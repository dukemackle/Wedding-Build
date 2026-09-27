-- Venues and vendors listing themselves ("List your business", linked from
-- the login page). A new listing is created as an inactive row with
-- source = 'self-listed' and goes live on its first approved submission --
-- no schema change needed for that.
--
-- "Edit my listing" looks listings up by email, case-insensitively.
create index if not exists venues_contact_email_idx on venues (lower(contact_email));
create index if not exists vendors_contact_email_idx on vendors (lower(contact_email));
