-- A business can ask for its listing to come down from the listing itself,
-- not only by email. Lands on /admin/listing-health like any report; the
-- policy is to hide it within a business day (docs/email-playbook.md, C).
alter table listing_reports drop constraint if exists listing_reports_reason_check;
alter table listing_reports add constraint listing_reports_reason_check
  check (reason in ('closed', 'contact', 'price', 'details', 'photos', 'remove', 'other'));
