-- Venues had no contact info at all (unlike vendors, which already have
-- contact_email) -- needed for a real "Request info" flow on the new venue
-- detail page. Admin-entered, same as every other venue field.
alter table venues add column if not exists contact_email text;
alter table venues add column if not exists contact_phone text;
alter table venues add column if not exists website text;

-- Mirrors vendor_inquiries so a venue inquiry is logged the same
-- guaranteed, zero-trust-required way: a message sent through Wren is
-- recorded in Wren's own database regardless of the venue's cooperation.
-- No "booked"/"declined" status here -- the venue actually booked already
-- lives on weddings.venue_id (see setBookedVenue), so this table only
-- tracks the inquiry itself.
create table if not exists venue_inquiries (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  venue_id uuid references venues (id) on delete set null,
  venue_name text not null,
  message text,
  recipient_email text,
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('sent', 'responded')),
  referral_code text
);
create index if not exists venue_inquiries_wedding_id_idx on venue_inquiries (wedding_id);

alter table venue_inquiries enable row level security;

create policy "venue_inquiries_owner_all" on venue_inquiries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
