-- Wedding planning checklist: couple-managed to-do items with an
-- optional due date, so they can track planning tasks over the months
-- leading up to the wedding (book venue, send invitations, etc.) --
-- distinct from the Itinerary, which is the day-of/weekend schedule,
-- not the planning process. Owner-only, like budget_custom_items --
-- no guest-facing exposure needed.
create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  title text not null,
  notes text,
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists checklist_items_wedding_id_idx on checklist_items (wedding_id);

alter table checklist_items enable row level security;

create policy "checklist_items_owner_all" on checklist_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
