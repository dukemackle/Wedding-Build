-- "Keep these two apart" for seating: divorced parents, an ex, a feud.
--
-- One row per pair, stored with the smaller id first so a pair can't be
-- saved twice the other way round. The seating screen warns when a pair
-- ends up at one table, and "Seat the rest" never puts them together.
--
-- As private as guest notes (0096_guest_notes_editors_only.sql): a view-only member such as a
-- parent must not see "keep Dad away from Mom", so only editors can read or
-- write it. Deleting either guest, or the wedding, removes the pair.

create table if not exists guest_keep_apart (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  guest_a uuid not null references guests (id) on delete cascade,
  guest_b uuid not null references guests (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint guest_keep_apart_ordered check (guest_a < guest_b),
  constraint guest_keep_apart_unique unique (guest_a, guest_b)
);
create index if not exists guest_keep_apart_wedding_id_idx on guest_keep_apart (wedding_id);
create index if not exists guest_keep_apart_guest_b_idx on guest_keep_apart (guest_b);

alter table guest_keep_apart enable row level security;

drop policy if exists "guest_keep_apart_editor_all" on guest_keep_apart;
create policy "guest_keep_apart_editor_all" on guest_keep_apart
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));
