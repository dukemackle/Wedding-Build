import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { estimateWeddingCost } from "@/lib/estimator";
import { loadMetroListings, median, metroForPoint, metroHref, anchorSlug } from "@/lib/metros";
import { currentVenueType } from "@/lib/wedding-options";
import type { PriceBasis } from "@/lib/supabase/types";

/**
 * "Compared with the Austin area" on a listing: where this venue or vendor
 * sits among its neighbours, from listings we hold and the estimator's own
 * model. Every number is computed, never written, so two listings in the same
 * city say different things (Google's scaled-content policy penalises filler,
 * and Search Console showed 14,824 listings known, 11 indexed: 2026-11-08).
 *
 * The area is the listing's metro hub when it's in one, else its state. A
 * comparison needs enough listings to mean something; below MIN_PEERS it's
 * left out rather than shown as "bigger than 2 of 3".
 */

const MIN_PEERS = 8;
/** The guest count the estimator figure is given for. */
export const ESTIMATE_GUESTS = 100;

/** Vendor category → the estimator's budget line. */
const VENDOR_BUDGET_LINE: Record<string, string> = {
  Photography: "photography",
  Videography: "videography",
  Florals: "florals",
  Music: "music",
  Catering: "catering",
  Cake: "cake",
  "Hair & Makeup": "hair_makeup",
  Planning: "planner",
  Officiant: "officiant",
  "Bridal & Formalwear": "attire",
};

const VENDOR_NOUN: Record<string, string> = {
  Photography: "photographers",
  Videography: "videographers",
  Florals: "florists",
  Music: "bands and DJs",
  Catering: "caterers",
  Cake: "cake bakers",
  "Hair & Makeup": "hair and makeup artists",
  Planning: "planners",
  Officiant: "officiants",
  Rentals: "rental companies",
  "Bridal & Formalwear": "bridal shops",
  "Photo Booth": "photo booth companies",
};

export type AreaComparison = {
  /** "Austin area" or "Texas". */
  area: string;
  /** The hub to browse them all, when the listing is in a metro. */
  href: string | null;
  /** How many of the same kind are listed in the area, this one included. */
  peers: number;
  /** "barn & ranch venues", "photographers"... for "one of 41 …". */
  peerNoun: string;
  capacity: { value: number; median: number; largerThan: number; min: number; max: number } | null;
  price: { value: number; median: number; count: number; above: number; min: number; max: number } | null;
  /** The estimator's Simple–Luxury range for this line, ESTIMATE_GUESTS guests, in this state. */
  estimate: { label: string; low: number; high: number; state: string } | null;
};

type Point = { id: string; latitude: number | null; longitude: number | null; state: string | null; region?: string | null };

async function peersOf<T extends Point>(
  supabase: SupabaseClient,
  table: "venues" | "vendors",
  listing: Point,
  columns: string,
  match: Record<string, string>,
): Promise<{ rows: T[]; area: string; href: string | null } | null> {
  const metro = metroForPoint(listing.latitude, listing.longitude);
  if (metro) {
    const rows = await loadMetroListings<T & Record<string, unknown>>(supabase, table, metro, columns);
    return {
      rows: rows.filter((r) => Object.entries(match).every(([k, v]) => r[k] === v)),
      area: `${metro.name} area`,
      href: metroHref(table, metro),
    };
  }
  if (!listing.state) return null;
  const rows = await fetchAll<T>((from, to) => {
    let query = supabase.from(table).select(columns).eq("active", true).eq("is_sample", false).eq("state", listing.state as string);
    for (const [k, v] of Object.entries(match)) query = query.eq(k, v);
    return query.order("id").range(from, to).returns<T[]>();
  });
  return { rows, area: listing.state, href: null };
}

function estimateLine(state: string | null, region: string | null | undefined, key: string, label: string) {
  if (!state) return null;
  const at = (tier: string) =>
    estimateWeddingCost([], state, ESTIMATE_GUESTS, tier, { region }).breakdown.find((b) => b.key === key)?.amount ?? 0;
  // To the nearest $100: it's a model's estimate, and $7,360 reads as a quote.
  const low = Math.round(at("Simple") / 100) * 100;
  const high = Math.round(at("Luxury") / 100) * 100;
  return low > 0 && high > 0 ? { label, low, high, state } : null;
}

