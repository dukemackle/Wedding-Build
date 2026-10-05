-- The Monday email: payments due or overdue and checklist items coming up,
-- sent by the cron in custom-worker.ts through /api/reminders.

-- Each planner can turn it off from /account. No row means "on".
create table if not exists email_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weekly_digest boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table email_preferences enable row level security;

drop policy if exists "email_preferences_own" on email_preferences;
create policy "email_preferences_own" on email_preferences
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- One row per wedding per week once it's been handled (sent, or nothing to
-- say), so the hourly Monday runs never send twice. Service role only.
create table if not exists reminder_digests (
  wedding_id uuid not null references weddings (id) on delete cascade,
  week_start date not null,
  recipients int not null default 0,
  created_at timestamptz not null default now(),
  primary key (wedding_id, week_start)
);

alter table reminder_digests enable row level security;
