-- A Google Sheet kept in step with the guest list or the budget.
--
-- One row per wedding per page. The sync itself runs in the couple's browser
-- with their own Google token (scope drive.file), so nothing here is a
-- credential: just which sheet and tab, and what the sheet held the last time
-- the two were in step.
--
-- `snapshot` is that last-known state, as a short hash per field per row
-- ({"<guest id>": {"email": "1x9k2", ...}}), never the values themselves --
-- the values are already in guests. With it a sync can tell which side
-- changed a field since last time, so an RSVP on the site and an address
-- typed into the sheet for the same guest both survive.
--
-- `pending_snapshot` is what the sheet will hold once the browser's write
-- lands. It only becomes `snapshot` when the browser confirms the write, so a
-- write that fails half way can't make the site believe the sheet is current.
create table if not exists sheet_links (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  kind text not null check (kind in ('guests', 'budget')),
  -- 'drive': picked or created through Google, read and written both ways.
  -- 'link': a pasted "anyone with the link" URL, which can only be read.
  mode text not null check (mode in ('drive', 'link')),
  file_id text not null,
  -- The tab, by Google's numeric sheet id (the gid in the URL).
  sheet_gid text not null default '0',
  title text,
  url text,
  snapshot jsonb not null default '{}'::jsonb,
  pending_snapshot jsonb,
  pending_token text,
  last_synced_at timestamptz,
  last_synced_by uuid references auth.users (id) on delete set null,
  last_synced_by_name text,
  -- What the last sync did, for the "Pulled 3 · sent 4" line.
  last_summary jsonb,
  -- Drive's modifiedTime for the file as of the last sync, so opening the page
  -- can say "your sheet was edited since".
  sheet_modified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (wedding_id, kind)
);

alter table sheet_links enable row level security;

drop policy if exists "sheet_links_editor_all" on sheet_links;
create policy "sheet_links_editor_all" on sheet_links
  for all
  using (can_edit_wedding(wedding_id))
  with check (can_edit_wedding(wedding_id));

drop policy if exists "sheet_links_member_select" on sheet_links;
create policy "sheet_links_member_select" on sheet_links
  for select
  using (is_wedding_member(wedding_id));
