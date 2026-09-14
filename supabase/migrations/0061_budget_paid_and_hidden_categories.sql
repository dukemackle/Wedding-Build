-- Tracks how much has actually been paid so far, separate from the
-- override_value/amount (the agreed total cost) -- a couple can owe
-- $3,000 total and have paid a $500 deposit, and the two numbers need
-- to be entered/edited independently.
alter table budget_line_items add column if not exists paid_amount numeric;
alter table budget_custom_items add column if not exists paid_amount numeric;

-- Lets a couple remove a standard category that doesn't apply to them
-- (e.g. no live band) from their budget list and total, without
-- deleting the category from the app-wide BUDGET_CATEGORIES config.
-- An array on weddings rather than a join table since it's small,
-- read on every budget-page load, and never queried independently.
alter table weddings add column if not exists hidden_budget_categories text[] not null default '{}';
