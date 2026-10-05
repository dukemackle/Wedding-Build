import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

type Pin = { latitude: number; longitude: number };

/**
 * Street address to map coordinates, via the US Census geocoder: free, no key,
 * and public-domain output, so there's nothing to attribute or pay for. US
 * addresses only, which is every listing today. Null when there's no match.
 */
export async function geocode(address: string): Promise<Pin | null> {
  try {
    const url =
      "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?" +
      new URLSearchParams({ address, benchmark: "Public_AR_Current", format: "json" });
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      result?: { addressMatches?: { coordinates: { x: number; y: number } }[] };
    };
    const match = body.result?.addressMatches?.[0];
    return match ? { latitude: match.coordinates.y, longitude: match.coordinates.x } : null;
  } catch {
    return null;
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
/** Postal abbreviation by full state name, as listings store it ("Texas" -> "TX"). */
export const STATE_ABBR: Record<string, string> = {};
for (const [fips, name, abbr] of [
  ["01", "Alabama", "AL"], ["02", "Alaska", "AK"], ["04", "Arizona", "AZ"], ["05", "Arkansas", "AR"],
  ["06", "California", "CA"], ["08", "Colorado", "CO"], ["09", "Connecticut", "CT"], ["10", "Delaware", "DE"],
  ["11", "District of Columbia", "DC"], ["12", "Florida", "FL"], ["13", "Georgia", "GA"], ["15", "Hawaii", "HI"],
  ["16", "Idaho", "ID"], ["17", "Illinois", "IL"], ["18", "Indiana", "IN"], ["19", "Iowa", "IA"],
  ["20", "Kansas", "KS"], ["21", "Kentucky", "KY"], ["22", "Louisiana", "LA"], ["23", "Maine", "ME"],
  ["24", "Maryland", "MD"], ["25", "Massachusetts", "MA"], ["26", "Michigan", "MI"], ["27", "Minnesota", "MN"],
  ["28", "Mississippi", "MS"], ["29", "Missouri", "MO"], ["30", "Montana", "MT"], ["31", "Nebraska", "NE"],
  ["32", "Nevada", "NV"], ["33", "New Hampshire", "NH"], ["34", "New Jersey", "NJ"], ["35", "New Mexico", "NM"],
  ["36", "New York", "NY"], ["37", "North Carolina", "NC"], ["38", "North Dakota", "ND"], ["39", "Ohio", "OH"],
  ["40", "Oklahoma", "OK"], ["41", "Oregon", "OR"], ["42", "Pennsylvania", "PA"], ["44", "Rhode Island", "RI"],
  ["45", "South Carolina", "SC"], ["46", "South Dakota", "SD"], ["47", "Tennessee", "TN"], ["48", "Texas", "TX"],
  ["49", "Utah", "UT"], ["50", "Vermont", "VT"], ["51", "Virginia", "VA"], ["53", "Washington", "WA"],
  ["54", "West Virginia", "WV"], ["55", "Wisconsin", "WI"], ["56", "Wyoming", "WY"],
]) {
  STATE_FIPS[name.toLowerCase()] = fips;
  STATE_FIPS[abbr.toLowerCase()] = fips;
  STATE_ABBR[name] = abbr;
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
