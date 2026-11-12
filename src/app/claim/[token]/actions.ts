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
  CLAIM_FIELD_LABELS,
  validateClaim,
  type ClaimSubmission,
} from "@/lib/venue-claim";
import { trackEvent } from "@/lib/events";
import { claimNotification } from "@/lib/claim-notify";
import { cleanFirstTouch, cleanHeardFrom, cleanVia } from "@/lib/attribution";
import { deleteClaimDraft, storeClaimDraft } from "@/lib/claim-drafts";
import { storeClaimPhoto } from "@/lib/claim-photos";

/**
 * Everything on the claim page runs through the service role, because the
 * visitor has no account -- the token in the URL is the only credential. So
 * every action starts by resolving that token to its venue, and nothing is
 * read or written for any other venue.
 */

const BUCKET = "venue-photos";

/**
 * Adds one photo, sent by the browser after it has shrunk it. Uploaded here
 * rather than straight from the browser, so the file's real type is checked
 * before it lands in a public bucket.
 */
export async function uploadClaimPhoto(token: string, formData: FormData): Promise<{ error?: string; url?: string }> {
  const venue = await venueForClaimToken(token);
  if (!venue) return { error: "This link is no longer valid." };
  const stored = await storeClaimPhoto(BUCKET, venue.id, formData.get("photo"));
  return "error" in stored ? { error: stored.error } : { url: stored.url };
}

export async function submitVenueClaim(
  token: string,
  submission: ClaimSubmission,
  /** How they found us (src/lib/attribution.ts); every part optional and checked here. */
  source?: { heardFrom?: unknown; via?: unknown; firstTouch?: unknown },
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
    heard_from: cleanHeardFrom(source?.heardFrom),
    arrived_via: cleanVia(source?.via),
    first_touch: cleanFirstTouch(source?.firstTouch),
    details: value.details,
    faqs: value.faqs,
    preferred_vendors: value.preferredVendors,
    spaces: value.spaces,
    photo_urls: value.photoUrls,
    photo_marketing_ok: value.photoUse?.marketing === true,
    photo_credit: value.photoUse?.credit ?? null,
  });
  if (error) return { error: "Couldn't save your changes -- please try again." };
  trackEvent("listing_claim_submitted", { listing: { kind: "venue", id: venue.id } });
  // Sent, so the half-finished copy has done its job.
  await deleteClaimDraft("venue", venue.id);

  // Best effort: the review queue is the record, the email is only a nudge.
  const adminEmail = process.env.ADMIN_EMAIL?.split(",")[0]?.trim();
  if (adminEmail && process.env.RESEND_API_KEY) {
    try {
      const { subject, text } = await claimNotification("venue", venue, value, CLAIM_FIELD_LABELS);
      await getResendClient().emails.send({
        from: INQUIRY_FROM_ADDRESS,
        to: adminEmail,
        replyTo: value.submitter.email,
        subject,
        text,
      });
    } catch {
      // Nothing to do -- it's in the queue either way.
    }
  }

  return {};
}

/** Keeps the unsent form on our side as they type, so another device or a new link picks it up. */
export async function saveVenueClaimDraft(token: string, draft: unknown): Promise<{ error?: string }> {
  const venue = await venueForClaimToken(token);
  if (!venue) return { error: "This link is no longer valid." };
  return storeClaimDraft("venue", venue.id, draft);
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
