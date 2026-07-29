-- Couple-managed gift registry: a short list of registry links and/or a
-- cash-fund note the couple curates themselves, shown on the Guests page.
-- This is intentionally couple-only for now -- there's no guest-facing
-- public page yet for invited guests to view this themselves (see
-- ROADMAP.md for that as a separate, larger future item).
create table if not exists registry_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  label text not null,
  url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists registry_items_wedding_id_idx on registry_items (wedding_id);

alter table registry_items enable row level security;

create policy "registry_items_owner_all" on registry_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
