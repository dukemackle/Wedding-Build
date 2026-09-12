-- Link a budget line item back to the actual vendor/venue record it
-- came from, instead of only the free-text `purchased_from` name. This
-- is what lets the Budget page show a real photo/contact for a booked
-- category, and is the anchor for auto-filling a budget line when a
-- vendor is marked booked (see src/lib/budget-sync.ts).
alter table budget_line_items add column if not exists vendor_id uuid references vendors (id) on delete set null;
alter table budget_line_items add column if not exists venue_id uuid references venues (id) on delete set null;
