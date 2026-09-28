import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { pinForTown } from "@/lib/listing-pin";

// Town pins for imported listings, shared by the venue and vendor batches.

export type Unpinned = { city: string | null; state: string | null; latitude: number | null; longitude: number | null };
type Pin = { latitude: number; longitude: number };

export const isPinned = (row: Unpinned) => row.latitude != null && row.longitude != null;
export const townKey = (row: Unpinned) => `${row.city ?? ""}|${row.state ?? ""}`.toLowerCase();

/**
 * How many towns one "Add them" click looks up. Cloudflare allows a Worker 50
 * outbound requests per invocation, and each town can take four (two Census
 * layers, then two table lookups) -- 42 towns in one go blew the limit. The
 * banner calls again until everything is in.
 */
export const TOWNS_PER_CALL = 6;

/**
 * Nudges a town-centre pin up to ~3km in a direction picked from `seed`.
 * Vendors have no address, so forty Austin vendors would otherwise share one
 * point and only the top marker could be clicked. The same seed always lands
 * in the same place, so a re-pin doesn't make listings wander.
 */
export function spreadPin(pin: Pin, seed: string): Pin {
  let hash = 2166136261;
  for (const ch of seed) hash = Math.imul(hash ^ ch.charCodeAt(0), 16777619);
  const angle = ((hash >>> 0) % 3600) / 3600 * 2 * Math.PI;
  const distance = 0.008 + (((hash >>> 12) % 1000) / 1000) * 0.022;
  return {
    latitude: Number((pin.latitude + distance * Math.sin(angle)).toFixed(5)),
    longitude: Number((pin.longitude + distance * Math.cos(angle) * 1.15).toFixed(5)),
  };
}

/**
 * Fills blank coordinates with the town's pin, looking each town up once. A
 * listing without coordinates is missing from the map entirely, and finding
 * them by hand was the slowest part of researching a batch. `spread` gives
 * each row its own point near the centre (see spreadPin), keyed on `seedOf`.
 */
export async function withTownPins<T extends Unpinned>(
  rows: T[],
  seedOf?: (row: T) => string,
): Promise<T[]> {
  const pins = new Map<string, Promise<Pin | null>>();
  return Promise.all(
    rows.map(async (row) => {
      if (isPinned(row)) return row;
      const key = townKey(row);
      if (!pins.has(key)) pins.set(key, pinForTown(row.city, row.state));
      const pin = await pins.get(key);
      if (!pin) return row;
      return { ...row, ...(seedOf ? spreadPin(pin, seedOf(row)) : pin) };
    }),
  );
}

/**
 * Gives listings already in the database a town pin if they were added
 * without one, up to `maxTowns` towns. Venues share one update per town;
 * vendors (`spread`) get one each, keyed on their name like withTownPins.
 */
export async function pinUnpinned(table: "venues" | "vendors", maxTowns: number, spread = false): Promise<void> {
  if (maxTowns <= 0) return;
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from(table)
    .select("id, name, city, state, latitude, longitude")
    .or("latitude.is.null,longitude.is.null")
    .returns<(Unpinned & { id: string; name: string })[]>();
  const towns = new Map<string, { city: string | null; state: string | null; rows: { id: string; name: string }[] }>();
  for (const row of data ?? []) {
    const key = townKey(row);
    if (!towns.has(key)) {
      if (towns.size >= maxTowns) continue;
      towns.set(key, { city: row.city, state: row.state, rows: [] });
    }
    towns.get(key)!.rows.push({ id: row.id, name: row.name });
  }
  await Promise.all(
    [...towns.values()].map(async (town) => {
      const pin = await pinForTown(town.city, town.state);
      if (!pin) return;
      if (!spread) {
        await admin.from(table).update(pin).in("id", town.rows.map((row) => row.id));
        return;
      }
      await Promise.all(
        town.rows.map((row) => admin.from(table).update(spreadPin(pin, row.name)).eq("id", row.id)),
      );
    }),
  );
}
