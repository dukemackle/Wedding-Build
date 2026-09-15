-- The weekend schedule is working notes until the couple says otherwise:
-- times move, venues change, a rehearsal dinner gets added and dropped. Guests
-- seeing that churn is worse than seeing nothing, so the itinerary stays
-- private until it is explicitly published.
--
-- Defaults to false, INCLUDING for weddings that already exist. Any itinerary
-- currently visible on a guest site disappears until its couple publishes it.
-- That is the point of the feature, but it is a change to live data, not just
-- to new rows.
alter table weddings
  add column if not exists itinerary_published boolean not null default false;

-- Exposed through the view so the guest page can tell "nothing scheduled yet"
-- apart from "not published yet" and word the empty state accordingly.
-- Appending only: `create or replace view` can add columns but cannot rename
-- or reorder the ones already there.
create or replace view public_weddings as
  select
    w.id,
    w.public_slug,
    w.partner_a_name,
    w.partner_b_name,
    w.wedding_date,
    w.region,
    w.hero_photo_url,
    w.rsvp_deadline,
    w.dress_code,
    w.travel_notes,
    v.name as venue_name,
    v.city as venue_city,
    v.state as venue_state,
    w.itinerary_published
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null;

grant select on public_weddings to anon, authenticated;

-- THE ACTUAL GATE.
--
-- Filtering in the page component would not be privacy: the anon key is
-- public by design (it ships in the client bundle and in wrangler.jsonc), so
-- anyone could query itinerary_events directly and read an unpublished
-- schedule. The old policy admitted every event of any wedding with a public
-- slug; this one additionally requires the couple to have published.
--
-- The owner policy is untouched, so the couple still sees their own drafts.
drop policy if exists "public can view itinerary for public weddings" on itinerary_events;
create policy "public can view published itineraries" on itinerary_events
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public_weddings pw
      where pw.id = itinerary_events.wedding_id
        and pw.itinerary_published
    )
  );
