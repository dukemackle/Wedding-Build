-- Which photos play behind the dashboard: the couple's own, their venue's
-- (booked, else most recently shortlisted), or the built-in inspiration set.
-- Null means "the best we have", in that order, so nothing changes for
-- couples who never choose. The inspiration set lives in the app
-- (src/lib/dashboard-photos.ts), not in the database.
alter table weddings add column if not exists dashboard_photo_source text
  check (dashboard_photo_source in ('own', 'venue', 'inspiration'));
