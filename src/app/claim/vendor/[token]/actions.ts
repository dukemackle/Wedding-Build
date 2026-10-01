"use server";

import { randomUUID } from "crypto";
import { importPrefix, MAX_IMPORT_BYTES, readForListing, type ListingRead } from "@/lib/ai/listing-reader";
import { VENDOR_READ_FIELDS } from "@/lib/ai/listing-read-fields";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { vendorForClaimToken } from "@/lib/vendor-claim-server";
import { CLAIM_PHOTO_TYPES, MAX_CLAIM_PHOTO_BYTES, MAX_CLAIM_PHOTOS } from "@/lib/venue-claim";
import { validateVendorClaim, type VendorClaimSubmission } from "@/lib/vendor-claim";

// The vendor side of the claim flow; see ../../[token]/actions.ts for the
// venue side and the reasoning. Every action resolves the token first and
// touches nothing but that vendor.

const BUCKET = "vendor-photos";
const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function createVendorClaimPhotoUploads(
  token: string,
  files: { type: string; size: number }[],
): Promise<{ error?: string; uploads?: { path: string; token: string; publicUrl: string }[] }> {
  const vendor = await vendorForClaimToken(token);
  if (!vendor) return { error: "This link is no longer valid." };
  if (files.length > MAX_CLAIM_PHOTOS) return { error: `Add at most ${MAX_CLAIM_PHOTOS} photos at a time.` };
  for (const file of files) {
    if (!(CLAIM_PHOTO_TYPES as readonly string[]).includes(file.type)) {
      return { error: "Photos need to be JPEG, PNG or WebP." };
    }
    if (file.size > MAX_CLAIM_PHOTO_BYTES) return { error: "Each photo needs to be under 10MB." };
  }

  const admin = createAdminSupabaseClient();
  const uploads = [];
  for (const file of files) {
    const path = `claims/${vendor.id}/${randomUUID()}.${EXTENSIONS[file.type]}`;
    const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) return { error: "Couldn't start the upload -- please try again." };
    uploads.push({ path, token: data.token, publicUrl: admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl });
  }
  return { uploads };
}

export async function submitVendorClaim(
  token: string,
  submission: VendorClaimSubmission,
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
    details: value.details,
    faqs: value.faqs,
    photo_urls: value.photoUrls,
  });
  if (error) return { error: "Couldn't save your changes -- please try again." };

  const adminEmail = process.env.ADMIN_EMAIL?.split(",")[0]?.trim();
  if (adminEmail && process.env.RESEND_API_KEY) {
    try {
      const isNew = vendor.source === "self-listed";
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: adminEmail,
        replyTo: value.submitter.email,
        subject: isNew ? `New vendor listing: ${value.details.name}` : `${value.details.name} updated its listing`,
        text: `${value.submitter.name} (${value.submitter.email}) submitted ${isNew ? "a new listing" : "changes"} for ${value.details.name}.\n\nReview them at https://admin.youdoido.com/admin/vendors/claims`,
      });
    } catch {
      // It's in the queue either way.
    }
  }
  return {};
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
