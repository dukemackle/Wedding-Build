// A second source for businesses whose own website blocks our checker:
// Google's Places API (New). Text Search asks only for basic fields (name,
// address, open/closed), which bills at the Text Search Pro rate: 5,000 free
// calls a month. Phone and website are left out on purpose: asking for them
// moves every call to the pricier Enterprise rate.
//
// Google's terms let us keep a place ID forever but not the rest of what it
// returns, so Google is used to CONFIRM, never as a source: the name and
// address it sends back are compared and thrown away, and only the date,
// result and place ID are kept, in src/lib/batches/places/<state>.tsv (one
// file per state, like the batches, so parallel batch PRs don't conflict).
// That file means a business is never looked up twice, lets the batch
// verifier read the answer, and counts the day's lookups. Needs
// GOOGLE_PLACES_API_KEY; without it every lookup returns null.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

export const KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";
export const LEDGER_DIR = "src/lib/batches/places";
const fileOf = (state) => `${LEDGER_DIR}/${state.toLowerCase().replace(/\s+/g, "-")}.tsv`;
// Under 5,000 free a month with room to spare.
export const DAILY_CAP = Number(process.env.PLACES_DAILY_CAP ?? 150);
const COLS = ["Date", "Name", "City", "State", "Website", "Result", "Place ID"];
const API = "https://places.googleapis.com/v1";

// Results a lookup can give.
export const OPEN = "Open";
export const CLOSED = "Closed";
export const NOT_FOUND = "Not found";

const ABBR = Object.fromEntries(
  [...readFileSync("src/lib/us-states.ts", "utf8").matchAll(/\["\d\d", "([^"]+)", "([A-Z]{2})"\]/g)].map((m) => [m[1], m[2]]),
);

const today = () => new Date().toISOString().slice(0, 10);
const keyOf = (name, city, state) => `${name}|${city}|${state}`.toLowerCase().replace(/\s+/g, " ").trim();

let ledger = null;
function load() {
  if (ledger) return ledger;
  ledger = new Map();
  for (const f of existsSync(LEDGER_DIR) ? readdirSync(LEDGER_DIR).filter((f) => f.endsWith(".tsv")) : []) {
    const [, ...lines] = readFileSync(`${LEDGER_DIR}/${f}`, "utf8").split("\n").filter((l) => l.trim());
    for (const line of lines) {
      const cells = line.split("\t");
      const row = Object.fromEntries(COLS.map((c, i) => [c, (cells[i] ?? "").trim()]));
      ledger.set(keyOf(row.Name, row.City, row.State), row);
    }
  }
  return ledger;
}

function save(state) {
  const clean = (v) => String(v ?? "").replace(/[\t\n]/g, " ");
  const rows = [...load().values()].filter((r) => r.State === state);
  mkdirSync(LEDGER_DIR, { recursive: true });
  writeFileSync(fileOf(state), [COLS.join("\t"), ...rows.map((r) => COLS.map((c) => clean(r[c])).join("\t"))].join("\n") + "\n");
}

let spentNow = 0; // lookups this run that weren't written down (temporarily closed)

/** Lookups left today before the cap. */
export const leftToday = () => DAILY_CAP - spentNow - [...load().values()].filter((r) => r.Date === today()).length;

const norm = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
const FILLER = new Set(
  "the and of at a an by co company llc inc ltd studio studios events event weddings wedding photography photo films film video videography design designs floral florals flowers catering music band dj entertainment productions bakery cakes cake beauty makeup hair venue house farm barn estate".split(" "),
);
function sameName(ours, google) {
  const a = norm(ours);
  const b = norm(google);
  if (a.includes(b) || b.includes(a)) return true;
  const words = a.split(" ").filter((w) => w.length > 2 && !FILLER.has(w));
  if (!words.length) return a.replace(/ /g, "") === b.replace(/ /g, "");
  return words.filter((w) => new RegExp(`\\b${w}\\b`).test(b)).length / words.length >= 0.75;
}

async function call(url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Places API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

/**
 * Look a business up on Google. Returns { Result, "Place ID", ... } or null
 * when there's no key or today's cap is spent. A result only counts when its
 * name matches ours and its address is in the same state.
 */
export async function lookup({ name, city, state, website = "" }) {
  const hit = load().get(keyOf(name, city, state));
  if (hit) return hit;
  if (!KEY || leftToday() <= 0) return null;

  const { places = [] } = await call(`${API}/places:searchText`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": KEY,
      "x-goog-fieldmask": "places.id,places.displayName,places.formattedAddress,places.businessStatus",
    },
    body: JSON.stringify({ textQuery: `${name}, ${city}, ${state}`, regionCode: "US", pageSize: 5 }),
  });
  const abbr = ABBR[state];
  const inState = (p) => new RegExp(`,\\s*${abbr}\\b|\\b${state}\\b`).test(p.formattedAddress ?? "");
  const match = places.find((p) => inState(p) && sameName(name, p.displayName?.text ?? ""));
  const row = {
    Date: today(),
    Name: name,
    City: city,
    State: state,
    Website: website,
    Result: !match ? NOT_FOUND : match.businessStatus === "CLOSED_PERMANENTLY" ? CLOSED : OPEN,
    "Place ID": match?.id ?? "",
  };
  // Temporarily closed proves neither: don't write it down, so a later day
  // asks again.
  if (match?.businessStatus === "CLOSED_TEMPORARILY") {
    spentNow++;
    return { ...row, Result: NOT_FOUND };
  }
  load().set(keyOf(name, city, state), row);
  save(state);
  return row;
}

/**
 * Google's current address for a place, to compare against ours and then
 * discard (never store it or copy it into a listing). Place Details
 * Essentials: 10,000 free a month.
 */
export async function addressOf(placeId) {
  if (!KEY || !placeId) return null;
  const p = await call(`${API}/places/${encodeURIComponent(placeId)}`, {
    headers: { "x-goog-api-key": KEY, "x-goog-fieldmask": "formattedAddress" },
  });
  return p.formattedAddress ?? null;
}
