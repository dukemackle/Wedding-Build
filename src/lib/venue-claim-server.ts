import "server-only";
import { randomBytes } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Venue } from "@/lib/supabase/types";

/**
 * Resolves a claim link's token to its venue, or null.
 *
 * Kept out of the claim page's "use server" file on purpose: anything
 * exported from there is callable from any browser, and this returns the
 * venue row -- inactive and sample venues included.
 */
export async function venueForClaimToken(token: string): Promise<Venue | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const admin = createAdminSupabaseClient();
  const { data: link } = await admin
    .from("venue_claim_links")
    .select("venue_id")
    .eq("token", token)
    .maybeSingle<{ venue_id: string }>();
  if (!link) return null;
  const { data: venue } = await admin
    .from("venues")
    .select("*")
    .eq("id", link.venue_id)
    .maybeSingle<Venue>();
  return venue;
}

// The claim page lives on the couple-facing domain, not the admin one: the
// venue has no admin access, and admin.wrenwed.com redirects everything
// outside /admin.
export const CLAIM_BASE_URL = "https://wrenwed.com/claim/";

export function newClaimToken() {
  return randomBytes(24).toString("base64url");
}

/** The venue's claim link, creating one the first time it's asked for. */
export async function ensureClaimLink(venueId: string): Promise<string | null> {
  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from("venue_claim_links")
    .select("token")
    .eq("venue_id", venueId)
    .maybeSingle<{ token: string }>();
  if (existing) return CLAIM_BASE_URL + existing.token;

  const token = newClaimToken();
  const { error } = await admin.from("venue_claim_links").insert({ venue_id: venueId, token });
  return error ? null : CLAIM_BASE_URL + token;
}
