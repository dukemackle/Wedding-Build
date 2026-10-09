-- The couple's venue on their guest site: its own photos (as the banner
-- until the couple adds theirs, and in a "The venue" section), its write-up
-- and its address. Only photos the venue uploaded itself are in photo_urls
-- (claims, Terms §6); image_url, which can come from a website import, is
-- left out on purpose.
--
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
    w.itinerary_published,
    w.site_design,
    v.photo_urls as venue_photo_urls,
    coalesce(v.about, v.description) as venue_about,
    v.address as venue_address
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null;

grant select on public_weddings to anon, authenticated;
