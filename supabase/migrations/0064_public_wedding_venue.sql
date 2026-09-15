-- The guest-site hero shows where the wedding is, and the couple already
-- told us via weddings.venue_id -- but the guest site reads
-- `public_weddings`, which never joined the venue in. Left join so a
-- wedding with no venue booked yet still appears, just without a location.
--
-- Columns are appended after the existing ones: `create or replace view`
-- can add columns but can't rename or reorder the ones already there.
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
    v.state as venue_state
  from weddings w
  left join venues v on v.id = w.venue_id
  where w.public_slug is not null;

grant select on public_weddings to anon, authenticated;
