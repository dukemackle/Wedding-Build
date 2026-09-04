-- Custom budget line items: the 12 preset categories in
-- src/lib/budget-categories.ts are driven by the region/season/style/
-- guest-count estimate engine and always shown as a planning baseline,
-- but couples often have extra costs that don't fit any of them
-- (wedding bands, a photo booth, welcome bags, etc.). This table lets
-- them add and delete freeform items with no computed estimate --
-- just a label and an amount they've decided on.
create table if not exists budget_custom_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  label text not null,
  amount numeric(12, 2) not null default 0,
  purchased_from text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists budget_custom_items_wedding_id_idx on budget_custom_items (wedding_id);

alter table budget_custom_items enable row level security;

create policy "budget_custom_items_owner_all" on budget_custom_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
