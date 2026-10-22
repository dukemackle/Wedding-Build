import type { AttireItem } from "@/lib/supabase/types";
import { ATTIRE_CATEGORIES } from "@/lib/wedding-options";

/**
 * How each attire category is presented: its shelf name, the line art that
 * stands in until real photos exist, and what its style tabs are called
 * (gowns have silhouettes, suits have cuts, rings have settings).
 */
export const ATTIRE_CATEGORY_META: Record<
  (typeof ATTIRE_CATEGORIES)[number],
  { label: string; art: string; styleLabel: string }
> = {
  "Wedding Dress": { label: "Wedding Dresses", art: "/attire-types/wedding-dress.svg", styleLabel: "gowns" },
  "Bridesmaid Dress": { label: "Bridesmaids", art: "/attire-types/bridesmaid-dress.svg", styleLabel: "dresses" },
  "Groom Attire": { label: "Suits & Tuxedos", art: "/attire-types/groom-attire.svg", styleLabel: "suits" },
  "Groomsmen Attire": { label: "Groomsmen", art: "/attire-types/groomsmen-attire.svg", styleLabel: "looks" },
  "Ring - Her": { label: "Her Ring", art: "/attire-types/ring-her.svg", styleLabel: "rings" },
  "Ring - Him": { label: "His Ring", art: "/attire-types/ring-him.svg", styleLabel: "rings" },
};

export function categoryArt(category: string) {
  return (
    ATTIRE_CATEGORY_META[category as keyof typeof ATTIRE_CATEGORY_META]?.art ??
    "/attire-types/wedding-dress.svg"
  );
}

/**
 * Swatch colours for the names used in `colors`. Anything not listed still
 * filters fine; it just gets a neutral dot.
 */
export const COLOR_SWATCHES: Record<string, string> = {
  White: "#ffffff",
  Ivory: "#f6efdc",
  Champagne: "#ead7bf",
  Blush: "#ebc8c4",
  Nude: "#dcbfa6",
  Sage: "#b5c2a5",
  "Dusty Blue": "#a9bccb",
  Navy: "#1f2b45",
  Black: "#1b1b1b",
  Charcoal: "#44474b",
  Grey: "#9a9ea3",
  Tan: "#c4a57c",
  Brown: "#6b4a33",
  Green: "#2f5a45",
  Burgundy: "#6d1f2b",
  Terracotta: "#c0694a",
  Lilac: "#c6b3d6",
  Gold: "#c9a24a",
  "Yellow Gold": "#d6b25a",
  "Rose Gold": "#d6a18e",
  "White Gold": "#e3e3de",
  Platinum: "#d9dadb",
  Silver: "#c0c2c4",
};

export function swatch(color: string) {
  return COLOR_SWATCHES[color] ?? "#d8d4cc";
}

export const PARTY_ROLES = [
  "Maid of honor",
  "Matron of honor",
  "Bridesmaid",
  "Best man",
  "Groomsman",
  "Flower girl",
  "Ring bearer",
  "Parent",
  "Other",
] as const;

export const PARTY_STATUSES = ["To order", "Ordered", "Arrived", "Fitted"] as const;

export function formatPrice(price: number | null | undefined) {
  if (price == null) return null;
  return `$${Math.round(Number(price)).toLocaleString()}`;
}

/** The lowest price a couple could pay, for sorting and the price filter. */
export function lowestPrice(item: Pick<AttireItem, "buy_price" | "rent_price" | "price_from">) {
  const prices = [item.buy_price, item.rent_price].filter((p): p is number => p != null);
  if (prices.length === 0) return item.price_from ?? null;
  return Math.min(...prices.map(Number));
}

export function canBuy(item: AttireItem) {
  return item.buy_price != null || item.buy_or_rent === "Buy" || item.buy_or_rent === "Buy or Rent";
}

export function canRent(item: AttireItem) {
  return item.rent_price != null || item.buy_or_rent === "Rent" || item.buy_or_rent === "Buy or Rent";
}

/** Only http(s) links are ever rendered as hrefs. */
export function safeUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Where "Shop" goes: the affiliate link if there is one, else the plain retailer link. */
export function outboundUrl(item: { affiliate_url?: string | null; retailer_url?: string | null }) {
  return safeUrl(item.affiliate_url) ?? safeUrl(item.retailer_url);
}

/**
 * The "Shop" href. It goes through /go/attire/<id>, which counts the click
 * and redirects to outboundUrl. Null when the item has nowhere to send you.
 */
export function shopHref(
  item: { id: string; affiliate_url?: string | null; retailer_url?: string | null },
  source: "attire" | "party" = "attire",
) {
  if (!outboundUrl(item)) return null;
  return `/go/attire/${item.id}${source === "party" ? "?from=party" : ""}`;
}

/**
 * FTC: a clear disclosure next to the links, not just in the Terms. Shown
 * only where an affiliate link actually is.
 */
export const AFFILIATE_DISCLOSURE =
  "Some links here are affiliate links. If you buy through them, You Do, I Do may earn a commission, at no extra cost to you.";

/** Stored prices are never presented as live: say when it was last checked. */
export function priceNote(checkedAt: string | null | undefined) {
  if (!checkedAt) return "Approximate price. The retailer's price is final.";
  const date = new Date(`${checkedAt}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `Price checked ${date}. The retailer's price is final.`;
}
