-- Add a state field to venues, backfill the original 12 placeholder venues
-- with a representative state, and seed 2 venues per US state (+DC) so the
-- Venues module can be filtered/searched nationwide.
alter table venues add column if not exists state text;

update venues set state = 'Wisconsin' where name = 'Cedar Hollow Barn' and state is null;
update venues set state = 'Massachusetts' where name = 'The Grand Linden Ballroom' and state is null;
update venues set state = 'Georgia' where name = 'Willow Creek Gardens' and state is null;
update venues set state = 'California' where name = 'Sandpiper Cove' and state is null;
update venues set state = 'New York' where name = 'The Ashford Estate' and state is null;
update venues set state = 'Oregon' where name = 'Vine & Table Vineyard' and state is null;
update venues set state = 'Arizona' where name = 'Sunset Mesa Ranch' and state is null;
update venues set state = 'Colorado' where name = 'Timberline Lodge Hall' and state is null;
update venues set state = 'Maine' where name = 'Harbor Light Pavilion' and state is null;
update venues set state = 'South Carolina' where name = 'Magnolia Manor' and state is null;
update venues set state = 'Iowa' where name = 'Prairie Rose Farm' and state is null;
update venues set state = 'New Mexico' where name = 'Copper Canyon Cellars' and state is null;

