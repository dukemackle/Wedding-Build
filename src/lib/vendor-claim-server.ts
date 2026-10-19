import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Vendor } from "@/lib/supabase/types";
import { claimLinkDue, claimLinkExpired, newClaimToken } from "@/lib/venue-claim-server";

// Vendor claim links: the same scheme as venues (see venue-claim-server.ts),
// under /claim/vendor/ so the two kinds of token can never be mistaken for
// each other.
export const VENDOR_CLAIM_BASE_URL = "https://youdoido.com/claim/vendor/";

export async function vendorForClaimToken(token: string): Promise<Vendor | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const admin = createAdminSupabaseClient();
  const { data: link } = await admin
    .from("vendor_claim_links")
    .select("vendor_id, created_at")
    .eq("token", token)
    .maybeSingle<{ vendor_id: string; created_at: string }>();
  if (!link || claimLinkExpired(link.created_at)) return null;
  const { data: vendor } = await admin.from("vendors").select("*").eq("id", link.vendor_id).maybeSingle<Vendor>();
  return vendor;
}

/** The vendor's claim link, creating one the first time it's asked for and replacing one past 60 days. */
export async function ensureVendorClaimLink(vendorId: string): Promise<string | null> {
  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from("vendor_claim_links")
    .select("token, created_at")
    .eq("vendor_id", vendorId)
    .maybeSingle<{ token: string; created_at: string }>();
  if (existing && !claimLinkDue(existing.created_at)) return VENDOR_CLAIM_BASE_URL + existing.token;
  return replaceVendorClaimLink(vendorId);
}

/** A new claim link for the vendor; the old one stops working. */
export async function replaceVendorClaimLink(vendorId: string): Promise<string | null> {
  const token = newClaimToken();
  const { error } = await createAdminSupabaseClient()
    .from("vendor_claim_links")
    .upsert({ vendor_id: vendorId, token, created_at: new Date().toISOString() });
  return error ? null : VENDOR_CLAIM_BASE_URL + token;
}
