-- Budget notes: a free-text field per budget line (preset category or
-- custom item), separate from purchased_from/paid_by, for things like
-- "still comparing two photographers" or negotiation details.
alter table budget_line_items add column if not exists notes text;
alter table budget_custom_items add column if not exists notes text;
