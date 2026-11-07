import "server-only";
import { randomUUID } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { MAX_CLAIM_PHOTO_BYTES } from "@/lib/venue-claim";

type PhotoType = "image/jpeg" | "image/png" | "image/webp";

const EXTENSIONS: Record<PhotoType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * What the file really is, from its first bytes. The browser's own label
 * (File.type) is whatever the sender says, so it never decides how a file in
 * a public bucket is served.
 */
export function sniffPhoto(bytes: Uint8Array): PhotoType | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

/**
 * Stores one claim-form photo under claims/<listing id>/ in the listing's
 * public photo bucket, with the service role. Callers have already resolved
 * the claim link to that listing. The browser shrinks the photo first (which
 * also drops a JPEG's EXIF location), so one fits in a server-action request.
 */
export async function storeClaimPhoto(
  bucket: "venue-photos" | "vendor-photos",
  listingId: string,
  photo: FormDataEntryValue | null,
): Promise<{ url: string } | { error: string }> {
  if (!(photo instanceof File) || photo.size === 0) return { error: "Choose a photo to add." };
  if (photo.size > MAX_CLAIM_PHOTO_BYTES) return { error: "Each photo needs to be under 5MB." };

  const bytes = new Uint8Array(await photo.arrayBuffer());
  const type = sniffPhoto(bytes);
  if (!type) return { error: "Photos need to be JPEG, PNG or WebP." };

  const path = `claims/${listingId}/${randomUUID()}.${EXTENSIONS[type]}`;
  const storage = createAdminSupabaseClient().storage.from(bucket);
  const { error } = await storage.upload(path, bytes, { contentType: type });
  if (error) return { error: "Couldn't upload that photo -- please try again." };
  return { url: storage.getPublicUrl(path).data.publicUrl };
}
