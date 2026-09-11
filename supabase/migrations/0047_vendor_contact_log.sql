-- Outreach/contact history for partners (vendors) -- a running log of
-- calls, emails, and meetings the owner has with a vendor, so a
-- solo operator doesn't have to remember or dig through their own
-- inbox to answer "when did I last talk to this vendor, and about
-- what." Multiple entries per vendor over time, so this is its own
-- table rather than columns on `vendors`.
create table if not exists vendor_contact_log (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  contact_type text not null default 'note' check (contact_type in ('call', 'email', 'meeting', 'note')),
  note text not null,
  created_at timestamptz not null default now()
);
create index if not exists vendor_contact_log_vendor_id_idx on vendor_contact_log (vendor_id);

alter table vendor_contact_log enable row level security;
-- Admin-only, same reasoning as admin_couple_notes in 0046: no policies
-- needed since only the service-role client ever touches this table.
