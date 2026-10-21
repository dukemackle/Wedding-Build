-- Usage events, so the first cohort of couples can be measured: when each
-- couple first reaches a milestone (guests added, site published, a vendor
-- contacted) and whether they come back on later days. Written by
-- src/lib/usage-events.ts from server actions through log_usage_event(); read
-- on /admin/growth. Owner-approved 2026-10-21 (measurement decision in
-- docs/ai-operating-system/decisions.md).
--
-- One row per day per user per event: a repeat bumps `count` and `last_at`.
-- That keeps the table small (a busy couple is a few rows a day) and is all
-- the funnel needs, since "first day" and "days active" are what's read.
-- No free text and no guest or vendor details: an event is a fixed name plus
-- the account and wedding it happened in.
-- Row security is on with no policies: service role only.
create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  day date not null default current_date,
  name text not null check (name ~ '^[a-z_]{1,40}$'),
  user_id uuid not null references auth.users (id) on delete cascade,
  wedding_id uuid references weddings (id) on delete cascade,
  count integer not null default 1,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  unique (day, name, user_id)
);
create index if not exists usage_events_user_idx on usage_events (user_id, day);
create index if not exists usage_events_wedding_idx on usage_events (wedding_id);

alter table usage_events enable row level security;

create or replace function log_usage_event(p_name text, p_user uuid, p_wedding uuid default null)
returns void
language sql
set search_path = public
as $$
  insert into usage_events (name, user_id, wedding_id)
  values (p_name, p_user, p_wedding)
  on conflict (day, name, user_id)
  do update set count = usage_events.count + 1, last_at = now(),
    wedding_id = coalesce(excluded.wedding_id, usage_events.wedding_id);
$$;

revoke execute on function log_usage_event(text, uuid, uuid) from public, anon, authenticated;
grant execute on function log_usage_event(text, uuid, uuid) to service_role;
