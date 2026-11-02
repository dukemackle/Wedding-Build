/**
 * How many photos can take turns behind the dashboard. The backdrop only
 * loads the photo showing and the one after it, so a full set costs nothing
 * extra on page load.
 */
export const MAX_DASHBOARD_PHOTOS = 25;

/** Focus point per photo URL, as [x, y] percentages. */
export type PhotoFocus = Record<string, [number, number]>;

/**
 * The CSS position that keeps a photo's focus point in view when it's
 * cropped (object-position), and that its slow zoom grows from
 * (transform-origin). Centre when none has been set.
 */
export function focusPosition(focus: PhotoFocus | null | undefined, url: string): string {
  const point = focus?.[url];
  return point ? `${point[0]}% ${point[1]}%` : "50% 50%";
}

/**
 * What plays behind the dashboard: the couple's own photos, their venue's
 * (booked, else the most recently shortlisted), or the inspiration set.
 * Null on the wedding means "the best one we have", in that order.
 */
export type PhotoSource = "own" | "venue" | "inspiration";

export const PHOTO_SOURCES: readonly PhotoSource[] = ["own", "venue", "inspiration"];

/**
 * The inspiration set: the landing page's own photos, served from /public
 * (free under the Unsplash licence, credited on screen anyway). Fixed for
 * now; mostly tables and details rather than faces, as stock photos of
 * people aren't model-released.
 */
export const INSPIRATION_PHOTOS: readonly { src: string; by: string }[] = [
  { src: "/landing/hero-lawn-lights-2000.webp", by: "Josh Withers" },
  { src: "/landing/hero-roses-blue-2000.webp", by: "Sheila C" },
  { src: "/landing/closing-waterfront-2000.webp", by: "Fotógrafo Samuel Cruz" },
  { src: "/landing/hero-long-table-2000.webp", by: "Jonathan Borba" },
  { src: "/landing/closing-sparklers-2000.webp", by: "Christian Bowen" },
  { src: "/landing/hero-yellow-blue-2000.webp", by: "Bruno Ngarukiye" },
  { src: "/landing/closing-toast-2000.webp", by: "Al Elmes" },
  { src: "/landing/hero-couple-2000.webp", by: "Jacob Diehl" },
];

/** A smaller copy of an inspiration photo, for thumbnails. */
export function inspirationThumb(src: string) {
  return src.replace(/-2000\.webp$/, "-1000.webp");
}

/** Who to credit on screen for a photo, or null when it's the couple's or the venue's. */
export function photoCredit(src: string): string | null {
  return INSPIRATION_PHOTOS.find((p) => p.src === src)?.by ?? null;
}

/**
 * The source that actually plays: the couple's choice when it has photos,
 * else the first of own, venue, inspiration that does. Inspiration always
 * has some, so there's always a backdrop.
 */
export function resolvePhotoSource(
  chosen: PhotoSource | null | undefined,
  sets: Record<PhotoSource, readonly string[]>,
): PhotoSource {
  if (chosen && sets[chosen].length > 0) return chosen;
  return PHOTO_SOURCES.find((s) => sets[s].length > 0) ?? "inspiration";
}
