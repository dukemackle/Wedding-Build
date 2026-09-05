-- Vendor inquiry follow-ups: the original inquiry email's recipient
-- wasn't saved anywhere, so there was no way to re-contact the same
-- address for a nudge. Also tracks when a follow-up was last sent,
-- mirroring guests.last_reminded_at.
alter table vendor_inquiries add column if not exists recipient_email text;
alter table vendor_inquiries add column if not exists last_followed_up_at timestamptz;
