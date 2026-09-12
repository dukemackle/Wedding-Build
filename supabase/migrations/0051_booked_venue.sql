-- The venue a couple has actually booked -- distinct from
-- venue_shortlist, which is just favorites (many-to-many, any number
-- of venues). This is the one confirmed choice per wedding, the anchor
-- for auto-filling the Venue budget line, showing the venue on the
-- Dashboard, and (later) per-venue vendor recommendations.
alter table weddings add column if not exists venue_id uuid references venues (id) on delete set null;
