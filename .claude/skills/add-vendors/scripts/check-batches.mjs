#!/usr/bin/env node
// Checks src/lib/vendor-batches.ts before a vendor PR goes up, and prints
// coverage so the next batch can be picked. Run from the repo root:
//   node .claude/skills/add-vendors/scripts/check-batches.mjs
// Exits 1 on any problem that would make /admin/vendors skip or reject a row.

import { readFileSync } from "node:fs";

const src = readFileSync("src/lib/vendor-batches.ts", "utf8");
const options = readFileSync("src/lib/wedding-options.ts", "utf8");

const catBlock = options.match(/PREFERRED_VENDOR_CATEGORIES = \[([\s\S]*?)\]/)[1];
const categories = [...catBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]).filter((c) => c !== "Lodging");

// New batches carry Address after Category; batches from before it don't.
const HEADER = "Name\tCategory\tAddress\tCity\tState\tService area\tDescription\tEmail\tPhone\tWebsite\tInstagram";
const OLD_HEADER = HEADER.replace("\tAddress", "");
const siteKey = (w) =>
  w.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[?#].*$/, "").replace(/\/+$/, "");

const problems = [];
const warnings = [];
const seenSites = new Map();
const seenNames = new Map();
const coverage = new Map(); // area -> Map(category -> count)

const batches = [...src.matchAll(/name: "([^"]+)",\s*tsv: `([\s\S]*?)`/g)];
for (const [, batchName, tsv] of batches) {
  const area = batchName.split(":")[0].trim();
  const lines = tsv.split("\n").filter((l) => l.trim() !== "");
  const hasAddress = lines[0] === HEADER;
  if (!hasAddress && lines[0] !== OLD_HEADER) problems.push(`${batchName}: header row differs from the standard columns`);
  const width = hasAddress ? 11 : 10;
  for (const line of lines.slice(1)) {
    const cols = line.split("\t");
    const [name, category, address, city, state, , description, email, , website, instagram] = hasAddress
      ? cols
      : [cols[0], cols[1], undefined, ...cols.slice(2)];
    const where = `${batchName} → ${name || "(no name)"}`;
    if (cols.length > width + 2) problems.push(`${where}: ${cols.length} columns (a stray tab?)`);
    if (cols.length < width) problems.push(`${where}: only ${cols.length} columns (should be ${width})`);
    if (address && /\b(p\.?\s*o\.?\s*box|post office box)\b/i.test(address)) problems.push(`${where}: Address is a PO Box`);
    if (address && /\b\d{5}\s*$/.test(address)) problems.push(`${where}: Address includes the ZIP -- street line only`);
    if (!name) problems.push(`${where}: no name`);
    if (!categories.includes(category)) problems.push(`${where}: category "${category}" isn't one we list`);
    if (!city || !state) warnings.push(`${where}: missing city or state`);
    if (!website) problems.push(`${where}: no website (leave out vendors without a working site)`);
    if (!description) warnings.push(`${where}: no description`);
    else if (description.length > 200) warnings.push(`${where}: description is ${description.length} chars (keep it to one sentence)`);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push(`${where}: email "${email}" doesn't look like an address`);
    if (website && !/^https?:\/\//.test(website)) problems.push(`${where}: website should start with https://`);
    if (instagram && !/^https:\/\/(www\.)?instagram\.com\//.test(instagram)) problems.push(`${where}: Instagram should be a full instagram.com URL`);

    if (website) {
      const key = siteKey(website);
      if (seenSites.has(key)) warnings.push(`${where}: same website as ${seenSites.get(key)} — only the first is added`);
      else seenSites.set(key, where);
    }
    const nameKey = (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (nameKey && seenNames.has(nameKey)) warnings.push(`${where}: same name as ${seenNames.get(nameKey)}`);
    else seenNames.set(nameKey, where);

    if (!coverage.has(area)) coverage.set(area, new Map());
    const byCat = coverage.get(area);
    byCat.set(category, (byCat.get(category) || 0) + 1);
  }
}

console.log(`${batches.length} batches, ${seenSites.size} vendors with unique websites.\n`);
console.log("Coverage (area: category count; categories with none are listed as missing):");
for (const [area, byCat] of coverage) {
  const have = [...byCat].map(([c, n]) => `${c} ${n}`).join(", ");
  const missing = categories.filter((c) => c !== "Other" && !byCat.has(c));
  console.log(`- ${area}: ${have}`);
  if (missing.length) console.log(`    missing: ${missing.join(", ")}`);
}

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ! ${w}`);
}
if (problems.length) {
  console.log(`\n${problems.length} problem(s) — fix before opening the PR:`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exit(1);
}
console.log("\nNo blocking problems.");
