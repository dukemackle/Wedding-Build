import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { isIndexable } from "@/lib/public-listings";

/**
 * The metro hub pages: /venues/in/<slug> and /vendors/in/<slug>.
 *
 * Search Console (2026-11-04) showed ~14,850 listings "Discovered - currently
 * not indexed": Google knew them from the sitemap but nothing on the site
 * linked to them, so it never got round to crawling them. A hub links to every
 * listing in a metro, and the footer and each listing link back to it.
 *
 * Metros are a centre and a radius rather than a list of towns: the catalog's
 * `city` is whatever town the business gives, and couples in Austin look at
 * Dripping Springs and Driftwood too. These are the launch metros
 * (`LAUNCH_METROS` in scripts/coverage-plan.mjs), in the same order. Add one
 * here only once it has listings worth a page; a hub with fewer than
 * MIN_INDEXABLE indexable listings is noindex and left out of the sitemap.
 */
export type Metro = {
  slug: string;
  /** "Austin", "Dallas–Fort Worth". */
  name: string;
  state: string;
  /** The town the radius is measured from, for "in Austin itself". */
  city: string;
  lat: number;
  lng: number;
  radiusMiles: number;
};

export const METROS: Metro[] = [
  { slug: "austin", name: "Austin", state: "Texas", city: "Austin", lat: 30.267, lng: -97.743, radiusMiles: 40 },
  { slug: "san-diego", name: "San Diego", state: "California", city: "San Diego", lat: 32.716, lng: -117.161, radiusMiles: 40 },
  { slug: "dallas-fort-worth", name: "Dallas–Fort Worth", state: "Texas", city: "Dallas", lat: 32.82, lng: -97.05, radiusMiles: 45 },
  { slug: "houston", name: "Houston", state: "Texas", city: "Houston", lat: 29.76, lng: -95.37, radiusMiles: 45 },
  { slug: "san-antonio", name: "San Antonio", state: "Texas", city: "San Antonio", lat: 29.424, lng: -98.494, radiusMiles: 40 },
  { slug: "new-york-city", name: "New York City", state: "New York", city: "New York", lat: 40.713, lng: -74.006, radiusMiles: 35 },
  { slug: "los-angeles", name: "Los Angeles", state: "California", city: "Los Angeles", lat: 34.052, lng: -118.244, radiusMiles: 40 },
  { slug: "chicago", name: "Chicago", state: "Illinois", city: "Chicago", lat: 41.878, lng: -87.63, radiusMiles: 40 },
  { slug: "miami", name: "Miami", state: "Florida", city: "Miami", lat: 25.762, lng: -80.192, radiusMiles: 40 },
];

/** A hub needs this many indexable listings before it asks to be indexed. */
export const MIN_INDEXABLE = 8;

export function metroBySlug(slug: string): Metro | undefined {
  return METROS.find((m) => m.slug === slug);
}

export function metroHref(kind: "venues" | "vendors", metro: Metro): string {
  return `/${kind}/in/${metro.slug}`;
}

/** Straight-line miles between two points (haversine). */
export function distanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lng2 - lng1) * rad) / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(a));
}

/** The metro a listing sits in, if any: the nearest whose radius covers it. */
export function metroForPoint(lat: number | null, lng: number | null): Metro | null {
  if (lat == null || lng == null) return null;
  let best: { metro: Metro; d: number } | null = null;
  for (const metro of METROS) {
    const d = distanceMiles(lat, lng, metro.lat, metro.lng);
    if (d <= metro.radiusMiles && (!best || d < best.d)) best = { metro, d };
  }
  return best?.metro ?? null;
}

/** The other metros, nearest first. */
export function nearbyMetros(metro: Metro, count = 4): Metro[] {
  return METROS.filter((m) => m !== metro)
    .map((m) => ({ m, d: distanceMiles(metro.lat, metro.lng, m.lat, m.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map(({ m }) => m);
}

type Located = { latitude: number | null; longitude: number | null };

/**
 * Every active, non-sample listing in a metro, as the anon role reads it.
 * A bounding box narrows the query; the radius check is done here. `columns`
 * must include latitude and longitude.
 */
export async function loadMetroListings<T extends Located>(
  supabase: SupabaseClient,
  table: "venues" | "vendors",
  metro: Metro,
  columns: string,
): Promise<T[]> {
  const dLat = metro.radiusMiles / 69;
  const dLng = metro.radiusMiles / (69 * Math.cos((metro.lat * Math.PI) / 180));
  const rows = await fetchAll<T>((from, to) =>
    supabase
      .from(table)
      .select(columns)
      .eq("active", true)
      .eq("is_sample", false)
      .gte("latitude", metro.lat - dLat)
      .lte("latitude", metro.lat + dLat)
      .gte("longitude", metro.lng - dLng)
      .lte("longitude", metro.lng + dLng)
      .order("name")
      .order("id")
      .range(from, to)
      .returns<T[]>(),
  );
  return rows.filter((r) => metroForPoint(r.latitude, r.longitude) === metro);
}

/** Whether a hub has enough real, indexable listings to ask Google to index it. */
export function hubIsIndexable(
  rows: { description: string | null; last_verified_at: string | null; is_sample: boolean }[],
): boolean {
  return rows.filter(isIndexable).length >= MIN_INDEXABLE;
}

/** "dripping-springs", for in-page anchors. */
export function anchorSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Values with how often each appears, most common first, then A–Z. */
export function countBy<T>(rows: T[], key: (row: T) => string | null | undefined): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = key(row)?.trim();
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** The middle value, or null for an empty list. */
export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
