"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { SITE_URL } from "@/lib/public-listings";
import {
  MARKET_REPORT_REASONS,
  MAX_MESSAGES_PER_HOUR,
  MAX_NEW_THREADS_PER_DAY,
} from "@/lib/marketplace";
import type { MarketListing, MarketThread } from "@/lib/supabase/types";

// Every write here uses the service role, after the checks the tables' RLS
// would otherwise have to repeat: see 0118_marketplace_chat.sql.

async function requireUser(next: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

type Admin = ReturnType<typeof createAdminSupabaseClient>;

async function isBlockedEitherWay(admin: Admin, a: string, b: string) {
  const { count } = await admin
    .from("market_blocks")
    .select("blocker_id", { count: "exact", head: true })
    .or(`and(blocker_id.eq.${a},blocked_id.eq.${b}),and(blocker_id.eq.${b},blocked_id.eq.${a})`);
  return (count ?? 0) > 0;
}

async function overMessageLimit(admin: Admin, senderId: string) {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await admin
    .from("market_messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", senderId)
    .gte("created_at", since);
  return (count ?? 0) >= MAX_MESSAGES_PER_HOUR;
}

function cleanBody(raw: unknown) {
  return String(raw ?? "").trim().slice(0, 2000);
}

/**
 * Adds a message and, if it's the first one the other side hasn't seen yet,
 * emails them. One email per unread stretch, not one per message: a quick
 * back-and-forth shouldn't become a dozen emails.
 */
async function postMessage(admin: Admin, thread: MarketThread, senderId: string, body: string, title: string) {
  const fromBuyer = senderId === thread.buyer_id;
  const recipientId = fromBuyer ? thread.seller_id : thread.buyer_id;
  const recipientReadAt = fromBuyer ? thread.seller_last_read_at : thread.buyer_last_read_at;

  const { count: alreadyUnread } = await admin
    .from("market_messages")
    .select("id", { count: "exact", head: true })
    .eq("thread_id", thread.id)
    .eq("sender_id", senderId)
    .gt("created_at", recipientReadAt);

  const now = new Date().toISOString();
  const { error } = await admin.from("market_messages").insert({ thread_id: thread.id, sender_id: senderId, body });
  if (error) return { error: "Couldn't send your message — please try again." };
  await admin
    .from("market_threads")
    .update({ last_message_at: now, ...(fromBuyer ? { buyer_last_read_at: now } : { seller_last_read_at: now }) })
    .eq("id", thread.id);

  if (!alreadyUnread && process.env.RESEND_API_KEY) {
    try {
      const { data } = await admin.auth.admin.getUserById(recipientId);
      const to = data.user?.email;
      if (to) {
        const who = fromBuyer ? thread.buyer_name : "The seller";
        await getResendClient().emails.send({
          from: INQUIRY_FROM_ADDRESS,
          to,
          subject: `New message about "${title}"`,
          // The message itself stays in the app: replies belong there, where
          // report and block are, not in an email thread with a stranger.
          text: `${who} sent you a message about "${title}" on the You Do, I Do marketplace.\n\nRead and reply: ${SITE_URL}/marketplace/inbox/${thread.id}\n\nNever pay ahead for shipping or share bank details. If something feels off, use Report in the conversation.\n\nYou Do, I Do`,
        });
      }
    } catch {
      // The message is saved either way; the badge shows it next visit.
    }
  }
  return {};
}

export async function startThread(formData: FormData): Promise<{ error?: string }> {
  const listingId = String(formData.get("listing_id") ?? "");
  const user = await requireUser(`/marketplace/${listingId}`);
  const buyerName = String(formData.get("buyer_name") ?? "").trim().slice(0, 40);
  const body = cleanBody(formData.get("body"));
  if (!buyerName) return { error: "Add the first name the seller will see." };
  if (!body) return { error: "Write a message first." };

  const admin = createAdminSupabaseClient();
  const { data: listing } = await admin
    .from("market_listings")
    .select("id, seller_id, title, status")
    .eq("id", listingId)
    .maybeSingle<Pick<MarketListing, "id" | "seller_id" | "title" | "status">>();
  if (!listing || (listing.status !== "active" && listing.status !== "pending")) {
    return { error: "This listing isn't available any more." };
  }
  if (listing.seller_id === user.id) return { error: "This is your own listing." };
  if (await isBlockedEitherWay(admin, user.id, listing.seller_id)) {
    return { error: "You can't message this seller." };
  }

  let { data: thread } = await admin
    .from("market_threads")
    .select("*")
    .eq("listing_id", listing.id)
    .eq("buyer_id", user.id)
    .maybeSingle<MarketThread>();

  if (!thread) {
    const since = new Date(Date.now() - 86400_000).toISOString();
    const { count } = await admin
      .from("market_threads")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", user.id)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_NEW_THREADS_PER_DAY) {
      return { error: "You've started a lot of conversations today. Try again tomorrow." };
    }
    const { data: created, error } = await admin
      .from("market_threads")
      .insert({ listing_id: listing.id, buyer_id: user.id, seller_id: listing.seller_id, buyer_name: buyerName })
      .select("*")
      .single<MarketThread>();
    if (error || !created) return { error: "Couldn't start the conversation — please try again." };
    thread = created;
  }

  if (await overMessageLimit(admin, user.id)) return { error: "You're sending messages too fast. Try again in a bit." };
  const result = await postMessage(admin, thread, user.id, body, listing.title);
  if (result.error) return result;

  revalidatePath("/marketplace", "layout");
  redirect(`/marketplace/inbox/${thread.id}`);
}

