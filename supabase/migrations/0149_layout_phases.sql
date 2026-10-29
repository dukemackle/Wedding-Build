-- Event phases for the venue layout: the same venue arranged differently for
-- the ceremony, cocktail hour and reception (plus any the couple adds, like a
-- rehearsal dinner), so flipping the room for dinner doesn't wreck the
-- ceremony plan.
--
-- A table or item with a phase_id belongs to that phase only. One with a null
-- phase_id is part of the venue itself -- the house, the parking, the stage --
-- and shows in every phase, so switching phases can never move it.
create table if not exists layout_phases (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  kind text not null default 'custom'
    check (kind in ('ceremony', 'cocktail', 'reception', 'custom')),
  name text not null check (char_length(name) between 1 and 60),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists layout_phases_wedding_id_idx on layout_phases (wedding_id);
-- One of each standard phase per wedding; custom ones can repeat.
create unique index if not exists layout_phases_standard_kind_key
  on layout_phases (wedding_id, kind) where kind <> 'custom';

alter table layout_phases enable row level security;

drop policy if exists "layout_phases_owner_all" on layout_phases;
create policy "layout_phases_owner_all" on layout_phases
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
drop policy if exists "layout_phases_member_select" on layout_phases;
create policy "layout_phases_member_select" on layout_phases
  for select
  using (is_wedding_member(wedding_id));

-- Deleting a phase takes its own tables and items with it (the app confirms
-- first); guests seated at those tables become unseated via guests.table_id.
alter table seating_tables
  add column if not exists phase_id uuid references layout_phases (id) on delete cascade;
alter table venue_layout_items
  add column if not exists phase_id uuid references layout_phases (id) on delete cascade;
create index if not exists seating_tables_phase_id_idx on seating_tables (phase_id);
create index if not exists venue_layout_items_phase_id_idx on venue_layout_items (phase_id);

-- Every wedding starts with the three standard phases.
create or replace function create_default_layout_phases()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into layout_phases (wedding_id, user_id, kind, name, sort_order)
  values
    (new.id, new.user_id, 'ceremony', 'Ceremony', 0),
    (new.id, new.user_id, 'cocktail', 'Cocktail hour', 1),
    (new.id, new.user_id, 'reception', 'Reception', 2)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists weddings_default_layout_phases on weddings;
create trigger weddings_default_layout_phases
  after insert on weddings
  for each row execute function create_default_layout_phases();

-- Carry over: existing weddings get the three phases, and the tables they
-- already placed become the reception's (a seating chart is a dinner plan).
-- Items stay null, as part of the venue, so nothing disappears from view.
insert into layout_phases (wedding_id, user_id, kind, name, sort_order)
select w.id, w.user_id, p.kind, p.name, p.sort_order
from weddings w
cross join (values
  ('ceremony', 'Ceremony', 0),
  ('cocktail', 'Cocktail hour', 1),
  ('reception', 'Reception', 2)
) as p (kind, name, sort_order)
on conflict do nothing;

update seating_tables t
set phase_id = p.id
from layout_phases p
where p.wedding_id = t.wedding_id
  and p.kind = 'reception'
  and t.phase_id is null;
