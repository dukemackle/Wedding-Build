-- A venue that isn't in the listings. A couple who booked somewhere we don't
-- list (a family farm, a backyard, a small-town hall) can type its name and
-- address, and the guest site shows it -- the venue section, Directions and
-- "Add to calendar" -- instead of losing the location entirely. A booked
-- listing still wins: these only fill in when weddings.venue_id is null.

alter table weddings add column if not exists own_venue_name text;
alter table weddings add column if not exists own_venue_address text;
alter table weddings add column if not exists own_venue_city text;
alter table weddings add column if not exists own_venue_state text;

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
    v.photo_urls as venue_photo_urls,
    coalesce(v.about, v.description) as venue_about,
    coalesce(v.address, w.own_venue_address) as venue_address,
    (w.site_password_hash is not null) as site_locked
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null;

grant select on public_weddings to anon, authenticated;
