import "server-only";
import { restamp, type FieldSources } from "@/lib/field-sources";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { geocode, pinForTown } from "@/lib/listing-pin";

// Town pins for imported listings, shared by the venue and vendor batches.

export type Unpinned = {
  city: string | null;
  state: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};
type Pin = { latitude: number; longitude: number };

export const isPinned = (row: Unpinned) => row.latitude != null && row.longitude != null;
export const townKey = (row: Unpinned) => `${row.city ?? ""}|${row.state ?? ""}`.toLowerCase();

/**
 * Outbound lookups one "Add them" call may spend. Cloudflare allows a Worker
 * 50 outbound requests per invocation and Supabase reads and writes count
 * too -- 42 towns in one go blew the limit. The banner (and the batch
 * routine) calls again until everything is in.
 */
export const LOOKUPS_PER_CALL = 36;
/** A town pin can take four requests: two Census layers, then two table lookups. */
export const TOWN_COST = 4;

/**
 * What's left of LOOKUPS_PER_CALL in this call. One is passed through every
 * step of an import -- both tables, database reads and writes included -- and
 * each step spends from it, so steps can't each assume the whole allowance.
 */
export type Budget = { left: number };
export const newBudget = (): Budget => ({ left: LOOKUPS_PER_CALL });

/** The one-line address the Census geocoder is given. */
export const fullAddress = (row: Unpinned) => [row.address, row.city, row.state].filter(Boolean).join(", ");

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
 * Where each row goes on the map, best source first:
 *   1. its street address, geocoded -- the only pin that is the actual place;
 *   2. coordinates typed into the batch, when the address didn't match;
 *   3. its town's centre (nudged per row with `seedOf`, see spreadPin), so a
 *      listing with neither is at least in the right town.
 * Each address and each town is looked up once.
 */
export async function withPins<T extends Unpinned>(rows: T[], seedOf?: (row: T) => string): Promise<T[]> {
  const towns = new Map<string, Promise<Pin | null>>();
  const townPinFor = (row: T) => {
    const key = townKey(row);
    if (!towns.has(key)) towns.set(key, pinForTown(row.city, row.state));
    return towns.get(key)!;
  };
  return Promise.all(
    rows.map(async (row) => {
      if (row.address) {
        const hit = await geocode(fullAddress(row));
        if (hit) return { ...row, ...hit };
      }
      if (isPinned(row)) return row;
      const pin = await townPinFor(row);
      if (!pin) return row;
      return { ...row, ...(seedOf ? spreadPin(pin, seedOf(row)) : pin) };
    }),
  );
}

/**
 * Lookups `row` could cost, given the towns already counted: one for its
 * address, plus a town pin if it might fall back to one.
 */
export function lookupCost(row: Unpinned, countedTowns: Set<string>): number {
  let cost = row.address ? 1 : 0;
  if (!isPinned(row) && !countedTowns.has(townKey(row))) {
    countedTowns.add(townKey(row));
    cost += TOWN_COST;
  }
  return cost;
}

/** As many of `rows` as fit in `budget` lookups, in order, and what they cost. */
export function withinBudget<T extends Unpinned>(rows: T[], budget: number): { batch: T[]; spent: number } {
  const counted = new Set<string>();
  const batch: T[] = [];
  let spent = 0;
  for (const row of rows) {
    const trial = new Set(counted);
    const cost = lookupCost(row, trial);
    if (spent + cost > budget) break;
    spent += cost;
    for (const key of trial) counted.add(key);
    batch.push(row);
  }
  return { batch, spent };
}

/**
 * Listings already in the database that were added before their batch row
 * had an address: geocodes the address and moves the pin there. Matched on
 * the website key; only rows whose address is still blank, so an address a
 * business entered itself (a claimed listing) is never overwritten. A row
 * whose address doesn't geocode still gets the address saved, so it isn't
 * retried every call, and the batch's typed coordinates if it has them.
 * Each row is two requests (lookup, update), spent from `budget`. Returns how
 * many are left, or the first database error, so a failing update can't loop
 * the caller forever.
 */
