-- Referral attribution: every wedding gets a short code (auto-generated
-- on insert, never touched by later updates since it's excluded from
-- the app's upsert payload) that goes out with every vendor inquiry, so
-- a vendor booking can be traced back to this account even though the
-- actual booking happens off-platform.
create or replace function generate_referral_code()
returns text
language plpgsql
as $$
declare
  code text;
begin
  code := 'WREN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  return code;
end;
$$;

alter table weddings
  add column if not exists referral_code text unique default generate_referral_code();

alter table vendor_inquiries
  add column if not exists referral_code text,
  add column if not exists booked_amount numeric;
