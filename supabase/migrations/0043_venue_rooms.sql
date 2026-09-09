-- Rooms: an optional grouping layer on top of the venue layout, so a
-- couple with multiple spaces (ceremony tent, reception hall, patio)
-- can plan each separately. "Whole Venue" and "Seating" stay flat views
-- across every room; only "Rooms" mode filters by room.
create table if not exists venue_rooms (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists venue_rooms_wedding_id_idx on venue_rooms (wedding_id);

alter table venue_rooms enable row level security;

create policy "venue_rooms_owner_all" on venue_rooms
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table seating_tables add column if not exists room_id uuid references venue_rooms (id) on delete set null;
alter table venue_layout_items add column if not exists room_id uuid references venue_rooms (id) on delete set null;

-- Carry over: every wedding that already has tables or layout items gets
-- a "Main Venue" room, and everything it already had gets assigned to
-- it -- so Rooms mode starts already showing the couple's existing
-- layout instead of an empty room.
do $$
declare
  w record;
  new_room_id uuid;
begin
  for w in
    select id as wedding_id, user_id
    from weddings
    where id in (select wedding_id from seating_tables)
       or id in (select wedding_id from venue_layout_items)
  loop
    insert into venue_rooms (wedding_id, user_id, name)
    values (w.wedding_id, w.user_id, 'Main Venue')
    returning id into new_room_id;

    update seating_tables set room_id = new_room_id
      where wedding_id = w.wedding_id and room_id is null;
    update venue_layout_items set room_id = new_room_id
      where wedding_id = w.wedding_id and room_id is null;
  end loop;
end $$;