-- Two placeholder venues per US state + DC, spanning the existing venue types
-- and price tiers. Safe to re-run since it checks for existing rows by name.
insert into venues (name, region, state, venue_type, capacity, price_tier, description)
select * from (values
  ('Litchfield Hills Barn', 'Northeast', 'Connecticut', 'Barn / Rustic', 127, 'Simple', 'A restored barn near Litchfield Hills with string lights and open fields, in Connecticut.'),
  ('Litchfield Hills Grand Hall', 'Northeast', 'Connecticut', 'Ballroom / Hotel', 164, 'Classic', 'An elegant ballroom near Litchfield Hills with chandeliers and a dedicated bridal suite, in Connecticut.'),
  ('Casco Bay Gardens', 'Northeast', 'Maine', 'Garden / Outdoor', 201, 'Classic', 'Manicured grounds near Casco Bay with a covered pavilion for rain backup, in Maine.'),
  ('Casco Bay Shore Pavilion', 'Northeast', 'Maine', 'Beach / Waterfront', 238, 'Luxury', 'A waterfront setting along the Casco Bay with room for a sunset ceremony, in Maine.'),
  ('The Berkshire Estate', 'Northeast', 'Massachusetts', 'Historic / Estate', 275, 'Luxury', 'A historic estate near Berkshire with formal gardens and a reception hall, in Massachusetts.'),
  ('Berkshire Vineyard Table', 'Northeast', 'Massachusetts', 'Restaurant / Vineyard', 312, 'Simple', 'A working vineyard near the Berkshire with an open-air pavilion, in Massachusetts.'),
  ('White Mountain Barn', 'Northeast', 'New Hampshire', 'Barn / Rustic', 349, 'Simple', 'A restored barn near White Mountain with string lights and open fields, in New Hampshire.'),
  ('White Mountain Grand Hall', 'Northeast', 'New Hampshire', 'Ballroom / Hotel', 126, 'Classic', 'An elegant ballroom near White Mountain with chandeliers and a dedicated bridal suite, in New Hampshire.'),
  ('Narragansett Gardens', 'Northeast', 'Rhode Island', 'Garden / Outdoor', 163, 'Classic', 'Manicured grounds near Narragansett with a covered pavilion for rain backup, in Rhode Island.'),
  ('Narragansett Shore Pavilion', 'Northeast', 'Rhode Island', 'Beach / Waterfront', 200, 'Luxury', 'A waterfront setting along the Narragansett with room for a sunset ceremony, in Rhode Island.'),
  ('The Green Mountain Estate', 'Northeast', 'Vermont', 'Historic / Estate', 237, 'Luxury', 'A historic estate near Green Mountain with formal gardens and a reception hall, in Vermont.'),
  ('Green Mountain Vineyard Table', 'Northeast', 'Vermont', 'Restaurant / Vineyard', 274, 'Simple', 'A working vineyard near the Green Mountain with an open-air pavilion, in Vermont.'),
  ('Hudson Valley Barn', 'Mid-Atlantic', 'New York', 'Barn / Rustic', 311, 'Simple', 'A restored barn near Hudson Valley with string lights and open fields, in New York.'),
  ('Hudson Valley Grand Hall', 'Mid-Atlantic', 'New York', 'Ballroom / Hotel', 348, 'Classic', 'An elegant ballroom near Hudson Valley with chandeliers and a dedicated bridal suite, in New York.'),
  ('Pine Barrens Gardens', 'Mid-Atlantic', 'New Jersey', 'Garden / Outdoor', 125, 'Classic', 'Manicured grounds near Pine Barrens with a covered pavilion for rain backup, in New Jersey.'),
  ('Pine Barrens Shore Pavilion', 'Mid-Atlantic', 'New Jersey', 'Beach / Waterfront', 162, 'Luxury', 'A waterfront setting along the Pine Barrens with room for a sunset ceremony, in New Jersey.'),
  ('The Brandywine Estate', 'Mid-Atlantic', 'Pennsylvania', 'Historic / Estate', 199, 'Luxury', 'A historic estate near Brandywine with formal gardens and a reception hall, in Pennsylvania.'),
  ('Brandywine Vineyard Table', 'Mid-Atlantic', 'Pennsylvania', 'Restaurant / Vineyard', 236, 'Simple', 'A working vineyard near the Brandywine with an open-air pavilion, in Pennsylvania.'),
  ('Brandywine Creek Barn', 'Mid-Atlantic', 'Delaware', 'Barn / Rustic', 273, 'Simple', 'A restored barn near Brandywine Creek with string lights and open fields, in Delaware.'),
  ('Brandywine Creek Grand Hall', 'Mid-Atlantic', 'Delaware', 'Ballroom / Hotel', 310, 'Classic', 'An elegant ballroom near Brandywine Creek with chandeliers and a dedicated bridal suite, in Delaware.'),
  ('Chesapeake Gardens', 'Mid-Atlantic', 'Maryland', 'Garden / Outdoor', 347, 'Classic', 'Manicured grounds near Chesapeake with a covered pavilion for rain backup, in Maryland.'),
  ('Chesapeake Shore Pavilion', 'Mid-Atlantic', 'Maryland', 'Beach / Waterfront', 124, 'Luxury', 'A waterfront setting along the Chesapeake with room for a sunset ceremony, in Maryland.'),
  ('The Shenandoah Estate', 'Mid-Atlantic', 'Virginia', 'Historic / Estate', 161, 'Luxury', 'A historic estate near Shenandoah with formal gardens and a reception hall, in Virginia.'),
  ('Shenandoah Vineyard Table', 'Mid-Atlantic', 'Virginia', 'Restaurant / Vineyard', 198, 'Simple', 'A working vineyard near the Shenandoah with an open-air pavilion, in Virginia.'),
  ('Blackwater Barn', 'Mid-Atlantic', 'West Virginia', 'Barn / Rustic', 235, 'Simple', 'A restored barn near Blackwater with string lights and open fields, in West Virginia.'),
  ('Blackwater Grand Hall', 'Mid-Atlantic', 'West Virginia', 'Ballroom / Hotel', 272, 'Classic', 'An elegant ballroom near Blackwater with chandeliers and a dedicated bridal suite, in West Virginia.'),
  ('Rock Creek Gardens', 'Mid-Atlantic', 'District of Columbia', 'Garden / Outdoor', 309, 'Classic', 'Manicured grounds near Rock Creek with a covered pavilion for rain backup, in District of Columbia.'),
  ('Rock Creek Shore Pavilion', 'Mid-Atlantic', 'District of Columbia', 'Beach / Waterfront', 346, 'Luxury', 'A waterfront setting along the Rock Creek with room for a sunset ceremony, in District of Columbia.'),
  ('The Blue Ridge Estate', 'Southeast', 'North Carolina', 'Historic / Estate', 123, 'Luxury', 'A historic estate near Blue Ridge with formal gardens and a reception hall, in North Carolina.'),
  ('Blue Ridge Vineyard Table', 'Southeast', 'North Carolina', 'Restaurant / Vineyard', 160, 'Simple', 'A working vineyard near the Blue Ridge with an open-air pavilion, in North Carolina.'),
  ('Lowcountry Barn', 'Southeast', 'South Carolina', 'Barn / Rustic', 197, 'Simple', 'A restored barn near Lowcountry with string lights and open fields, in South Carolina.'),
  ('Lowcountry Grand Hall', 'Southeast', 'South Carolina', 'Ballroom / Hotel', 234, 'Classic', 'An elegant ballroom near Lowcountry with chandeliers and a dedicated bridal suite, in South Carolina.'),
  ('Savannah Gardens', 'Southeast', 'Georgia', 'Garden / Outdoor', 271, 'Classic', 'Manicured grounds near Savannah with a covered pavilion for rain backup, in Georgia.'),
  ('Savannah Shore Pavilion', 'Southeast', 'Georgia', 'Beach / Waterfront', 308, 'Luxury', 'A waterfront setting along the Savannah with room for a sunset ceremony, in Georgia.'),
  ('The Biscayne Estate', 'Southeast', 'Florida', 'Historic / Estate', 345, 'Luxury', 'A historic estate near Biscayne with formal gardens and a reception hall, in Florida.'),
  ('Biscayne Vineyard Table', 'Southeast', 'Florida', 'Restaurant / Vineyard', 122, 'Simple', 'A working vineyard near the Biscayne with an open-air pavilion, in Florida.'),
  ('Gulf Shores Barn', 'Southeast', 'Alabama', 'Barn / Rustic', 159, 'Simple', 'A restored barn near Gulf Shores with string lights and open fields, in Alabama.'),
  ('Gulf Shores Grand Hall', 'Southeast', 'Alabama', 'Ballroom / Hotel', 196, 'Classic', 'An elegant ballroom near Gulf Shores with chandeliers and a dedicated bridal suite, in Alabama.'),
  ('Natchez Gardens', 'Southeast', 'Mississippi', 'Garden / Outdoor', 233, 'Classic', 'Manicured grounds near Natchez with a covered pavilion for rain backup, in Mississippi.'),
  ('Natchez Shore Pavilion', 'Southeast', 'Mississippi', 'Beach / Waterfront', 270, 'Luxury', 'A waterfront setting along the Natchez with room for a sunset ceremony, in Mississippi.'),
  ('The Smoky Mountain Estate', 'Southeast', 'Tennessee', 'Historic / Estate', 307, 'Luxury', 'A historic estate near Smoky Mountain with formal gardens and a reception hall, in Tennessee.'),
  ('Smoky Mountain Vineyard Table', 'Southeast', 'Tennessee', 'Restaurant / Vineyard', 344, 'Simple', 'A working vineyard near the Smoky Mountain with an open-air pavilion, in Tennessee.'),
  ('Bluegrass Barn', 'Southeast', 'Kentucky', 'Barn / Rustic', 121, 'Simple', 'A restored barn near Bluegrass with string lights and open fields, in Kentucky.'),
  ('Bluegrass Grand Hall', 'Southeast', 'Kentucky', 'Ballroom / Hotel', 158, 'Classic', 'An elegant ballroom near Bluegrass with chandeliers and a dedicated bridal suite, in Kentucky.'),
  ('Bayou Gardens', 'Southeast', 'Louisiana', 'Garden / Outdoor', 195, 'Classic', 'Manicured grounds near Bayou with a covered pavilion for rain backup, in Louisiana.'),
  ('Bayou Shore Pavilion', 'Southeast', 'Louisiana', 'Beach / Waterfront', 232, 'Luxury', 'A waterfront setting along the Bayou with room for a sunset ceremony, in Louisiana.'),
  ('The Ozark Estate', 'Southeast', 'Arkansas', 'Historic / Estate', 269, 'Luxury', 'A historic estate near Ozark with formal gardens and a reception hall, in Arkansas.'),
  ('Ozark Vineyard Table', 'Southeast', 'Arkansas', 'Restaurant / Vineyard', 306, 'Simple', 'A working vineyard near the Ozark with an open-air pavilion, in Arkansas.'),
  ('Cuyahoga Barn', 'Midwest', 'Ohio', 'Barn / Rustic', 343, 'Simple', 'A restored barn near Cuyahoga with string lights and open fields, in Ohio.'),
  ('Cuyahoga Grand Hall', 'Midwest', 'Ohio', 'Ballroom / Hotel', 120, 'Classic', 'An elegant ballroom near Cuyahoga with chandeliers and a dedicated bridal suite, in Ohio.'),
  ('Whitewater Gardens', 'Midwest', 'Indiana', 'Garden / Outdoor', 157, 'Classic', 'Manicured grounds near Whitewater with a covered pavilion for rain backup, in Indiana.'),
  ('Whitewater Shore Pavilion', 'Midwest', 'Indiana', 'Beach / Waterfront', 194, 'Luxury', 'A waterfront setting along the Whitewater with room for a sunset ceremony, in Indiana.'),
  ('The Prairie Estate', 'Midwest', 'Illinois', 'Historic / Estate', 231, 'Luxury', 'A historic estate near Prairie with formal gardens and a reception hall, in Illinois.'),
  ('Prairie Vineyard Table', 'Midwest', 'Illinois', 'Restaurant / Vineyard', 268, 'Simple', 'A working vineyard near the Prairie with an open-air pavilion, in Illinois.'),
  ('Great Lakes Barn', 'Midwest', 'Michigan', 'Barn / Rustic', 305, 'Simple', 'A restored barn near Great Lakes with string lights and open fields, in Michigan.'),
  ('Great Lakes Grand Hall', 'Midwest', 'Michigan', 'Ballroom / Hotel', 342, 'Classic', 'An elegant ballroom near Great Lakes with chandeliers and a dedicated bridal suite, in Michigan.'),
  ('Driftless Gardens', 'Midwest', 'Wisconsin', 'Garden / Outdoor', 119, 'Classic', 'Manicured grounds near Driftless with a covered pavilion for rain backup, in Wisconsin.'),
  ('Driftless Shore Pavilion', 'Midwest', 'Wisconsin', 'Beach / Waterfront', 156, 'Luxury', 'A waterfront setting along the Driftless with room for a sunset ceremony, in Wisconsin.'),
  ('The Northwoods Estate', 'Midwest', 'Minnesota', 'Historic / Estate', 193, 'Luxury', 'A historic estate near Northwoods with formal gardens and a reception hall, in Minnesota.'),
  ('Northwoods Vineyard Table', 'Midwest', 'Minnesota', 'Restaurant / Vineyard', 230, 'Simple', 'A working vineyard near the Northwoods with an open-air pavilion, in Minnesota.'),
  ('Cedar Valley Barn', 'Midwest', 'Iowa', 'Barn / Rustic', 267, 'Simple', 'A restored barn near Cedar Valley with string lights and open fields, in Iowa.'),
  ('Cedar Valley Grand Hall', 'Midwest', 'Iowa', 'Ballroom / Hotel', 304, 'Classic', 'An elegant ballroom near Cedar Valley with chandeliers and a dedicated bridal suite, in Iowa.'),
  ('Ozark Hills Gardens', 'Midwest', 'Missouri', 'Garden / Outdoor', 341, 'Classic', 'Manicured grounds near Ozark Hills with a covered pavilion for rain backup, in Missouri.'),
  ('Ozark Hills Shore Pavilion', 'Midwest', 'Missouri', 'Beach / Waterfront', 118, 'Luxury', 'A waterfront setting along the Ozark Hills with room for a sunset ceremony, in Missouri.'),
  ('The Flint Hills Estate', 'Midwest', 'Kansas', 'Historic / Estate', 155, 'Luxury', 'A historic estate near Flint Hills with formal gardens and a reception hall, in Kansas.'),
  ('Flint Hills Vineyard Table', 'Midwest', 'Kansas', 'Restaurant / Vineyard', 192, 'Simple', 'A working vineyard near the Flint Hills with an open-air pavilion, in Kansas.'),
  ('Sandhills Barn', 'Midwest', 'Nebraska', 'Barn / Rustic', 229, 'Simple', 'A restored barn near Sandhills with string lights and open fields, in Nebraska.'),
  ('Sandhills Grand Hall', 'Midwest', 'Nebraska', 'Ballroom / Hotel', 266, 'Classic', 'An elegant ballroom near Sandhills with chandeliers and a dedicated bridal suite, in Nebraska.'),
  ('Badlands Gardens', 'Midwest', 'North Dakota', 'Garden / Outdoor', 303, 'Classic', 'Manicured grounds near Badlands with a covered pavilion for rain backup, in North Dakota.'),
  ('Badlands Shore Pavilion', 'Midwest', 'North Dakota', 'Beach / Waterfront', 340, 'Luxury', 'A waterfront setting along the Badlands with room for a sunset ceremony, in North Dakota.'),
  ('The Black Hills Estate', 'Midwest', 'South Dakota', 'Historic / Estate', 117, 'Luxury', 'A historic estate near Black Hills with formal gardens and a reception hall, in South Dakota.'),
  ('Black Hills Vineyard Table', 'Midwest', 'South Dakota', 'Restaurant / Vineyard', 154, 'Simple', 'A working vineyard near the Black Hills with an open-air pavilion, in South Dakota.'),
  ('Hill Country Barn', 'Southwest', 'Texas', 'Barn / Rustic', 191, 'Simple', 'A restored barn near Hill Country with string lights and open fields, in Texas.'),
  ('Hill Country Grand Hall', 'Southwest', 'Texas', 'Ballroom / Hotel', 228, 'Classic', 'An elegant ballroom near Hill Country with chandeliers and a dedicated bridal suite, in Texas.'),
  ('Red River Gardens', 'Southwest', 'Oklahoma', 'Garden / Outdoor', 265, 'Classic', 'Manicured grounds near Red River with a covered pavilion for rain backup, in Oklahoma.'),
  ('Red River Shore Pavilion', 'Southwest', 'Oklahoma', 'Beach / Waterfront', 302, 'Luxury', 'A waterfront setting along the Red River with room for a sunset ceremony, in Oklahoma.'),
  ('The Sangre de Cristo Estate', 'Southwest', 'New Mexico', 'Historic / Estate', 339, 'Luxury', 'A historic estate near Sangre de Cristo with formal gardens and a reception hall, in New Mexico.'),
  ('Sangre de Cristo Vineyard Table', 'Southwest', 'New Mexico', 'Restaurant / Vineyard', 116, 'Simple', 'A working vineyard near the Sangre de Cristo with an open-air pavilion, in New Mexico.'),
  ('Sonoran Barn', 'Southwest', 'Arizona', 'Barn / Rustic', 153, 'Simple', 'A restored barn near Sonoran with string lights and open fields, in Arizona.'),
  ('Sonoran Grand Hall', 'Southwest', 'Arizona', 'Ballroom / Hotel', 190, 'Classic', 'An elegant ballroom near Sonoran with chandeliers and a dedicated bridal suite, in Arizona.'),
  ('Rocky Mountain Gardens', 'Mountain West', 'Colorado', 'Garden / Outdoor', 227, 'Classic', 'Manicured grounds near Rocky Mountain with a covered pavilion for rain backup, in Colorado.'),
  ('Rocky Mountain Shore Pavilion', 'Mountain West', 'Colorado', 'Beach / Waterfront', 264, 'Luxury', 'A waterfront setting along the Rocky Mountain with room for a sunset ceremony, in Colorado.'),
  ('The Wasatch Estate', 'Mountain West', 'Utah', 'Historic / Estate', 301, 'Luxury', 'A historic estate near Wasatch with formal gardens and a reception hall, in Utah.'),
  ('Wasatch Vineyard Table', 'Mountain West', 'Utah', 'Restaurant / Vineyard', 338, 'Simple', 'A working vineyard near the Wasatch with an open-air pavilion, in Utah.'),
  ('Sierra Foothill Barn', 'Mountain West', 'Nevada', 'Barn / Rustic', 115, 'Simple', 'A restored barn near Sierra Foothill with string lights and open fields, in Nevada.'),
  ('Sierra Foothill Grand Hall', 'Mountain West', 'Nevada', 'Ballroom / Hotel', 152, 'Classic', 'An elegant ballroom near Sierra Foothill with chandeliers and a dedicated bridal suite, in Nevada.'),
  ('Tetons Gardens', 'Mountain West', 'Wyoming', 'Garden / Outdoor', 189, 'Classic', 'Manicured grounds near Tetons with a covered pavilion for rain backup, in Wyoming.'),
  ('Tetons Shore Pavilion', 'Mountain West', 'Wyoming', 'Beach / Waterfront', 226, 'Luxury', 'A waterfront setting along the Tetons with room for a sunset ceremony, in Wyoming.'),
  ('The Big Sky Estate', 'Mountain West', 'Montana', 'Historic / Estate', 263, 'Luxury', 'A historic estate near Big Sky with formal gardens and a reception hall, in Montana.'),
  ('Big Sky Vineyard Table', 'Mountain West', 'Montana', 'Restaurant / Vineyard', 300, 'Simple', 'A working vineyard near the Big Sky with an open-air pavilion, in Montana.'),
  ('Sawtooth Barn', 'Mountain West', 'Idaho', 'Barn / Rustic', 337, 'Simple', 'A restored barn near Sawtooth with string lights and open fields, in Idaho.'),
  ('Sawtooth Grand Hall', 'Mountain West', 'Idaho', 'Ballroom / Hotel', 114, 'Classic', 'An elegant ballroom near Sawtooth with chandeliers and a dedicated bridal suite, in Idaho.'),
  ('Puget Sound Gardens', 'Pacific Northwest', 'Washington', 'Garden / Outdoor', 151, 'Classic', 'Manicured grounds near Puget Sound with a covered pavilion for rain backup, in Washington.'),
  ('Puget Sound Shore Pavilion', 'Pacific Northwest', 'Washington', 'Beach / Waterfront', 188, 'Luxury', 'A waterfront setting along the Puget Sound with room for a sunset ceremony, in Washington.'),
  ('The Willamette Valley Estate', 'Pacific Northwest', 'Oregon', 'Historic / Estate', 225, 'Luxury', 'A historic estate near Willamette Valley with formal gardens and a reception hall, in Oregon.'),
  ('Willamette Valley Vineyard Table', 'Pacific Northwest', 'Oregon', 'Restaurant / Vineyard', 262, 'Simple', 'A working vineyard near the Willamette Valley with an open-air pavilion, in Oregon.'),
  ('Kenai Barn', 'Pacific Northwest', 'Alaska', 'Barn / Rustic', 299, 'Simple', 'A restored barn near Kenai with string lights and open fields, in Alaska.'),
  ('Kenai Grand Hall', 'Pacific Northwest', 'Alaska', 'Ballroom / Hotel', 336, 'Classic', 'An elegant ballroom near Kenai with chandeliers and a dedicated bridal suite, in Alaska.'),
  ('Sonoma Gardens', 'West Coast', 'California', 'Garden / Outdoor', 113, 'Classic', 'Manicured grounds near Sonoma with a covered pavilion for rain backup, in California.'),
  ('Sonoma Shore Pavilion', 'West Coast', 'California', 'Beach / Waterfront', 150, 'Luxury', 'A waterfront setting along the Sonoma with room for a sunset ceremony, in California.'),
  ('The Kailua Estate', 'West Coast', 'Hawaii', 'Historic / Estate', 187, 'Luxury', 'A historic estate near Kailua with formal gardens and a reception hall, in Hawaii.'),
  ('Kailua Vineyard Table', 'West Coast', 'Hawaii', 'Restaurant / Vineyard', 224, 'Simple', 'A working vineyard near the Kailua with an open-air pavilion, in Hawaii.')
) as seed(name, region, state, venue_type, capacity, price_tier, description)
where not exists (
  select 1 from venues where venues.name = seed.name
);
