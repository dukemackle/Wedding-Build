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
