import "server-only";
import { randomBytes } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import type { Venue } from "@/lib/supabase/types";

/**
 * Claim links don't last forever (docs/legal-audit.md R8). Every inquiry
 * footer carries one, so an old link can sit in any inbox it was forwarded
 * to. A link opens for 90 days; past 60, the next email that would carry it
 * gets a fresh one instead, so a link we've just sent always has a month or
 * more left. A business with an expired link asks for a new one at /list/edit,
 * which only ever sends to an address on file.
 */
export const CLAIM_LINK_DAYS = 90;
const CLAIM_LINK_REFRESH_DAYS = 60;
const DAY = 24 * 60 * 60 * 1000;

const olderThan = (createdAt: string, days: number) => Date.now() - new Date(createdAt).getTime() > days * DAY;
export const claimLinkExpired = (createdAt: string) => olderThan(createdAt, CLAIM_LINK_DAYS);
export const claimLinkDue = (createdAt: string) => olderThan(createdAt, CLAIM_LINK_REFRESH_DAYS);

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
    .select("venue_id, created_at")
    .eq("token", token)
    .maybeSingle<{ venue_id: string; created_at: string }>();
  if (!link || claimLinkExpired(link.created_at)) return null;
  const { data: venue } = await admin
    .from("venues")
    .select("*")
    .eq("id", link.venue_id)
    .maybeSingle<Venue>();
  return venue;
}

// The claim page lives on the couple-facing domain, not the admin one: the
// venue has no admin access, and admin.youdoido.com redirects everything
// outside /admin.
export const CLAIM_BASE_URL = "https://youdoido.com/claim/";

export function newClaimToken() {
  return randomBytes(24).toString("base64url");
}

/** The venue's claim link, creating one the first time it's asked for and replacing one past 60 days. */
export async function ensureClaimLink(venueId: string): Promise<string | null> {
  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from("venue_claim_links")
    .select("token, created_at")
    .eq("venue_id", venueId)
    .maybeSingle<{ token: string; created_at: string }>();
  if (existing && !claimLinkDue(existing.created_at)) return CLAIM_BASE_URL + existing.token;
  return replaceClaimLink(venueId);
}

/** A new claim link for the venue; the old one stops working. */
export async function replaceClaimLink(venueId: string): Promise<string | null> {
  const token = newClaimToken();
  const { error } = await createAdminSupabaseClient()
    .from("venue_claim_links")
    .upsert({ venue_id: venueId, token, created_at: new Date().toISOString() });
  return error ? null : CLAIM_BASE_URL + token;
}

/**
 * Tells a listing's old contact address that an approved change replaced it.
 * Leads follow the contact email, so a claim by the wrong person would
 * otherwise redirect a business's inquiries without it ever knowing.
 */
export async function noticeOfContactChange(
  listingName: string,
  oldEmail: string | null | undefined,
  newEmail: string | null | undefined,
) {
  if (!oldEmail || !process.env.RESEND_API_KEY) return;
  if (oldEmail.trim().toLowerCase() === (newEmail ?? "").trim().toLowerCase()) return;
  try {
    await getResendClient().emails.send({
      from: INQUIRY_FROM_ADDRESS,
      to: oldEmail,
      replyTo: process.env.ADMIN_EMAIL?.split(",")[0]?.trim(),
      subject: `The contact email on ${listingName}'s You Do, I Do listing changed`,
      text: `Hi,\n\nSomeone updated ${listingName}'s listing on You Do, I Do, and couples' inquiries now go to ${newEmail ?? "no email address"} instead of this one.\n\nIf that was you or your team, there's nothing to do. If it wasn't, reply to this email and we'll put it back.\n\nThanks,\nYou Do, I Do`,
    });
  } catch {
    // Best effort: the change is approved either way.
  }
}
