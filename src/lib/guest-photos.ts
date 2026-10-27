import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export const GUEST_PHOTOS_BUCKET = "guest-photos";

/**
 * The storage path inside a guest-photos public URL (`<wedding_id>/<uuid>.<ext>`),
 * or null for anything else -- a photo from another bucket, or another
 * wedding's, is never ours to remove.
 */
export function guestPhotoPath(url: string | null | undefined, weddingId: string): string | null {
  if (!url) return null;
  const marker = `/${GUEST_PHOTOS_BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return null;
  const path = decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
  return path.startsWith(`${weddingId}/`) && !path.includes("..") ? path : null;
}

/**
 * Deletes guest photos whose row is gone, so a post the couple deleted or an
 * RSVP they dismissed doesn't stay reachable at its URL. Best effort: the row
 * is already removed, so a storage hiccup never fails the couple's action.
 * Callers check first that the request may edit this wedding.
 */
export async function removeGuestPhotos(
  weddingId: string,
  urls: (string | null | undefined)[],
): Promise<void> {
  const paths = urls.map((url) => guestPhotoPath(url, weddingId)).filter((path): path is string => !!path);
  if (paths.length === 0) return;
  try {
    await createAdminSupabaseClient().storage.from(GUEST_PHOTOS_BUCKET).remove(paths);
  } catch {
    // An orphaned file is better than a failed delete.
  }
}
