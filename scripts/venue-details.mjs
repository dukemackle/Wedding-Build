// Fills in Capacity and Price tier on venue batch rows that already exist, for
// the details backfill. Run with:
//
//   npm run venue-details -- list Ohio            venues in Ohio missing either, as TSV
//   npm run venue-details -- list Ohio --limit 60
//   npm run venue-details -- fill found.tsv       write what research found
//
// `fill` also takes Price from and Price basis (Rental, Package, Per person or
// Minimum), for the tier-only re-check: a row with a tier but no price gets the
// figure its own site publishes, and its tier is redrawn from that figure the
// way the importer would (tierFromPrice), so the two can't disagree. Blocks
// older than the price columns gain them at the end of their header.
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
const BASES = ["Rental", "Package", "Per person", "Minimum"];
// As tierFromPrice in src/lib/venue-pricing.ts.
const tierFor = (price, basis) => {
  const [classic, luxury] = basis === "Per person" ? [100, 200] : [6000, 15000];
  return price < classic ? "Simple" : price <= luxury ? "Classic" : "Luxury";
};
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
    const price = get("Price from").replace(/[$,]/g, "");
    const basis = BASES.find((b) => b.toLowerCase() === get("Price basis").toLowerCase()) ?? "";
    if ((price || get("Price basis")) && !(/^\d+$/.test(price) && +price > 0 && basis)) {
      console.error(`skip ${get("Website")}: Price from "${price}" / Price basis "${get("Price basis")}" isn't whole dollars plus one of ${BASES.join(", ")}`);
      continue;
    }
    if (capacity || tier || price) want.set(site(get("Website")), { capacity, tier, price, basis });
  }
  let filled = 0;
  const used = new Set();
  for (const file of files) {
    const path = `${DIR}/${file}`;
    const src = readFileSync(path, "utf8");
    const next = src.replace(/(tsv:\s*`)([^`]*)(`)/g, (all, open, tsv, close) => {
      const lines = tsv.split("\n");
      const headAt = lines.findIndex((l) => l.trim());
      let cols = lines[headAt].split("\t");
      const pricing = lines.slice(headAt + 1).some((l) => want.get(site(l.split("\t")[cols.indexOf("Website")] ?? ""))?.price);
      if (pricing && !cols.includes("Price from")) {
        // After Price tier (or Capacity), not at the end: a checker trims
        // trailing tabs, so empty cells there would read as missing.
        const at = (cols.includes("Price tier") ? cols.indexOf("Price tier") : cols.indexOf("Capacity")) + 1;
        for (let i = headAt; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cells = lines[i].split("\t");
          while (cells.length < cols.length) cells.push("");
          cells.splice(at, 0, ...(i === headAt ? ["Price from", "Price basis"] : ["", ""]));
          lines[i] = cells.join("\t");
        }
        cols = lines[headAt].split("\t");
      }
      const [w, c, t, p, b] = ["Website", "Capacity", "Price tier", "Price from", "Price basis"].map((name) => cols.indexOf(name));
      if (w < 0 || c < 0) return all;
      for (let i = headAt + 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cells = lines[i].split("\t");
        const hit = cells[w] && want.get(site(cells[w]));
        if (!hit) continue;
        while (cells.length < cols.length) cells.push("");
        let changed = false;
        if (hit.capacity && !cells[c].trim()) {
          cells[c] = hit.capacity;
          changed = true;
        }
        if (hit.tier && t >= 0 && !cells[t].trim()) {
          cells[t] = hit.tier;
          changed = true;
        }
        if (hit.price && p >= 0 && !cells[p].trim() && !cells[b].trim()) {
          cells[p] = hit.price;
          cells[b] = hit.basis;
          if (t >= 0 && cells[t].trim()) cells[t] = tierFor(+hit.price, hit.basis);
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
