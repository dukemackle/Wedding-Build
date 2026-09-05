-- Seating chart: couples group confirmed guests into numbered tables
-- with an optional capacity, so they can see at a glance whether a
-- table is over capacity before the big day. Owner-only, like
-- checklist_items -- no guest-facing exposure needed.

create table if not exists seating_tables (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  name text not null,
  capacity integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists seating_tables_wedding_id_idx on seating_tables (wedding_id);

alter table seating_tables enable row level security;

create policy "seating_tables_owner_all" on seating_tables
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table guests add column if not exists table_id uuid references seating_tables (id) on delete set null;
