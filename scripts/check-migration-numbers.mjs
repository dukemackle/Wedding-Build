// Fails when two migration files share a number, so "run migration 0158"
// always names one file. The pairs below shipped before this check; they are
// tracked by full file name (supabase/check-missing-migrations.sql), so they
// stay as they are rather than being renamed under the database.
import { readdirSync } from "node:fs";

const GRANDFATHERED = new Set([
  "0086", "0087", "0090", "0093", "0099", "0101", "0106", "0110",
  "0121", "0129", "0143", "0144", "0147", "0149", "0157",
]);

const files = readdirSync(new URL("../supabase/migrations/", import.meta.url)).filter((f) => f.endsWith(".sql"));
const byNumber = new Map();
for (const f of files) {
  const n = f.slice(0, 4);
  byNumber.set(n, [...(byNumber.get(n) ?? []), f]);
}
const clashes = [...byNumber].filter(([n, list]) => list.length > 1 && !GRANDFATHERED.has(n));
if (clashes.length) {
  for (const [, list] of clashes) console.error(`Migration number used twice: ${list.join(", ")}`);
  const next = String(Math.max(...[...byNumber.keys()].map(Number)) + 1).padStart(4, "0");
  console.error(`Renumber the newer file. Next free number: ${next}.`);
  process.exit(1);
}
