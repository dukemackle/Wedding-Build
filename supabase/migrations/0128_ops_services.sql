-- What the company pays for: domains, software, infra, the LLC, the mailbox.
-- Entered by hand on /admin/spend (owner-only); one row per service, holding
-- its current price and next renewal, not a ledger of every charge. These are
-- the owner's own running notes, not the books.
-- Row security is on with no policies, so only the admin's server code
-- (service role) can read or write it.
create table if not exists ops_services (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  category text not null default 'software'
    check (category in ('domain', 'software', 'infra', 'ai', 'legal', 'mail', 'other')),
  plan text check (char_length(plan) <= 200),
  -- null = price not known yet; totals leave it out and say so.
  amount_cents integer check (amount_cents >= 0),
  billing_cycle text not null default 'monthly'
    check (billing_cycle in ('monthly', 'yearly', 'one_time')),
  next_renewal date,
  paid_with text check (char_length(paid_with) <= 80),
  status text not null default 'active' check (status in ('active', 'cancelled')),
  notes text check (char_length(notes) <= 1000)
);
create index if not exists ops_services_renewal_idx on ops_services (next_renewal);
alter table ops_services enable row level security;

-- Starting rows, from the hello@youdoido.com inbox (receipts and notices up to
-- 2026-10-21) and the dates in CLAUDE.md. Prices nobody has seen stay null.
-- Only runs on an empty table, so re-running this file adds nothing twice.
insert into ops_services (name, category, plan, amount_cents, billing_cycle, next_renewal, notes)
select * from (values
  ('Anytime Mailbox', 'mail', 'Bronze digital mailbox (Encinitas, CA)', 10999, 'yearly', date '2027-10-21',
   'Receipt #1341-9152, paid 2026-10-20. Needs the notarized USPS Form 1583 before mail is handled.'),
  ('Google Workspace', 'software', 'youdoido.com (plan not stated)', null, 'monthly', date '2026-11-01',
   'Free trial ends; paid billing starts 2026-11-01. Add the price from the first invoice.'),
  ('Northwest Registered Agent', 'legal', 'Registered agent for You Do, I Do LLC', null, 'yearly', null,
   'Welcome email 2026-10-21, no price shown. Order receipt likely went to the personal inbox.'),
  ('youdoido.com domain', 'domain', 'Registered 2026-10-01', null, 'yearly', date '2027-10-01',
   'No receipt in hello@. Check the registrar for price and auto-renew.'),
  ('wrenwed.com domain', 'domain', 'Old domain, 301s to youdoido.com', null, 'yearly', null,
   'Keep renewing while old links still point at it.'),
  ('Cloudflare Workers', 'infra', 'Workers Free', 0, 'monthly', null,
   'Hosts the site. 10 ms CPU per request on Free.')
) as seed(name, category, plan, amount_cents, billing_cycle, next_renewal, notes)
where not exists (select 1 from ops_services);
