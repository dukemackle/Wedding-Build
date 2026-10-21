-- (0129: 0128 is ops_services, built in parallel.)
-- Server errors, so breakage on a guest site, an RSVP or an inquiry is caught
-- from the admin rather than reported by a couple. Written by
-- src/lib/error-log.ts (the Next.js onRequestError hook and the failure
-- points that catch their own errors) through log_app_error(); read on the
-- admin Home and /admin/errors.
--
-- One row per day per distinct error: a repeat bumps `count` and `last_at`,
-- so an error firing on every request can't grow the table by a row a
-- request. Messages are scrubbed of emails and long numbers before they get
-- here, and `source` is a route pattern or function name, never a URL.
-- Row security is on with no policies: service role only.
create table if not exists app_errors (
  id uuid primary key default gen_random_uuid(),
  day date not null default current_date,
  area text not null check (char_length(area) <= 32),
  source text not null check (char_length(source) <= 200),
  message text not null check (char_length(message) <= 500),
  digest text check (char_length(digest) <= 64),
  count integer not null default 1,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  unique (day, area, source, message)
);
create index if not exists app_errors_last_idx on app_errors (last_at desc);

alter table app_errors enable row level security;

create or replace function log_app_error(p_area text, p_source text, p_message text, p_digest text default null)
returns void
language sql
set search_path = public
as $$
  insert into app_errors (area, source, message, digest)
  values (left(p_area, 32), left(p_source, 200), left(p_message, 500), left(p_digest, 64))
  on conflict (day, area, source, message)
  do update set count = app_errors.count + 1, last_at = now(), digest = coalesce(excluded.digest, app_errors.digest);
$$;

revoke execute on function log_app_error(text, text, text, text) from public, anon, authenticated;
grant execute on function log_app_error(text, text, text, text) to service_role;
