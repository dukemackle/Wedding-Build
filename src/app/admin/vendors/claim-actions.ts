"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { restamp, type FieldSources } from "@/lib/field-sources";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { VendorSubmission } from "@/lib/supabase/types";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { newClaimToken } from "@/lib/venue-claim-server";
import { ensureVendorClaimLink, VENDOR_CLAIM_BASE_URL } from "@/lib/vendor-claim-server";
import { townPin } from "@/lib/listing-pin";

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

  const { data: live } = await admin
    .from("vendors")
    .select("latitude, city, state, source, field_sources")
    .eq("id", submission.vendor_id)
    .maybeSingle<{
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

  if (process.env.RESEND_API_KEY) {
    try {
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: submission.submitter_email,
        replyTo: process.env.ADMIN_EMAIL?.split(",")[0]?.trim(),
        subject: isNew ? `${d.name} is live on You Do, I Do` : `${d.name} is updated on You Do, I Do`,
        text: isNew
          ? `Hi ${submission.submitter_name},\n\n${d.name} is now listed on You Do, I Do, where couples can find you and send you inquiries. Use the same link any time to make changes, or ask for it again at https://youdoido.com/list/edit\n\nThanks,\nYou Do, I Do`
          : `Hi ${submission.submitter_name},\n\nYour changes to ${d.name} are now live on You Do, I Do. You can use the same link any time to make more.\n\nThanks,\nYou Do, I Do`,
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
