-- When Wren's standard checklist was added to this wedding. The plan used to
-- be added only by pressing "Build my plan" on an empty checklist, so a couple
-- whose first tasks came from the assistant never got it. It's now added on its
-- own once the date is set, and this stamp stops it coming back after a couple
-- deletes the tasks they don't want.
alter table weddings add column if not exists plan_seeded_at timestamptz;

-- Weddings that already have the plan count as seeded.
update weddings w
set plan_seeded_at = now()
where plan_seeded_at is null
  and exists (
    select 1 from checklist_items c where c.wedding_id = w.id and c.phase is not null
  );
