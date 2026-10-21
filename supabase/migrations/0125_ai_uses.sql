-- Couple-facing AI calls that had no daily ceiling: reading an uploaded
-- contract (a stronger model, per upload or re-read) and drafting thank-you
-- notes. One row per call, counted before it runs, so one wedding can't run
-- up an open-ended bill (src/lib/ai/allowance.ts). Written by the service
-- role only, so row security is on with no policies.
create table if not exists ai_uses (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  purpose text not null check (purpose in ('contract', 'thank_you')),
  created_at timestamptz not null default now()
);
create index if not exists ai_uses_wedding_idx on ai_uses (wedding_id, purpose, created_at);
alter table ai_uses enable row level security;
