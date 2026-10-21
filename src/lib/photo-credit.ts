/** Who took a free-library photo (src/lib/unsplash.ts), saved beside the banner so the site can credit them. */
export type PhotoCredit = { source: "unsplash"; name: string; username: string };

const UTM = "utm_source=you_do_i_do&utm_medium=referral";

export const UNSPLASH_HOME = `https://unsplash.com/?${UTM}`;

/** Where a credit links: the photographer's page and Unsplash, both tagged as from us, as Unsplash asks. */
export function creditLinks(credit: PhotoCredit) {
  return {
    photographer: `https://unsplash.com/@${encodeURIComponent(credit.username)}?${UTM}`,
    library: UNSPLASH_HOME,
  };
}

/** A stored credit, or null for anything that isn't one (the column is free-form jsonb). */
export function parseCredit(value: unknown): PhotoCredit | null {
  if (!value || typeof value !== "object") return null;
  const { source, name, username } = value as Record<string, unknown>;
  if (source !== "unsplash" || typeof name !== "string" || typeof username !== "string") return null;
  return { source, name, username };
}

/**
 * A photo served from the library's own image servers. Unsplash requires
 * those addresses be used as they are, so the site shows them without
 * Next's image resizing (which would fetch and re-serve them from ours).
 */
export function isLibraryPhoto(url: string | null | undefined) {
  return Boolean(url?.startsWith("https://images.unsplash.com/"));
}