export async function pinFromAddresses<T extends Unpinned & { source_id: string }>(
  table: "venues" | "vendors",
  rows: T[],
  budget: Budget,
): Promise<{ remaining: number; error?: string }> {
  const withAddress = rows.filter((row) => row.address);
  if (withAddress.length === 0) return { remaining: 0 };
  const admin = createAdminSupabaseClient();
  // Pages through the listings still without an address rather than asking
  // about the batch's ids: every batch website in the URL made it too long,
  // and the 400 ("Bad Request") stopped every import call once venues were in.
  const idOf = new Map<string, string>();
  const sourcesOf = new Map<string, FieldSources>();
  for (let from = 0; ; ) {
    budget.left -= 1;
    const { data, error } = await admin
      .from(table)
      .select("id, source_id, field_sources")
      .is("address", null)
      .not("source_id", "is", null)
      .order("id")
      .range(from, from + 999)
      .returns<{ id: string; source_id: string; field_sources: FieldSources | null }[]>();
    // 42703: vendors.address (migration 0092) isn't applied yet. Skip rather than fail the import.
    if (error) return error.code === "42703" ? { remaining: 0 } : { remaining: 0, error: error.message };
    if (!data?.length) break;
    for (const row of data) {
      idOf.set(row.source_id, row.id);
      sourcesOf.set(row.source_id, row.field_sources ?? {});
    }
    from += data.length;
  }
  const todo = withAddress.filter((row) => idOf.has(row.source_id));
  const now = todo.slice(0, Math.max(0, Math.floor(budget.left / 2)));
  budget.left -= now.length * 2;
  const errors = await Promise.all(
    now.map(async (row) => {
      const hit = await geocode(fullAddress(row));
      const pin = hit ?? (isPinned(row) ? { latitude: row.latitude, longitude: row.longitude } : {});
      const { error } = await admin
        .from(table)
        .update({
          address: row.address,
          city: row.city,
          ...pin,
          field_sources: restamp(
            { field_sources: sourcesOf.get(row.source_id) },
            { address: row.address, city: row.city },
            "batch",
          ),
        })
        .eq("id", idOf.get(row.source_id)!);
      return error?.message;
    }),
  );
  const failed = errors.find(Boolean);
  return failed ? { remaining: 0, error: failed } : { remaining: todo.length - now.length };
}
/**
 * Gives listings already in the database a town pin if they were added
 * without one, as far as `budget` goes. Venues share one update per town;
 * vendors (`spread`) get one each, keyed on their name like withPins. A town
 * that won't pin is tried again next call, so this always runs last, on
 * whatever the call has left.
 */
export async function pinUnpinned(table: "venues" | "vendors", budget: Budget, spread = false): Promise<void> {
  if (budget.left < 1 + TOWN_COST + 1) return;
  const admin = createAdminSupabaseClient();
  budget.left -= 1;
  const { data } = await admin
    .from(table)
    .select("id, name, city, state, latitude, longitude")
    .or("latitude.is.null,longitude.is.null")
    .returns<(Unpinned & { id: string; name: string })[]>();
  const towns = new Map<string, { city: string | null; state: string | null; rows: { id: string; name: string }[] }>();
  for (const row of data ?? []) {
    const key = townKey(row);
    const town = towns.get(key);
    // A new town is its lookup plus an update; another vendor in a town
    // already taken is one more update, and another venue costs nothing.
    const cost = town ? (spread ? 1 : 0) : TOWN_COST + 1;
    if (cost > budget.left) continue;
    budget.left -= cost;
    if (town) town.rows.push({ id: row.id, name: row.name });
    else towns.set(key, { city: row.city, state: row.state, rows: [{ id: row.id, name: row.name }] });
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
