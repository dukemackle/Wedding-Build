-- Contact collector: a public link where guests fill in their own mailing
-- address, instead of the couple chasing a hundred of them by text.
--
-- The guest list has carried email and phone since 0058 but never an address,
-- so a couple addressing invitations had to keep them somewhere else --
-- exactly the spreadsheet-alongside-the-app problem the budget page was built
-- to avoid.
--
-- Structured columns rather than one free-text blob: envelopes, label sheets,
-- and mail merges all need the parts separately, and splitting a blob back
-- apart later is guesswork.
alter table guests add column if not exists address_line1 text;
alter table guests add column if not exists address_line2 text;
alter table guests add column if not exists city text;
alter table guests add column if not exists state text;
alter table guests add column if not exists postal_code text;
alter table guests add column if not exists country text;

-- Submissions land in their own insert-only table rather than writing into
-- `guests` directly -- same reasoning as rsvp_submissions in 0016: anyone with
-- the link can add to this, so a stranger must never be able to read, edit, or
-- delete what another guest submitted, nor touch the real guest list. The
-- couple reviews each one and merges it themselves.
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'applied', 'dismissed')),
  created_at timestamptz not null default now()
);
create index if not exists contact_submissions_wedding_idx
  on contact_submissions (wedding_id, status, created_at);

alter table contact_submissions enable row level security;

-- Insert only, and only for a wedding that has a public site. No select for
-- anon at all: a submitter cannot read back their own row, let alone anyone
-- else's, which is what keeps a shared link from becoming a directory of
-- everyone's home address.
drop policy if exists "anyone can submit contact details to a public wedding" on contact_submissions;
create policy "anyone can submit contact details to a public wedding"
  on contact_submissions for insert
  to anon, authenticated
  with check (
    exists (select 1 from public_weddings pw where pw.id = contact_submissions.wedding_id)
  );

-- Both partners, matching every other table since 0055.
drop policy if exists "couples can read their contact submissions" on contact_submissions;
create policy "couples can read their contact submissions"
  on contact_submissions for select
  to authenticated
  using (
    wedding_id in (
      select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );

drop policy if exists "couples can update their contact submissions" on contact_submissions;
create policy "couples can update their contact submissions"
  on contact_submissions for update
  to authenticated
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

drop policy if exists "couples can delete their contact submissions" on contact_submissions;
create policy "couples can delete their contact submissions"
  on contact_submissions for delete
  to authenticated
  using (
    wedding_id in (
      select id from weddings where user_id = auth.uid() or partner_user_id = auth.uid()
    )
  );
