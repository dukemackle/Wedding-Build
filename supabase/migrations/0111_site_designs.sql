-- Several guest-site designs per wedding (Guests › Guest site › Your designs).
-- A couple can keep a few looks side by side and pick the one guests see.
--
-- Each row is one design's working copy. What guests see stays
-- weddings.site_design (so public_weddings and the live page are unchanged):
-- "Make this the live site" copies a design there and points live_design_id
-- at it. site_design_draft is no longer written.
--
-- Shared wording: the words typed into the page's headings (the design's
-- `text` slots). A design with shared_wording on reads and writes them in
-- weddings.site_wording, so a typo fixed in one shows in every linked design;
-- with it off, the design keeps its own copy. Everything else the couple
-- writes (story, FAQ, schedule, photos, RSVPs) lives in its own tables and is
-- the same in every design.
create table if not exists site_designs (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  name text not null default 'My design' check (char_length(name) between 1 and 60),
  design jsonb not null,
  shared_wording boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists site_designs_wedding_id_idx on site_designs (wedding_id);

alter table site_designs enable row level security;

drop policy if exists "site_designs_owner_all" on site_designs;
create policy "site_designs_owner_all" on site_designs
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "site_designs_member_select" on site_designs;
create policy "site_designs_member_select" on site_designs
  for select
  using (is_wedding_member(wedding_id));

alter table weddings
  add column if not exists live_design_id uuid references site_designs (id) on delete set null,
  add column if not exists site_wording jsonb not null default '{}'::jsonb;

-- Every wedding that has designed its site so far gets that design as its
-- first row, live if it was published.
insert into site_designs (wedding_id, name, design)
select w.id, 'My design', coalesce(w.site_design_draft, w.site_design)
from weddings w
where coalesce(w.site_design_draft, w.site_design) is not null
  and not exists (select 1 from site_designs d where d.wedding_id = w.id);

update weddings w
set live_design_id = d.id
from site_designs d
where d.wedding_id = w.id
  and w.site_design is not null
  and w.live_design_id is null;

-- Their headings' words become the shared wording.
update weddings w
set site_wording = coalesce(
  (
    select jsonb_object_agg(e.key, e.value ->> 'text')
    from jsonb_each(coalesce(w.site_design_draft, w.site_design) -> 'text') as e (key, value)
    where jsonb_typeof(e.value) = 'object' and coalesce(e.value ->> 'text', '') <> ''
  ),
  '{}'::jsonb
)
where coalesce(w.site_design_draft, w.site_design) -> 'text' is not null
  and w.site_wording = '{}'::jsonb;