async function loadOwnThread(admin: Admin, threadId: string, userId: string) {
  const { data: thread } = await admin
    .from("market_threads")
    .select("*, market_listings(title, status)")
    .eq("id", threadId)
    .maybeSingle<MarketThread & { market_listings: Pick<MarketListing, "title" | "status"> | null }>();
  if (!thread || (thread.buyer_id !== userId && thread.seller_id !== userId)) return null;
  return thread;
}

export async function sendMessage(threadId: string, rawBody: string): Promise<{ error?: string }> {
  const user = await requireUser(`/marketplace/inbox/${threadId}`);
  const body = cleanBody(rawBody);
  if (!body) return { error: "Write a message first." };

  const admin = createAdminSupabaseClient();
  const thread = await loadOwnThread(admin, threadId, user.id);
  if (!thread) return { error: "That conversation isn't yours." };
  if (thread.market_listings?.status === "removed") return { error: "This listing was taken down." };
  const other = thread.buyer_id === user.id ? thread.seller_id : thread.buyer_id;
  if (await isBlockedEitherWay(admin, user.id, other)) return { error: "You can't message this person." };
  if (await overMessageLimit(admin, user.id)) return { error: "You're sending messages too fast. Try again in a bit." };

  const result = await postMessage(admin, thread, user.id, body, thread.market_listings?.title ?? "your listing");
  if (result.error) return result;
  revalidatePath(`/marketplace/inbox/${threadId}`);
  return {};
}

export async function blockPerson(threadId: string): Promise<{ error?: string }> {
  const user = await requireUser(`/marketplace/inbox/${threadId}`);
  const admin = createAdminSupabaseClient();
  const thread = await loadOwnThread(admin, threadId, user.id);
  if (!thread) return { error: "That conversation isn't yours." };
  const other = thread.buyer_id === user.id ? thread.seller_id : thread.buyer_id;
  const { error } = await admin
    .from("market_blocks")
    .upsert({ blocker_id: user.id, blocked_id: other }, { ignoreDuplicates: true });
  if (error) return { error: "Couldn't block — please try again." };
  revalidatePath("/marketplace", "layout");
  return {};
}

export async function unblockPerson(threadId: string): Promise<{ error?: string }> {
  const user = await requireUser(`/marketplace/inbox/${threadId}`);
  const admin = createAdminSupabaseClient();
  const thread = await loadOwnThread(admin, threadId, user.id);
  if (!thread) return { error: "That conversation isn't yours." };
  const other = thread.buyer_id === user.id ? thread.seller_id : thread.buyer_id;
  await admin.from("market_blocks").delete().eq("blocker_id", user.id).eq("blocked_id", other);
  revalidatePath("/marketplace", "layout");
  return {};
}

export async function reportMarket(formData: FormData): Promise<{ error?: string }> {
  const listingId = String(formData.get("listing_id") ?? "") || null;
  const threadId = String(formData.get("thread_id") ?? "") || null;
  const user = await requireUser(listingId ? `/marketplace/${listingId}` : "/marketplace/inbox");
  const reason = String(formData.get("reason") ?? "");
  const details = String(formData.get("details") ?? "").trim().slice(0, 1000) || null;
  if (!MARKET_REPORT_REASONS.some((r) => r.value === reason)) return { error: "Choose a reason." };
  if (!listingId && !threadId) return { error: "Nothing to report." };

  const admin = createAdminSupabaseClient();
  if (threadId && !(await loadOwnThread(admin, threadId, user.id))) return { error: "That conversation isn't yours." };

  const { error } = await admin
    .from("market_reports")
    .insert({ listing_id: listingId, thread_id: threadId, reporter_id: user.id, reason, details });
  if (error) return { error: "Couldn't send the report — please try again." };
  revalidatePath("/admin/marketplace");
  return {};
}
