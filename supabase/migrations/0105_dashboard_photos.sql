-- Photos of the couple shown behind the whole dashboard, taking turns.
--
-- Replaces the profile-photo circle beside the couple's names, which made the
-- dashboard read like a social profile. The guest site banner
-- (hero_photo_url) stays its own picture; the dashboard falls back to it, then
-- to the booked venue's photo, when this list is empty. Order is the order
-- they're shown in. The app caps the list at eight.
alter table weddings add column if not exists dashboard_photo_urls text[] not null default '{}';
