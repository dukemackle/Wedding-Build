-- Who took the banner photo, when it came from the free photo library
-- (src/lib/unsplash.ts): {"source":"unsplash","name":"...","username":"..."}.
-- Unsplash's terms ask that a photo always shows with its photographer's
-- name, so the guest site reads it beside hero_photo_url. Cleared when the
-- couple uploads or removes their own banner. Null for everything else.
alter table weddings add column if not exists hero_photo_credit jsonb;

-- public_weddings as of 0121, plus the credit at the end.
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
    w.ask_dietary,
    w.hero_photo_credit
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null and guest_site_open(w.id);

grant select on public_weddings to anon, authenticated;
