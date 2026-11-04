// Rechecks every "Site dead" row in src/lib/batches/skipped/*.tsv, because
// that reason used to cover sites that were only turning our checker away.
//
//   npm run recheck:skipped            report only
//   npm run recheck:skipped -- --write update the Reason column
//
// Each site gets one honest visit, as YouDoIDoBot, the same as
// verify-batches. Nothing is disguised or retried another way. Results:
//   - loads           -> "Site back up": a candidate to research into a batch again
//   - 401/403/429/502/503/520 -> "Site blocks automated visits, unconfirmed": real, needs a second source
//   - anything else   -> stays "Site dead"
// Directory and social links (The Knot, WeddingWire, Facebook...) aren't the
// business's own site, so those rows are left alone.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const DIR = "src/lib/batches/skipped";
const WRITE = process.argv.includes("--write");
const UA = "Mozilla/5.0 (compatible; YouDoIDoBot/1.0; +https://youdoido.com)";
const NOT_OWN_SITE =
  /theknot|weddingwire|wedding-spot|zola\.com|facebook|instagram|google\.|goo\.gl|yelp|thumbtack|tiktok|linktr\.ee/i;
const PARKED =
  /domain (?:is|may be) for sale|buy this domain|this domain is parked|parked free|domain has expired|hugedomains|sedo domain parking|website is (?:currently )?unavailable|account (?:has been )?suspended/i;
const BLOCKED = "Site blocks automated visits, unconfirmed";
const UP = "Site back up";

async function check(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: { "user-agent": UA, accept: "text/html,*/*", "accept-language": "en-US" },
    });
    const html = res.ok || res.status === 202 ? await res.text() : "";
    if ([401, 403, 429, 502, 503, 520].includes(res.status) || (res.status === 202 && html.length < 2000)) return BLOCKED;
    if (res.status >= 400) return null;
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, " ");
    if (PARKED.test(text) || text.replace(/\s+/g, " ").trim().length < 200) return null;
    return UP;
  } catch {
    return null;
  }
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".tsv"));
const jobs = [];
const sheets = files.map((f) => {
  const lines = readFileSync(`${DIR}/${f}`, "utf8").split("\n");
  const cols = lines[0].split("\t");
  const [iReason, iLink] = [cols.indexOf("Reason"), cols.indexOf("Link")];
  lines.forEach((line, n) => {
    if (!n || !line.trim()) return;
    const cells = line.split("\t");
    const link = (cells[iLink] ?? "").trim();
    if (cells[iReason]?.trim() !== "Site dead" || !/^https?:\/\//.test(link) || NOT_OWN_SITE.test(link)) return;
    jobs.push({ f, n, cells, iReason, link });
  });
  return { f, lines };
});

console.log(`Rechecking ${jobs.length} "Site dead" row(s)...`);
const tally = { [UP]: [], [BLOCKED]: [], dead: 0 };
let next = 0, done = 0;
await Promise.all(
  Array.from({ length: 12 }, async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const result = await check(j.link);
      if (result) {
        tally[result].push(j);
        j.cells[j.iReason] = result;
        sheets.find((s) => s.f === j.f).lines[j.n] = j.cells.join("\t");
      } else tally.dead++;
      if (++done % 250 === 0) console.log(`  ${done}/${jobs.length}`);
    }
  }),
);

const by = (list, i) =>
  Object.entries(list.reduce((m, j) => ((m[j.cells[i]] = (m[j.cells[i]] ?? 0) + 1), m), {}))
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
for (const [label, list] of [[UP, tally[UP]], [BLOCKED, tally[BLOCKED]]]) {
  const v = list.filter((j) => j.cells[0] === "Venue").length;
  console.log(`\n${label}: ${list.length} (${v} venues, ${list.length - v} vendors)`);
  if (list.length) console.log(`  by state: ${by(list, 4)}`);
}
console.log(`\nStill dead: ${tally.dead}`);
if (WRITE) {
  for (const s of sheets) writeFileSync(`${DIR}/${s.f}`, s.lines.join("\n"));
  console.log("Reasons updated.");
} else console.log("Report only; add -- --write to update the files.");
