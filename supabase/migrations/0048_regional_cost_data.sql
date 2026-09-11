-- Real (or modeled, clearly labeled) wedding cost data by state and
-- category, feeding the public cost estimator and, eventually,
-- replacing the hardcoded placeholder multipliers in
-- src/lib/budget-categories.ts. One row per (state, category): all
-- three tiers live side by side, matching the shape of the source
-- spreadsheet so an import maps one CSV row -> one DB row.
--
-- Publicly readable, like vendors/venues below -- the estimator is a
-- no-login public page. Writes go through the service-role admin
-- client only (bulk CSV import from /admin/cost-data), so no
-- insert/update policy is needed, same pattern as vendors/venues'
-- `active` flag in 0041.
create table if not exists regional_cost_data (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  category_key text not null,
  simple_amount numeric,
  classic_amount numeric,
  luxury_amount numeric,
  per_guest boolean not null default false,
  source text,
  notes text,
  updated_at timestamptz not null default now(),
  unique (state, category_key)
);
create index if not exists regional_cost_data_state_category_idx
  on regional_cost_data (state, category_key);

alter table regional_cost_data enable row level security;

create policy "regional_cost_data_read_all" on regional_cost_data
  for select using (true);
