-- Guest notes are for the people planning, not the people watching.
--
-- A view-only member (say, the bride's mum) can read every guests row, and
-- notes hold things like "keep away from Dad's new wife". RLS works on rows,
-- not columns, so notes move to their own table that only editors can read.
--
-- The app keeps writing guests.notes exactly as before. A trigger moves the
-- value into guest_notes and blanks the column, so guests.notes is always
-- null and every existing insert/update path keeps working. Reads embed it:
-- `.select("*, guest_notes(notes)")` (see src/lib/guest-notes.ts), which
-- comes back null for a view-only member.

create table if not exists guest_notes (
  guest_id uuid primary key
    references guests (id) on delete cascade
    deferrable initially deferred,
  wedding_id uuid not null references weddings (id) on delete cascade,
  notes text not null,
  updated_at timestamptz not null default now()
);
create index if not exists guest_notes_wedding_id_idx on guest_notes (wedding_id);

alter table guest_notes enable row level security;

drop policy if exists "guest_notes_editor_all" on guest_notes;
create policy "guest_notes_editor_all" on guest_notes
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

-- Bring existing notes across before the trigger exists -- with it in place,
-- blanking the column would delete what was just copied (hence the drop, in
-- case this is ever re-run).
drop trigger if exists guests_move_notes on guests;
insert into guest_notes (guest_id, wedding_id, notes)
select id, wedding_id, btrim(notes) from guests
where nullif(btrim(coalesce(notes, '')), '') is not null
on conflict (guest_id) do nothing;

update guests set notes = null where notes is not null;

-- Runs as the caller, so a view-only member's write is refused by the
-- policy above as well as by guests' own. The guest_id FK is deferred
-- because on insert this fires before the guests row exists.
create or replace function move_guest_notes()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  body text := nullif(btrim(coalesce(new.notes, '')), '');
begin
  if body is null then
    delete from guest_notes where guest_id = new.id;
  else
    insert into guest_notes (guest_id, wedding_id, notes)
    values (new.id, new.wedding_id, body)
    on conflict (guest_id) do update
      set notes = excluded.notes, wedding_id = excluded.wedding_id, updated_at = now();
  end if;
  new.notes := null;
  return new;
end;
$$;

-- UPDATE OF notes fires only when the statement sets notes, so an update
-- that leaves notes out (seating, RSVP status...) doesn't touch them.
drop trigger if exists guests_move_notes on guests;
create trigger guests_move_notes
  before insert or update of notes on guests
  for each row execute function move_guest_notes();

