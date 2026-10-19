-- Marketplace, part 2: buyers and sellers message each other, and anyone can
-- report a listing or a conversation or block a person.
--
-- People read their own conversations straight from these tables (RLS
-- below), but never write them directly: every write goes through a server
-- action that checks the listing is still up, neither side has blocked the
-- other and the sender is under the rate limits, then writes with the
-- service role. That keeps those checks in one place instead of split
-- between policies and code.
--
-- 1. market_threads: one per listing per buyer. Each side's last-read time
--    drives the unread badge and decides whether a new message is worth an
--    email (only the first one since they last looked).
-- 2. market_messages: the conversation.
-- 3. market_blocks: a person this account never hears from again.
-- 4. market_reports: a listing or conversation reported to the admin, who
--    can take the listing down (status 'removed', 0117).

create table if not exists market_threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references market_listings (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  -- The first name the buyer gave, shown to the seller.
  buyer_name text not null check (char_length(buyer_name) between 1 and 40),
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  buyer_last_read_at timestamptz not null default now(),
  seller_last_read_at timestamptz not null default 'epoch',
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);

create index if not exists market_threads_buyer_idx on market_threads (buyer_id, last_message_at desc);
create index if not exists market_threads_seller_idx on market_threads (seller_id, last_message_at desc);

alter table market_threads enable row level security;

create policy "people read their own conversations"
  on market_threads for select
  to authenticated
  using (auth.uid() in (buyer_id, seller_id));

create table if not exists market_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references market_threads (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists market_messages_thread_idx on market_messages (thread_id, created_at);
create index if not exists market_messages_sender_idx on market_messages (sender_id, created_at desc);

alter table market_messages enable row level security;

create policy "people read messages in their own conversations"
  on market_messages for select
  to authenticated
  using (
    exists (
      select 1 from market_threads t
      where t.id = thread_id and auth.uid() in (t.buyer_id, t.seller_id)
    )
  );

create table if not exists market_blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

alter table market_blocks enable row level security;

create policy "people see who they've blocked"
  on market_blocks for select
  to authenticated
  using (blocker_id = auth.uid());

create table if not exists market_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references market_listings (id) on delete cascade,
  thread_id uuid references market_threads (id) on delete set null,
  reporter_id uuid references auth.users (id) on delete set null,
  reason text not null check (reason in ('scam', 'prohibited', 'offensive', 'misleading', 'other')),
  details text check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'removed', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists market_reports_open_idx on market_reports (status, created_at);

-- Admin-only: no policies, so only the service role reads or writes it.
alter table market_reports enable row level security;
