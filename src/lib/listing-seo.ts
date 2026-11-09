import type { SupabaseClient } from "@supabase/supabase-js";
import { distanceMiles, metroForPoint, metroHref, type Metro } from "@/lib/metros";
import { SITE_URL } from "@/lib/public-listings";

/**
 * What search engines see of a listing or hub beyond its text: the "nearby"
 * links under a listing, and the schema.org JSON-LD for listings and hubs.
 *
 * Search Console (2026-11-08): 14,824 URLs discovered, 11 indexed. The
 * listings' "More like this" links used to be a same-category query with no
 * order, so every photographer page in the country linked to the same three
 * Sonoma photographers, and an Austin venue to venues in Illinois. Nearest
 * first gives each page its own set of links, and gives Google a crawl path
 * from one listing to its neighbours.
 */

type Located = { id: string; latitude: number | null; longitude: number | null };

/**
 * The `count` active, non-sample listings nearest to `origin`, nearest first.
 * Searches a ~5-mile box, then 25, then 100 until it has enough, so a dense
 * city doesn't hand back an arbitrary slice of a big box. `columns` must
 * include id, latitude and longitude. `match` narrows the query (a vendor's
 * category, for instance).
 */
export async function nearestListings<T extends Located>(
  supabase: SupabaseClient,
  table: "venues" | "vendors",
  origin: Located,
  columns: string,
  count: number,
  match: Record<string, string> = {},
): Promise<(T & { miles: number })[]> {
  const { latitude: lat, longitude: lng } = origin;
  if (lat == null || lng == null) return [];
  let found: (T & { miles: number })[] = [];
  for (const miles of [5, 25, 100]) {
    const dLat = miles / 69;
    const dLng = miles / (69 * Math.max(Math.cos((lat * Math.PI) / 180), 0.2));
    let query = supabase
      .from(table)
      .select(columns)
      .eq("active", true)
      .eq("is_sample", false)
      .neq("id", origin.id)
      .gte("latitude", lat - dLat)
      .lte("latitude", lat + dLat)
      .gte("longitude", lng - dLng)
      .lte("longitude", lng + dLng);
    for (const [key, value] of Object.entries(match)) query = query.eq(key, value);
    // Even a 5-mile box in Manhattan is a few hundred; enough to sort.
    const { data } = await query.limit(300).returns<T[]>();
    found = (data ?? [])
      .map((row) => ({ ...row, miles: distanceMiles(lat, lng, row.latitude as number, row.longitude as number) }))
      .filter((row) => row.miles <= miles)
      .sort((a, b) => a.miles - b.miles)
      .slice(0, count);
    if (found.length >= count) break;
  }
  return found;
}

/** "Simple" / "Classic" / "Luxury" as schema.org's priceRange. */
const PRICE_RANGE: Record<string, string> = { Simple: "$", Classic: "$$", Luxury: "$$$" };

export function priceRange(tier: string | null | undefined): string | undefined {
  return tier ? PRICE_RANGE[tier] : undefined;
}

type Crumb = { name: string; href: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.href}`,
    })),
  };
}

/** Wedding venues › Austin area › The Arlo, matching the hub's own crumbs. */
export function listingBreadcrumbJsonLd(
  kind: "venues" | "vendors",
  listing: { name: string; latitude: number | null; longitude: number | null },
  href: string,
) {
  const metro: Metro | null = metroForPoint(listing.latitude, listing.longitude);
  return breadcrumbJsonLd([
    { name: kind === "venues" ? "Wedding venues" : "Wedding vendors", href: `/${kind}` },
    ...(metro ? [{ name: `${metro.name} area`, href: metroHref(kind, metro) }] : []),
    { name: listing.name, href },
  ]);
}

/**
 * A hub's listings as a schema.org ItemList of URLs (the "summary page"
 * pattern: each item is only a link to its own page, which carries the
 * details). Capped: Google reads the list for structure, not as a sitemap.
 */
export function itemListJsonLd(name: string, items: { name: string; href: string }[], max = 100) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.slice(0, max).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${item.href}`,
      name: item.name,
    })),
  };
}
