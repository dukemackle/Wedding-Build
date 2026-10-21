"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { restamp, type FieldSources } from "@/lib/field-sources";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { VendorSubmission } from "@/lib/supabase/types";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { noticeOfContactChange } from "@/lib/venue-claim-server";
import { ensureVendorClaimLink, replaceVendorClaimLink } from "@/lib/vendor-claim-server";
import { townPin } from "@/lib/listing-pin";
import { trackEvent } from "@/lib/events";

// The vendor side of ../venues/claim-actions.ts.

export async function getVendorClaimLink(vendorId: string): Promise<{ error?: string; url?: string }> {
  await requireAdmin();
  const url = await ensureVendorClaimLink(vendorId);
  return url ? { url } : { error: "Couldn't create a link -- try again." };
}

export async function regenerateVendorClaimLink(vendorId: string): Promise<{ error?: string; url?: string }> {
  await requireAdmin();
  const url = await replaceVendorClaimLink(vendorId);
  if (url) await logAdminAction("vendor.claim_link_replace", { type: "vendor", ids: [vendorId] }, "Replaced a vendor's claim link");
  return url ? { url } : { error: "Couldn't create a link -- try again." };
}

export async function approveVendorSubmission(submissionId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const { data: submission } = await admin
    .from("vendor_submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("status", "pending")
    .maybeSingle<VendorSubmission>();
  if (!submission) return { error: "That submission has already been reviewed." };

  const { data: live } = await admin
    .from("vendors")
    .select("latitude, city, state, source, field_sources, contact_email")
    .eq("id", submission.vendor_id)
    .maybeSingle<{
      contact_email: string | null;
      latitude: number | null;
      city: string | null;
      state: string | null;
      source: string | null;
      field_sources: FieldSources;
    }>();
  const d = submission.details;
  // A vendor that listed itself goes live on its first approval. Any other
  // vendor keeps whatever active state the admin gave it.
  const isNew = live?.source === "self-listed";
  // Vendors have no street address, so the map pin follows the town: borrowed
  // from another listing there when the town changes or there's no pin yet.
  const moved = d.city !== live?.city || d.state !== live?.state;
  const pin = moved || live?.latitude == null ? await townPin(d.city, d.state) : null;

  const now = new Date().toISOString();
  const { error: vendorError } = await admin
    .from("vendors")
    .update({
      ...submission.details,
      ...(pin ?? {}),
      ...(isNew ? { active: true } : {}),
      photo_urls: submission.photo_urls,
      image_url: submission.photo_urls[0] ?? null,
      source: "claimed",
      last_verified_at: now,
      verified_by: `vendor: ${submission.submitter_email}`,
      // Every field the vendor sent, changed or not: it looked at each and kept it.
      field_sources: restamp(live ?? null, { ...submission.details, photo_urls: submission.photo_urls }, "vendor"),
    })
    .eq("id", submission.vendor_id);
  if (vendorError) return { error: vendorError.message };

  await admin.from("vendor_faqs").delete().eq("vendor_id", submission.vendor_id);
  if (submission.faqs.length > 0) {
    const { error } = await admin.from("vendor_faqs").insert(
      submission.faqs.map((f, i) => ({ vendor_id: submission.vendor_id, question: f.question, answer: f.answer, sort_order: i })),
    );
    if (error) return { error: error.message };
  }

  await admin.from("vendor_submissions").update({ status: "approved", reviewed_at: now }).eq("id", submissionId);

  // As for venues: the old link has been in forwarded inquiry emails, so the
  // approved submitter gets a fresh one and the old one stops working.
  const link = await replaceVendorClaimLink(submission.vendor_id);
  const linkLine = link ? `Your private link for changes from now on (it lasts 90 days; ask for a new one any time at https://youdoido.com/list/edit):\n${link}` : "Ask for your link any time at https://youdoido.com/list/edit";
  await noticeOfContactChange(d.name, live?.contact_email, d.contact_email);

  if (process.env.RESEND_API_KEY) {
    try {
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: submission.submitter_email,
        replyTo: process.env.ADMIN_EMAIL?.split(",")[0]?.trim(),
        subject: isNew ? `${d.name} is live on You Do, I Do` : `${d.name} is updated on You Do, I Do`,
        text: isNew
          ? `Hi ${submission.submitter_name},\n\n${d.name} is now listed on You Do, I Do, where couples can find you and send you inquiries.\n\n${linkLine}\n\nThanks,\nYou Do, I Do`
          : `Hi ${submission.submitter_name},\n\nYour changes to ${d.name} are now live on You Do, I Do.\n\n${linkLine}\n\nThanks,\nYou Do, I Do`,
      });
    } catch {
      // The listing is live either way.
    }
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/vendors/claims");
  revalidatePath("/vendors");
  revalidatePath(`/vendors/${submission.vendor_id}`);
  if (submission.vendor_id) trackEvent("listing_claimed", { listing: { kind: "vendor", id: submission.vendor_id }, props: { new_listing: isNew } });
  await logAdminAction("vendor.claim_approve", { type: "vendor_submission", ids: [submissionId] }, "Approved a vendor claim");
  return {};
}

export async function rejectVendorSubmission(submissionId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const { error } = await createAdminSupabaseClient()
    .from("vendor_submissions")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", submissionId)
    .eq("status", "pending");
  if (error) return { error: error.message };
  revalidatePath("/admin/vendors/claims");
  await logAdminAction("vendor.claim_reject", { type: "vendor_submission", ids: [submissionId] }, "Rejected a vendor claim");
  return {};
}
