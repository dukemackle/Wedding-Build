"use server";

import { randomUUID } from "crypto";
import { importPrefix, MAX_IMPORT_BYTES, readForListing, type ListingRead } from "@/lib/ai/listing-reader";
import { VENDOR_READ_FIELDS } from "@/lib/ai/listing-read-fields";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { vendorForClaimToken } from "@/lib/vendor-claim-server";
import { VENDOR_CLAIM_FIELD_LABELS, validateVendorClaim, type VendorClaimSubmission } from "@/lib/vendor-claim";
import { claimNotification } from "@/lib/claim-notify";
import { trackEvent } from "@/lib/events";
import { cleanFirstTouch, cleanHeardFrom, cleanVia } from "@/lib/attribution";
import { deleteClaimDraft, storeClaimDraft } from "@/lib/claim-drafts";
import { storeClaimPhoto } from "@/lib/claim-photos";

// The vendor side of the claim flow; see ../../[token]/actions.ts for the
// venue side and the reasoning. Every action resolves the token first and
// touches nothing but that vendor.

const BUCKET = "vendor-photos";

/** One shrunk photo from the browser; see uploadClaimPhoto on the venue side. */
export async function uploadVendorClaimPhoto(token: string, formData: FormData): Promise<{ error?: string; url?: string }> {
  const vendor = await vendorForClaimToken(token);
  if (!vendor) return { error: "This link is no longer valid." };
  const stored = await storeClaimPhoto(BUCKET, vendor.id, formData.get("photo"));
  return "error" in stored ? { error: stored.error } : { url: stored.url };
}

export async function submitVendorClaim(
  token: string,
  submission: VendorClaimSubmission,
  /** How they found us (src/lib/attribution.ts); every part optional and checked here. */
  source?: { heardFrom?: unknown; via?: unknown; firstTouch?: unknown },
): Promise<{ error?: string; errors?: string[] }> {
  const vendor = await vendorForClaimToken(token);
  if (!vendor) return { error: "This link is no longer valid." };

  const { value, errors } = validateVendorClaim(submission);
  const admin = createAdminSupabaseClient();
  const ownPrefix = admin.storage.from(BUCKET).getPublicUrl(`claims/${vendor.id}/`).data.publicUrl;
  const existing = new Set([...(vendor.photo_urls ?? []), vendor.image_url].filter(Boolean));
  if (value.photoUrls.some((url) => !url.startsWith(ownPrefix) && !existing.has(url))) {
    errors.push("One of the photos didn't upload properly -- remove it and add it again.");
  }
  if (errors.length > 0) return { errors };

  await admin.from("vendor_submissions").delete().eq("vendor_id", vendor.id).eq("status", "pending");
  const { error } = await admin.from("vendor_submissions").insert({
    vendor_id: vendor.id,
    submitter_name: value.submitter.name,
    submitter_email: value.submitter.email,
    submitter_role: value.submitter.role,
    heard_from: cleanHeardFrom(source?.heardFrom),
    arrived_via: cleanVia(source?.via),
    first_touch: cleanFirstTouch(source?.firstTouch),
    details: value.details,
    faqs: value.faqs,
    photo_urls: value.photoUrls,
  });
  if (error) return { error: "Couldn't save your changes -- please try again." };
  trackEvent("listing_claim_submitted", { listing: { kind: "vendor", id: vendor.id } });
  // Sent, so the half-finished copy has done its job.
  await deleteClaimDraft("vendor", vendor.id);

  const adminEmail = process.env.ADMIN_EMAIL?.split(",")[0]?.trim();
  if (adminEmail && process.env.RESEND_API_KEY) {
    try {
      const { subject, text } = await claimNotification("vendor", vendor, value, VENDOR_CLAIM_FIELD_LABELS);
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: adminEmail,
        replyTo: value.submitter.email,
        subject,
        text,
      });
    } catch {
      // It's in the queue either way.
    }
  }
  return {};
}

/** Keeps the unsent form on our side as they type, so another device or a new link picks it up. */
export async function saveVendorClaimDraft(token: string, draft: unknown): Promise<{ error?: string }> {
  const vendor = await vendorForClaimToken(token);
  if (!vendor) return { error: "This link is no longer valid." };
  return storeClaimDraft("vendor", vendor.id, draft);
}

/** A signed upload URL for a pricing guide or brochure PDF, for "Fill this in for me". */
export async function createImportUpload(
  token: string,
  file: { type: string; size: number },
): Promise<{ error?: string; upload?: { path: string; token: string } }> {
  const vendor = await vendorForClaimToken(token);
  if (!vendor) return { error: "This link is no longer valid." };
  if (file.type !== "application/pdf") return { error: "Upload a PDF -- or use your website instead." };
  if (file.size > MAX_IMPORT_BYTES) return { error: "That PDF is over 20MB. Try a smaller copy, or use your website." };
  const path = `${importPrefix(vendor.id)}${randomUUID()}.pdf`;
  const { data, error } = await createAdminSupabaseClient().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: "Couldn't start the upload -- please try again." };
  return { upload: { path, token: data.token } };
}

/** Drafts the listing from their website or an uploaded PDF. Fills nothing itself -- the form merges it. */
export async function readListingSource(
  token: string,
  source: { pdfPath: string; fileName: string } | { websiteUrl: string },
  questions: string[],
): Promise<{ error?: string; read?: ListingRead }> {
  const vendor = await vendorForClaimToken(token);
  if (!vendor) return { error: "This link is no longer valid." };
  return readForListing({
    kind: "vendor",
    listingId: vendor.id,
    bucket: BUCKET,
    fields: VENDOR_READ_FIELDS,
    questions,
    source,
  });
}
