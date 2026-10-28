-- Who's involved in each schedule event, and names for the schedule's days.
--
-- people: free names ("Lens & Light", "Both families", "Officiant"), picked
-- from the couple's booked vendors or typed. Names rather than vendor ids,
-- because half of who's involved is never a vendor, and a run sheet needs
-- the name even after a vendor listing changes. Same visibility as the
-- event's notes: printed on run sheets, not shown on the guest site.
--
-- itinerary_day_names: { "2027-09-03": "Rehearsal", ... }. A day with no
-- name falls back to "Wedding day", "Day before" or the weekday.

alter table itinerary_events
  add column if not exists people text[] not null default '{}';

alter table weddings
  add column if not exists itinerary_day_names jsonb not null default '{}'::jsonb;
