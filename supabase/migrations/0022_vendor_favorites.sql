-- Vendor favorites (hearting a vendor), mirroring venue_shortlist so
-- vendors get the same "favorite for later" concept venues already have
-- -- separate from vendor_inquiries, since hearting a vendor doesn't
-- mean an inquiry has been sent yet.
create table if not exists vendor_favorites (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  vendor_id uuid not null references vendors (id) on delete cascade,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists vendor_favorites_wedding_id_idx on vendor_favorites (wedding_id);

alter table vendor_favorites enable row level security;

create policy "vendor_favorites_owner_all" on vendor_favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
