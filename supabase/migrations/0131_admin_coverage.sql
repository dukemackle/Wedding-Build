-- Everything /admin/coverage needs per state, counted in the database so the
-- page reads ~51 rows instead of paging ~20,000 listings into the Worker.
--
-- Supply: live listings (same filters as the public directories), vendors
-- split by category, and how many are weak (no photo, no price, no map pin).
-- Demand: real couples planning there, listings real couples opened
-- (events, migration 0130) and inquiries they sent, over the last p_days.
-- Test weddings are left out. Service role only.
create or replace function admin_coverage(p_days integer default 90)
returns jsonb
language sql
stable
set search_path = public
as $$
  with since as (select now() - make_interval(days => p_days) as t),
  ven as (
    select state,
      count(*) as n,
      count(*) filter (where image_url is null and coalesce(cardinality(photo_urls), 0) = 0) as no_photo,
      count(*) filter (where price_from is null and price_tier is null) as no_price,
      count(*) filter (where latitude is null) as no_pin
    from venues where active and state is not null group by state
  ),
  vend as (
    select state,
      count(*) as n,
      count(*) filter (where image_url is null and coalesce(cardinality(photo_urls), 0) = 0) as no_photo,
      count(*) filter (where price_from is null and price_tier is null) as no_price,
      count(*) filter (where latitude is null) as no_pin
    from vendors where active and not is_sample and state is not null group by state
  ),
  cats as (
    select state, jsonb_object_agg(category, n) as by_category from (
      select state, category, count(*) as n
      from vendors where active and not is_sample and state is not null and category is not null
      group by state, category
    ) c group by state
  ),
  couples as (
    select state, count(*) as n from weddings where not is_test and state is not null group by state
  ),
  views as (
    select coalesce(v.state, d.state) as state, count(*) as n
    from events e
    join weddings w on w.id = e.wedding_id and not w.is_test
    left join venues v on e.listing_kind = 'venue' and v.id = e.listing_id
    left join vendors d on e.listing_kind = 'vendor' and d.id = e.listing_id
    where e.name = 'listing_viewed' and e.created_at >= (select t from since)
    group by 1
  ),
  inquiries as (
    select state, count(*) as n from (
      select v.state from venue_inquiries i
        join venues v on v.id = i.venue_id
        join weddings w on w.id = i.wedding_id and not w.is_test
        where i.sent_at >= (select t from since)
      union all
      select d.state from vendor_inquiries i
        join vendors d on d.id = i.vendor_id
        join weddings w on w.id = i.wedding_id and not w.is_test
        where i.sent_at >= (select t from since)
    ) q group by state
  ),
  states as (
    select state from ven union select state from vend union select state from couples
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'state', s.state,
    'venues', coalesce(ven.n, 0),
    'venues_no_photo', coalesce(ven.no_photo, 0),
    'venues_no_price', coalesce(ven.no_price, 0),
    'venues_no_pin', coalesce(ven.no_pin, 0),
    'vendors', coalesce(vend.n, 0),
    'vendors_no_photo', coalesce(vend.no_photo, 0),
    'vendors_no_price', coalesce(vend.no_price, 0),
    'vendors_no_pin', coalesce(vend.no_pin, 0),
    'by_category', coalesce(cats.by_category, '{}'::jsonb),
    'couples', coalesce(couples.n, 0),
    'views', coalesce(views.n, 0),
    'inquiries', coalesce(inquiries.n, 0)
  )), '[]'::jsonb)
  from states s
  left join ven using (state)
  left join vend using (state)
  left join cats using (state)
  left join couples using (state)
  left join views using (state)
  left join inquiries using (state);
$$;

revoke execute on function admin_coverage(integer) from public, anon, authenticated;
grant execute on function admin_coverage(integer) to service_role;
