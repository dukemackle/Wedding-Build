-- Admin-only notes and tags per couple (e.g. "VIP", "high budget",
-- "needs follow-up") so the owner can annotate a wedding without that
-- ever being visible to the couple themselves. Kept in its own table
-- rather than columns on `weddings` -- couple-facing pages select("*")
-- from weddings under the couple's own RLS-scoped session, and mixing
-- admin-internal fields into that row risks leaking them into a future
-- couple-facing view by accident.
create table if not exists admin_couple_notes (
  wedding_id uuid primary key references weddings (id) on delete cascade,
  notes text,
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table admin_couple_notes enable row level security;
-- Admin-only: read and written exclusively via the service-role client
-- (bypasses RLS), gated at the app layer by ADMIN_EMAIL -- see 0041's
-- vendors/venues `active` flag for the same pattern. No policies needed.
