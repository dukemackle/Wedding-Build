-- Placeholder seed vendors spanning common wedding vendor categories.
-- Run once; safe to re-run since it checks for existing rows by name.
insert into vendors (name, category, region, price_tier, description, contact_email)
select * from (values
  ('Golden Hour Photography', 'Photography', 'Northeast', 'Classic', 'Documentary-style coverage with a same-day preview gallery.', 'hello@goldenhourphoto.example'),
  ('Reel Love Films', 'Videography', 'West Coast', 'Luxury', 'Cinematic highlight films with drone coverage included.', 'book@reellovefilms.example'),
  ('Harvest Table Catering', 'Catering', 'Midwest', 'Classic', 'Farm-to-table plated dinners and family-style service.', 'events@harvesttablecatering.example'),
  ('Bloom & Bramble Florals', 'Florals', 'Southeast', 'Luxury', 'Garden-style arrangements using seasonal, locally grown blooms.', 'studio@bloomandbramble.example'),
  ('The Night Shift DJs', 'Music', 'Southwest', 'Simple', 'High-energy DJ sets with MC services and uplighting.', 'bookings@nightshiftdjs.example'),
  ('Firefly String Quartet', 'Music', 'Mid-Atlantic', 'Classic', 'Live strings for ceremonies and cocktail hour.', 'info@fireflystrings.example'),
  ('Sweet Layers Bakery', 'Cake', 'Pacific Northwest', 'Classic', 'Custom tiered cakes and dessert tables.', 'orders@sweetlayersbakery.example'),
  ('Timeless Occasions Planning', 'Planning', 'Mountain West', 'Luxury', 'Full-service planning and month-of coordination.', 'hello@timelessoccasions.example'),
  ('Glow Beauty Collective', 'Hair & Makeup', 'Northeast', 'Classic', 'On-site hair and makeup teams for the full bridal party.', 'team@glowbeautycollective.example'),
  ('Vintage Row Rentals', 'Rentals', 'Southeast', 'Simple', 'Farm tables, market lighting, and lounge furniture rentals.', 'rentals@vintagerow.example'),
  ('Route One Transport', 'Transportation', 'Midwest', 'Simple', 'Shuttle buses and vintage car service for the wedding party.', 'dispatch@routeonetransport.example'),
  ('Ceremony & Co. Officiants', 'Officiant', 'West Coast', 'Simple', 'Personalized, non-denominational ceremony officiating.', 'schedule@ceremonyandco.example')
) as seed(name, category, region, price_tier, description, contact_email)
where not exists (
  select 1 from vendors where vendors.name = seed.name
);
