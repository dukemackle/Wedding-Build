-- Location lookups on venues and vendors: the metro hubs (/venues/in/…,
-- /vendors/in/…) and each listing's "nearby" links search a lat/lng box.
-- With no index that was a sequential scan of every row (~1.8 s for one
-- vendor listing's nearby photographers, 2026-11-08), paid by every
-- logged-out visitor and every Googlebot crawl.
create index if not exists venues_active_location_idx
  on public.venues (latitude, longitude)
  where active and not is_sample;

create index if not exists vendors_active_location_idx
  on public.vendors (latitude, longitude)
  where active and not is_sample;

create index if not exists vendors_active_category_location_idx
  on public.vendors (category, latitude, longitude)
  where active and not is_sample;
