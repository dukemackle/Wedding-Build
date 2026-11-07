-- Three pieces of abuse hardening (legal audit R7, R8, R17).
--
-- Safe to run before or after the app change: nothing here removes anything
-- the live app relies on.

-- 1. Listing photo buckets. Claim links hand out signed upload URLs, and a
--    signed URL takes whatever file the browser sends, at any size, served
--    from a public bucket. Storage now refuses anything but the photos and
--    pricing-guide PDFs the claim forms send. 20MB is the PDF limit
--    (MAX_IMPORT_BYTES); photos are capped at 5MB by the app, which now
--    uploads them itself.
update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
where id in ('venue-photos', 'vendor-photos');

-- 2. "Something wrong?" on a listing could be sent as often as anyone liked.
--    Same shape as allow_guest_write (0140), keyed by listing: per visitor
--    per hour across every listing, and per listing per day.
create table if not exists listing_report_writes (
  id bigint generated always as identity primary key,
  listing_id uuid not null,
  ip_hash text,
  at timestamptz not null default now()
);
create index if not exists listing_report_writes_listing_idx on listing_report_writes (listing_id, at);
create index if not exists listing_report_writes_ip_idx on listing_report_writes (ip_hash, at) where ip_hash is not null;
alter table listing_report_writes enable row level security;
-- No policies: only allow_listing_report touches it.

create or replace function allow_listing_report(p_listing uuid, p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if random() < 0.02 then
    delete from listing_report_writes where at < now() - interval '2 days';
  end if;

  if (
    select count(*) from listing_report_writes
    where listing_id = p_listing and at > now() - interval '1 day'
  ) >= 20 then
    return false;
  end if;
  if p_ip_hash is not null and (
    select count(*) from listing_report_writes
    where ip_hash = p_ip_hash and at > now() - interval '1 hour'
  ) >= 10 then
    return false;
  end if;

  insert into listing_report_writes (listing_id, ip_hash) values (p_listing, p_ip_hash);
  return true;
end;
$$;

revoke all on function allow_listing_report(uuid, text) from public, anon, authenticated;
grant execute on function allow_listing_report(uuid, text) to service_role;

-- 3. Copyright notices (DMCA). Safe harbor needs a takedown process and a
--    repeat-infringer policy that's actually carried out: this is the record
--    of both. One row per notice; the uploader is whoever posted the content,
--    by email where we know it, so /admin/copyright can count strikes.
create table if not exists copyright_notices (
  id uuid primary key default gen_random_uuid(),
  received_at date not null default current_date,
  complainant text not null check (char_length(complainant) <= 300),
  work text not null check (char_length(work) <= 1000),
  content_url text not null check (char_length(content_url) <= 1000),
  uploader_email text check (char_length(uploader_email) <= 200),
  status text not null default 'received'
    check (status in ('received', 'removed', 'rejected', 'counter_notice', 'restored')),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists copyright_notices_uploader_idx on copyright_notices (lower(uploader_email));
alter table copyright_notices enable row level security;
-- Read and written only with the service role, from the admin.
