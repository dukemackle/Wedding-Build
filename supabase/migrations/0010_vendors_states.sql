-- Add a state field to vendors, backfill the original 12 placeholder
-- vendors with a representative state, and seed 2 vendors per US state
-- (+DC) across the vendor category list, mirroring what was done for
-- venues in migration 0006. Run once; safe to re-run since it checks for
-- existing rows by name.
alter table vendors add column if not exists state text;

update vendors set state = 'Massachusetts' where name = 'Golden Hour Photography' and state is null;
update vendors set state = 'California' where name = 'Reel Love Films' and state is null;
update vendors set state = 'Illinois' where name = 'Harvest Table Catering' and state is null;
update vendors set state = 'North Carolina' where name = 'Bloom & Bramble Florals' and state is null;
update vendors set state = 'Texas' where name = 'The Night Shift DJs' and state is null;
update vendors set state = 'Virginia' where name = 'Firefly String Quartet' and state is null;
update vendors set state = 'Oregon' where name = 'Sweet Layers Bakery' and state is null;
update vendors set state = 'Colorado' where name = 'Timeless Occasions Planning' and state is null;
update vendors set state = 'New York' where name = 'Glow Beauty Collective' and state is null;
update vendors set state = 'Georgia' where name = 'Vintage Row Rentals' and state is null;
update vendors set state = 'Ohio' where name = 'Route One Transport' and state is null;
update vendors set state = 'Hawaii' where name = 'Ceremony & Co. Officiants' and state is null;

