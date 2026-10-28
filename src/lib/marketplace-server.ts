import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { createClient as createServerClient } from "@/lib/supabase/server";
import type { MarketListing, MarketSet, MarketThread } from "@/lib/supabase/types";
import { liveSetItems, MIN_SET_ITEMS, type MarketSetWithItems } from "@/lib/marketplace";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { SITE_URL } from "@/lib/public-listings";
import { passItOnDrafts, type PassItOnDraft } from "@/lib/pass-it-on";
import { PALETTES, themeById, type ColorFamily } from "@/lib/site-design";
import { parseSiteDesign } from "@/lib/site-design-schema";

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

export type MarketWedding = {
  weddingId: string;
  firstName: string;
  guestCount: number;
  weddingDate: string | null;
  /** The booked venue's pin, where "within X miles" measures from. */
  origin: { latitude: number; longitude: number; label: string } | null;
  ownVenueCity: string | null;
  ownVenueState: string | null;
  /** The colour family of their guest-site palette; null until they pick one. */
  colorFamily: ColorFamily | null;
};

/**
 * What the marketplace borrows from the viewer's wedding, if they have one:
 * a first name for listings and messages, the guest count for "fits my
 * wedding", the venue for distance, the date for the seller badge. Read as
 * the person (their own client), so RLS keeps it to their own wedding.
 */
export async function loadMarketWedding(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
): Promise<MarketWedding | null> {
  const { data: wedding } = await supabase
    .from("weddings")
    .select(
      "id, partner_a_name, guest_count_override, wedding_date, own_venue_city, own_venue_state, site_design, site_design_draft, venue:venues(city, latitude, longitude)",
    )
    .or(`user_id.eq.${userId},member_ids.cs.{${userId}}`)
    .maybeSingle<{
      id: string;
      partner_a_name: string | null;
      guest_count_override: number | null;
      wedding_date: string | null;
      own_venue_city: string | null;
      own_venue_state: string | null;
      site_design: unknown;
      site_design_draft: unknown;
      venue: { city: string | null; latitude: number | null; longitude: number | null } | null;
    }>();
  if (!wedding) return null;

  let guestCount = wedding.guest_count_override ?? 0;
  if (wedding.guest_count_override == null) {
    const { data: guests } = await supabase
      .from("guests")
      .select("status, plus_one")
      .eq("wedding_id", wedding.id)
      .returns<{ status: string; plus_one: boolean }[]>();
    // Everyone invited, not just yes's: when shopping, the list is the plan.
    guestCount = (guests ?? [])
      .filter((g) => g.status !== "declined")
      .reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);
  }

  const venue = wedding.venue;
  return {
    weddingId: wedding.id,
    firstName: wedding.partner_a_name?.split(/\s+/)[0] ?? "",
    guestCount,
    weddingDate: wedding.wedding_date,
    origin:
      venue?.latitude != null && venue.longitude != null
        ? { latitude: venue.latitude, longitude: venue.longitude, label: venue.city ?? "your venue" }
        : null,
    ownVenueCity: wedding.own_venue_city,
    ownVenueState: wedding.own_venue_state,
    colorFamily: paletteFamily(wedding.site_design ?? wedding.site_design_draft),
  };
}

/**
 * The colour family of a guest-site design's palette. Designs store the
 * palette's colours rather than its id, so this finds the palette by its
 * accent and background (the theme's own where the design has none), then by
 * accent alone. Null for no design, or colours that aren't a palette's.
 */
export function paletteFamily(value: unknown): ColorFamily | null {
  if (value == null) return null;
  const design = parseSiteDesign(value);
  const theme = themeById(design.theme);
  const accent = (design.accent ?? theme.swatches[0]).toLowerCase();
  const bg = (design.colors.bg ?? theme.bg).toLowerCase();
  const palette =
    PALETTES.find((p) => p.accent === accent && p.bg === bg) ?? PALETTES.find((p) => p.accent === accent);
  return palette?.family ?? null;
}

/**
 * The rentals already out on a date, for "Free on your date". By date rather
 * than by listing, so the query stays short however many rentals there are.
 * Read as the person; RLS shows bookings on live listings (0147).
 */
export async function loadBookedOn(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  date: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("market_rental_bookings")
    .select("listing_id")
    .lte("starts_on", date)
    .gte("ends_on", date)
    .returns<{ listing_id: string }[]>();
  return [...new Set((data ?? []).map((b) => b.listing_id))];
}

/**
 * Live whole-wedding sets, newest first, with their items. A set whose items
 * have mostly sold one by one (fewer than two left) isn't shown.
 */
export async function loadLiveSets(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  limit = 12,
): Promise<MarketSetWithItems[]> {
  const { data } = await supabase
    .from("market_sets")
    .select("*, items:market_listings(*)")
    .in("status", ["active", "pending"])
    .order("created_at", { ascending: false })
    .limit(limit * 2)
    .returns<(MarketSet & { items: MarketListing[] })[]>();
  return (data ?? [])
    .map((set) => ({ ...set, items: sortItems(liveSetItems(set.items ?? [])) }))
    .filter((set) => set.items.length >= MIN_SET_ITEMS)
    .slice(0, limit);
}

