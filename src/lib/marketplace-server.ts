import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { MarketListing, MarketThread } from "@/lib/supabase/types";

export type InboxThread = MarketThread & {
  listing: Pick<MarketListing, "id" | "title" | "price_cents" | "photo_urls" | "status" | "seller_name"> | null;
  lastMessage: { body: string; sender_id: string } | null;
  unread: boolean;
};

/**
 * Whether a thread has news for this person: a message after the time they
 * last opened it. last_message_at moves for their own messages too, but
 * sending also moves their own read time (see postMessage), so it can't
 * light up their own badge.
 */
function isUnread(thread: MarketThread, userId: string) {
  const readAt = thread.buyer_id === userId ? thread.buyer_last_read_at : thread.seller_last_read_at;
  return new Date(thread.last_message_at) > new Date(readAt);
}

/** Every conversation this person is in, newest first. */
export async function loadInbox(userId: string): Promise<InboxThread[]> {
  const admin = createAdminSupabaseClient();
  const { data: threads } = await admin
    .from("market_threads")
    .select("*, listing:market_listings(id, title, price_cents, photo_urls, status, seller_name)")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false })
    .limit(200)
    .returns<(MarketThread & { listing: InboxThread["listing"] })[]>();
  if (!threads?.length) return [];

  // The last message of each, for the preview line. One query for all of
  // them, newest first, keeping the first seen per thread.
  const { data: messages } = await admin
    .from("market_messages")
    .select("thread_id, body, sender_id, created_at")
    .in("thread_id", threads.map((t) => t.id))
    .order("created_at", { ascending: false })
    .limit(threads.length * 20)
    .returns<{ thread_id: string; body: string; sender_id: string }[]>();
  const last = new Map<string, { body: string; sender_id: string }>();
  for (const m of messages ?? []) if (!last.has(m.thread_id)) last.set(m.thread_id, m);

  return threads.map((t) => ({ ...t, lastMessage: last.get(t.id) ?? null, unread: isUnread(t, userId) }));
}

/** Conversations with something unread, for the nav badge. */
export async function unreadThreadCount(userId: string): Promise<number> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("market_threads")
    .select("buyer_id, seller_id, last_message_at, buyer_last_read_at, seller_last_read_at")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false })
    .limit(200)
    .returns<MarketThread[]>();
  return (data ?? []).filter((t) => isUnread(t, userId)).length;
}

export async function markThreadRead(thread: MarketThread, userId: string) {
  if (!isUnread(thread, userId)) return;
  const column = thread.buyer_id === userId ? "buyer_last_read_at" : "seller_last_read_at";
  await createAdminSupabaseClient()
    .from("market_threads")
    .update({ [column]: new Date().toISOString() })
    .eq("id", thread.id);
}

/** Whether `blocker` has blocked `blocked`. */
export async function hasBlocked(blocker: string, blocked: string) {
  const { count } = await createAdminSupabaseClient()
    .from("market_blocks")
    .select("blocker_id", { count: "exact", head: true })
    .eq("blocker_id", blocker)
    .eq("blocked_id", blocked);
  return (count ?? 0) > 0;
}
