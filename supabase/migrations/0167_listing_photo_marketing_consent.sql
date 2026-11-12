-- Opt-in for You Do, I Do to use a business's listing photos beyond its
-- listing: the youdoido.com homepage and marketing, and the sample photos in
-- guest-site template designs (Terms §6). Off unless the business ticks the
-- box on its claim form, and a later submission with the box unticked turns
-- it off again. Who agreed stays on the submission row; the listing only
-- carries the answer, its date and the credit line.
--
-- Safe to run before or after the app change: every column is new and
-- defaults to "no".

alter table venue_submissions
  add column if not exists photo_marketing_ok boolean not null default false,
  add column if not exists photo_credit text;
alter table vendor_submissions
  add column if not exists photo_marketing_ok boolean not null default false,
  add column if not exists photo_credit text;

alter table venues
  add column if not exists photo_marketing_ok boolean not null default false,
  add column if not exists photo_marketing_ok_at timestamptz,
  add column if not exists photo_credit text;
alter table vendors
  add column if not exists photo_marketing_ok boolean not null default false,
  add column if not exists photo_marketing_ok_at timestamptz,
  add column if not exists photo_credit text;

comment on column venues.photo_marketing_ok is
  'The business agreed (claim form) that its listing photos may be used on the homepage, in marketing and in guest-site template designs. Credit photo_credit wherever one is used.';
comment on column vendors.photo_marketing_ok is
  'The business agreed (claim form) that its listing photos may be used on the homepage, in marketing and in guest-site template designs. Credit photo_credit wherever one is used.';
