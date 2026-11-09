// Looks up skipped businesses whose own site blocks our checker on Google
// (scripts/places.mjs), up to the daily cap, and moves each to a reason the
// batch routines can act on:
//
//   Open      -> "Confirmed on Google, site blocks us": add it to a batch
//   Closed    -> "Closed"
//   Not found -> "Not on Google, site blocks us": leave it, invite it later
//
//   npm run places:check                 every state, up to today's cap
//   npm run places:check -- --state ohio one state
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { CLOSED, KEY, NOT_FOUND, OPEN, leftToday, lookup } from "./places.mjs";

const DIR = "src/lib/batches/skipped";
const BLOCKED = "Site blocks automated visits, unconfirmed";
const NEXT = { [OPEN]: "Confirmed on Google, site blocks us", [CLOSED]: "Closed", [NOT_FOUND]: "Not on Google, site blocks us" };
const i = process.argv.indexOf("--state");
const STATE = i === -1 ? null : process.argv[i + 1].toLowerCase().replace(/\s+/g, "-");

if (!KEY) {
  console.log("GOOGLE_PLACES_API_KEY isn't set; nothing looked up.");
  process.exit(1);
}

const tally = { [OPEN]: 0, [CLOSED]: 0, [NOT_FOUND]: 0 };
let stopped = false;
for (const f of readdirSync(DIR).filter((f) => f.endsWith(".tsv") && (!STATE || f === `${STATE}.tsv`))) {
  const lines = readFileSync(`${DIR}/${f}`, "utf8").split("\n");
  const cols = lines[0].split("\t");
  const at = (c) => cols.indexOf(c);
  let changed = false;
  for (let n = 1; n < lines.length && !stopped; n++) {
    const cells = lines[n].split("\t");
    if (cells[at("Reason")]?.trim() !== BLOCKED) continue;
    if (leftToday() <= 0) {
      stopped = true;
      break;
    }
    const row = await lookup({
      name: cells[at("Name")].trim(),
      city: cells[at("City")].trim(),
      state: cells[at("State")].trim(),
      website: cells[at("Link")]?.trim(),
    });
    if (!row) continue;
    tally[row.Result]++;
    cells[at("Reason")] = NEXT[row.Result];
    lines[n] = cells.join("\t");
    changed = true;
  }
  if (changed) writeFileSync(`${DIR}/${f}`, lines.join("\n"));
  if (stopped) break;
}

console.log(`Open ${tally[OPEN]}, closed ${tally[CLOSED]}, not found ${tally[NOT_FOUND]}.`);
console.log(stopped ? "Stopped at today's cap; run again tomorrow." : "Every blocked row in scope is checked.");
