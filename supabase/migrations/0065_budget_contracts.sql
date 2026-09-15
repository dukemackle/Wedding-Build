-- Contracts attached to budget lines.
--
-- A private bucket, unlike guest-photos and wedding-photos. Those are
-- deliberately public because the guest site serves them to anonymous
-- visitors. A vendor contract is the opposite: full legal names, a home
-- address, phone numbers, signatures, payment schedules, sometimes bank
-- details. A public bucket hands any of that to anyone who has (or guesses)
-- the URL, with no auth check at all, so these are served through
-- short-lived signed URLs generated server-side instead.
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

-- Object paths are `<wedding_id>/<uuid>-<filename>`, so the first folder
-- segment is the wedding, matching how the photo buckets are scoped. Both
-- partners get access (same OR as every other policy since 0055).
drop policy if exists "couples can read their wedding's contracts" on storage.objects;
create policy "couples can read their wedding's contracts"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

drop policy if exists "couples can upload their wedding's contracts" on storage.objects;
create policy "couples can upload their wedding's contracts"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

drop policy if exists "couples can delete their wedding's contracts" on storage.objects;
create policy "couples can delete their wedding's contracts"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] in (
      select id::text from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

-- The budget page shows two kinds of row and they are identified differently:
--
--   * Category rows are keyed by a category string ('venue', 'catering'...).
--     Their budget_line_items row is created lazily on first edit, so for a
--     category the couple has not touched yet there is no row to reference --
--     which is why this stores the category key rather than a foreign key.
--   * Custom rows are real budget_custom_items records, referenced by id so
--     deleting the item takes its contracts with it.
--
-- Exactly one of the two is set; the check constraint enforces that rather
-- than trusting callers.
create table if not exists budget_contracts (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  category text,
  custom_item_id uuid references budget_custom_items (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  file_size bigint,
  content_type text,
  created_at timestamptz not null default now(),
  constraint budget_contracts_one_target check (
    (category is not null and custom_item_id is null)
    or (category is null and custom_item_id is not null)
  )
);

create index if not exists budget_contracts_wedding_idx
  on budget_contracts (wedding_id, created_at);
create index if not exists budget_contracts_category_idx
  on budget_contracts (wedding_id, category);
create index if not exists budget_contracts_custom_item_idx
  on budget_contracts (custom_item_id);

alter table budget_contracts enable row level security;

-- Couple-only, both partners. No public read policy: unlike most tables here
-- there is deliberately no anon path to this data at all.
drop policy if exists "budget_contracts_owner_all" on budget_contracts;
create policy "budget_contracts_owner_all" on budget_contracts
  for all
  using (
    wedding_id in (
      select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  )
  with check (
    wedding_id in (
      select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );
