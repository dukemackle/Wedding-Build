-- What a couple saved on each budget line: a discount, a credit, a free
-- extra ("$400 nurse discount", "$1,000 beef credit"). For the record and the
-- "You've saved" total only -- the cost they enter is what they actually pay,
-- so this is never subtracted from anything.
alter table budget_line_items add column if not exists saved_amount numeric;
alter table budget_custom_items add column if not exists saved_amount numeric;

-- Which section of the budget page a custom item sits in. The standard
-- categories get theirs from BUDGET_CATEGORIES in src/lib/budget-categories.ts;
-- a couple's own lines (photo booth, welcome bags) need it stored. Null reads
-- as the wedding day, which is where existing items go.
alter table budget_custom_items add column if not exists section text;
alter table budget_custom_items drop constraint if exists budget_custom_items_section_check;
alter table budget_custom_items add constraint budget_custom_items_section_check
  check (section is null or section in ('wedding_day', 'rehearsal', 'attire', 'fees'));

-- New optional category "wedding_party_attire" starts hidden, like the others.
-- Keep in sync with DEFAULT_HIDDEN_CATEGORIES in src/lib/budget-categories.ts.
-- Column default only; existing weddings keep what they chose.
alter table weddings
  alter column hidden_budget_categories
  set default array['videography', 'planner', 'welcome_party', 'transportation', 'favors', 'officiant', 'wedding_party_attire']::text[];
