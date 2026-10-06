"use server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { REPORT_REASONS } from "@/lib/listing-report-reasons";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * "Report a problem" on a listing. Anyone can send one, signed in or not:
 * the couple who drove to a closed venue is exactly who we want to hear from.
 * Lands on /admin/listing-health; nothing changes on the listing by itself.
 */
export async function reportListing(formData: FormData): Promise<{ error?: string }> {
  // Hidden from people, filled in by bots.
  if (((formData.get("website") as string) || "").trim()) return {};

  const listingType = formData.get("listing_type");
  const listingId = formData.get("listing_id");
  const reason = formData.get("reason");
  const details = ((formData.get("details") as string) || "").trim().slice(0, 1000) || null;
  const reporterEmail = ((formData.get("reporter_email") as string) || "").trim().slice(0, 200) || null;

  if ((listingType !== "venue" && listingType !== "vendor") || typeof listingId !== "string" || !UUID.test(listingId)) {
    return { error: "Missing listing." };
  }
  if (!REPORT_REASONS.some((r) => r.value === reason)) {
    return { error: "Choose what's wrong." };
  }
  if (reason === "other" && !details) {
    return { error: "Tell us what's wrong." };
  }

  const admin = createAdminSupabaseClient();
  const { data: listing } = await admin
    .from(listingType === "venue" ? "venues" : "vendors")
    .select("id")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) return { error: "Missing listing." };

  const { error } = await admin.from("listing_reports").insert({
    listing_type: listingType,
    listing_id: listingId,
    reason,
    details,
    reporter_email: reporterEmail,
  });
  if (error) return { error: "Couldn't send that. Please try again." };
  return {};
}