function priceStats(value: number, prices: number[]) {
  return {
    value,
    median: median(prices) as number,
    count: prices.length,
    above: Math.round((100 * prices.filter((p) => p < value).length) / prices.length),
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/** Rental and package prices are whole-event figures, so comparable; per-person and minimums aren't. */
const COMPARABLE: (PriceBasis | null)[] = ["rental", "package"];

export async function venueAreaComparison(
  supabase: SupabaseClient,
  venue: Point & { capacity: number | null; price_from: number | null; price_basis: PriceBasis | null; venue_type: string | null },
): Promise<AreaComparison | null> {
  type Row = Point & { capacity: number | null; price_from: number | null; price_basis: PriceBasis | null; venue_type: string | null };
  const found = await peersOf<Row>(supabase, "venues", venue, "id, latitude, longitude, state, capacity, price_from, price_basis, venue_type", {});
  if (!found || found.rows.length < MIN_PEERS) return null;
  const { rows, area, href } = found;

  const style = currentVenueType(venue.venue_type) ?? venue.venue_type;
  const sameStyle = style ? rows.filter((r) => (currentVenueType(r.venue_type) ?? r.venue_type) === style).length : 0;

  const capacities = rows.map((r) => r.capacity).filter((c): c is number => c != null && c > 0);
  const capacity =
    venue.capacity && capacities.length >= MIN_PEERS
      ? {
          value: venue.capacity,
          median: median(capacities) as number,
          largerThan: Math.round((100 * capacities.filter((c) => c < (venue.capacity as number)).length) / capacities.length),
          min: Math.min(...capacities),
          max: Math.max(...capacities),
        }
      : null;

  const prices = rows.filter((r) => r.price_from != null && COMPARABLE.includes(r.price_basis)).map((r) => r.price_from as number);
  const price =
    venue.price_from != null && COMPARABLE.includes(venue.price_basis) && prices.length >= 5
      ? priceStats(venue.price_from, prices)
      : null;

  const byStyle = sameStyle >= 3 && style;
  return {
    area,
    href: href && byStyle ? `${href}?style=${encodeURIComponent(style)}#list` : href,
    peers: byStyle ? sameStyle : rows.length,
    peerNoun: byStyle ? `${style.toLowerCase()} venues` : "wedding venues",
    capacity,
    price,
    estimate: estimateLine(venue.state, venue.region, "venue", "Venue rental"),
  };
}

export async function vendorAreaComparison(
  supabase: SupabaseClient,
  vendor: Point & { category: string | null; price_from: number | null; price_unit: string | null },
): Promise<AreaComparison | null> {
  if (!vendor.category) return null;
  type Row = Point & { category: string | null; price_from: number | null; price_unit: string | null };
  const found = await peersOf<Row>(supabase, "vendors", vendor, "id, latitude, longitude, state, category, price_from, price_unit", {
    category: vendor.category,
  });
  if (!found || found.rows.length < MIN_PEERS) return null;
  const { rows, area, href } = found;

  // Only prices quoted the same way compare (a per-hour DJ against a package DJ doesn't).
  const prices = rows.filter((r) => r.price_from != null && r.price_unit === vendor.price_unit).map((r) => r.price_from as number);
  const price =
    vendor.price_from != null && prices.length >= 5 ? priceStats(vendor.price_from, prices) : null;

  const line = VENDOR_BUDGET_LINE[vendor.category];
  return {
    area,
    href: href ? `${href}#cat-${anchorSlug(vendor.category)}` : null,
    peers: rows.length,
    peerNoun: VENDOR_NOUN[vendor.category] ?? `${vendor.category.toLowerCase()} vendors`,
    capacity: null,
    price,
    estimate: line ? estimateLine(vendor.state, vendor.region, line, vendor.category) : null,
  };
}
