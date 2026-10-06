-- Businesses that said "no thanks" to outreach. The vendor-outreach skill
-- skips every address here, for good. This is separate from email_bounces on
-- purpose: opting out of our invitations doesn't mean a vendor stops getting
-- couples' inquiries, which they still want.
create table if not exists outreach_opt_outs (
  email text primary key,
  business_name text,
  created_at timestamptz not null default now()
);

alter table outreach_opt_outs enable row level security;
