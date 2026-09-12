-- Vendors get a photo, same as venues already have (venues.image_url,
-- 0001_init.sql) -- admin pastes a URL in the Image URL field on the
-- vendor form, couple-facing vendor cards render it when set.
alter table vendors add column if not exists image_url text;
