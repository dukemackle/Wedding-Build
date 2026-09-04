-- Wedding weekend itinerary: the couple builds a day-by-day schedule
-- (rehearsal dinner, ceremony, reception, day-after brunch, etc.) by
-- clicking a day on a calendar and adding events to it. Mirrors the
-- registry_items pattern from migration 0016: owner-only read/write,
-- plus a narrow public-read policy (via the public_weddings view) so
-- invited guests can see the schedule on the public wedding site once
-- the couple has turned that on.
create table if not exists itinerary_events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  event_date date not null,
  start_time time,
  end_time time,
  title text not null,
  location text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists itinerary_events_wedding_id_idx on itinerary_events (wedding_id);
create index if not exists itinerary_events_date_idx on itinerary_events (wedding_id, event_date);

alter table itinerary_events enable row level security;

create policy "itinerary_events_owner_all" on itinerary_events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "public can view itinerary for public weddings" on itinerary_events
  for select
  to anon, authenticated
  using (
    exists (select 1 from public_weddings pw where pw.id = itinerary_events.wedding_id)
  );
