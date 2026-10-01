-- Vendors get a street address, like venues (0084), so a vendor with a studio
-- or shop is pinned where it actually is rather than near its town's centre.
-- Null for home-based vendors, who keep the town pin. Not added to anon's
-- column grants (0091): the map pin is what the public needs, not the street.
alter table vendors add column if not exists address text;

-- When the address finder (src/lib/address-finder.ts) last read the listing's
-- own website for a street address, found or not, so a site without one
-- isn't fetched again on every batch-import call.
alter table venues add column if not exists address_checked_at timestamptz;
alter table vendors add column if not exists address_checked_at timestamptz;
