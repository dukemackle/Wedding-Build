"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Vendor, VenueSubmission } from "@/lib/supabase/types";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { CLAIM_BASE_URL, ensureClaimLink, newClaimToken } from "@/lib/venue-claim-server";
import { geocode, townPin } from "@/lib/listing-pin";

/** The venue's claim link, creating one the first time it's asked for. */
export async function getClaimLink(venueId: string): Promise<{ error?: string; url?: string }> {
  await requireAdmin();
  const url = await ensureClaimLink(venueId);
  return url ? { url } : { error: "Couldn't create a link -- try again." };
}

/** Replaces the link, so the old one stops working -- for a link sent to the wrong person. */
export async function regenerateClaimLink(venueId: string): Promise<{ error?: string; url?: string }> {
  await requireAdmin();
  const token = newClaimToken();
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("venue_claim_links")
    .upsert({ venue_id: venueId, token, created_at: new Date().toISOString() });
  if (error) return { error: error.message };
  return { url: CLAIM_BASE_URL + token };
}

/**
 * Publishes a submission: overwrites the listing with what the venue sent,
 * replaces its FAQs and preferred vendors, and marks it claimed and verified.
 */
export async function approveSubmission(submissionId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminSupabaseClient();

  const { data: submission } = await admin
    .from("venue_submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("status", "pending")
    .maybeSingle<VenueSubmission>();
  if (!submission) return { error: "That submission has already been reviewed." };

  const now = new Date().toISOString();

  // A new or changed street address moves the map pin. Only when the address
  // actually changed, so approving an unrelated edit never shifts a pin that
  // was placed by hand.
  const { data: live } = await admin
    .from("venues")
    .select("address, latitude, source")
    .eq("id", submission.venue_id)
    .maybeSingle<{ address: string | null; latitude: number | null; source: string | null }>();
  const d = submission.details;
  // A listing with no pin at all (a venue that listed itself without an
  // address the geocoder knows) borrows its town's, so it still shows on the map.
  const pin =
    (d.address && d.address !== live?.address
      ? await geocode([d.address, d.city, d.state].filter(Boolean).join(", "))
      : null) ?? (live?.latitude == null ? await townPin(d.city, d.state) : null);
  // A venue that listed itself goes live on its first approval. Any other
  // venue keeps whatever active state the admin gave it.
  const isNew = live?.source === "self-listed";

  const { error: venueError } = await admin
    .from("venues")
    .update({
      ...submission.details,
      ...(pin ?? {}),
      photo_urls: submission.photo_urls,
      image_url: submission.photo_urls[0] ?? null,
      ...(isNew ? { active: true } : {}),
      source: "claimed",
      last_verified_at: now,
      verified_by: `venue: ${submission.submitter_email}`,
    })
    .eq("id", submission.venue_id);
  if (venueError) return { error: venueError.message };

  await admin.from("venue_faqs").delete().eq("venue_id", submission.venue_id);
  if (submission.faqs.length > 0) {
    const { error } = await admin.from("venue_faqs").insert(
      submission.faqs.map((f, i) => ({
        venue_id: submission.venue_id,
        question: f.question,
        answer: f.answer,
        sort_order: i,
      })),
    );
    if (error) return { error: error.message };
  }

  // Link a preferred vendor to its Wren listing when the names match exactly.
  // Vendors have no website column to match on, and a looser match would send
  // couples to the wrong business -- worse than an outside link.
  const { data: vendors } = await admin
    .from("vendors")
    .select("id, name")
    .eq("active", true)
    .eq("is_sample", false)
    .returns<Pick<Vendor, "id" | "name">[]>();
  const vendorIdByName = new Map((vendors ?? []).map((v) => [v.name.trim().toLowerCase(), v.id]));

  await admin.from("venue_preferred_vendors").delete().eq("venue_id", submission.venue_id);
  if (submission.preferred_vendors.length > 0) {
    const { error } = await admin.from("venue_preferred_vendors").insert(
      submission.preferred_vendors.map((v, i) => ({
        venue_id: submission.venue_id,
        category: v.category,
        name: v.name,
        website: v.website,
        vendor_id: vendorIdByName.get(v.name.trim().toLowerCase()) ?? null,
        sort_order: i,
      })),
    );
    if (error) return { error: error.message };
  }

  await admin.from("venue_spaces").delete().eq("venue_id", submission.venue_id);
  if ((submission.spaces ?? []).length > 0) {
    const { error } = await admin.from("venue_spaces").insert(
      submission.spaces.map((sp, i) => ({ venue_id: submission.venue_id, ...sp, sort_order: i })),
    );
    if (error) return { error: error.message };
  }

  await admin
    .from("venue_submissions")
    .update({ status: "approved", reviewed_at: now })
    .eq("id", submissionId);

  if (process.env.RESEND_API_KEY) {
    try {
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: submission.submitter_email,
        replyTo: process.env.ADMIN_EMAIL?.split(",")[0]?.trim(),
        subject: isNew ? `${submission.details.name} is live on You Do, I Do` : `${submission.details.name} is updated on You Do, I Do`,
        text: isNew
          ? `Hi ${submission.submitter_name},\n\n${submission.details.name} is now listed on You Do, I Do, where couples can find it and send you inquiries. Use the same link any time to make changes, or ask for it again at https://youdoido.com/list/edit\n\nThanks,\nYou Do, I Do`
          : `Hi ${submission.submitter_name},\n\nYour changes to ${submission.details.name} are now live on You Do, I Do. You can use the same link any time to make more.\n\nThanks,\nYou Do, I Do`,
      });
    } catch {
      // The listing is live either way.
    }
  }

  revalidatePath("/admin/venues");
  revalidatePath("/admin/venues/claims");
  revalidatePath("/venues");
  revalidatePath(`/venues/${submission.venue_id}`);
  return {};
}

export async function rejectSubmission(submissionId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("venue_submissions")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", submissionId)
    .eq("status", "pending");
  if (error) return { error: error.message };
  revalidatePath("/admin/venues/claims");
  return {};
}
