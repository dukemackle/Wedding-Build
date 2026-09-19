-- Which stage of the plan a checklist item belongs to.
--
-- Wren's plan is ordered by dependency, not date: you cannot choose a caterer
-- before a venue, or a venue before a guest count. Grouping by phase is what
-- lets the page show the couple the stage they're actually in and fold the
-- rest away -- the whole point being to stop handing someone fifty tasks at
-- once. Due dates alone can't express that, since several phases overlap on
-- the calendar.
--
-- Nullable: anything a couple adds by hand has no phase, and is listed under
-- their own heading rather than being forced into one of Wren's.
alter table checklist_items add column if not exists phase text;

-- The page reads items for one wedding and buckets them by phase.
create index if not exists checklist_items_wedding_phase_idx
  on checklist_items (wedding_id, phase);
