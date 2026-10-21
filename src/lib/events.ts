import "server-only";
import { after } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/**
 * Every event the app records, and how often each counts:
 * - "once": the first time for a wedding (or for a wedding and a listing),
 * - "daily": at most once a day per wedding,
 * - "every": each time it happens.
 *
 * Named object_verb, past tense. A name changing meaning gets a new name
 * (`_v2`) rather than being redefined, or old rows stop meaning what the
 * funnel says they do.
 */
export const EVENTS = {
  account_created: "once",
  wedding_created: "once",
  dashboard_visited: "daily",
  guest_added: "once",
  budget_set: "once",
  checklist_item_completed: "once",
  wren_question_asked: "once",
  listing_viewed: "once",
  listing_saved: "once",
  listing_inquiry_sent: "every",
  listing_booked: "once",
  guest_site_published: "once",
  rsvp_invites_sent: "once",
  rsvp_received: "every",
  listing_claim_submitted: "every",
  listing_claimed: "once",
} as const;

export type EventName = keyof typeof EVENTS;

export type EventContext = {
  weddingId?: string | null;
  userId?: string | null;
  listing?: { kind: "venue" | "vendor"; id: string } | null;
  /** Small, typed values only: never names, emails, guest details or free text. */
  props?: Record<string, string | number | boolean | null>;
};

function dedupeKey(name: EventName, ctx: EventContext): string | null {
  const mode = EVENTS[name];
  if (mode === "every") return null;
  // Whose first time: the wedding, else the account, else (a claim) just the listing.
  const subject = ctx.weddingId ?? ctx.userId ?? "";
  if (!subject && !ctx.listing) return null;
  const parts = [name, subject];
  if (ctx.listing) parts.push(ctx.listing.kind, ctx.listing.id);
  if (mode === "daily") parts.push(new Date().toISOString().slice(0, 10));
  return parts.join(":");
}

/**
 * Records a product event in `events` (migration 0130), after the response
 * has gone, so it never slows or breaks what the couple was doing. Call it
 * once the write it describes has succeeded.
 *
 * Read on /admin/analytics. Test weddings are left out there, not here, so
 * flagging a wedding as test later still takes its events out.
 */
export function trackEvent(name: EventName, ctx: EventContext = {}): void {
  const row = {
    p_name: name,
    p_wedding_id: ctx.weddingId ?? null,
    p_user_id: ctx.userId ?? null,
    p_listing_kind: ctx.listing?.kind ?? null,
    p_listing_id: ctx.listing?.id ?? null,
    p_props: ctx.props ?? {},
    p_dedupe_key: dedupeKey(name, ctx),
  };
  after(async () => {
    try {
      const { error } = await createAdminSupabaseClient().rpc("log_event", row);
      if (error) console.error("events insert failed:", error.message);
    } catch (failure) {
      console.error("events insert failed:", failure);
    }
  });
}
