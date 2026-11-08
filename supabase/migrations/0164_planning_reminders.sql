-- Planning reminders (src/lib/planning-reminders.ts, /api/planning-reminders).
--
-- planning_reminders_sent: one row per wedding per reminder, written before
-- the email goes out, so a reminder can never be sent twice (the primary key
-- refuses the second claim, even from two overlapping runs).
--
-- planning_reminder_opt_outs: addresses that turned reminders off, from
-- /account or the link in a reminder. Keyed by email so the link works
-- without signing in. Separate from marketing_consents: turning off planning
-- tips doesn't stop reminders, and the other way round.
--
-- Only the service role touches either table.
create table if not exists planning_reminders_sent (
  wedding_id uuid not null references weddings (id) on delete cascade,
  reminder_key text not null,
  -- The date the reminder was counted from, in case the couple moves it later.
  wedding_date date not null,
  recipients int not null default 0,
  sent_at timestamptz not null default now(),
  primary key (wedding_id, reminder_key)
);

alter table planning_reminders_sent enable row level security;

create table if not exists planning_reminder_opt_outs (
  email text primary key,
  -- 'account', 'link', 'one-click'
  source text not null,
  opted_out_at timestamptz not null default now()
);

alter table planning_reminder_opt_outs enable row level security;
