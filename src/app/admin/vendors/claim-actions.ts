"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { VendorSubmission } from "@/lib/supabase/types";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { newClaimToken } from "@/lib/venue-claim-server";
import { ensureVendorClaimLink, VENDOR_CLAIM_BASE_URL } from "@/lib/vendor-claim-server";

// The vendor side of ../venues/claim-actions.ts.

export async function getVendorClaimLink(vendorId: string): Promise<{ error?: string; url?: string }> {
  await requireAdmin();
  const url = await ensureVendorClaimLink(vendorId);
  return url ? { url } : { error: "Couldn't create a link -- try again." };
}

export async function regenerateVendorClaimLink(vendorId: string): Promise<{ error?: string; url?: string }> {
  await requireAdmin();
  const token = newClaimToken();
  const { error } = await createAdminSupabaseClient()
    .from("vendor_claim_links")
    .upsert({ vendor_id: vendorId, token, created_at: new Date().toISOString() });
  if (error) return { error: error.message };
  return { url: VENDOR_CLAIM_BASE_URL + token };
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

  const now = new Date().toISOString();
  const { error: vendorError } = await admin
    .from("vendors")
    .update({
      ...submission.details,
      photo_urls: submission.photo_urls,
      image_url: submission.photo_urls[0] ?? null,
      source: "claimed",
      last_verified_at: now,
      verified_by: `vendor: ${submission.submitter_email}`,
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

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/vendors/claims");
  revalidatePath("/vendors");
  revalidatePath(`/vendors/${submission.vendor_id}`);
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
  return {};
}
