import type { MarketListing } from "@/lib/supabase/types";

/**
 * The marketplace's fixed vocabularies, shared by the browse screen, the
 * listing page and the sell form. The database checks the same values
 * (0117_marketplace.sql), so a change here needs a migration too.
 */

export const MARKET_CATEGORIES = [
  { value: "decor", label: "Decor" },
  { value: "signage", label: "Signs" },
  { value: "attire", label: "Dresses & attire" },
  { value: "tableware", label: "Tableware" },
  { value: "florals", label: "Florals" },
  { value: "lighting", label: "Lighting" },
  { value: "stationery", label: "Stationery" },
  { value: "other", label: "Other" },
] as const;

export const MARKET_CONDITIONS = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
] as const;

/** Price bands for the browse filter, in cents; `max` is exclusive. */
export const MARKET_PRICE_BANDS = [
  { value: "free", label: "Free", min: 0, max: 1 },
  { value: "under25", label: "Under $25", min: 1, max: 2500 },
  { value: "25to100", label: "$25 – $100", min: 2500, max: 10001 },
  { value: "over100", label: "Over $100", min: 10001, max: Infinity },
] as const;

export const MAX_MARKET_PHOTOS = 10;

/** Shown on the sell form; a listing for any of these gets taken down. */
export const NOT_ALLOWED = [
  "Alcohol",
  "Live animals",
  "Weapons or fireworks",
  "Counterfeit designer items",
  "Anything recalled or unsafe",
  "Services (list those as a vendor instead)",
  "Gift cards or tickets",
];

export const MARKET_REPORT_REASONS = [
  { value: "scam", label: "Looks like a scam" },
  { value: "prohibited", label: "Not allowed to be sold here" },
  { value: "offensive", label: "Offensive or harassing" },
  { value: "misleading", label: "Misleading or fake listing" },
  { value: "other", label: "Something else" },
] as const;

/** First message a buyer sends, pre-filled the way Facebook does. */
export const OPENING_MESSAGE = "Hi! Is this still available?";

/** Rate limits for messaging, per sender. */
export const MAX_NEW_THREADS_PER_DAY = 20;
export const MAX_MESSAGES_PER_HOUR = 60;

/** The distance filter's choices, in miles. */
export const MARKET_DISTANCES = [10, 25, 50, 100] as const;

/** Great-circle distance in miles. */
export function milesBetween(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

const categoryLabels = new Map<string, string>(MARKET_CATEGORIES.map((c) => [c.value, c.label]));
const conditionLabels = new Map<string, string>(MARKET_CONDITIONS.map((c) => [c.value, c.label]));

export function categoryLabel(value: string) {
  return categoryLabels.get(value) ?? "Other";
}

export function conditionLabel(value: string) {
  return conditionLabels.get(value) ?? value;
}

export function formatPrice(cents: number) {
  if (cents === 0) return "Free";
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** "Listed 3 days ago", the way a marketplace dates things. */
export function listedAgo(iso: string, now = Date.now()) {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return minutes <= 1 ? "just now" : `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "an hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return days === 1 ? "yesterday" : `${days} days ago`;
  const months = Math.round(days / 30);
  return months <= 1 ? "a month ago" : `${months} months ago`;
}

/**
 * Whether a photo URL is one of this seller's uploads to our bucket. The
 * browser uploads photos itself and hands the server their URLs, so the
 * server checks every one rather than storing whatever it was sent.
 */
export function isOwnMarketPhoto(url: string, sellerId: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  return !url.includes("..") && url.startsWith(`${base}/storage/v1/object/public/market-photos/${sellerId}/`);
}

/** A stable offset of up to ~400m, from the listing's id. */
function nudge(id: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const angle = ((hash >>> 0) % 360) * (Math.PI / 180);
  const distance = 0.0015 + (((hash >>> 9) % 100) / 100) * 0.0022;
  return [Math.sin(angle) * distance, Math.cos(angle) * distance];
}

export type PinnedMarketListing = MarketListing & { latitude: number; longitude: number };

/**
 * Listings with the nudge applied, for the map and for "what's in view". A
 * listing sits on its town's centre, never the seller's address, so pins from
 * one town would land on one spot; each moves a few hundred metres, by its id
 * so it stays put between visits.
 */
export function pinListings(listings: MarketListing[]): PinnedMarketListing[] {
  return listings
    .filter((l) => l.latitude != null && l.longitude != null)
    .map((l) => {
      const [dLat, dLng] = nudge(l.id);
      return { ...l, latitude: l.latitude! + dLat, longitude: l.longitude! + dLng };
    });
}
