import type { FieldSources } from "@/lib/field-sources";
import type { Vendor, Venue } from "@/lib/supabase/types";

/**
 * Venue and vendor listings as the public -- and search engines -- see them.
 *
 * A logged-out visitor can browse and open every active listing; saving,
 * booking and contacting still need an account. Supabase only lets the anon
 * role read the columns below (migration 0091), so a logged-out query has to
 * name them: `select("*")` would be refused. Contact email and phone are left
 * out on purpose -- inquiries go through the product.
 */

/**
 * The fields the /venues and /vendors browse screens use: the cards, the
 * filters and the map pins. Everything else loads when a listing is opened.
 * The full rows came to ~9 MB of venues and ~13 MB of vendors, sent on every
 * visit, which is what made those pages slow to appear. Signed-in pages add
 * `contact_email` (not readable by anon), so the quote form knows whether to
 * ask for an address.
 */
export const VENUE_LIST_COLUMNS =
  "id, slug, name, state, city, latitude, longitude, venue_type, setting, capacity, price_tier, price_from, price_basis, image_url, is_sample, source";
export type VenueListing = Pick<
  Venue,
  "id" | "slug" | "name" | "state" | "city" | "latitude" | "longitude" | "venue_type" | "setting" | "capacity" | "price_tier" | "price_from" | "price_basis" | "image_url" | "is_sample" | "source"
> & { contact_email?: string | null };

export const VENDOR_LIST_COLUMNS =
  "id, slug, name, category, state, city, latitude, longitude, price_tier, image_url, is_sample, source";
export type VendorListing = Pick<
  Vendor,
  "id" | "slug" | "name" | "category" | "state" | "city" | "latitude" | "longitude" | "price_tier" | "image_url" | "is_sample" | "source"
> & { contact_email?: string | null };

/** Where the site lives. One place to change when the new domain arrives. */
export const SITE_URL = "https://youdoido.com";

export const PUBLIC_VENUE_COLUMNS =
  "id, slug, name, region, state, city, latitude, longitude, venue_type, setting, capacity, price_tier, description, about, included, good_to_know, amenities, image_url, website, photo_urls, address, price_from, price_note, service_level, vendor_policy, capacity_standing, lodging_sleeps, parking, wheelchair_accessible, pets_allowed, instagram_url, facebook_url, pinterest_url, tiktok_url, youtube_url, reviews_url, price_basis, price_options, included_items, music_until, rain_plan, alcohol_policy, founded_year, weddings_per_year, booking_lead_months, reply_time, deposit_percent, balance_due_days, cancellation_policy, active, is_sample, source, last_verified_at, field_sources, created_at";

export const PUBLIC_VENDOR_COLUMNS =
  "id, slug, name, category, region, state, city, latitude, longitude, price_tier, description, about, included, good_to_know, amenities, image_url, photo_urls, website, service_area, price_from, price_unit, price_note, instagram_url, facebook_url, pinterest_url, founded_year, weddings_per_year, booking_lead_months, reply_time, deposit_percent, balance_due_days, cancellation_policy, active, is_sample, source, last_verified_at, created_at";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A vendor we listed from its Instagram alone, with no website to check its
 * details against. Not labelled to couples (a label read as second-rate);
 * the listing page just invites the owner to add their details. A vendor that
 * lists or claims itself isn't one.
 */
/**
 * Nobody from the business has claimed or submitted it: built from public
 * information. Such a listing says so, and that the business isn't affiliated
 * with us (docs/legal-audit.md R5).
 */
export function isUnclaimedListing(v: { source: string | null; is_sample: boolean }): boolean {
  return !v.is_sample && v.source !== "claimed" && v.source !== "self-listed";
}

export function isBasicListing(v: { website: string | null; instagram_url: string | null; source: string | null }): boolean {
  return !v.website && Boolean(v.instagram_url) && v.source === "import";
}

/** A listing URL segment is either an old uuid link or a slug. */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}

type Linkable = { id: string; slug?: string | null };

export function venueHref(venue: Linkable): string {
  return `/venues/${venue.slug || venue.id}`;
}

export function vendorHref(vendor: Linkable): string {
  return `/vendors/${vendor.slug || vendor.id}`;
}

/**
 * Whether a listing is worth offering to search engines. A page with no
 * description, or one nobody has ever confirmed, is thin -- and a site full
 * of thin pages drags down its good ones. They stay visible to people and
 * become indexable on their own once filled in.
 */
export function isIndexable(listing: {
  description: string | null;
  last_verified_at: string | null;
  is_sample: boolean;
}): boolean {
  return Boolean(listing.description?.trim()) && Boolean(listing.last_verified_at) && !listing.is_sample;
}

/** "Checked against their website, September 2026", or who confirmed them. Unclaimed listings never say "verified": nobody from the business has (docs/legal-audit.md R5). */
export function verifiedLabel(
  listing: { source: string | null; last_verified_at: string | null },
  noun: "venue" | "vendor",
): string | null {
  if (!listing.last_verified_at) return null;
  const when = new Date(listing.last_verified_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return listing.source === "claimed" ? `Details confirmed by the ${noun}, ${when}` : `Checked against their website, ${when}`;
}

/** Whether the business itself confirmed this field through its claim link. */
export function confirmedByOwner(listing: { field_sources?: FieldSources }, ...keys: string[]): boolean {
  return keys.some((key) => {
    const by = listing.field_sources?.[key]?.by;
    return by === "venue" || by === "vendor";
  });
}

/** A short plain-text description for search results and link previews. */
export function metaDescription(parts: (string | null | undefined)[], body: string | null): string {
  const lead = parts.filter(Boolean).join(" · ");
  const text = [lead, body?.replace(/\s+/g, " ").trim()].filter(Boolean).join(". ");
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

/**
 * Only the public columns of a row, for handing a listing to the browser
 * where the full row (claim token, notes) mustn't go -- the claim forms'
 * preview starts from this.
 */
export function publicFields<T extends object>(row: T, columns: string): Partial<T> {
  const keys = new Set(columns.split(",").map((c) => c.trim()));
  return Object.fromEntries(Object.entries(row).filter(([k]) => keys.has(k))) as Partial<T>;
}
