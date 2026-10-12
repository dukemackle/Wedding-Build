-- The couple's own photos of their venue. A venue we don't list has no
-- photos at all, and a listed one may have none or ones the couple wouldn't
-- pick for their invitation. When the couple adds any, the guest site shows
-- theirs instead of the listing's (and uses the first as the banner when
-- there's no banner photo). Up to five, enforced in the server action.

alter table weddings add column if not exists own_venue_photo_urls text[] not null default '{}';

-- Same view as 0113 with venue_photo_urls preferring the couple's photos, and
-- venue_photos_own so the site only credits the venue for the venue's own.
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
    coalesce(v.name, w.own_venue_name) as venue_name,
    coalesce(v.city, w.own_venue_city) as venue_city,
    coalesce(v.state, w.own_venue_state) as venue_state,
    w.itinerary_published,
    w.site_design,
    coalesce(nullif(w.own_venue_photo_urls, '{}'), v.photo_urls) as venue_photo_urls,
    coalesce(v.about, v.description) as venue_about,
    coalesce(v.address, w.own_venue_address) as venue_address,
    (w.site_password_hash is not null) as site_locked,
    (cardinality(w.own_venue_photo_urls) > 0) as venue_photos_own
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null;

grant select on public_weddings to anon, authenticated;
