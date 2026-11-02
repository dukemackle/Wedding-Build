-- Every row here was a national figure times the state's cost index and the
-- tier multipliers -- exactly what the fallback in
-- src/lib/budget-categories.ts computes -- and most of those national
-- figures were Zola's labelled as The Knot's. The code now carries the
-- corrected The Knot 2026 figures, so the rows would only hold the old
-- numbers in place for eight states and claim "sourced pricing" for them.
-- Real per-state data, or "Recompute from customer quotes", can repopulate
-- this table later through /admin/cost-data.
delete from regional_cost_data;
