-- Lets the couple attach what/who a budget line item was actually
-- purchased from (e.g. "Cedar Hollow Barn" for the venue category,
-- "Harvest Table Catering" for catering), shown alongside the actual
-- amount they entered.
alter table budget_line_items add column if not exists purchased_from text;

-- Optional contact info the couple can attach to a favorited venue or
-- vendor, for the new Contacts page -- venues have no catalog contact
-- info (unlike vendors, which already have contact_email), and vendors
-- only have an email on file, not a phone number.
alter table venue_shortlist add column if not exists contact_email text;
alter table venue_shortlist add column if not exists contact_phone text;
alter table vendor_favorites add column if not exists contact_phone text;
