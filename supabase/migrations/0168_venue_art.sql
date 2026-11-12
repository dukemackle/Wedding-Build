-- Venue art: a consenting venue's ceremony-spot photo, painted (watercolour,
-- engraving, more styles later) for custom guest-site templates. Made by hand
-- in ChatGPT from the admin "Venue art" page (prompts in
-- docs/site-art-prompts.md), uploaded here with its provenance.
--
-- Admin-only for now: RLS on with no policies, so only the service role
-- reads or writes. Couples see nothing until a guest-site PR (after the A9
-- attorney review) adds a read path for approved art.
--
-- Consent is not copied: the admin page reads venues.photo_marketing_ok live,
-- so a venue that withdraws has its art hidden and flagged for deletion
-- (within 30 days, Terms §6) without a trigger.

create table if not exists venue_art (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references venues (id) on delete cascade,
  style text not null check (style in ('watercolour', 'engraving', 'pen-and-wash', 'gouache', 'papercut')),
  -- The listing photo it was painted from, and its credit, as they were then.
  source_photo_url text not null,
  photo_credit text,
  consent_at timestamptz,
  wide_path text,
  tall_path text,
  status text not null default 'draft' check (status in ('draft', 'approved')),
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint venue_art_one_per_style unique (venue_id, style)
);
create index if not exists venue_art_venue_id_idx on venue_art (venue_id);

alter table venue_art enable row level security;

comment on table venue_art is
  'Paintings of a venue made from its own photo (photo_marketing_ok venues only). Admin-only; files in the private venue-art bucket.';

-- Private: the admin views files through signed URLs. Uploads go straight
-- from the browser to a signed upload URL, so no storage policies are needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('venue-art', 'venue-art', false, 20971520, array['image/png', 'image/webp', 'image/jpeg'])
on conflict (id) do nothing;
