-- Venue search filters: replaces the region pill filter (redundant with the
-- state/city dropdowns already on /venues) with filters that are actually
-- useful -- indoor/outdoor setting, capacity, and a standardized price tier.
--
-- `setting` is backfilled from venue_type since none of the ~1,275 seed
-- venues (migrations 0004-0017) have real indoor/outdoor data -- this is a
-- reasonable guess per type, not a fact, and should be corrected by hand as
-- real venues replace seed rows.
--
-- `is_sample` marks those same seed rows so the UI can label them as sample
-- listings rather than presenting fabricated venues as real ones. Defaults
-- to false going forward so venues added by hand through /admin/venues are
-- assumed real unless explicitly marked otherwise.

alter table venues add column if not exists setting text;
alter table venues add column if not exists is_sample boolean not null default false;

update venues set is_sample = true;

update venues set setting = case venue_type
  when 'Ballroom / Hotel' then 'Indoor'
  when 'Garden / Outdoor' then 'Outdoor'
  when 'Beach / Waterfront' then 'Outdoor'
  when 'Barn / Rustic' then 'Indoor & Outdoor'
  when 'Historic / Estate' then 'Indoor & Outdoor'
  when 'Restaurant / Vineyard' then 'Indoor & Outdoor'
  else null
end
where setting is null;
