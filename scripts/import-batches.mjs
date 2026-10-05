// Puts merged venue and vendor batches live, for the hourly batch routine.
// Run with:
//
//   BATCH_IMPORT_SECRET=... npm run import:batches
//   npm run import:batches -- --minutes 20      stop starting new work after 20 min
//   npm run import:batches -- --dry-run         say what it would do, write nothing
//   npm run import:batches -- --repair-pins     also re-check every venue's pin against its address
//
// The heavy part runs here, on the routine's machine: parsing every batch file
// through the real importers, geocoding, and reading listings' own websites
// for their street addresses. youdoido.com's /api/batch-sync only reads
// listings and writes what this works out. Doing it all inside the Worker ran
// Workers Free past its 10 ms of CPU per request (Cloudflare error 1102) and
// its 50 outbound requests, so the old /api/import-batches crept along a few
// listings a call. In order:
//
//   1. new batch rows -> inserted, pinned to their address, typed
//      coordinates or town (vendors nudged apart so they stay clickable)
//   2. listed rows whose batch row has since gained an address -> moved onto it
//   3. listings with no pin -> their town's; listings on a bad Census town
//      point -> the town's real middle
//   4. with --repair-pins, venues pinned away from their own address -> onto it
//   5. listings with no address -> read off their website (until --minutes)
//   6. a line on where the pins stand
//
// Addresses go to the Census geocoder first and OpenStreetMap's second, and a
// result more than 40 km from the listing's town is thrown away as a wrong
// match.
//
// Prints one line per step and a JSON summary last. Exits 1 if a write fails.
//
// Needs `npm ci` (for @supabase/supabase-js, which the shared modules import)
// but no build: Node 22 strips the TypeScript, and the hook below resolves the
// "@/..." imports to src/.

import { existsSync } from "node:fs";
import { register } from "node:module";

register(
  "data:text/javascript," +
    encodeURIComponent(`
      import { existsSync } from "node:fs";
      const root = ${JSON.stringify(new URL("../src/", import.meta.url).href)};
      export async function resolve(specifier, context, next) {
        // server-only guards against bundling into the browser; a script is fine.
        if (specifier === "server-only") return { url: "data:text/javascript,export {}", shortCircuit: true };
        if (specifier.startsWith("@/")) {
          const base = new URL(specifier.slice(2), root);
          const file = existsSync(new URL(base.href + ".ts")) ? base.href + ".ts" : base.href + "/index.ts";
          return next(file, context);
        }
        return next(specifier, context);
      }
    `),
);

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const DRY = args.includes("--dry-run");
const REPAIR = args.includes("--repair-pins");
const MINUTES = Number(option("--minutes") ?? 35);
const SITE = option("--site") ?? "https://youdoido.com";
const SECRET = process.env.BATCH_IMPORT_SECRET;
const deadline = Date.now() + MINUTES * 60_000;

if (!SECRET) {
  console.error("BATCH_IMPORT_SECRET isn't set; nothing to do.");
  process.exit(1);
}
if (!existsSync(new URL("../node_modules/@supabase/supabase-js", import.meta.url))) {
  console.error("Run `npm ci` first.");
  process.exit(1);
}

const { ALL_VENUE_BATCHES } = await import("../src/lib/batches/venues/index.ts");
const { ALL_VENDOR_BATCHES } = await import("../src/lib/batches/vendors/index.ts");
const { parseVenueTable, importSourceId } = await import("../src/lib/venue-import.ts");
const { parseVendorTable } = await import("../src/lib/vendor-import.ts");
const { geocode, censusPlacePin } = await import("../src/lib/listing-pin.ts");
const { lookUpAddress } = await import("../src/lib/address-finder.ts");
const { spreadPin, fullAddress, townKey, isPinned } = await import("../src/lib/import-pins.ts");

