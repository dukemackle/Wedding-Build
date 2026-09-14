-- Optional phone number a couple can include when messaging a venue or
-- vendor, so the recipient can call/text back instead of only email.
alter table venue_inquiries add column if not exists sender_phone text;
alter table vendor_inquiries add column if not exists sender_phone text;
