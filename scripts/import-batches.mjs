// Puts merged venue and vendor batches live, for the hourly batch routine.
// Run with:
//
//   BATCH_IMPORT_SECRET=... npm run import:batches
//   npm run import:batches -- --minutes 20      stop starting new work after 20 min
//   npm run import:batches -- --dry-run         say what it would do, write nothing
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
//   3. listings with no pin at all -> their town's
//   4. listings with no address -> read off their website (until --minutes)
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

// --- pins ---------------------------------------------------------------

/**
 * A town's pin: its Census centre, else where another listing in the same
 * town already sits (the same order as pinForTown). Looked up once per town.
 */
function townPins(known) {
  const byTown = new Map();
  for (const row of known) if (isPinned(row) && !byTown.has(townKey(row))) byTown.set(townKey(row), row);
  const cache = new Map();
  return (row) => {
    const key = townKey(row);
    if (!cache.has(key)) {
      cache.set(
        key,
        (async () => {
          if (!row.city || !row.state) return null;
          const pin = await censusPlacePin(row.city, row.state);
          if (pin) return pin;
          const other = byTown.get(key);
          return other ? { latitude: other.latitude, longitude: other.longitude } : null;
        })(),
      );
    }
    return cache.get(key);
  };
}

/** As withPins in import-pins.ts: address, then typed coordinates, then town (spread for vendors). */
async function pinned(row, townPin, spread) {
  if (row.address) {
    const hit = await geocode(fullAddress(row));
    if (hit) return { ...row, ...hit };
  }
  if (isPinned(row)) return row;
  const pin = await townPin(row);
  if (!pin) return row;
  return { ...row, ...(spread ? spreadPin(pin, row.name) : pin) };
}

// --- the run ------------------------------------------------------------

const TABLES = {
  venues: { batches: ALL_VENUE_BATCHES, parse: parseVenueTable, spread: false },
  vendors: { batches: ALL_VENDOR_BATCHES, parse: parseVendorTable, spread: true },
};
const summary = { imported: 0, moved: 0, townPinned: 0, checked: 0, found: 0, remaining: 0, dryRun: DRY };

try {
  const listed = {};
  for (const [table, { batches, parse, spread }] of Object.entries(TABLES)) {
    const rows = batches.flatMap((batch) => parse(batch.tsv).rows).filter((row) => row.errors.length === 0).map((row) => row.values);
    listed[table] = await listings(table);
    const townPin = townPins(listed[table]);

    // 1. New rows. Rows with no website are skipped: nothing would mark them as
    //    added, so every run would insert them again.
    const present = new Set(listed[table].map((row) => row.source_id).filter(Boolean));
    const fresh = rows.filter((row) => {
      const id = importSourceId(row.website);
      if (!id || present.has(id)) return false;
      present.add(id);
      return true;
    });
    const ready = await pool(fresh, 8, (row) => pinned(row, townPin, spread));
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
      const hit = await geocode(fullAddress(row));
      const pin = hit ?? (isPinned(row) ? { latitude: row.latitude, longitude: row.longitude } : {});
      // The address is saved even when it doesn't geocode, so it isn't retried every run.
      return { id: listing.id, address: row.address, city: row.city, ...pin };
    });
    await update(table, moves);
    summary.moved += moves.length;
    console.log(`${table}: ${moves.length} moved onto their batch row's address`);
  }

  // 3. Listings still with no pin get their town's. Fresh listings, so step 1's
  //    rows are counted (they were pinned on the way in, so few remain).
  for (const [table, { spread }] of Object.entries(TABLES)) {
    listed[table] = await listings(table);
    const townPin = townPins(listed[table]);
    const unpinned = listed[table].filter((row) => !isPinned(row));
    const pins = await pool(unpinned, 8, async (row) => {
      const pin = await townPin(row);
      return pin ? { id: row.id, ...(spread ? spreadPin(pin, row.name) : pin) } : null;
    });
    const updates = pins.filter(Boolean);
    await update(table, updates);
    summary.townPinned += updates.length;
    console.log(`${table}: ${updates.length} of ${unpinned.length} unpinned given a town pin`);
  }

  // 4. Listings with no address: read it off their own website. Every one
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

  if (!DRY) await api("POST", "", { action: "refresh" });
} catch (error) {
  console.error(error.message);
  console.log(JSON.stringify({ ...summary, error: error.message }));
  process.exit(1);
}

console.log(JSON.stringify({ ...summary, done: summary.remaining === 0 }));