// --- talking to /api/batch-sync -------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** One call, retried on a 5xx (a 1102 included) or a dropped connection. */
async function api(method, query, body) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(`${SITE}/api/batch-sync${query}`, {
        method,
        headers: { authorization: `Bearer ${SECRET}`, ...(body ? { "content-type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      if (attempt < 4) {
        await sleep(attempt * 5000);
        continue;
      }
      throw new Error(`${method} batch-sync: ${error.message}`);
    }
    const text = await res.text();
    if (res.ok) return JSON.parse(text);
    if (res.status >= 500 && attempt < 4) {
      await sleep(attempt * 5000);
      continue;
    }
    throw new Error(`${method} batch-sync ${res.status}: ${text.slice(0, 300)}`);
  }
}

async function listings(table) {
  const rows = [];
  for (let from = 0; from != null; ) {
    const page = await api("GET", `?table=${table}&from=${from}`);
    rows.push(...page.rows);
    from = page.next;
  }
  return rows.map((row) => ({
    ...row,
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
  }));
}

const chunks = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));

async function insert(table, rows) {
  if (DRY) return;
  for (const chunk of chunks(rows, 100)) await api("POST", "", { action: "insert", table, rows: chunk });
}

async function update(table, updates) {
  if (DRY) return;
  for (const chunk of chunks(updates, 40)) await api("POST", "", { action: "update", table, updates: chunk });
}

/** `fn` over `items`, `limit` at a time, results in order. Stops starting new ones past `until`. */
async function pool(items, limit, fn, until = Infinity) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length && Date.now() < until) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }),
  );
  return results;
}

// --- where things are ---------------------------------------------------

