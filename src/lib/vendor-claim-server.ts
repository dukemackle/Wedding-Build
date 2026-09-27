import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Vendor } from "@/lib/supabase/types";
import { newClaimToken } from "@/lib/venue-claim-server";

// Vendor claim links: the same scheme as venues (see venue-claim-server.ts),
// under /claim/vendor/ so the two kinds of token can never be mistaken for
// each other.
export const VENDOR_CLAIM_BASE_URL = "https://wrenwed.com/claim/vendor/";

export async function vendorForClaimToken(token: string): Promise<Vendor | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const admin = createAdminSupabaseClient();
  const { data: link } = await admin
    .from("vendor_claim_links")
    .select("vendor_id")
    .eq("token", token)
    .maybeSingle<{ vendor_id: string }>();
  if (!link) return null;
  const { data: vendor } = await admin.from("vendors").select("*").eq("id", link.vendor_id).maybeSingle<Vendor>();
  return vendor;
}

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
