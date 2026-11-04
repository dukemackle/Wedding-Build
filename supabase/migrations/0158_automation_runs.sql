-- Automations log (/admin/automations): one row each time a scheduled job
-- reports in, so a job that failed or stopped running shows up on Home
-- instead of being noticed when something goes stale.
--
-- Written by /api/automation-log (the Batches and Spend reminders GitHub
-- Actions, the batch-builder routines) and by the spend-reminders endpoint
-- itself, all with the service role. Summaries are counts and links only:
-- no names, emails or secrets.
create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  job text not null check (job ~ '^[a-z_]{3,40}$'),
  ok boolean not null,
  summary text check (char_length(summary) <= 300),
  ran_at timestamptz not null default now()
);
create index if not exists automation_runs_job_ran_idx on automation_runs (job, ran_at desc);
alter table automation_runs enable row level security;