/** One set and its items, for its own page; null when it isn't visible. */
export async function loadSet(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  id: string,
): Promise<MarketSetWithItems | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase
    .from("market_sets")
    .select("*, items:market_listings(*)")
    .eq("id", id)
    .maybeSingle<MarketSet & { items: MarketListing[] }>();
  return data ? { ...data, items: sortItems(data.items ?? []) } : null;
}

function sortItems(items: MarketListing[]) {
  return [...items].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

/**
 * "Pass it on": the things the couple's budget says they bought and haven't
 * listed yet. Listings by either partner count as listed (RLS shows a
 * partner's live ones, and all of the viewer's own).
 */
export async function loadPassItOn(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  weddingId: string,
): Promise<PassItOnDraft[]> {
  const [{ data: wedding }, { data: lineItems }, { data: customItems }] = await Promise.all([
    supabase
      .from("weddings")
      .select("user_id, member_ids")
      .eq("id", weddingId)
      .maybeSingle<{ user_id: string; member_ids: string[] | null }>(),
    supabase
      .from("budget_line_items")
      .select("category, override_value, paid_amount")
      .eq("wedding_id", weddingId)
      .returns<{ category: string; override_value: number | null; paid_amount: number | null }[]>(),
    supabase
      .from("budget_custom_items")
      .select("id, label, amount, paid_amount")
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: true })
      .returns<{ id: string; label: string; amount: number | null; paid_amount: number | null }[]>(),
  ]);
  if (!wedding) return [];

  const { data: listed } = await supabase
    .from("market_listings")
    .select("source_budget_item")
    .in("seller_id", [wedding.user_id, ...(wedding.member_ids ?? [])])
    .not("source_budget_item", "is", null)
    .returns<{ source_budget_item: string }[]>();

  return passItOnDrafts({
    lineItems: lineItems ?? [],
    customItems: customItems ?? [],
    listedSources: new Set((listed ?? []).map((l) => l.source_budget_item)),
  });
}

/**
 * Posts a line from the app into every conversation about a listing ("Marked
 * as sold", "Price reduced to $40"), so buyers who asked hear about it where
 * they asked. Moves the conversation up and marks it unread for the buyer;
 * the seller, who made the change, has seen it.
 */
export async function postListingEvent(listingId: string, sellerId: string, body: string) {
  const admin = createAdminSupabaseClient();
  const { data: threads } = await admin
    .from("market_threads")
    .select("id")
    .eq("listing_id", listingId)
    .returns<{ id: string }[]>();
  if (!threads?.length) return;
  const now = new Date().toISOString();
  await admin
    .from("market_messages")
    .insert(threads.map((t) => ({ thread_id: t.id, sender_id: sellerId, body, kind: "event" })));
  await admin
    .from("market_threads")
    .update({ last_message_at: now, seller_last_read_at: now })
    .in(
      "id",
      threads.map((t) => t.id),
    );
}

/** Most people a price drop emails, so a popular listing can't run up the Resend bill. */
const MAX_PRICE_DROP_EMAILS = 50;

/**
 * A lower price: a line in each conversation about the listing, and an email
 * to the people who saved it (Facebook's "price dropped" nudge), except the
 * ones already talking to the seller, who get the line instead.
 */
export async function announcePriceDrop(listingId: string, sellerId: string, title: string, price: string) {
  await postListingEvent(listingId, sellerId, `Price reduced to ${price}`);
  if (!process.env.RESEND_API_KEY) return;

  const admin = createAdminSupabaseClient();
  const [{ data: saves }, { data: threads }] = await Promise.all([
    admin
      .from("market_saves")
      .select("user_id")
      .eq("listing_id", listingId)
      .limit(MAX_PRICE_DROP_EMAILS)
      .returns<{ user_id: string }[]>(),
    admin.from("market_threads").select("buyer_id").eq("listing_id", listingId).returns<{ buyer_id: string }[]>(),
  ]);
  const talking = new Set((threads ?? []).map((t) => t.buyer_id));
  const resend = getResendClient();
  for (const { user_id } of saves ?? []) {
    if (talking.has(user_id) || user_id === sellerId) continue;
    try {
      const { data } = await admin.auth.admin.getUserById(user_id);
      if (!data.user?.email) continue;
      await resend.emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: data.user.email,
        subject: `Price drop: "${title}" is now ${price}`,
        text: `Something you saved on the You Do, I Do marketplace just got cheaper: "${title}" is now ${price}.\n\nSee it: ${SITE_URL}/marketplace/${listingId}\n\nYou're getting this because you saved the listing. Unsave it to stop hearing about it.\n\nYou Do, I Do`,
      });
    } catch {
      // One failed email shouldn't stop the rest.
    }
  }
}

/** When this person joined, for "Joined You Do, I Do in 2026". */
export async function joinedYear(userId: string): Promise<number | null> {
  try {
    const { data } = await createAdminSupabaseClient().auth.admin.getUserById(userId);
    return data.user?.created_at ? new Date(data.user.created_at).getFullYear() : null;
  } catch {
    return null;
  }
}
