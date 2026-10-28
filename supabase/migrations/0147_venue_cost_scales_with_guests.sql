-- The venue rows in regional_cost_data were a flat fee built from a
-- national $8,573 labelled "The Knot 2026", which isn't The Knot's figure
-- (its 2026 venue average is $12,900, rising with guest count). A row can
-- be flat or per-guest but not both, so the venue line now comes from the
-- base + per-guest default in src/lib/budget-categories.ts, which applies
-- the same state index and tier multipliers the rows were built with.
delete from regional_cost_data where category_key = 'venue';
