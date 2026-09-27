"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Vendor, VenueSubmission } from "@/lib/supabase/types";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { CLAIM_BASE_URL, ensureClaimLink, newClaimToken } from "@/lib/venue-claim-server";

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
  const { error: venueError } = await admin
    .from("venues")
    .update({
      ...submission.details,
      photo_urls: submission.photo_urls,
      image_url: submission.photo_urls[0] ?? null,
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
        subject: `${submission.details.name} is updated on Wren`,
        text: `Hi ${submission.submitter_name},\n\nYour changes to ${submission.details.name} are now live on Wren. You can use the same link any time to make more.\n\nThanks,\nWren`,
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
