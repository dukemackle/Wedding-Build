-- Where each field on a listing came from and when, so a capacity the venue
-- confirmed can be told apart from one researched for a batch, and stale
-- fields re-checked on their own. Shape and sources: src/lib/field-sources.ts.
--   {"capacity": {"by": "venue", "at": "2026-10-05"}, "price_tier": {"by": "batch", ...}}
--
-- Added while there are a few thousand listings, because once there are tens
-- of thousands nobody can say which of their fields were checked.

alter table venues add column if not exists field_sources jsonb not null default '{}'::jsonb;
alter table vendors add column if not exists field_sources jsonb not null default '{}'::jsonb;

-- Not granted to anon: it's for the admin side and the audits, and anon reads
-- venues column by column since 0091.

-- Backfill what the existing rows can honestly say. Fields in a listing's
-- latest approved claim are the business's own, dated when it was approved.
-- Other fields on an imported row (it has a source_id) came from its batch,
-- dated when it was added. Rows entered by hand on /admin are stamped admin.
-- Anything else on a self-listed or claimed row is left unstamped rather
-- than guessed.

create or replace function pg_temp.backfill_sources(
  listing jsonb,
  claimed jsonb,
  claimed_at date,
  claimed_by text
) returns jsonb language sql as $$
  select coalesce(jsonb_object_agg(e.key, e.stamp), '{}'::jsonb)
  from (
    select key,
      case
        when claimed ? key then jsonb_build_object('by', claimed_by, 'at', claimed_at)
        when listing->>'source_id' is not null then jsonb_build_object('by', 'batch', 'at', (listing->>'created_at')::date)
        when coalesce(listing->>'source', '') not in ('self-listed', 'claimed') then jsonb_build_object('by', 'admin', 'at', (listing->>'created_at')::date)
      end as stamp
    from jsonb_each(listing)
    where value not in ('null'::jsonb, '""'::jsonb, '[]'::jsonb)
      and key not in (
        'id', 'slug', 'latitude', 'longitude', 'image_url', 'is_sample', 'active',
        'source', 'source_id', 'last_verified_at', 'verified_by', 'address_checked_at',
        'field_sources', 'created_at'
      )
  ) e
  where e.stamp is not null
$$;

with claim as (
  select distinct on (venue_id) venue_id,
    details || case when photo_urls <> '{}' then '{"photo_urls": true}'::jsonb else '{}'::jsonb end as fields,
    reviewed_at::date as at
  from venue_submissions
  where status = 'approved'
  order by venue_id, reviewed_at desc
)
update venues v
set field_sources = pg_temp.backfill_sources(to_jsonb(v), coalesce(c.fields, '{}'::jsonb), c.at, 'venue')
from venues v0
left join claim c on c.venue_id = v0.id
where v0.id = v.id and v.field_sources = '{}'::jsonb;

with claim as (
  select distinct on (vendor_id) vendor_id,
    details || case when photo_urls <> '{}' then '{"photo_urls": true}'::jsonb else '{}'::jsonb end as fields,
    reviewed_at::date as at
  from vendor_submissions
  where status = 'approved'
  order by vendor_id, reviewed_at desc
)
update vendors v
set field_sources = pg_temp.backfill_sources(to_jsonb(v), coalesce(c.fields, '{}'::jsonb), c.at, 'vendor')
from vendors v0
left join claim c on c.vendor_id = v0.id
where v0.id = v.id and v.field_sources = '{}'::jsonb;
