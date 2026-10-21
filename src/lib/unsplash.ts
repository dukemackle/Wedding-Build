import "server-only";

/**
 * Photo search for the guest site's banner and gallery, through the Unsplash
 * API. Off until UNSPLASH_ACCESS_KEY is set; the search button doesn't show.
 *
 * The API's terms shape this file: photos are hotlinked from the URLs it
 * returns (never re-uploaded), every chosen photo is reported to its download
 * endpoint, and the photographer and Unsplash are credited with links back,
 * tagged with our app name. See https://unsplash.com/documentation.
 */

const API = "https://api.unsplash.com";
const APP = "youdoido";

export function unsplashConfigured(): boolean {
  return Boolean(process.env.UNSPLASH_ACCESS_KEY?.trim());
}

type ApiPhoto = {
  id: string;
  width: number;
  height: number;
  alt_description: string | null;
  urls: { raw: string; regular: string; small: string };
  links: { download_location: string };
  user: { name: string; links: { html: string } };
};

export type StockPhoto = {
  id: string;
  thumb: string;
  alt: string;
  photographer: string;
  profileUrl: string;
};

async function call<T>(path: string): Promise<T | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) return null;
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
    cache: "no-store",
  }).catch(() => null);
  if (!res?.ok) return null;
  return (await res.json()) as T;
}

/** The credit links Unsplash asks for: the photographer's page and theirs, tagged with ours. */
export function withReferral(url: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}utm_source=${APP}&utm_medium=referral`;
}
export const UNSPLASH_HOME = withReferral("https://unsplash.com/");

function summary(p: ApiPhoto): StockPhoto {
  return {
    id: p.id,
    thumb: p.urls.small,
    alt: p.alt_description ?? "",
    photographer: p.user.name,
    profileUrl: withReferral(p.user.links.html),
  };
}

/** One page of results, with Unsplash's strictest safe-search filter. */
export async function searchUnsplash(query: string, page: number): Promise<{ photos: StockPhoto[]; more: boolean } | null> {
  const params = new URLSearchParams({ query, page: String(page), per_page: "24", content_filter: "high" });
  const data = await call<{ total_pages: number; results: ApiPhoto[] }>(`/search/photos?${params}`);
  if (!data) return null;
  return { photos: data.results.map(summary), more: page < data.total_pages };
}

/**
 * The photo to save, looked up again by id so the URL and credit come from
 * Unsplash rather than from the browser, and reported as a download.
 */
export async function chooseUnsplash(
  id: string,
  width: number,
): Promise<{ url: string; photographer: string; profileUrl: string } | null> {
  if (!/^[A-Za-z0-9_-]{1,32}$/.test(id)) return null;
  const photo = await call<ApiPhoto>(`/photos/${id}`);
  if (!photo || !photo.urls.raw.startsWith("https://images.unsplash.com/")) return null;
  const download = new URL(photo.links.download_location);
  await call(download.pathname + download.search);
  return {
    url: `${photo.urls.raw}&auto=format&fit=crop&w=${width}&q=80`,
    photographer: photo.user.name,
    profileUrl: withReferral(photo.user.links.html),
  };
}
