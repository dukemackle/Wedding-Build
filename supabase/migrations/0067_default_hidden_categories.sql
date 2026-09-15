-- A new wedding starts with the optional budget categories hidden.
--
-- Nineteen line items on day one reads as a list of things you're forgetting
-- rather than a plan. These six are the ones a large share of couples simply
-- don't have: a friend officiates, parents host the rehearsal dinner, there's
-- no planner, no second event, no favors, no videographer. They aren't
-- removed -- they sit in the "not tracking" strip and can be added back in one
-- click, same as any category hidden by hand.
--
-- Column default only. Existing weddings keep whatever they have already
-- chosen to hide; this deliberately does not touch a single existing row.
-- Keep in sync with DEFAULT_HIDDEN_CATEGORIES in src/lib/budget-categories.ts.
alter table weddings
  alter column hidden_budget_categories
  set default array['videography', 'planner', 'welcome_party', 'transportation', 'favors', 'officiant']::text[];
