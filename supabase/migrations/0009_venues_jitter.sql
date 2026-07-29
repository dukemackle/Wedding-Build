-- Give each venue its own approximate pin location instead of sharing the
-- exact city/state center point with every other venue in the same
-- city/state (e.g. a city-level venue and the 2 generic state-level venues
-- for that state previously all landed on the identical coordinate).
-- Applies a small deterministic offset derived from each row's id on top
-- of the city/state coordinates set in migration 0008, spreading venues
-- within roughly a 1-2 mile radius of their city so pins are distinguishable.
-- Run this once -- re-running will jitter already-jittered rows further.
update venues
set
  latitude = latitude + ((abs(hashtext(id::text || 'lat')) % 2000) / 1000.0 - 1.0) * 0.02,
  longitude = longitude + ((abs(hashtext(id::text || 'lng')) % 2000) / 1000.0 - 1.0) * 0.02
where latitude is not null and longitude is not null;
