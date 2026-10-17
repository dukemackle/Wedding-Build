-- The couple's own RSVP questions. Until now every guest site offered the
-- same seven meals, so a couple serving short rib and salmon still got
-- "Chicken / Fish". meal_options is their menu: null keeps the old preset
-- list, and fewer than two choices means guests aren't asked (one plated
-- meal, a buffet, family style). ask_dietary adds an "Any allergies or
-- dietary needs?" line, on by default because the caterer needs it whatever
-- the menu is; the answer lands in rsvp_submissions.dietary.

alter table weddings add column if not exists meal_options text[];
alter table weddings add column if not exists ask_dietary boolean not null default true;
alter table rsvp_submissions add column if not exists dietary text;

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
    (cardinality(w.own_venue_photo_urls) > 0) as venue_photos_own,
    w.gift_venmo,
    w.gift_paypal,
    w.gift_cashapp,
    w.gift_zelle,
    w.meal_options,
    w.ask_dietary
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null;

grant select on public_weddings to anon, authenticated;
