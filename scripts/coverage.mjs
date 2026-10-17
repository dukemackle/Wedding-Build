// How far the venue and vendor batches are from the 50-state plan in
// scripts/coverage-plan.mjs. Run with:
//
//   npm run coverage                 every state, worst first, with totals
//   npm run coverage -- Ohio Iowa    what's missing in those states, by metro
//
// Counts rows in the batch files (src/lib/venue-batches.ts,
// src/lib/vendor-batches.ts and src/lib/batches/), not the live database.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import {
  AREA_ALIASES,
  CORE_CATEGORIES,
  FILL_DRY,
  FILL_TARGET,
  MAP_FILL,
  METROS,
  MIN_VENUES,
  PASS4_METROS,
  PER_CATEGORY,
  metroTarget,
} from "./coverage-plan.mjs";

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
        out.push({ area, state: get("State"), city: get("City").toLowerCase(), category: get("Category") });
      }
    }
  }
  return out;
}

// Businesses research found but left out (src/lib/batches/skipped/README.md).
function skipped() {
  const dir = "src/lib/batches/skipped";
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsv"))
    .flatMap((f) => {
      const [header, ...lines] = readFileSync(`${dir}/${f}`, "utf8").split("\n").filter((l) => l.trim());
      const cols = header.split("\t");
      return lines.map((line) => {
        const cells = line.split("\t");
        const get = (c) => (cells[cols.indexOf(c)] ?? "").trim();
        return { kind: get("Kind"), state: get("State"), city: get("City").toLowerCase(), reason: get("Reason") };
      });
    });
}

function skippedLine(list) {
  if (!list.length) return null;
  const counts = {};
  for (const s of list) counts[s.reason] = (counts[s.reason] ?? 0) + 1;
  const reasons = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([r, n]) => `${r} ${n}`)
    .join(", ");
  const kinds = ["Venue", "Vendor"].map((k) => {
    const n = list.filter((s) => s.kind === k).length;
    return `${n} ${k.toLowerCase()}${n === 1 ? "" : "s"}`;
  });
  return `Skipped: ${kinds.join(", ")} (${reasons})`;
}

const venues = rows("venue");
const left = skipped();
const vendors = rows("vendor");

// Pass 4 stage 1: towns with no listings nearby. Stage 2 (doubled targets and
// PASS4_METROS) starts once every one of them is done.
const fill = Object.entries(MAP_FILL).flatMap(([state, towns]) =>
  towns.map(({ town, near }) => {
    const cities = new Set([town, ...near].map((c) => c.toLowerCase()));
    const inArea = (r) => r.state === state && cities.has(r.city);
    const venueHave = venues.filter(inArea).length;
    const vendorHave = vendors.filter(inArea).length;
    const dry = left.filter(inArea).length >= FILL_DRY;
    const venueNeed = dry ? 0 : Math.max(0, FILL_TARGET.venues - venueHave);
    const vendorNeed = dry ? 0 : Math.max(0, FILL_TARGET.vendors - vendorHave);
    return { state, town, near, venueHave, vendorHave, venueNeed, vendorNeed, done: venueNeed + vendorNeed === 0 };
  }),
);
const stage2 = fill.every((t) => t.done);

const report = Object.entries(METROS).map(([state, base]) => {
  const metros = stage2 ? [...base, ...(PASS4_METROS[state] ?? [])] : base;
  const towns = fill.filter((t) => t.state === state && !t.done);
  const venueHave = venues.filter((v) => v.state === state).length;
  const venueTarget = Math.max(MIN_VENUES, metros.reduce((s, m) => s + metroTarget(state, m, stage2).venues, 0));
  const metroGaps = metros.map((metro) => {
    const here = vendors.filter((v) => v.state === state && v.area === metro);
    // Pass 1 only asks for the standard 3 per category in the first metro.
    const per = metroTarget(state, metro, stage2).perCategory;
    const missing = CORE_CATEGORIES.map((c) => [c, per - here.filter((v) => v.category === c).length]).filter(
      ([, n]) => n > 0,
    );
    return { metro, have: here.length, missing };
  });
  const vendorNeed =
    metroGaps.reduce((s, m) => s + m.missing.reduce((t, [, n]) => t + n, 0), 0) +
    towns.reduce((s, t) => s + t.vendorNeed, 0);
  const venueNeed = Math.max(0, venueTarget - venueHave) + towns.reduce((s, t) => s + t.venueNeed, 0);
  const first = vendors.filter((v) => v.state === state && v.area === metros[0]);
  const pass1 = venueHave >= MIN_VENUES && CORE_CATEGORIES.every((c) => first.filter((v) => v.category === c).length >= PER_CATEGORY);
  return { state, venueHave, venueTarget, venueNeed, metroGaps, towns, vendorNeed, pass1 };
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
    for (const t of r.towns) {
      console.log(
        `  Map fill, ${t.town}: ${t.venueHave} venues, ${t.vendorHave} vendors; ` +
          `still needs ${[t.venueNeed && `${t.venueNeed} venues`, t.vendorNeed && `${t.vendorNeed} vendors`].filter(Boolean).join(", ")}` +
          (t.near.length ? ` (City may also be ${t.near.join(", ")})` : ""),
      );
    }
    const line = skippedLine(left.filter((s) => s.state === r.state));
    if (line) console.log(`  ${line}`);
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
    stage2
      ? "\nPass 4 stage 2: map filled; targets doubled and the PASS4_METROS markets added."
      : `\nPass 4 stage 1 (fill the map): ${fill.filter((t) => t.done).length}/${fill.length} blank towns done. ` +
          "Doubled targets start when all are done.",
  );
  console.log(
    `${report.filter((r) => r.pass1).length}/${report.length} states meet pass 1. ` +
      `Still to add for the current stage: ${sum("venueNeed")} venues, ${sum("vendorNeed")} vendors.`,
  );
  const line = skippedLine(left);
  if (line) {
    const listed = venues.length + vendors.length;
    const pct = Math.round((100 * left.length) / (listed + left.length));
    console.log(`${line}; ${pct}% of the businesses research has found.`);
  }
}
