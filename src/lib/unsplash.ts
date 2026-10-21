import "server-only";
import type { PhotoCredit } from "./photo-credit";

/**
 * Unsplash, the free photo library behind "Find a free photo" in the guest
 * site's banner panel (decided 2026-10-21, after Pexels paused new keys).
 *
 * Unsplash's API rules shape this file: the key never leaves the server, the
 * photos are shown from Unsplash's own image servers (never copied into our
 * storage), using one is reported to Unsplash's download endpoint, and every
 * photo shown carries its photographer's name and links back with our UTM
 * tags (creditLinks in photo-credit.ts). Without UNSPLASH_ACCESS_KEY the
 * feature simply doesn't appear, as with the Google Drive picker.
 */

const API = "https://api.unsplash.com";

export type LibraryPhoto = {
  id: string;
  /** A small version for the picker's grid. */
  thumb: string;
  alt: string;
  width: number;
  height: number;
  credit: PhotoCredit;
};

type ApiPhoto = {
  id: string;
  width: number;
  height: number;
  alt_description: string | null;
  description: string | null;
  urls: { raw: string; small: string };
  links: { download_location: string };
  user: { name: string; username: string };
};

function accessKey() {
  return process.env.UNSPLASH_ACCESS_KEY || null;
}

export function photoLibraryEnabled() {
  return accessKey() !== null;
}

async function call<T>(path: string): Promise<T | null> {
  const key = accessKey();
  if (!key) return null;
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

function toLibraryPhoto(p: ApiPhoto): LibraryPhoto {
  return {
    id: p.id,
    thumb: p.urls.small,
    alt: p.alt_description ?? p.description ?? "",
    width: p.width,
    height: p.height,
    credit: { source: "unsplash", name: p.user.name, username: p.user.username },
  };
}

/** Landscape photos for a banner, safe-search on. Null when the library is off or Unsplash fails. */
export async function searchPhotos(query: string, page = 1) {
  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: "18",
    orientation: "landscape",
    content_filter: "high",
  });
  const data = await call<{ total_pages: number; results: ApiPhoto[] }>(`/search/photos?${params}`);
  if (!data) return null;
  return { photos: data.results.map(toLibraryPhoto), totalPages: data.total_pages };
}

/**
 * One photo, looked up again on the server so a banner's address and credit
 * always come from Unsplash, never from what the browser sent. Reports the
 * use to Unsplash, as their terms ask. The address is Unsplash's own,
 * sized for a banner.
 */
export async function claimPhoto(id: string) {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return null;
  const photo = await call<ApiPhoto>(`/photos/${id}`);
  if (!photo) return null;
  const download = new URL(photo.links.download_location);
  if (download.origin === API) await call(`${download.pathname}${download.search}`);
  const url = new URL(photo.urls.raw);
  url.searchParams.set("w", "2400");
  url.searchParams.set("q", "80");
  url.searchParams.set("fm", "jpg");
  url.searchParams.set("fit", "max");
  return { url: url.toString(), credit: toLibraryPhoto(photo).credit };
}
