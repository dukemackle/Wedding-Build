// Fills in Capacity and Price tier on venue batch rows that already exist, for
// the details backfill. Run with:
//
//   npm run venue-details -- list Ohio            venues in Ohio missing either, as TSV
//   npm run venue-details -- list Ohio --limit 60
//   npm run venue-details -- fill found.tsv       write what research found
//
// `list` prints Website, Name, City, Capacity, Price tier for each venue with a
// blank in either column: those missing a capacity first (most sites state
// one, few publish prices), then those missing only a tier, oldest first. `fill` reads a TSV with the
// columns Website, Capacity and Price tier (others are ignored), finds each
// venue's row by website in src/lib/batches/venues/ and writes only into a
// blank cell: a value already there is never changed. Capacity must be a whole
// number from 1 to 5000 and Price tier Simple, Classic or Luxury; anything
// else is reported and skipped. The importer then copies the new values onto
// live listings whose field is still blank.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const DIR = "src/lib/batches/venues";
const TIERS = ["Simple", "Classic", "Luxury"];
const site = (url) =>
  url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");

const [mode, arg, ...rest] = process.argv.slice(2);
const files = readdirSync(DIR).filter((f) => f.endsWith(".ts") && f !== "index.ts");

if (mode === "list") {
  if (!arg) throw new Error("Usage: venue-details list <State> [--limit N]");
  const limitAt = rest.indexOf("--limit");
  const limit = limitAt >= 0 ? Number(rest[limitAt + 1]) : Infinity;
  const out = [];
  for (const file of files) {
    for (const [, tsv] of readFileSync(`${DIR}/${file}`, "utf8").matchAll(/tsv:\s*`([^`]*)`/g)) {
      const [header, ...lines] = tsv.split("\n").filter((l) => l.trim());
      const cols = header.split("\t");
      for (const line of lines) {
        const cells = line.split("\t");
        const get = (c) => (cells[cols.indexOf(c)] ?? "").trim();
        if (get("State").toLowerCase() !== arg.toLowerCase() || !get("Website")) continue;
        if (get("Capacity") && get("Price tier")) continue;
        out.push({
          noCapacity: !get("Capacity"),
          line: [get("Website"), get("Name"), get("City"), get("Capacity"), get("Price tier")].join("\t"),
        });
      }
    }
  }
  const ordered = [...out.filter((r) => r.noCapacity), ...out.filter((r) => !r.noCapacity)];
  console.log(["Website\tName\tCity\tCapacity\tPrice tier", ...ordered.slice(0, limit).map((r) => r.line)].join("\n"));
  const short = out.filter((r) => r.noCapacity).length;
  console.error(`${out.length} venues in ${arg} missing a capacity or price tier (${short} without a capacity)`);
} else if (mode === "fill") {
  if (!arg) throw new Error("Usage: venue-details fill <found.tsv>");
  const [head, ...found] = readFileSync(arg, "utf8").split("\n").filter((l) => l.trim());
  const fcols = head.split("\t").map((c) => c.trim());
  const want = new Map();
  for (const line of found) {
    const cells = line.split("\t");
    const get = (c) => (cells[fcols.indexOf(c)] ?? "").trim();
    const capacity = get("Capacity");
    const tier = get("Price tier");
    if (capacity && !(/^\d+$/.test(capacity) && +capacity >= 1 && +capacity <= 5000)) {
      console.error(`skip ${get("Website")}: Capacity "${capacity}" isn't a whole number from 1 to 5000`);
      continue;
    }
    if (tier && !TIERS.includes(tier)) {
      console.error(`skip ${get("Website")}: Price tier "${tier}" isn't ${TIERS.join(", ")}`);
      continue;
    }
    if (capacity || tier) want.set(site(get("Website")), { capacity, tier });
  }
  let filled = 0;
  const used = new Set();
  for (const file of files) {
    const path = `${DIR}/${file}`;
    const src = readFileSync(path, "utf8");
    const next = src.replace(/(tsv:\s*`)([^`]*)(`)/g, (all, open, tsv, close) => {
      const lines = tsv.split("\n");
      const headAt = lines.findIndex((l) => l.trim());
      const cols = lines[headAt].split("\t");
      const [w, c, t] = ["Website", "Capacity", "Price tier"].map((name) => cols.indexOf(name));
      if (w < 0 || c < 0 || t < 0) return all;
      for (let i = headAt + 1; i < lines.length; i++) {
        const cells = lines[i].split("\t");
        const hit = cells[w] && want.get(site(cells[w]));
        if (!hit) continue;
        while (cells.length < cols.length) cells.push("");
        let changed = false;
        if (hit.capacity && !cells[c].trim()) {
          cells[c] = hit.capacity;
          changed = true;
        }
        if (hit.tier && !cells[t].trim()) {
          cells[t] = hit.tier;
          changed = true;
        }
        if (changed) {
          lines[i] = cells.join("\t");
          filled++;
        }
        used.add(site(cells[w]));
      }
      return open + lines.join("\n") + close;
    });
    if (next !== src) writeFileSync(path, next);
  }
  const missing = [...want.keys()].filter((k) => !used.has(k));
  for (const k of missing) console.error(`no batch row with website ${k}`);
  console.log(`${filled} venue rows filled in; ${missing.length} websites not found`);
} else {
  throw new Error("Usage: venue-details list <State> | fill <found.tsv>");
}
