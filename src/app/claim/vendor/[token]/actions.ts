"use server";

import { randomUUID } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { vendorForClaimToken } from "@/lib/vendor-claim-server";
import { CLAIM_PHOTO_TYPES, MAX_CLAIM_PHOTO_BYTES } from "@/lib/venue-claim";
import { validateVendorClaim, type VendorClaimSubmission } from "@/lib/vendor-claim";

/**
 * The vendor claim page's actions. As on the venue claim page, the token in
 * the URL is the only credential, so everything starts by resolving it and
 * touches nothing but that vendor.
 */

const BUCKET = "vendor-photos";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** A signed upload URL for the listing photo; the browser uploads straight to storage. */
export async function createVendorPhotoUpload(
  token: string,
  file: { type: string; size: number },
): Promise<{ error?: string; upload?: { path: string; token: string; publicUrl: string } }> {
  const vendor = await vendorForClaimToken(token);
  if (!vendor) return { error: "This link is no longer valid." };
  if (!(CLAIM_PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return { error: "Photos need to be JPEG, PNG or WebP." };
  }
  if (file.size > MAX_CLAIM_PHOTO_BYTES) return { error: "The photo needs to be under 10MB." };

  const admin = createAdminSupabaseClient();
  const path = `claims/${vendor.id}/${randomUUID()}.${EXTENSIONS[file.type]}`;
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: "Couldn't start the upload -- please try again." };
  return {
    upload: { path, token: data.token, publicUrl: admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl },
  };
}

export async function submitVendorClaim(
  token: string,
  submission: VendorClaimSubmission,
): Promise<{ error?: string; errors?: string[] }> {
  const vendor = await vendorForClaimToken(token);
  if (!vendor) return { error: "This link is no longer valid." };

  const { value, errors } = validateVendorClaim(submission);

  // The photo is either the one the listing already has, or one uploaded
  // through this vendor's own link -- never an arbitrary image URL.
  const admin = createAdminSupabaseClient();
  const ownPrefix = admin.storage.from(BUCKET).getPublicUrl(`claims/${vendor.id}/`).data.publicUrl;
  if (value.photoUrl && value.photoUrl !== vendor.image_url && !value.photoUrl.startsWith(ownPrefix)) {
    errors.push("The photo didn't upload properly -- remove it and add it again.");
  }
  if (errors.length > 0) return { errors };

  // One submission waiting per vendor: a resubmission replaces the earlier one.
  await admin.from("vendor_submissions").delete().eq("vendor_id", vendor.id).eq("status", "pending");
  const { error } = await admin.from("vendor_submissions").insert({
    vendor_id: vendor.id,
    submitter_name: value.submitter.name,
    submitter_email: value.submitter.email,
    submitter_role: value.submitter.role,
    details: value.details,
    photo_url: value.photoUrl,
  });
  if (error) return { error: "Couldn't save your changes -- please try again." };

  // Best effort: the review queue is the record, the email is only a nudge.
  const adminEmail = process.env.ADMIN_EMAIL?.split(",")[0]?.trim();
  if (adminEmail && process.env.RESEND_API_KEY) {
    try {
      const isNew = vendor.source === "self-listed";
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: adminEmail,
        replyTo: value.submitter.email,
        subject: isNew ? `New vendor listing: ${value.details.name}` : `${value.details.name} updated its listing`,
        text: `${value.submitter.name} (${value.submitter.email}) sent ${isNew ? "a new listing" : "changes"} for ${value.details.name}.\n\nReview at https://admin.wrenwed.com/admin/vendors/claims`,
      });
    } catch {
      // It's in the queue either way.
    }
  }

  return {};
}
