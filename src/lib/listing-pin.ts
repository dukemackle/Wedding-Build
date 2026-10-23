import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { US_STATES } from "@/lib/us-states";

export { STATE_ABBR } from "@/lib/us-states";

type Pin = { latitude: number; longitude: number };

/**
 * Street address to map coordinates, via the US Census geocoder: free, no key,
 * and public-domain output, so there's nothing to attribute or pay for. US
 * addresses only, which is every listing today. Null when there's no match.
 */
export async function geocode(address: string): Promise<Pin | null> {
  return (await geocodeAll(address))[0] ?? null;
}

/**
 * Every place the Census matches `address` to. Usually one; a road that runs
 * through town under one name in two pieces gives two, often kilometres
 * apart ("15425 McKenzie Highway, Sisters" is on both OR-126 and OR-242), and
 * geocode's first pick can be the wrong one.
 */
export async function geocodeAll(address: string): Promise<Pin[]> {
  try {
    const url =
      "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?" +
      new URLSearchParams({ address, benchmark: "Public_AR_Current", format: "json" });
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      result?: { addressMatches?: { coordinates: { x: number; y: number } }[] };
    };
    return (body.result?.addressMatches ?? []).map((match) => ({
      latitude: match.coordinates.y,
      longitude: match.coordinates.x,
    }));
  } catch {
    return [];
  }
}

/**
 * A pin for a listing that has only a town: the coordinates another listing
 * in the same town already uses. Vendors have no street address, and the
 * Census geocoder won't place a bare town -- without a pin a listing is
 * missing from the map entirely.
 */
export async function townPin(city: string | null, state: string | null): Promise<Pin | null> {
  if (!city || !state) return null;
  const admin = createAdminSupabaseClient();
  for (const table of ["venues", "vendors"] as const) {
    const { data } = await admin
      .from(table)
      .select("latitude, longitude")
      .ilike("city", city.replace(/[%_\\]/g, "\\$&"))
      .eq("state", state)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .limit(1)
      .maybeSingle<Pin>();
    if (data) return { latitude: Number(data.latitude), longitude: Number(data.longitude) };
  }
  return null;
}

// Census state codes, keyed by full name and postal abbreviation.
const STATE_FIPS: Record<string, string> = {};
for (const [fips, name, abbr] of US_STATES) {
  STATE_FIPS[name.toLowerCase()] = fips;
  STATE_FIPS[abbr.toLowerCase()] = fips;
}

/**
 * A town's centre from the Census's own list of places (TIGERweb, 2020
 * census): incorporated towns first, then unincorporated ones like Driftwood.
 * Same terms as the geocoder above -- free, no key, public domain. Null for a
 * town the Census doesn't list (e.g. Oatmeal, TX).
 *
 * `thorough` also tries New England-style towns, which the Census files as
 * county subdivisions (Stratham NH, Guilford CT), and merged city-counties
 * filed under their long name (Augusta is "Augusta-Richmond County"). Off by
 * default: each layer is another outbound request, and the in-app import has
 * Cloudflare's 50 to stay inside. scripts/import-batches.mjs turns it on.
 */
export async function censusPlacePin(city: string, state: string, thorough = false): Promise<Pin | null> {
  const fips = STATE_FIPS[state.trim().toLowerCase()];
  if (!fips) return null;
  const name = city.trim().replace(/'/g, "''");
  const exact = `BASENAME='${name}' AND STATE='${fips}'`;
  // Layer 25 is incorporated places, 26 census-designated places, 22 county
  // subdivisions; a consolidated city is an incorporated place named
  // "<city>-<county> ...".
  const tries: [number, string][] = [
    [25, exact],
    [26, exact],
    ...(thorough ? ([[22, exact], [25, `BASENAME LIKE '${name}-%' AND STATE='${fips}'`]] as [number, string][]) : []),
  ];
  for (const [layer, where] of tries) {
    try {
      const url =
        `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/${layer}/query?` +
        new URLSearchParams({ where, outFields: "INTPTLAT,INTPTLON", returnGeometry: "false", f: "json" });
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const body = (await res.json()) as { features?: { attributes: { INTPTLAT: string; INTPTLON: string } }[] };
      const hit = body.features?.[0]?.attributes;
      if (hit) return { latitude: Number(hit.INTPTLAT), longitude: Number(hit.INTPTLON) };
    } catch {
      // Try the next layer; no pin is better than a failed import.
    }
  }
  return null;
}

/**
 * The best pin available from just a town: its Census centre, else another
 * listing's pin in the same town. What imported venues get when their row
 * leaves the coordinates blank, so researching a batch needn't look them up.
 */
export async function pinForTown(city: string | null, state: string | null): Promise<Pin | null> {
  if (!city || !state) return null;
  return (await censusPlacePin(city, state)) ?? (await townPin(city, state));
}
