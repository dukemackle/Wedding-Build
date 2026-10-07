-- Where to centre each dashboard photo when it's cropped to the screen.
--
-- A wide photo behind a tall phone screen loses most of its width, and the
-- default centre crop can cut the couple out entirely. The couple taps the
-- faces once per photo and the crop keeps that spot in view. Keyed by the
-- photo's URL (as stored in dashboard_photo_urls): {"<url>": [x, y]} with x
-- and y as percentages. A photo with no entry is centred.
alter table weddings add column if not exists dashboard_photo_focus jsonb not null default '{}'::jsonb;