insert into vendors (name, category, region, state, price_tier, description, contact_email)
select * from (values
  ('Litchfield Hills Photography Co.', 'Photography', 'Northeast', 'Connecticut', 'Simple', 'Documentary-style wedding photography based near Litchfield Hills, in Connecticut.', 'hello@litchfieldhillsphotography.example'),
  ('Litchfield Hills Films', 'Videography', 'Northeast', 'Connecticut', 'Classic', 'Cinematic highlight films and drone coverage, based near Litchfield Hills, in Connecticut.', 'hello@litchfieldhillsvideography.example'),
  ('Casco Bay Catering', 'Catering', 'Northeast', 'Maine', 'Classic', 'Farm-to-table plated dinners and family-style service near Casco Bay, in Maine.', 'hello@cascobaycatering.example'),
  ('Casco Bay Florals', 'Florals', 'Northeast', 'Maine', 'Luxury', 'Garden-style arrangements using seasonal blooms near Casco Bay, in Maine.', 'hello@cascobayflorals.example'),
  ('Berkshire Sound & Strings', 'Music', 'Northeast', 'Massachusetts', 'Luxury', 'Live music for ceremonies and receptions near Berkshire, in Massachusetts.', 'hello@berkshiremusic.example'),
  ('Berkshire Bakery', 'Cake', 'Northeast', 'Massachusetts', 'Simple', 'Custom tiered cakes and dessert tables near Berkshire, in Massachusetts.', 'hello@berkshirecake.example'),
  ('White Mountain Events Co.', 'Planning', 'Northeast', 'New Hampshire', 'Simple', 'Full-service planning and day-of coordination near White Mountain, in New Hampshire.', 'hello@whitemountainplanning.example'),
  ('White Mountain Beauty Collective', 'Hair & Makeup', 'Northeast', 'New Hampshire', 'Classic', 'On-site hair and makeup teams near White Mountain, in New Hampshire.', 'hello@whitemountainhairmakeup.example'),
  ('Narragansett Rentals', 'Rentals', 'Northeast', 'Rhode Island', 'Classic', 'Farm tables, market lighting, and lounge furniture rentals near Narragansett, in Rhode Island.', 'hello@narragansettrentals.example'),
  ('Narragansett Transport', 'Transportation', 'Northeast', 'Rhode Island', 'Luxury', 'Shuttle buses and vintage car service near Narragansett, in Rhode Island.', 'hello@narragansetttransportation.example'),
  ('Green Mountain Officiants', 'Officiant', 'Northeast', 'Vermont', 'Luxury', 'Personalized, non-denominational ceremony officiating near Green Mountain, in Vermont.', 'hello@greenmountainofficiant.example'),
  ('Green Mountain Photography Co.', 'Photography', 'Northeast', 'Vermont', 'Simple', 'Documentary-style wedding photography based near Green Mountain, in Vermont.', 'hello@greenmountainphotography.example'),
  ('Hudson Valley Films', 'Videography', 'Mid-Atlantic', 'New York', 'Simple', 'Cinematic highlight films and drone coverage, based near Hudson Valley, in New York.', 'hello@hudsonvalleyvideography.example'),
  ('Hudson Valley Catering', 'Catering', 'Mid-Atlantic', 'New York', 'Classic', 'Farm-to-table plated dinners and family-style service near Hudson Valley, in New York.', 'hello@hudsonvalleycatering.example'),
  ('Pine Barrens Florals', 'Florals', 'Mid-Atlantic', 'New Jersey', 'Classic', 'Garden-style arrangements using seasonal blooms near Pine Barrens, in New Jersey.', 'hello@pinebarrensflorals.example'),
  ('Pine Barrens Sound & Strings', 'Music', 'Mid-Atlantic', 'New Jersey', 'Luxury', 'Live music for ceremonies and receptions near Pine Barrens, in New Jersey.', 'hello@pinebarrensmusic.example'),
  ('Brandywine Bakery', 'Cake', 'Mid-Atlantic', 'Pennsylvania', 'Luxury', 'Custom tiered cakes and dessert tables near Brandywine, in Pennsylvania.', 'hello@brandywinecake.example'),
  ('Brandywine Events Co.', 'Planning', 'Mid-Atlantic', 'Pennsylvania', 'Simple', 'Full-service planning and day-of coordination near Brandywine, in Pennsylvania.', 'hello@brandywineplanning.example'),
  ('Brandywine Creek Beauty Collective', 'Hair & Makeup', 'Mid-Atlantic', 'Delaware', 'Simple', 'On-site hair and makeup teams near Brandywine Creek, in Delaware.', 'hello@brandywinecreekhairmakeup.example'),
  ('Brandywine Creek Rentals', 'Rentals', 'Mid-Atlantic', 'Delaware', 'Classic', 'Farm tables, market lighting, and lounge furniture rentals near Brandywine Creek, in Delaware.', 'hello@brandywinecreekrentals.example'),
  ('Chesapeake Transport', 'Transportation', 'Mid-Atlantic', 'Maryland', 'Classic', 'Shuttle buses and vintage car service near Chesapeake, in Maryland.', 'hello@chesapeaketransportation.example'),
  ('Chesapeake Officiants', 'Officiant', 'Mid-Atlantic', 'Maryland', 'Luxury', 'Personalized, non-denominational ceremony officiating near Chesapeake, in Maryland.', 'hello@chesapeakeofficiant.example'),
  ('Shenandoah Photography Co.', 'Photography', 'Mid-Atlantic', 'Virginia', 'Luxury', 'Documentary-style wedding photography based near Shenandoah, in Virginia.', 'hello@shenandoahphotography.example'),
  ('Shenandoah Films', 'Videography', 'Mid-Atlantic', 'Virginia', 'Simple', 'Cinematic highlight films and drone coverage, based near Shenandoah, in Virginia.', 'hello@shenandoahvideography.example'),
  ('Blackwater Catering', 'Catering', 'Mid-Atlantic', 'West Virginia', 'Simple', 'Farm-to-table plated dinners and family-style service near Blackwater, in West Virginia.', 'hello@blackwatercatering.example'),
  ('Blackwater Florals', 'Florals', 'Mid-Atlantic', 'West Virginia', 'Classic', 'Garden-style arrangements using seasonal blooms near Blackwater, in West Virginia.', 'hello@blackwaterflorals.example'),
  ('Rock Creek Sound & Strings', 'Music', 'Mid-Atlantic', 'District of Columbia', 'Classic', 'Live music for ceremonies and receptions near Rock Creek, in District of Columbia.', 'hello@rockcreekmusic.example'),
  ('Rock Creek Bakery', 'Cake', 'Mid-Atlantic', 'District of Columbia', 'Luxury', 'Custom tiered cakes and dessert tables near Rock Creek, in District of Columbia.', 'hello@rockcreekcake.example'),
  ('Blue Ridge Events Co.', 'Planning', 'Southeast', 'North Carolina', 'Luxury', 'Full-service planning and day-of coordination near Blue Ridge, in North Carolina.', 'hello@blueridgeplanning.example'),
  ('Blue Ridge Beauty Collective', 'Hair & Makeup', 'Southeast', 'North Carolina', 'Simple', 'On-site hair and makeup teams near Blue Ridge, in North Carolina.', 'hello@blueridgehairmakeup.example'),
  ('Lowcountry Rentals', 'Rentals', 'Southeast', 'South Carolina', 'Simple', 'Farm tables, market lighting, and lounge furniture rentals near Lowcountry, in South Carolina.', 'hello@lowcountryrentals.example'),
  ('Lowcountry Transport', 'Transportation', 'Southeast', 'South Carolina', 'Classic', 'Shuttle buses and vintage car service near Lowcountry, in South Carolina.', 'hello@lowcountrytransportation.example'),
  ('Savannah Officiants', 'Officiant', 'Southeast', 'Georgia', 'Classic', 'Personalized, non-denominational ceremony officiating near Savannah, in Georgia.', 'hello@savannahofficiant.example'),
  ('Savannah Photography Co.', 'Photography', 'Southeast', 'Georgia', 'Luxury', 'Documentary-style wedding photography based near Savannah, in Georgia.', 'hello@savannahphotography.example'),
  ('Biscayne Films', 'Videography', 'Southeast', 'Florida', 'Luxury', 'Cinematic highlight films and drone coverage, based near Biscayne, in Florida.', 'hello@biscaynevideography.example'),
  ('Biscayne Catering', 'Catering', 'Southeast', 'Florida', 'Simple', 'Farm-to-table plated dinners and family-style service near Biscayne, in Florida.', 'hello@biscaynecatering.example'),
  ('Gulf Shores Florals', 'Florals', 'Southeast', 'Alabama', 'Simple', 'Garden-style arrangements using seasonal blooms near Gulf Shores, in Alabama.', 'hello@gulfshoresflorals.example'),
  ('Gulf Shores Sound & Strings', 'Music', 'Southeast', 'Alabama', 'Classic', 'Live music for ceremonies and receptions near Gulf Shores, in Alabama.', 'hello@gulfshoresmusic.example'),
  ('Natchez Bakery', 'Cake', 'Southeast', 'Mississippi', 'Classic', 'Custom tiered cakes and dessert tables near Natchez, in Mississippi.', 'hello@natchezcake.example'),
  ('Natchez Events Co.', 'Planning', 'Southeast', 'Mississippi', 'Luxury', 'Full-service planning and day-of coordination near Natchez, in Mississippi.', 'hello@natchezplanning.example'),
  ('Smoky Mountain Beauty Collective', 'Hair & Makeup', 'Southeast', 'Tennessee', 'Luxury', 'On-site hair and makeup teams near Smoky Mountain, in Tennessee.', 'hello@smokymountainhairmakeup.example'),
  ('Smoky Mountain Rentals', 'Rentals', 'Southeast', 'Tennessee', 'Simple', 'Farm tables, market lighting, and lounge furniture rentals near Smoky Mountain, in Tennessee.', 'hello@smokymountainrentals.example'),
  ('Bluegrass Transport', 'Transportation', 'Southeast', 'Kentucky', 'Simple', 'Shuttle buses and vintage car service near Bluegrass, in Kentucky.', 'hello@bluegrasstransportation.example'),
  ('Bluegrass Officiants', 'Officiant', 'Southeast', 'Kentucky', 'Classic', 'Personalized, non-denominational ceremony officiating near Bluegrass, in Kentucky.', 'hello@bluegrassofficiant.example'),
  ('Bayou Photography Co.', 'Photography', 'Southeast', 'Louisiana', 'Classic', 'Documentary-style wedding photography based near Bayou, in Louisiana.', 'hello@bayouphotography.example'),
  ('Bayou Films', 'Videography', 'Southeast', 'Louisiana', 'Luxury', 'Cinematic highlight films and drone coverage, based near Bayou, in Louisiana.', 'hello@bayouvideography.example'),
  ('Ozark Catering', 'Catering', 'Southeast', 'Arkansas', 'Luxury', 'Farm-to-table plated dinners and family-style service near Ozark, in Arkansas.', 'hello@ozarkcatering.example'),
  ('Ozark Florals', 'Florals', 'Southeast', 'Arkansas', 'Simple', 'Garden-style arrangements using seasonal blooms near Ozark, in Arkansas.', 'hello@ozarkflorals.example'),
  ('Cuyahoga Sound & Strings', 'Music', 'Midwest', 'Ohio', 'Simple', 'Live music for ceremonies and receptions near Cuyahoga, in Ohio.', 'hello@cuyahogamusic.example'),
  ('Cuyahoga Bakery', 'Cake', 'Midwest', 'Ohio', 'Classic', 'Custom tiered cakes and dessert tables near Cuyahoga, in Ohio.', 'hello@cuyahogacake.example'),
  ('Whitewater Events Co.', 'Planning', 'Midwest', 'Indiana', 'Classic', 'Full-service planning and day-of coordination near Whitewater, in Indiana.', 'hello@whitewaterplanning.example'),
  ('Whitewater Beauty Collective', 'Hair & Makeup', 'Midwest', 'Indiana', 'Luxury', 'On-site hair and makeup teams near Whitewater, in Indiana.', 'hello@whitewaterhairmakeup.example'),
  ('Prairie Rentals', 'Rentals', 'Midwest', 'Illinois', 'Luxury', 'Farm tables, market lighting, and lounge furniture rentals near Prairie, in Illinois.', 'hello@prairierentals.example'),
  ('Prairie Transport', 'Transportation', 'Midwest', 'Illinois', 'Simple', 'Shuttle buses and vintage car service near Prairie, in Illinois.', 'hello@prairietransportation.example'),
  ('Great Lakes Officiants', 'Officiant', 'Midwest', 'Michigan', 'Simple', 'Personalized, non-denominational ceremony officiating near Great Lakes, in Michigan.', 'hello@greatlakesofficiant.example'),
  ('Great Lakes Photography Co.', 'Photography', 'Midwest', 'Michigan', 'Classic', 'Documentary-style wedding photography based near Great Lakes, in Michigan.', 'hello@greatlakesphotography.example'),
  ('Driftless Films', 'Videography', 'Midwest', 'Wisconsin', 'Classic', 'Cinematic highlight films and drone coverage, based near Driftless, in Wisconsin.', 'hello@driftlessvideography.example'),
  ('Driftless Catering', 'Catering', 'Midwest', 'Wisconsin', 'Luxury', 'Farm-to-table plated dinners and family-style service near Driftless, in Wisconsin.', 'hello@driftlesscatering.example'),
  ('Northwoods Florals', 'Florals', 'Midwest', 'Minnesota', 'Luxury', 'Garden-style arrangements using seasonal blooms near Northwoods, in Minnesota.', 'hello@northwoodsflorals.example'),
  ('Northwoods Sound & Strings', 'Music', 'Midwest', 'Minnesota', 'Simple', 'Live music for ceremonies and receptions near Northwoods, in Minnesota.', 'hello@northwoodsmusic.example'),
  ('Cedar Valley Bakery', 'Cake', 'Midwest', 'Iowa', 'Simple', 'Custom tiered cakes and dessert tables near Cedar Valley, in Iowa.', 'hello@cedarvalleycake.example'),
  ('Cedar Valley Events Co.', 'Planning', 'Midwest', 'Iowa', 'Classic', 'Full-service planning and day-of coordination near Cedar Valley, in Iowa.', 'hello@cedarvalleyplanning.example'),
  ('Ozark Hills Beauty Collective', 'Hair & Makeup', 'Midwest', 'Missouri', 'Classic', 'On-site hair and makeup teams near Ozark Hills, in Missouri.', 'hello@ozarkhillshairmakeup.example'),
  ('Ozark Hills Rentals', 'Rentals', 'Midwest', 'Missouri', 'Luxury', 'Farm tables, market lighting, and lounge furniture rentals near Ozark Hills, in Missouri.', 'hello@ozarkhillsrentals.example'),
  ('Flint Hills Transport', 'Transportation', 'Midwest', 'Kansas', 'Luxury', 'Shuttle buses and vintage car service near Flint Hills, in Kansas.', 'hello@flinthillstransportation.example'),
  ('Flint Hills Officiants', 'Officiant', 'Midwest', 'Kansas', 'Simple', 'Personalized, non-denominational ceremony officiating near Flint Hills, in Kansas.', 'hello@flinthillsofficiant.example'),
  ('Sandhills Photography Co.', 'Photography', 'Midwest', 'Nebraska', 'Simple', 'Documentary-style wedding photography based near Sandhills, in Nebraska.', 'hello@sandhillsphotography.example'),
  ('Sandhills Films', 'Videography', 'Midwest', 'Nebraska', 'Classic', 'Cinematic highlight films and drone coverage, based near Sandhills, in Nebraska.', 'hello@sandhillsvideography.example'),
  ('Badlands Catering', 'Catering', 'Midwest', 'North Dakota', 'Classic', 'Farm-to-table plated dinners and family-style service near Badlands, in North Dakota.', 'hello@badlandscatering.example'),
  ('Badlands Florals', 'Florals', 'Midwest', 'North Dakota', 'Luxury', 'Garden-style arrangements using seasonal blooms near Badlands, in North Dakota.', 'hello@badlandsflorals.example'),
  ('Black Hills Sound & Strings', 'Music', 'Midwest', 'South Dakota', 'Luxury', 'Live music for ceremonies and receptions near Black Hills, in South Dakota.', 'hello@blackhillsmusic.example'),
  ('Black Hills Bakery', 'Cake', 'Midwest', 'South Dakota', 'Simple', 'Custom tiered cakes and dessert tables near Black Hills, in South Dakota.', 'hello@blackhillscake.example'),
  ('Hill Country Events Co.', 'Planning', 'Southwest', 'Texas', 'Simple', 'Full-service planning and day-of coordination near Hill Country, in Texas.', 'hello@hillcountryplanning.example'),
  ('Hill Country Beauty Collective', 'Hair & Makeup', 'Southwest', 'Texas', 'Classic', 'On-site hair and makeup teams near Hill Country, in Texas.', 'hello@hillcountryhairmakeup.example'),
  ('Red River Rentals', 'Rentals', 'Southwest', 'Oklahoma', 'Classic', 'Farm tables, market lighting, and lounge furniture rentals near Red River, in Oklahoma.', 'hello@redriverrentals.example'),
  ('Red River Transport', 'Transportation', 'Southwest', 'Oklahoma', 'Luxury', 'Shuttle buses and vintage car service near Red River, in Oklahoma.', 'hello@redrivertransportation.example'),
  ('Sangre de Cristo Officiants', 'Officiant', 'Southwest', 'New Mexico', 'Luxury', 'Personalized, non-denominational ceremony officiating near Sangre de Cristo, in New Mexico.', 'hello@sangredecristoofficiant.example'),
  ('Sangre de Cristo Photography Co.', 'Photography', 'Southwest', 'New Mexico', 'Simple', 'Documentary-style wedding photography based near Sangre de Cristo, in New Mexico.', 'hello@sangredecristophotography.example'),
  ('Sonoran Films', 'Videography', 'Southwest', 'Arizona', 'Simple', 'Cinematic highlight films and drone coverage, based near Sonoran, in Arizona.', 'hello@sonoranvideography.example'),
  ('Sonoran Catering', 'Catering', 'Southwest', 'Arizona', 'Classic', 'Farm-to-table plated dinners and family-style service near Sonoran, in Arizona.', 'hello@sonorancatering.example'),
  ('Rocky Mountain Florals', 'Florals', 'Mountain West', 'Colorado', 'Classic', 'Garden-style arrangements using seasonal blooms near Rocky Mountain, in Colorado.', 'hello@rockymountainflorals.example'),
  ('Rocky Mountain Sound & Strings', 'Music', 'Mountain West', 'Colorado', 'Luxury', 'Live music for ceremonies and receptions near Rocky Mountain, in Colorado.', 'hello@rockymountainmusic.example'),
  ('Wasatch Bakery', 'Cake', 'Mountain West', 'Utah', 'Luxury', 'Custom tiered cakes and dessert tables near Wasatch, in Utah.', 'hello@wasatchcake.example'),
  ('Wasatch Events Co.', 'Planning', 'Mountain West', 'Utah', 'Simple', 'Full-service planning and day-of coordination near Wasatch, in Utah.', 'hello@wasatchplanning.example'),
  ('Sierra Foothill Beauty Collective', 'Hair & Makeup', 'Mountain West', 'Nevada', 'Simple', 'On-site hair and makeup teams near Sierra Foothill, in Nevada.', 'hello@sierrafoothillhairmakeup.example'),
  ('Sierra Foothill Rentals', 'Rentals', 'Mountain West', 'Nevada', 'Classic', 'Farm tables, market lighting, and lounge furniture rentals near Sierra Foothill, in Nevada.', 'hello@sierrafoothillrentals.example'),
  ('Tetons Transport', 'Transportation', 'Mountain West', 'Wyoming', 'Classic', 'Shuttle buses and vintage car service near Tetons, in Wyoming.', 'hello@tetonstransportation.example'),
  ('Tetons Officiants', 'Officiant', 'Mountain West', 'Wyoming', 'Luxury', 'Personalized, non-denominational ceremony officiating near Tetons, in Wyoming.', 'hello@tetonsofficiant.example'),
  ('Big Sky Photography Co.', 'Photography', 'Mountain West', 'Montana', 'Luxury', 'Documentary-style wedding photography based near Big Sky, in Montana.', 'hello@bigskyphotography.example'),
  ('Big Sky Films', 'Videography', 'Mountain West', 'Montana', 'Simple', 'Cinematic highlight films and drone coverage, based near Big Sky, in Montana.', 'hello@bigskyvideography.example'),
  ('Sawtooth Catering', 'Catering', 'Mountain West', 'Idaho', 'Simple', 'Farm-to-table plated dinners and family-style service near Sawtooth, in Idaho.', 'hello@sawtoothcatering.example'),
  ('Sawtooth Florals', 'Florals', 'Mountain West', 'Idaho', 'Classic', 'Garden-style arrangements using seasonal blooms near Sawtooth, in Idaho.', 'hello@sawtoothflorals.example'),
  ('Puget Sound Sound & Strings', 'Music', 'Pacific Northwest', 'Washington', 'Classic', 'Live music for ceremonies and receptions near Puget Sound, in Washington.', 'hello@pugetsoundmusic.example'),
  ('Puget Sound Bakery', 'Cake', 'Pacific Northwest', 'Washington', 'Luxury', 'Custom tiered cakes and dessert tables near Puget Sound, in Washington.', 'hello@pugetsoundcake.example'),
  ('Willamette Valley Events Co.', 'Planning', 'Pacific Northwest', 'Oregon', 'Luxury', 'Full-service planning and day-of coordination near Willamette Valley, in Oregon.', 'hello@willamettevalleyplanning.example'),
  ('Willamette Valley Beauty Collective', 'Hair & Makeup', 'Pacific Northwest', 'Oregon', 'Simple', 'On-site hair and makeup teams near Willamette Valley, in Oregon.', 'hello@willamettevalleyhairmakeup.example'),
  ('Kenai Rentals', 'Rentals', 'Pacific Northwest', 'Alaska', 'Simple', 'Farm tables, market lighting, and lounge furniture rentals near Kenai, in Alaska.', 'hello@kenairentals.example'),
  ('Kenai Transport', 'Transportation', 'Pacific Northwest', 'Alaska', 'Classic', 'Shuttle buses and vintage car service near Kenai, in Alaska.', 'hello@kenaitransportation.example'),
  ('Sonoma Officiants', 'Officiant', 'West Coast', 'California', 'Classic', 'Personalized, non-denominational ceremony officiating near Sonoma, in California.', 'hello@sonomaofficiant.example'),
  ('Sonoma Photography Co.', 'Photography', 'West Coast', 'California', 'Luxury', 'Documentary-style wedding photography based near Sonoma, in California.', 'hello@sonomaphotography.example'),
  ('Kailua Films', 'Videography', 'West Coast', 'Hawaii', 'Luxury', 'Cinematic highlight films and drone coverage, based near Kailua, in Hawaii.', 'hello@kailuavideography.example'),
  ('Kailua Catering', 'Catering', 'West Coast', 'Hawaii', 'Simple', 'Farm-to-table plated dinners and family-style service near Kailua, in Hawaii.', 'hello@kailuacatering.example');
) as seed(name, category, region, state, price_tier, description, contact_email)
where not exists (
  select 1 from vendors where vendors.name = seed.name
);
