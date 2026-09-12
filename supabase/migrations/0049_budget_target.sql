-- A couple's own overall budget goal, distinct from the auto-computed
-- category estimates or any single category's override -- one number
-- they set for themselves, so the Budget page can show "actual
-- spending so far" against it.
alter table weddings add column if not exists budget_target numeric;
