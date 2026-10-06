"use server";

import { randomUUID } from "crypto";
import { importPrefix, MAX_IMPORT_BYTES, readForListing, type ListingRead } from "@/lib/ai/listing-reader";
import { writeListingCopy, type WriteField } from "@/lib/ai/listing-writer";
import { VENUE_READ_FIELDS } from "@/lib/ai/listing-read-fields";
import { PREFERRED_VENDOR_CATEGORIES } from "@/lib/wedding-options";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import { venueForClaimToken } from "@/lib/venue-claim-server";
import {
  CLAIM_PHOTO_TYPES,
  MAX_CLAIM_PHOTO_BYTES,
  MAX_CLAIM_PHOTOS,
  validateClaim,
  type ClaimSubmission,
} from "@/lib/venue-claim";

/**
 * Everything on the claim page runs through the service role, because the
 * visitor has no account -- the token in the URL is the only credential. So
 * every action starts by resolving that token to its venue, and nothing is
 * read or written for any other venue.
 */

const BUCKET = "venue-photos";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Hands out one signed upload URL per photo. The browser uploads straight to
 * storage with them -- ten phone photos are far past what a server action can
 * carry in one request body.
 */
export async function createClaimPhotoUploads(
  token: string,
  files: { type: string; size: number }[],
): Promise<{ error?: string; uploads?: { path: string; token: string; publicUrl: string }[] }> {
  const venue = await venueForClaimToken(token);
  if (!venue) return { error: "This link is no longer valid." };

  // Per request, not per listing: gallery and space photos are uploaded
  // separately, and the submission itself caps how many are kept.
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
    const path = `claims/${venue.id}/${randomUUID()}.${EXTENSIONS[file.type]}`;
    const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) return { error: "Couldn't start the upload -- please try again." };
    uploads.push({
      path,
      token: data.token,
      publicUrl: admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
    });
  }
  return { uploads };
}

export async function submitVenueClaim(
  token: string,
  submission: ClaimSubmission,
): Promise<{ error?: string; errors?: string[] }> {
  const venue = await venueForClaimToken(token);
  if (!venue) return { error: "This link is no longer valid." };

  const { value, errors } = validateClaim(submission);

  // A photo is either one the listing already has, or one uploaded through
  // this venue's own link. Anything else would let a submission point the
  // listing at an arbitrary image on the internet.
  const admin = createAdminSupabaseClient();
  const ownPrefix = admin.storage.from(BUCKET).getPublicUrl(`claims/${venue.id}/`).data.publicUrl;
  const { data: liveSpaces } = await admin
    .from("venue_spaces")
    .select("photo_url")
    .eq("venue_id", venue.id)
    .returns<{ photo_url: string | null }[]>();
  const existing = new Set(
    [...(venue.photo_urls ?? []), venue.image_url, ...(liveSpaces ?? []).map((sp) => sp.photo_url)].filter(Boolean),
  );
  const submittedPhotos = [
    ...value.photoUrls,
    ...value.spaces.map((sp) => sp.photo_url).filter((u): u is string => Boolean(u)),
  ];
  if (submittedPhotos.some((url) => !url.startsWith(ownPrefix) && !existing.has(url))) {
    errors.push("One of the photos didn't upload properly -- remove it and add it again.");
  }

  if (errors.length > 0) return { errors };

  // One submission waiting per venue: a resubmission replaces the earlier
  // one rather than stacking up for review.
  await admin.from("venue_submissions").delete().eq("venue_id", venue.id).eq("status", "pending");
  const { error } = await admin.from("venue_submissions").insert({
    venue_id: venue.id,
    submitter_name: value.submitter.name,
    submitter_email: value.submitter.email,
    submitter_role: value.submitter.role,
    details: value.details,
    faqs: value.faqs,
    preferred_vendors: value.preferredVendors,
    spaces: value.spaces,
    photo_urls: value.photoUrls,
  });
  if (error) return { error: "Couldn't save your changes -- please try again." };

  // Best effort: the review queue is the record, the email is only a nudge.
  const adminEmail = process.env.ADMIN_EMAIL?.split(",")[0]?.trim();
  if (adminEmail && process.env.RESEND_API_KEY) {
    try {
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: adminEmail,
        replyTo: value.submitter.email,
        subject: `${value.details.name} updated its listing`,
        text: `${value.submitter.name} (${value.submitter.email}) submitted changes for ${value.details.name}.\n\nReview them at https://admin.youdoido.com/admin/venues/claims`,
      });
    } catch {
      // Nothing to do -- it's in the queue either way.
    }
  }

  return {};
}

/** A signed upload URL for a pricing guide or brochure PDF, for "Fill this in for me". */
export async function createImportUpload(
  token: string,
  file: { type: string; size: number },
): Promise<{ error?: string; upload?: { path: string; token: string } }> {
  const venue = await venueForClaimToken(token);
  if (!venue) return { error: "This link is no longer valid." };
  if (file.type !== "application/pdf") return { error: "Upload a PDF -- or use your website instead." };
  if (file.size > MAX_IMPORT_BYTES) return { error: "That PDF is over 20MB. Try a smaller copy, or use your website." };
  const path = `${importPrefix(venue.id)}${randomUUID()}.pdf`;
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
  const venue = await venueForClaimToken(token);
  if (!venue) return { error: "This link is no longer valid." };
  return readForListing({
    kind: "venue",
    listingId: venue.id,
    bucket: BUCKET,
    fields: VENUE_READ_FIELDS,
    questions,
    vendorCategories: PREFERRED_VENDOR_CATEGORIES,
    source,
  });
}

/** "Help me write this" on the one-liner and About. Returns a draft; the form puts it in the box. */
export async function writeListingText(
  token: string,
  field: WriteField,
  facts: Record<string, string | number | null>,
  notes: string,
): Promise<{ error?: string; text?: string }> {
  const venue = await venueForClaimToken(token);
  if (!venue) return { error: "This link is no longer valid." };
  if (field !== "description" && field !== "about") return { error: "Couldn't write that." };
  return writeListingCopy({ listingId: venue.id, field, facts, notes: String(notes ?? "") });
}
