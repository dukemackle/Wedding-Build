"use server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { vendorForClaimToken } from "@/lib/vendor-claim-server";
import { venueForClaimToken } from "@/lib/venue-claim-server";

// The optional "help us get this right" card shown after a venue or vendor
// sends its listing. Like the rest of the claim page, the token is the only
// credential, so this resolves it first and writes through the service role.
// Answers land in /admin/feedback beside the couples' /help feedback.

const MAX_ANSWER = 2000;

export type ListingFeedback = { missing: string; rating: number | null; bookings: string };

export async function submitListingFeedback(
  kind: "venue" | "vendor",
  token: string,
  feedback: ListingFeedback,
): Promise<{ error?: string }> {
  const listing = kind === "venue" ? await venueForClaimToken(token) : await vendorForClaimToken(token);
  if (!listing) return { error: "This link is no longer valid." };

  const missing = feedback.missing.trim().slice(0, MAX_ANSWER);
  const bookings = feedback.bookings.trim().slice(0, MAX_ANSWER);
  const rating = Number.isInteger(feedback.rating) && feedback.rating! >= 1 && feedback.rating! <= 5 ? feedback.rating : null;
  if (!missing && !bookings && rating === null) return { error: "Answer any one question before sending." };

  const message = [
    missing && `Couldn't add: ${missing}`,
    bookings && `Would help bookings: ${bookings}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("feedback_submissions").insert({
    source: kind,
    venue_id: kind === "venue" ? listing.id : null,
    vendor_id: kind === "vendor" ? listing.id : null,
    category: "idea",
    rating,
    message: message || "(rating only)",
  });
  if (error) return { error: "Couldn't send that -- please try again." };
  return {};
}
