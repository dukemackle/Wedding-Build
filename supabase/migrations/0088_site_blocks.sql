-- Custom blocks on the guest site: a photo, a story or a quote the couple
-- adds themselves (Guests › Guest site › Sections › Add a section). See
-- docs/guest-site-editor.md, phase 4.
--
-- Content lives here; where a block sits and whether it's shown lives in the
-- site design (weddings.site_design / site_design_draft) as a "block:<id>"
-- entry, so a new block reaches guests only when the couple publishes.
create table if not exists site_blocks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  kind text not null check (kind in ('photo', 'story', 'quote')),
  -- Story: its heading. Photo: its caption. Quote: unused.
  heading text,
  -- Story: the text. Quote: the quote. Photo: unused.
  body text,
  -- Quote: who said it.
  attribution text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists site_blocks_wedding_id_idx on site_blocks (wedding_id);

alter table site_blocks enable row level security;

-- Couple (or their partner) manages their own blocks; anyone can read them
-- once the guest site is turned on, same shape as wedding_faqs.
drop policy if exists "site_blocks_owner_all" on site_blocks;
create policy "site_blocks_owner_all" on site_blocks
  for all
  using (
    wedding_id in (
      select id from weddings
      where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  )
  with check (
    wedding_id in (
      select id from weddings
      where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

drop policy if exists "public can view blocks for public weddings" on site_blocks;
create policy "public can view blocks for public weddings" on site_blocks
  for select
  to anon, authenticated
  using (exists (select 1 from public_weddings pw where pw.id = site_blocks.wedding_id));
