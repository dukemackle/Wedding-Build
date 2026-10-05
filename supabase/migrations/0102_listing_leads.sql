-- What the admin decided about a vendor or venue name couples typed into
-- "Purchased from" on their budget without picking a listing (/admin/leads).
-- The names themselves stay on budget_line_items; this only records the
-- decision, keyed by the normalised name (src/lib/leads.ts), so a lead that
-- was dismissed or sent to research doesn't come back as new.
--   status 'research': a real business to look up for the next batch
--   status 'dismissed': not a business we'd list (a relative, a typo, a shop)

create table if not exists listing_leads (
  kind text not null check (kind in ('vendor', 'venue')),
  name_key text not null,
  name text not null,
  category text,
  state text,
  status text not null check (status in ('research', 'dismissed')),
  decided_at timestamptz not null default now(),
  primary key (kind, name_key)
);

-- Admin only, through the service role. No policies, so no one else reads it.
alter table listing_leads enable row level security;
