import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Vendor } from "@/lib/supabase/types";
import { newClaimToken } from "@/lib/venue-claim-server";

/**
 * The vendor counterpart of venue-claim-server.ts. Kept out of the claim
 * page's "use server" file for the same reason: this returns the vendor row,
 * inactive listings included, and anything exported from there is callable
 * from any browser.
 */
export async function vendorForClaimToken(token: string): Promise<Vendor | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const admin = createAdminSupabaseClient();
  const { data: link } = await admin
    .from("vendor_claim_links")
    .select("vendor_id")
    .eq("token", token)
    .maybeSingle<{ vendor_id: string }>();
  if (!link) return null;
  const { data: vendor } = await admin
    .from("vendors")
    .select("*")
    .eq("id", link.vendor_id)
    .maybeSingle<Vendor>();
  return vendor;
}

export const VENDOR_CLAIM_BASE_URL = "https://wrenwed.com/claim/vendor/";

/** The vendor's claim link, creating one the first time it's asked for. */
export async function ensureVendorClaimLink(vendorId: string): Promise<string | null> {
  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from("vendor_claim_links")
    .select("token")
    .eq("vendor_id", vendorId)
    .maybeSingle<{ token: string }>();
  if (existing) return VENDOR_CLAIM_BASE_URL + existing.token;

  const token = newClaimToken();
  const { error } = await admin.from("vendor_claim_links").insert({ vendor_id: vendorId, token });
  return error ? null : VENDOR_CLAIM_BASE_URL + token;
}
