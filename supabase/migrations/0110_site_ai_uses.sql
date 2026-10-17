-- Guest site editor, phase 5b: each time Wren designs a site from a
-- description or drafts words for it. Only here to cap the paid AI calls per
-- wedding per day (src/lib/ai/site-wren.ts); written by the service role only,
-- so row security is on with no policies.
create table if not exists site_ai_uses (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  purpose text not null check (purpose in ('design', 'write')),
  created_at timestamptz not null default now()
);
create index if not exists site_ai_uses_wedding_idx on site_ai_uses (wedding_id, created_at);
alter table site_ai_uses enable row level security;
