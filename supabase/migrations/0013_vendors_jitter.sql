-- Give each vendor its own approximate pin location instead of sharing the
-- exact city/state center point with other vendors in the same city/state,
-- mirroring migration 0009 for venues. Applies a small deterministic
-- offset derived from each row's id on top of the coordinates set in
-- migration 0012. Run this once -- re-running will jitter already-jittered
-- rows further.
update vendors
set
  latitude = latitude + ((abs(hashtext(id::text || 'lat')) % 2000) / 1000.0 - 1.0) * 0.02,
  longitude = longitude + ((abs(hashtext(id::text || 'lng')) % 2000) / 1000.0 - 1.0) * 0.02
where latitude is not null and longitude is not null;
