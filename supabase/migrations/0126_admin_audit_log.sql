-- Who did what in the admin panel: approving claims, hiding or deleting
-- listings, emailing couples, changing test flags. One row per successful
-- admin change, written by src/lib/admin-audit.ts through the service role.
-- Row security is on with no policies, so nothing outside the admin's own
-- server code can read or write it; there is no edit or delete in the app.
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_email text not null,
  action text not null check (char_length(action) <= 64),
  target_type text not null check (char_length(target_type) <= 64),
  target_ids text[] not null default '{}',
  summary text not null check (char_length(summary) <= 500)
);
create index if not exists admin_audit_log_created_idx on admin_audit_log (created_at desc);
create index if not exists admin_audit_log_action_idx on admin_audit_log (action, created_at desc);
alter table admin_audit_log enable row level security;
