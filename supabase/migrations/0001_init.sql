-- The Wedding Ledger: initial schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query).

-- One row per couple/account.
create table if not exists weddings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  partner_a_name text,
  partner_b_name text,
  wedding_date date,
  region text,
  season text,
  style_tier text,
  venue_type text,
  guest_count_override integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  household text,
  name text not null,
  plus_one boolean not null default false,
  status text not null default 'invited' check (status in ('invited', 'confirmed', 'declined', 'pending')),
  meal text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists guests_wedding_id_idx on guests (wedding_id);

create table if not exists budget_line_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  category text,
  label text not null,
  base_value numeric(12, 2) not null default 0,
  override_value numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists budget_line_items_wedding_id_idx on budget_line_items (wedding_id);

-- Reference data: sample venues and vendors, not owned by any single user.
create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  venue_type text,
  capacity integer,
  price_tier text,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  region text,
  price_tier text,
  description text,
  contact_email text,
  created_at timestamptz not null default now()
);

create table if not exists venue_shortlist (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  venue_id uuid not null references venues (id) on delete cascade,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists venue_shortlist_wedding_id_idx on venue_shortlist (wedding_id);

create table if not exists vendor_inquiries (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  vendor_id uuid references vendors (id) on delete set null,
  vendor_name text not null,
  category text,
  message text,
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('sent', 'responded', 'booked', 'declined'))
);
create index if not exists vendor_inquiries_wedding_id_idx on vendor_inquiries (wedding_id);

-- Row Level Security: every user-owned row is scoped to auth.uid().
alter table weddings enable row level security;
alter table guests enable row level security;
alter table budget_line_items enable row level security;
alter table venue_shortlist enable row level security;
alter table vendor_inquiries enable row level security;
alter table venues enable row level security;
alter table vendors enable row level security;

create policy "weddings_owner_all" on weddings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "guests_owner_all" on guests
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "budget_line_items_owner_all" on budget_line_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "venue_shortlist_owner_all" on venue_shortlist
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "vendor_inquiries_owner_all" on vendor_inquiries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Reference data is readable by any signed-in user; only edited via the Supabase dashboard/service role for now.
create policy "venues_read_all" on venues
  for select using (true);

create policy "vendors_read_all" on vendors
  for select using (true);
