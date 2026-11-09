-- When RSVPs open on the guest site.
--
-- Couples usually take replies from the invitation, six to eight weeks out,
-- but the save-the-date's QR code reaches the site months earlier. Null keeps
-- RSVPs open now (as before, and for couples who ask for early replies on
-- their save-the-date); a date holds the form back until that day, and the
-- site says when it opens. submitRsvp checks it too.
alter table weddings add column if not exists rsvp_opens_on date;

-- public_weddings as it stands after 0154, with rsvp_opens_on added at the end.
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
    coalesce(nullif(w.own_venue_photo_urls, '{}'::text[]), v.photo_urls) as venue_photo_urls,
    coalesce(v.about, v.description) as venue_about,
    coalesce(v.address, w.own_venue_address) as venue_address,
    w.site_password_hash is not null as site_locked,
    cardinality(w.own_venue_photo_urls) > 0 as venue_photos_own,
    w.gift_venmo,
    w.gift_paypal,
    w.gift_cashapp,
    w.gift_zelle,
    w.meal_options,
    w.ask_dietary,
    w.hero_photo_credit,
    v.latitude as venue_latitude,
    v.longitude as venue_longitude,
    w.rsvp_opens_on
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null and guest_site_open(w.id);

grant select on public_weddings to anon, authenticated;