/** Kilometres between two pins. */
function km(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/** A geocoded address must land within this of its town, or it's a wrong match. */
const MAX_KM = 40;

// OpenStreetMap's geocoder (Nominatim), for what the Census can't place: rural
// routes, "N3540 State Road 22", unincorporated towns. Its usage policy asks
// for one request a second and a real User-Agent; the maps already carry the
// "© OpenStreetMap contributors" credit its licence asks for.
let osmNext = 0;
async function osm(params) {
  const wait = osmNext - Date.now();
  osmNext = Math.max(Date.now(), osmNext) + 1100;
  if (wait > 0) await sleep(wait);
  try {
    const res = await fetch(
      "https://nominatim.openstreetmap.org/search?" + new URLSearchParams({ format: "jsonv2", limit: "1", countrycodes: "us", ...params }),
      { headers: { "user-agent": "YouDoIDoBot/1.0 (+https://youdoido.com)" }, signal: AbortSignal.timeout(15_000) },
    );
    if (!res.ok) return null;
    const [hit] = await res.json();
    return hit ? { latitude: Number(hit.lat), longitude: Number(hit.lon) } : null;
  } catch {
    return null;
  }
}

/** An address's pin: the Census geocoder, then OpenStreetMap. */
const addressCache = new Map();
function geocodeAny(row) {
  const key = fullAddress(row).toLowerCase();
  if (!addressCache.has(key)) {
    addressCache.set(
      key,
      (async () => (await geocode(fullAddress(row))) ?? (await osm({ street: row.address, city: row.city ?? "", state: row.state ?? "" })))(),
    );
  }
  return addressCache.get(key);
}

/**
 * Where each town is, for pinning listings that have only a town and for
 * sanity-checking geocodes. Best first:
 *   1. the middle of the town's listings that sit on a real street address,
 *      when there are 3 or more -- the Census's own point for a town is the
 *      middle of its area, and for some that's nowhere near the town (San
 *      Francisco's is 55 km out to sea, near the Farallon Islands);
 *   2. the Census point, trying townships and merged city-counties too;
 *   3. OpenStreetMap's point for the town;
 *   4. where another listing in the town already sits.
 * `census(row)` is the bare Census point, to find listings pinned to a bad one.
 */
function towns(all) {
  const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const located = new Map();
  const any = new Map();
  for (const row of all) {
    if (!isPinned(row)) continue;
    const key = townKey(row);
    if (!any.has(key)) any.set(key, row);
    if (row.address) located.set(key, [...(located.get(key) ?? []), row]);
  }
  const censusCache = new Map();
  const census = (row) => {
    const key = townKey(row);
    if (!censusCache.has(key)) censusCache.set(key, row.city && row.state ? censusPlacePin(row.city, row.state, true) : Promise.resolve(null));
    return censusCache.get(key);
  };
  const cache = new Map();
  const pin = (row) => {
    const key = townKey(row);
    if (!cache.has(key)) {
      cache.set(
        key,
        (async () => {
          const here = located.get(key) ?? [];
          if (here.length >= 3) {
            return { latitude: median(here.map((r) => r.latitude)), longitude: median(here.map((r) => r.longitude)) };
          }
          if (!row.city || !row.state) return null;
          const found = (await census(row)) ?? (await osm({ city: row.city, state: row.state }));
          if (found) return found;
          const other = any.get(key);
          return other ? { latitude: other.latitude, longitude: other.longitude } : null;
        })(),
      );
    }
    return cache.get(key);
  };
  return { pin, census };
}

/**
 * Where a listing goes: its address (if it lands near its town), then typed
 * coordinates, then its town (vendors nudged apart so they stay clickable).
 */
async function pinned(row, town, spread) {
  const here = await town.pin(row);
  if (row.address) {
    const hit = await geocodeAny(row);
    if (hit && (!here || km(hit, here) <= MAX_KM)) return { ...row, ...hit };
  }
  if (isPinned(row)) return row;
  if (!here) return row;
  return { ...row, ...(spread ? spreadPin(here, row.name) : here) };
}

// --- the run ------------------------------------------------------------

const TABLES = {
  venues: { batches: ALL_VENUE_BATCHES, parse: parseVenueTable, spread: false },
  vendors: { batches: ALL_VENDOR_BATCHES, parse: parseVendorTable, spread: true },
};
const summary = {
  imported: 0,
  moved: 0,
  townPinned: 0,
  repinned: 0,
  repaired: 0,
  checked: 0,
  found: 0,
  remaining: 0,
  dryRun: DRY,
};
const both = async () => ({ venues: await listings("venues"), vendors: await listings("vendors") });

try {
  let listed = await both();
  let town = towns([...listed.venues, ...listed.vendors]);
  for (const [table, { batches, parse, spread }] of Object.entries(TABLES)) {
    const rows = batches.flatMap((batch) => parse(batch.tsv).rows).filter((row) => row.errors.length === 0).map((row) => row.values);

    // 1. New rows. Rows with no website are skipped: nothing would mark them as
    //    added, so every run would insert them again.
    const present = new Set(listed[table].map((row) => row.source_id).filter(Boolean));
    const fresh = rows.filter((row) => {
      const id = importSourceId(row.website);
      if (!id || present.has(id)) return false;
      present.add(id);
      return true;
    });
    const ready = await pool(fresh, 8, (row) => pinned(row, town, spread));
    // A blank vendor address is left out rather than sent as null, as the
    // in-app import does.
    await insert(
      table,
      ready.map((row) => {
        if (table !== "vendors" || row.address) return row;
        const copy = { ...row };
        delete copy.address;
        return copy;
      }),
    );
    summary.imported += ready.length;
    console.log(`${table}: ${rows.length} batch rows, ${listed[table].length} listed, ${ready.length} added`);

    // 2. Listed rows whose batch row now has an address, while theirs is blank.
    //    Never a listing whose own address is set: a claimed one keeps its own.
    const unaddressed = new Map(listed[table].filter((row) => !row.address && row.source_id).map((row) => [row.source_id, row]));
    const movable = rows.filter((row) => row.address && unaddressed.has(importSourceId(row.website)));
    const moves = await pool(movable, 8, async (row) => {
      const listing = unaddressed.get(importSourceId(row.website));
      const hit = await geocodeAny(row);
      const here = await town.pin(row);
      const near = hit && (!here || km(hit, here) <= MAX_KM);
      const pin = near ? hit : isPinned(row) ? { latitude: row.latitude, longitude: row.longitude } : {};
      // The address is saved even when it doesn't geocode, so it isn't retried every run.
      return { id: listing.id, address: row.address, city: row.city, ...pin };
    });
    await update(table, moves);
    summary.moved += moves.length;
    console.log(`${table}: ${moves.length} moved onto their batch row's address`);
  }

  // 3. Fresh listings, so steps 1-2 are counted. Listings with no pin get
  //    their town's; listings with no address that sit on a Census town point
  //    far from where the town's listings are (San Francisco's is at sea) move
  //    to the town's real middle.
  listed = await both();
  town = towns([...listed.venues, ...listed.vendors]);
  for (const [table, { spread }] of Object.entries(TABLES)) {
    const updates = [];
    const unpinned = listed[table].filter((row) => !isPinned(row));
    for (const row of unpinned) {
      const here = await town.pin(row);
      if (here) updates.push({ id: row.id, ...(spread ? spreadPin(here, row.name) : here) });
    }
    const townOnly = listed[table].filter((row) => isPinned(row) && !row.address);
    let repinned = 0;
    await pool(townOnly, 8, async (row) => {
      const [here, census] = [await town.pin(row), await town.census(row)];
      if (!here || !census || km(here, census) < 15) return;
      // Within 4 km covers a vendor nudged apart from the point.
      if (km(row, census) > 4) return;
      updates.push({ id: row.id, ...(spread ? spreadPin(here, row.name) : here) });
      repinned++;
    });
    await update(table, updates);
    summary.townPinned += updates.length - repinned;
    summary.repinned += repinned;
    console.log(`${table}: ${updates.length - repinned} of ${unpinned.length} unpinned given a town pin, ${repinned} moved off a bad town point`);
  }

  // 4. With --repair-pins (the routine adds it once a day): every venue with
  //    an address is geocoded again, and a pin more than 1 km from where its
  //    address lands is moved there, when that's near its town. Catches typed
  //    coordinates that were wrong and pins set while a geocoder was down.
  if (REPAIR) {
    const withAddress = listed.venues.filter((row) => row.address && row.city && row.state);
    const fixes = (
      await pool(withAddress, 8, async (row) => {
        const hit = await geocodeAny(row);
        const here = await town.pin(row);
        if (!hit || (here && km(hit, here) > MAX_KM)) return null;
        if (isPinned(row) && km(hit, row) <= 1) return null;
        return { id: row.id, ...hit };
      }, deadline)
    ).filter(Boolean);
    await update("venues", fixes);
    summary.repaired = fixes.length;
    console.log(`venues: ${fixes.length} of ${withAddress.length} with an address moved onto it`);
  }

  // 5. Listings with no address: read it off their own website. Every one
  //    looked at is stamped address_checked_at, found or not, so a site
  //    without an address isn't fetched again next run. Saved as it goes, so
  //    stopping at --minutes loses nothing.
  for (const table of Object.keys(TABLES)) {
    const candidates = listed[table].filter(
      (row) => !row.address && !row.address_checked_at && row.website && row.state && isPinned(row),
    );
    let pending = [];
    const flush = async () => {
      const batch = pending;
      pending = [];
      await update(table, batch);
    };
    let checked = 0;
    await pool(
      candidates,
      8,
      async (row) => {
        const hit = await lookUpAddress(row).catch(() => null);
        checked++;
        if (hit) summary.found++;
        pending.push({ id: row.id, ...(hit ?? {}), address_checked_at: new Date().toISOString() });
        if (pending.length >= 40) await flush();
      },
      deadline,
    );
    await flush();
    summary.checked += checked;
    summary.remaining += candidates.length - checked;
    console.log(`${table}: ${checked} of ${candidates.length} websites read for an address`);
  }

  // 6. Where the pins stand, for the routine's report.
  listed = await both();
  const pins = {
    venuesUnpinned: listed.venues.filter((row) => !isPinned(row)).length,
    venuesTownOnly: listed.venues.filter((row) => isPinned(row) && !row.address).length,
    vendorsUnpinned: listed.vendors.filter((row) => !isPinned(row)).length,
  };
  Object.assign(summary, pins);
  console.log(
    `pins: ${pins.venuesUnpinned} venues and ${pins.vendorsUnpinned} vendors off the map; ` +
      `${pins.venuesTownOnly} venues placed by town only (no street address known)`,
  );

  if (!DRY) await api("POST", "", { action: "refresh" });
} catch (error) {
  console.error(error.message);
  console.log(JSON.stringify({ ...summary, error: error.message }));
  process.exit(1);
}

console.log(JSON.stringify({ ...summary, done: summary.remaining === 0 }));
