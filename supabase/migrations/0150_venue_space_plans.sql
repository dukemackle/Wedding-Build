-- Venue floor plans (decisions.md, 2026-10-28). A plan belongs to one event
-- space ("The Barn", "Oak Lawn") and holds its real size and outline, in
-- metres. The admin draws them; couples copy a published one into their own
-- venue layout as a room ("Design my wedding here").
create table if not exists venue_space_plans (
  space_id uuid primary key references venue_spaces (id) on delete cascade,
  venue_id uuid not null references venues (id) on delete cascade,
  width_m numeric(6, 2) not null check (width_m between 3 and 120),
  length_m numeric(6, 2) not null check (length_m between 3 and 120),
  -- Corners as [[x, y], ...] in metres from the top-left of the width x length
  -- box, clockwise. Null means the whole rectangle.
  outline jsonb,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists venue_space_plans_venue_idx on venue_space_plans (venue_id);

alter table venue_space_plans enable row level security;

-- Only published plans of live venues are public. Writes go through the
-- admin panel's service-role client, so there is no write policy.
drop policy if exists "anyone can read published plans" on venue_space_plans;
create policy "anyone can read published plans"
  on venue_space_plans for select
  to anon, authenticated
  using (published and exists (select 1 from venues v where v.id = venue_id and v.active));

-- A couple's room copied from a venue plan: a snapshot of its size and
-- outline, so redrawing the venue never moves anyone's tables.
alter table venue_rooms add column if not exists width_m numeric(6, 2);
alter table venue_rooms add column if not exists length_m numeric(6, 2);
alter table venue_rooms add column if not exists outline jsonb;
alter table venue_rooms add column if not exists source_space_id uuid references venue_spaces (id) on delete set null;
alter table venue_rooms add column if not exists source_venue_id uuid references venues (id) on delete set null;
