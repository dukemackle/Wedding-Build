-- Vendors get a street address, like venues (0084), so a vendor with a studio
-- or shop is pinned where it actually is rather than near its town's centre.
-- Null for home-based vendors, who keep the town pin. Not added to anon's
-- column grants (0091): the map pin is what the public needs, not the street.
alter table vendors add column if not exists address text;
