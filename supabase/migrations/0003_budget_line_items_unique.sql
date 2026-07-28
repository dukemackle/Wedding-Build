-- One budget_line_items row per category per wedding, so the app can upsert overrides.
alter table budget_line_items
  add constraint budget_line_items_wedding_category_key unique (wedding_id, category);
