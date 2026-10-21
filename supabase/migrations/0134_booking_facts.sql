-- Booking facts on claimed listings: how long a business has been going,
-- how far ahead couples book it, what it takes to book and what happens if
-- plans change -- plus, for venues, the three rules couples get caught out
-- by (music curfew, rain plan, alcohol). All self-reported through the claim
-- form and all optional; the claim validators hold the same limits.

alter table venues
  add column if not exists founded_year smallint check (founded_year between 1800 and 2100),
  add column if not exists weddings_per_year integer check (weddings_per_year between 0 and 2000),
  add column if not exists booking_lead_months smallint check (booking_lead_months between 0 and 48),
  add column if not exists reply_time text check (reply_time in ('same_day', 'one_day', 'few_days', 'week')),
  add column if not exists deposit_percent smallint check (deposit_percent between 0 and 100),
  -- Days before the wedding the balance is due; 0 = on the day.
  add column if not exists balance_due_days smallint check (balance_due_days between 0 and 365),
  add column if not exists cancellation_policy text,
  -- A MUSIC_END_TIMES label ("11 pm", "No curfew"), stored as shown.
  add column if not exists music_until text,
  add column if not exists rain_plan text,
  add column if not exists alcohol_policy text check (alcohol_policy in ('in_house', 'licensed', 'byob', 'none'));

alter table vendors
  add column if not exists founded_year smallint check (founded_year between 1800 and 2100),
  add column if not exists weddings_per_year integer check (weddings_per_year between 0 and 2000),
  add column if not exists booking_lead_months smallint check (booking_lead_months between 0 and 48),
  add column if not exists reply_time text check (reply_time in ('same_day', 'one_day', 'few_days', 'week')),
  add column if not exists deposit_percent smallint check (deposit_percent between 0 and 100),
  add column if not exists balance_due_days smallint check (balance_due_days between 0 and 365),
  add column if not exists cancellation_policy text;

-- Anon reads listings column by column since 0091.
grant select (
  founded_year, weddings_per_year, booking_lead_months, reply_time, deposit_percent,
  balance_due_days, cancellation_policy, music_until, rain_plan, alcohol_policy
) on venues to anon;
grant select (
  founded_year, weddings_per_year, booking_lead_months, reply_time, deposit_percent,
  balance_due_days, cancellation_policy
) on vendors to anon;
