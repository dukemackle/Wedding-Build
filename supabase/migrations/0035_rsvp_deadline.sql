-- RSVP deadline: an optional date the couple sets so guests know by
-- when to respond. Shown as a banner on the public site, and as context
-- on the couple's reminder panel.

alter table weddings add column if not exists rsvp_deadline date;

-- public_weddings needs to expose the new column for the public site
-- to read it -- same narrow view as before, just one more column.
create or replace view public_weddings as
  select id, public_slug, partner_a_name, partner_b_name, wedding_date, region, hero_photo_url, rsvp_deadline
  from weddings
  where public_slug is not null;
