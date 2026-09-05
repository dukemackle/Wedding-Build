-- Payment due dates: an optional due date on any budget line (preset
-- category or custom item), so the couple can catch an upcoming deposit
-- or balance before it's missed instead of only tracking the total.
alter table budget_line_items add column if not exists due_date date;
alter table budget_custom_items add column if not exists due_date date;
