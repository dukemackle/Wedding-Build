// Builds public/boundaries/<ST>/<city-slug>.json: the outline of every city our venues and
// vendors list, drawn on the browse maps when a couple picks that city.
//
//   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... npm run boundaries:build
//
// Outlines are the Census Bureau's cartographic boundary files for places
// (public domain), simplified to ~100 m, about a pixel at the zoom a
// picked city opens at. One small file per city (1-2 KB), so picking a city
// fetches only its own outline; only cities we list are kept. A city the Census doesn't
// have as a place (most New England towns, neighbourhoods) gets no outline and
// the map simply shows none. Re-run after big batches to pick up new cities.

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { US_STATES } from "../src/lib/us-states.ts";
import { boundarySlug } from "../src/lib/boundary-slug.ts";

const YEAR = 2023;
const TOLERANCE = 0.001; // degrees, ~100 m
const OUT = new URL("../public/boundaries/", import.meta.url);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

/** Every city/state pair a published venue or vendor lists. */
async function listedCities() {
  const byState = new Map();
  for (const table of ["venues", "vendors"]) {
    for (let from = 0; ; from += 1000) {
      const res = await fetch(`${url}/rest/v1/${table}?select=city,state&city=not.is.null`, {
        headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + 999}` },
      });
      if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
      const rows = await res.json();
      for (const { city, state } of rows) {
        if (!state) continue;
        if (!byState.has(state)) byState.set(state, new Set());
        byState.get(state).add(city);
      }
      if (rows.length < 1000) break;
    }
  }
  return byState;
}

/** Census names to compare against ours: "St." and "Saint" alike, case ignored. */
function norm(name) {
  return name.toLowerCase().replace(/^st\.? /, "saint ").replace(/ st\.? /g, " saint ").trim();
}

// --- Minimal shapefile reading: polygons (.shp) and their attributes (.dbf) ---

function readDbf(buf) {
  const count = buf.readUInt32LE(4);
  const headerLen = buf.readUInt16LE(8);
  const recordLen = buf.readUInt16LE(10);
  const fields = [];
  for (let at = 32; buf[at] !== 0x0d; at += 32) {
    fields.push({ name: buf.toString("latin1", at, at + 11).replace(/\0.*$/, ""), len: buf[at + 16] });
  }
  const rows = [];
  for (let i = 0; i < count; i++) {
    let at = headerLen + i * recordLen + 1;
    const row = {};
    for (const f of fields) {
      row[f.name] = buf.toString("utf8", at, at + f.len).trim();
      at += f.len;
    }
    rows.push(row);
  }
  return rows;
}

/** Each record's rings as [lat, lng] arrays (shapefiles store x = lng first). */
function readShp(buf) {
  const shapes = [];
  let at = 100;
  while (at < buf.length) {
    const len = buf.readInt32BE(at + 4) * 2;
    const body = at + 8;
    if (buf.readInt32LE(body) === 5) {
      const numParts = buf.readInt32LE(body + 36);
      const numPoints = buf.readInt32LE(body + 40);
      const parts = [];
      for (let p = 0; p < numParts; p++) parts.push(buf.readInt32LE(body + 44 + p * 4));
      const pts = body + 44 + numParts * 4;
      const rings = parts.map((start, p) => {
        const end = p + 1 < numParts ? parts[p + 1] : numPoints;
        const ring = [];
        for (let k = start; k < end; k++) {
          ring.push([buf.readDoubleLE(pts + k * 16 + 8), buf.readDoubleLE(pts + k * 16)]);
        }
        return ring;
      });
      shapes.push(rings);
    } else {
      shapes.push([]);
    }
    at = body + len;
  }
  return shapes;
}

// --- Geometry ---

/** Signed area; shapefile outer rings run clockwise (negative in lat/lng order here). */
function area(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][1] + ring[i][1]) * (ring[j][0] - ring[i][0]);
  }
  return a / 2;
}

function simplify(points, tol) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    const [ay, ax] = points[s];
    const [by, bx] = points[e];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1e-12;
    let max = 0;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = Math.abs(dy * (points[i][1] - ax) - dx * (points[i][0] - ay)) / len;
      if (d > max) {
        max = d;
        idx = i;
      }
    }
    if (max > tol) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const round = (n) => Math.round(n * 1e4) / 1e4;

/**
 * Rings grouped into polygons (outer ring, then its holes), simplified, with
 * slivers smaller than 0.5% of the largest part dropped.
 */
function toPolygons(rings) {
  const sized = rings.map((r) => ({ ring: r, a: area(r) }));
  const largest = Math.max(...sized.map((s) => Math.abs(s.a)));
  const polygons = [];
  for (const { ring, a } of sized) {
    if (Math.abs(a) < largest * 0.005) continue;
    // A closed ring starts and ends on one point, which gives Douglas-Peucker
    // no baseline, so simplify each half separately.
    const mid = Math.floor(ring.length / 2);
    const simple = [...simplify(ring.slice(0, mid + 1), TOLERANCE).slice(0, -1), ...simplify(ring.slice(mid), TOLERANCE)]
      .map(([lat, lng]) => [round(lat), round(lng)]);
    if (simple.length < 4) continue;
    simple.pop(); // closing point; Leaflet closes rings itself
    // In a Census file each hole follows the outer ring it sits in.
    if (a < 0 || polygons.length === 0) polygons.push([simple]);
    else polygons[polygons.length - 1].push(simple);
  }
  return polygons;
}

// --- Run ---

const byState = await listedCities();
const work = mkdtempSync(join(tmpdir(), "boundaries-"));
mkdirSync(OUT, { recursive: true });
let matched = 0;
let total = 0;
const missing = [];

for (const [fips, name, abbr] of US_STATES) {
  const cities = byState.get(name);
  if (!cities?.size) continue;
  const base = `cb_${YEAR}_${fips}_place_500k`;
  const zip = join(work, `${base}.zip`);
  const res = await fetch(`https://www2.census.gov/geo/tiger/GENZ${YEAR}/shp/${base}.zip`);
  if (!res.ok) throw new Error(`${name}: Census download ${res.status}`);
  writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
  execFileSync("unzip", ["-o", "-q", zip, `${base}.shp`, `${base}.dbf`, "-d", work]);
  const rows = readDbf(readFileSync(join(work, `${base}.dbf`)));
  const shapes = readShp(readFileSync(join(work, `${base}.shp`)));

  // Incorporated places win over a census-designated place of the same name.
  const places = new Map();
  rows.forEach((row, i) => {
    const names = [row.NAME];
    // "Nashville-Davidson metropolitan government (balance)" is Nashville.
    const balance = row.NAME.match(/^([^-(]+)[-\s].*\(balance\)$/);
    if (balance) names.push(balance[1]);
    for (const n of names) {
      const k = norm(n);
      const prev = places.get(k);
      if (!prev || (prev.cdp && row.LSAD !== "57")) places.set(k, { i, cdp: row.LSAD === "57" });
    }
  });

  const dir = new URL(`${abbr}/`, OUT);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  let written = 0;
  for (const city of [...cities].sort()) {
    total++;
    const hit = places.get(norm(city));
    const polygons = hit && toPolygons(shapes[hit.i]);
    if (polygons?.length) {
      writeFileSync(new URL(`${boundarySlug(city)}.json`, dir), JSON.stringify(polygons));
      written++;
      matched++;
    } else {
      missing.push(`${city}, ${abbr}`);
    }
  }
  console.log(`${abbr}: ${written}/${cities.size} cities`);
}

rmSync(work, { recursive: true, force: true });
console.log(`\n${matched}/${total} cities outlined. No Census place for ${missing.length}.`);
if (process.argv.includes("--verbose")) console.log(missing.join("\n"));
