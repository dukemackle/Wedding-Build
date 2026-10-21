import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/**
 * The milestones measured for the first cohort (migration 0130). Fixed names
 * only -- nothing a couple typed goes into usage_events.
 */
export type UsageEvent =
  | "signed_up"
  | "wedding_created"
  | "dashboard_viewed"
  | "guest_added"
  | "budget_edited"
  | "checklist_done"
  | "site_published"
  | "rsvp_invites_sent"
  | "wren_asked"
  | "listing_saved"
  | "vendor_inquiry_sent"
  | "venue_inquiry_sent";

/**
 * Records that `userId` did `name` today. Never throws: if the row can't be
 * written, it goes to the Worker logs and whatever the caller was doing
 * carries on.
 */
export async function trackEvent(name: UsageEvent, userId: string | null | undefined, weddingId?: string | null): Promise<void> {
  if (!userId) return;
  try {
    const { error } = await createAdminSupabaseClient().rpc("log_usage_event", {
      p_name: name,
      p_user: userId,
      p_wedding: weddingId ?? null,
    });
    if (error) console.error("usage_events insert failed:", error.message);
  } catch (failure) {
    console.error("usage_events insert failed:", failure);
  }
}
