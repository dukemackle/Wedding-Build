// How far the venue and vendor batches are from the 50-state plan in
// scripts/coverage-plan.mjs. Run with:
//
//   npm run coverage                 every state, worst first, with totals
//   npm run coverage -- Ohio Iowa    what's missing in those states, by metro
//
// Counts rows in the batch files (src/lib/venue-batches.ts,
// src/lib/vendor-batches.ts and src/lib/batches/), not the live database.

import { readdirSync, readFileSync } from "node:fs";
import { AREA_ALIASES, CORE_CATEGORIES, METROS, MIN_VENUES, PER_CATEGORY, VENUES_PER_METRO } from "./coverage-plan.mjs";

function rows(kind) {
  const files = [
    `src/lib/${kind}-batches.ts`,
    ...readdirSync(`src/lib/batches/${kind}s`)
      .filter((f) => f.endsWith(".ts") && f !== "index.ts")
      .map((f) => `src/lib/batches/${kind}s/${f}`),
  ];
  const out = [];
  for (const file of files) {
    for (const [, name, tsv] of readFileSync(file, "utf8").matchAll(/name:\s*"([^"]+)",\s*tsv:\s*`([^`]*)`/g)) {
      const [header, ...lines] = tsv.split("\n").filter((l) => l.trim());
      const cols = header.split("\t");
      const short = name.split(":")[0].trim();
      const area = AREA_ALIASES[short] ?? short;
      for (const line of lines) {
        const cells = line.split("\t");
        const get = (c) => (cells[cols.indexOf(c)] ?? "").trim();
        out.push({ area, state: get("State"), category: get("Category") });
      }
    }
  }
  return out;
}

const venues = rows("venue");
const vendors = rows("vendor");

const report = Object.entries(METROS).map(([state, metros]) => {
  const venueHave = venues.filter((v) => v.state === state).length;
  const venueTarget = Math.max(MIN_VENUES, VENUES_PER_METRO * metros.length);
  const metroGaps = metros.map((metro) => {
    const here = vendors.filter((v) => v.state === state && v.area === metro);
    const missing = CORE_CATEGORIES.map((c) => [c, PER_CATEGORY - here.filter((v) => v.category === c).length]).filter(
      ([, n]) => n > 0,
    );
    return { metro, have: here.length, missing };
  });
  const vendorNeed = metroGaps.reduce((s, m) => s + m.missing.reduce((t, [, n]) => t + n, 0), 0);
  const venueNeed = Math.max(0, venueTarget - venueHave);
  const pass1 = venueHave >= MIN_VENUES && metroGaps[0].missing.length === 0;
  return { state, venueHave, venueTarget, venueNeed, metroGaps, vendorNeed, pass1 };
});

// Longest names first, each removed once matched, so "West Virginia" doesn't
// also pick Virginia and "Arkansas" doesn't pick Kansas.
let asked = process.argv.slice(2).join(" ").toLowerCase();
const picked = [];
for (const r of [...report].sort((a, b) => b.state.length - a.state.length)) {
  const name = r.state.toLowerCase();
  if (asked.includes(name)) {
    picked.push(r);
    asked = asked.replace(name, " ");
  }
}
picked.sort((a, b) => a.state.localeCompare(b.state));

if (picked.length) {
  for (const r of picked) {
    console.log(`\n${r.state}: venues ${r.venueHave}/${r.venueTarget}${r.pass1 ? "  (pass 1 met)" : ""}`);
    for (const m of r.metroGaps) {
      const gaps = m.missing.map(([c, n]) => `${c} ${n}`).join(", ");
      console.log(`  ${m.metro}: ${m.have} vendors${gaps ? `; still needs ${gaps}` : "; core categories filled"}`);
    }
  }
} else {
  const sorted = [...report].sort((a, b) => a.pass1 - b.pass1 || b.venueNeed + b.vendorNeed - (a.venueNeed + a.vendorNeed));
  console.log("State                  Venues     Vendors still needed   Pass 1");
  for (const r of sorted) {
    console.log(
      `${r.state.padEnd(22)} ${`${r.venueHave}/${r.venueTarget}`.padEnd(10)} ${String(r.vendorNeed).padEnd(22)} ${r.pass1 ? "yes" : "no"}`,
    );
  }
  const sum = (k) => report.reduce((s, r) => s + r[k], 0);
  console.log(
    `\n${report.filter((r) => r.pass1).length}/${report.length} states meet pass 1. ` +
      `Still to add for the full plan: ${sum("venueNeed")} venues, ${sum("vendorNeed")} vendors.`,
  );
}
