-- Placeholder seed venues spanning the existing region/venue-type options.
-- Run once; safe to re-run since it checks for existing rows by name.
insert into venues (name, region, venue_type, capacity, price_tier, description)
select * from (values
  ('Cedar Hollow Barn', 'Midwest', 'Barn / Rustic', 150, 'Simple', 'A restored dairy barn with string lights and a wraparound porch for cocktail hour.'),
  ('The Grand Linden Ballroom', 'Northeast', 'Ballroom / Hotel', 300, 'Luxury', 'A downtown hotel ballroom with crystal chandeliers and a dedicated bridal suite.'),
  ('Willow Creek Gardens', 'Southeast', 'Garden / Outdoor', 180, 'Classic', 'Manicured gardens along a creek, with a covered pavilion for rain backup.'),
  ('Sandpiper Cove', 'West Coast', 'Beach / Waterfront', 120, 'Luxury', 'A private beach cove with a cliffside terrace for sunset ceremonies.'),
  ('The Ashford Estate', 'Mid-Atlantic', 'Historic / Estate', 200, 'Luxury', 'An 1890s manor house with formal gardens and a carriage house reception hall.'),
  ('Vine & Table Vineyard', 'Pacific Northwest', 'Restaurant / Vineyard', 100, 'Classic', 'A working vineyard with an open-air pavilion overlooking the rows.'),
  ('Sunset Mesa Ranch', 'Southwest', 'Barn / Rustic', 160, 'Simple', 'A high-desert ranch with a rustic barn and mountain views at golden hour.'),
  ('Timberline Lodge Hall', 'Mountain West', 'Ballroom / Hotel', 220, 'Classic', 'A timber-frame lodge with a stone fireplace and floor-to-ceiling windows.'),
  ('Harbor Light Pavilion', 'Northeast', 'Beach / Waterfront', 140, 'Classic', 'A waterfront pavilion on a working harbor, with a lighthouse backdrop.'),
  ('Magnolia Manor', 'Southeast', 'Historic / Estate', 250, 'Luxury', 'A columned antebellum estate with oak-lined grounds and a ballroom addition.'),
  ('Prairie Rose Farm', 'Midwest', 'Garden / Outdoor', 130, 'Simple', 'A working flower farm with a barn for receptions and fields for photos.'),
  ('Copper Canyon Cellars', 'Southwest', 'Restaurant / Vineyard', 90, 'Classic', 'A boutique winery tasting room with a courtyard for outdoor dinners.')
) as seed(name, region, venue_type, capacity, price_tier, description)
where not exists (
  select 1 from venues where venues.name = seed.name
);

-- One shortlist entry per venue per wedding, so the app can toggle it.
alter table venue_shortlist
  add constraint venue_shortlist_wedding_venue_key unique (wedding_id, venue_id);
