-- Claim-form drafts, saved as the business types. Until now the only copy of
-- an unsent claim form lived in one browser's localStorage, so opening the
-- emailed link on a phone, in Gmail's in-app browser, after a new link was
-- issued, or after the listing changed underneath it all started them over.
--
-- One draft per listing (not per link), so a replaced or expired link still
-- finds it. Written and read only by the claim page's server actions with the
-- service role, after the token in the URL has resolved to this listing.
create table if not exists claim_drafts (
  kind text not null check (kind in ('venue', 'vendor')),
  listing_id uuid not null,
  data jsonb not null,
  saved_at timestamptz not null default now(),
  primary key (kind, listing_id)
);

alter table claim_drafts enable row level security;
-- No policies: nobody reaches this table except the service role.
