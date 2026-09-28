-- Public listings: readable URLs, and what a logged-out visitor may read.
--
-- 1. Slugs. /venues/the-barn-at-x-columbus-oh instead of a uuid. Added now,
--    before search engines index anything, because a URL scheme is the part
--    that's expensive to change later: every indexed link has to redirect
--    forever. Old uuid links keep working -- the page redirects them to the
--    slug.
--
--    Filled by a trigger rather than by the app, since venues and vendors are
--    inserted from several places (venue batches, CSV import, the /list
--    form, admin edits). A slug is set once and never follows a rename: a
--    changed URL would throw away whatever the old one had earned.
--
-- 2. Column grants. Venues and vendors have been readable by everyone since
--    0001 (`using (true)`), which with Supabase's default grants includes the
--    anon key every browser holds -- so contact emails, phone numbers and
--    `verified_by` (an admin's email) were readable by anyone who asked the
--    API directly. Listings are now public on purpose, but contact details
--    stay behind signup: inquiries go through the product. So anon gets
--    every column except those. Signed-in users are unchanged.
--
--    A column added later is not readable by anon until it is added here,
--    which is the safe way round: forgetting fails closed.

create or replace function listing_slugify(value text) returns text
language sql immutable as $$
  select trim(both '-' from regexp_replace(
    lower(translate(coalesce(value, ''),
      'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖòóôõöÙÚÛÜùúûüÇçÑñ',
      'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn')),
    '[^a-z0-9]+', '-', 'g'))
$$;

alter table venues add column if not exists slug text;
alter table vendors add column if not exists slug text;

-- Name, city, state: "rose-hall-savannah-ga". A clash gets the first eight
-- characters of the id, which is stable and needs no counter.
create or replace function set_listing_slug() returns trigger
language plpgsql as $$
declare
  base text;
  taken boolean;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;
  base := listing_slugify(concat_ws(' ', new.name, new.city, new.state));
  if base = '' then
    base := 'listing';
  end if;
  execute format('select exists(select 1 from %I where slug = $1 and id <> $2)', tg_table_name)
    into taken using base, new.id;
  new.slug := case when taken then base || '-' || left(new.id::text, 8) else base end;
  return new;
end;
$$;

drop trigger if exists venues_set_slug on venues;
create trigger venues_set_slug before insert or update on venues
  for each row execute function set_listing_slug();
drop trigger if exists vendors_set_slug on vendors;
create trigger vendors_set_slug before insert or update on vendors
  for each row execute function set_listing_slug();

-- Backfill oldest first, so the longest-standing listing keeps the plain slug.
do $$
declare r record;
begin
  for r in select id from venues where slug is null order by created_at, id loop
    update venues set slug = null where id = r.id;
  end loop;
  for r in select id from vendors where slug is null order by created_at, id loop
    update vendors set slug = null where id = r.id;
  end loop;
end $$;

create unique index if not exists venues_slug_key on venues (slug);
create unique index if not exists vendors_slug_key on vendors (slug);
alter table venues alter column slug set not null;
alter table vendors alter column slug set not null;

revoke select on venues from anon;
grant select (
  id, slug, name, region, state, city, latitude, longitude, venue_type, setting,
  capacity, price_tier, description, about, included, good_to_know, amenities,
  image_url, website, photo_urls, address, price_from, price_note, service_level,
  vendor_policy, capacity_standing, lodging_sleeps, parking, wheelchair_accessible,
  pets_allowed, instagram_url, facebook_url, pinterest_url, active, is_sample,
  source, last_verified_at, created_at
) on venues to anon;

revoke select on vendors from anon;
grant select (
  id, slug, name, category, region, state, city, latitude, longitude, price_tier,
  description, about, included, good_to_know, amenities, image_url, photo_urls,
  website, service_area, price_from, price_unit, price_note, instagram_url,
  facebook_url, pinterest_url, active, is_sample, source, last_verified_at,
  created_at
) on vendors to anon;
