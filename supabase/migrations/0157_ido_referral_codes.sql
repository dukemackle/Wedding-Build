-- Referral codes move from the old Wren brand to You Do, I Do:
-- WREN-B38681 becomes IDO-B38681. Same six characters, so a vendor quoting
-- an old code from an inquiry email is still recognisable (the admin search
-- also treats "WREN-" as "IDO-").
create or replace function generate_referral_code()
returns text
language plpgsql
as $$
begin
  return 'IDO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
end;
$$;

update weddings
  set referral_code = 'IDO-' || substr(referral_code, 6)
  where referral_code like 'WREN-%';

update vendor_inquiries
  set referral_code = 'IDO-' || substr(referral_code, 6)
  where referral_code like 'WREN-%';

update venue_inquiries
  set referral_code = 'IDO-' || substr(referral_code, 6)
  where referral_code like 'WREN-%';
