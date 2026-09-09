-- Venue floor plan: a separate canvas from the seating chart for laying
-- out the physical space itself -- ceremony stage, chairs, bar, dance
-- floor, etc. -- with no guest assignment, just drag-to-place items.
create table if not exists venue_layout_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  item_type text not null check (item_type in (
    'chairs', 'stage', 'dance_floor', 'bar', 'dj_booth',
    'buffet', 'cake_table', 'gift_table', 'entrance', 'other'
  )),
  label text,
  position_x integer not null default 60,
  position_y integer not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists venue_layout_items_wedding_id_idx on venue_layout_items (wedding_id);

alter table venue_layout_items enable row level security;

create policy "venue_layout_items_owner_all" on venue_layout_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
