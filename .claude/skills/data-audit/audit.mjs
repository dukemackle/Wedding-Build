#!/usr/bin/env node
// Data audit for venues and vendors. See SKILL.md next to this file.
//
//   node .claude/skills/data-audit/audit.mjs [--venues venues.csv] [--vendors vendors.csv]
//        [--out report.md] [--json findings.json] [--fixes data-audit-fixes.json]
//        [--no-web] [--stale-days 180]
//
// With no CSVs it audits the bundled batches (src/lib/*-batches.ts and the
// per-state files in src/lib/batches/), which
// have no photo, price or "last checked" columns, so those checks are skipped.
// The CSVs are the exports from /admin/venues and /admin/vendors (Export
// button), which carry every column the audit reads.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);
const STALE_DAYS = Number(opt("stale-days") ?? 180);
const ROOT = resolve(import.meta.dirname, "../../..");

// ---------- loading ----------

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim()));
}

function toRecords(table, origin) {
  const [head, ...body] = table;
  return body.map((cells, i) => {
    const rec = { origin: `${origin} row ${i + 2}` };
    head.forEach((h, j) => (rec[h.trim()] = (cells[j] ?? "").trim()));
    return rec;
  });
}

function loadCsv(path) {
  return toRecords(parseCsv(readFileSync(path, "utf8")), basename(path));
}

function loadBatches(file) {
  const src = readFileSync(resolve(ROOT, file), "utf8");
  const out = [];
  for (const m of src.matchAll(/name:\s*"([^"]+)",\s*tsv:\s*`([^`]*)`/g)) {
    const table = m[2].split("\n").filter((l) => l.trim()).map((l) => l.split("\t"));
    out.push(...toRecords(table, `${file} "${m[1]}"`));
  }
  return out;
}

const sets = [];
const venuesCsv = opt("venues"), vendorsCsv = opt("vendors");
if (venuesCsv || vendorsCsv) {
  if (venuesCsv) sets.push({ kind: "venue", rows: loadCsv(venuesCsv), fromDb: true });
  if (vendorsCsv) sets.push({ kind: "vendor", rows: loadCsv(vendorsCsv), fromDb: true });
} else {
  // The older shared file plus one file per state under src/lib/batches/.
  const batchFiles = (kind) => [
    `src/lib/${kind}-batches.ts`,
    ...readdirSync(resolve(ROOT, `src/lib/batches/${kind}s`))
      .filter((f) => f.endsWith(".ts") && f !== "index.ts")
      .map((f) => `src/lib/batches/${kind}s/${f}`),
  ];
  sets.push({ kind: "venue", rows: batchFiles("venue").flatMap(loadBatches), fromDb: false });
  sets.push({ kind: "vendor", rows: batchFiles("vendor").flatMap(loadBatches), fromDb: false });
}

// ---------- helpers ----------

const STOP = /\b(the|and|at|of|llc|inc|co|company|weddings?|events?|venue|studios?|photography|catering|florals?|designs?)\b/g;
const normName = (s = "") => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9 ]/g, " ").replace(STOP, " ").replace(/\s+/g, " ").trim();
const host = (url = "") => {
  try { return new URL(/^https?:/i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return ""; }
};
// example.co.uk-style suffixes are rare here; two labels is good enough.
const domain = (h) => h.split(".").slice(-2).join(".");
// Mirrors importSourceId in src/lib/venue-import.ts.
const sourceId = (url = "") =>
  url.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[?#].*$/, "").replace(/\/+$/, "");
const digits = (s = "") => s.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
const label = (r) => `${r.Name}${r.City ? ` (${r.City}${r.State ? `, ${r.State}` : ""})` : ""}`;
const has = (rows, col) => rows.length > 0 && col in rows[0];

const findings = []; // { kind, check, severity, name, detail, origin, website }
// Rows with a high or medium finding, so the fixes file never marks them checked.
const flagged = new Set();
const add = (kind, check, severity, r, detail) => {
  findings.push({ kind, check, severity, name: label(r), detail, origin: r.origin, website: r.Website ?? "" });
  if (severity === "high" || severity === "medium") flagged.add(r.origin);
};

// ---------- offline checks ----------

for (const { kind, rows, fromDb } of sets) {
  // Duplicates: same website, same phone, or same cleaned-up name in one city.
  const groups = [
    // The importer's source_id, so a clash here also means the second row
    // never imports (the batch check treats it as already present).
    ["website", (r) => sourceId(r.Website)],
    ["phone", (r) => (digits(r.Phone).length === 10 ? digits(r.Phone) : "")],
    ["name + city", (r) => (normName(r.Name) ? `${normName(r.Name)}|${(r.City ?? "").toLowerCase()}` : "")],
  ];
  const reported = new Set();
  for (const [by, keyOf] of groups) {
    const map = new Map();
    for (const r of rows) {
      const k = keyOf(r);
      if (k) map.set(k, [...(map.get(k) ?? []), r]);
    }
    for (const [k, list] of map) {
      if (list.length < 2) continue;
      const sig = list.map((r) => r.origin).sort().join("|");
      if (reported.has(sig)) continue;
      reported.add(sig);
      if (by !== "phone") list.forEach((r) => flagged.add(r.origin));
      add(kind, by === "phone" ? "shared phone" : "duplicate", by === "phone" ? "low" : "high", list[0], `Same ${by} (${k.split("|")[0]}): ${list.map((r) => `${label(r)} [${r.origin}]`).join("; ")}`);
    }
  }

  for (const r of rows) {
    if (fromDb && r.Live === "no") continue; // hidden already; nobody sees it
    if (!r.Website) add(kind, "no website", "medium", r, "No website on file, so it can't be re-checked.");
    if (has(rows, "Email") && has(rows, "Phone") && !r.Email && !r.Phone)
      add(kind, "no contact", "low", r, "No email and no phone.");
    if (has(rows, "Photos") && Number(r.Photos || 0) === 0)
      add(kind, "no photos", "low", r, "No photos; the card shows a placeholder.");
    if (has(rows, "Price from")) {
      const tier = has(rows, "Price tier") ? r["Price tier"] : "";
      if (!r["Price from"] && !tier) add(kind, "no price", "low", r, "No starting price or price tier.");
    }
    if (has(rows, "Last checked")) {
      const d = r["Last checked"];
      const age = d && d !== "never" ? (Date.now() - Date.parse(d)) / 864e5 : Infinity;
      if (age > STALE_DAYS)
        add(kind, "stale", "low", r, d === "never" || !d ? "Never verified." : `Last verified ${d} (${Math.round(age)} days ago).`);
    }
  }
}

// ---------- website checks ----------

// Phrases a closed business leaves on its site. Kept narrow on purpose:
// "we are closed on Mondays" and "after the garden has closed" are opening
// hours, not closures.
const CLOSED = [
  /permanently closed/i, /no longer (in business|operating|hosting|accepting (new )?(bookings|events|weddings)|booking)/i,
  /(have|has) (permanently )?closed (our|its) doors/i, /closing (our|its) doors/i, /closed for good/i,
  /ceased (operations|trading)/i, /(final|last) (season|weddings?) (was|will be)/i,
  /not (currently )?(booking|accepting) (new )?(events|weddings|inquiries)/i,
];
const PARKED = [
  /domain (is )?(may be )?for sale/i, /buy this domain/i, /this domain (has expired|is parked)/i, /parked (free|domain)/i,
  /godaddy\.com\/domains|sedo\.com|dan\.com|afternic|hugedomains/i, /account (has been )?suspended/i,
  /site (is )?(currently )?(unavailable|not found)/i, /website expired/i,
];

async function check(url, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(/^https?:/i.test(url) ? url : `https://${url}`, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; YouDoIDo-data-audit/1.0)", accept: "text/html" },
    });
    const body = (await res.text()).slice(0, 300_000);
    const text = body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
    return { status: res.status, finalUrl: res.url, text };
  } catch (e) {
    return { error: e.name === "AbortError" ? `timed out after ${ms / 1000}s` : (e.cause?.code ?? e.message) };
  } finally {
    clearTimeout(t);
  }
}

function snippet(text, re) {
  const m = text.match(re);
  if (!m) return "";
  const i = Math.max(0, m.index - 60);
  return `"…${text.slice(i, m.index + m[0].length + 60).replace(/\s+/g, " ").trim()}…"`;
}

// Each site's result, shared by every row on that site (sister venues).
const siteOk = new Map(); // `${kind}|${host}` -> true when it loaded cleanly
if (!flag("no-web")) {
  const seen = new Set();
  const jobs = [];
  for (const { kind, rows, fromDb } of sets)
    for (const r of rows) {
      if (!r.Website || (fromDb && r.Live === "no")) continue;
      const key = `${kind}|${host(r.Website)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      jobs.push({ kind, r });
    }
  let next = 0, done = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const { kind, r } = jobs[next++];
      let res = await check(r.Website);
      if (res.error) res = await check(r.Website, 30000); // slow hosts get a second, longer try
      done++;
      if (done % 25 === 0) process.stderr.write(`  checked ${done}/${jobs.length} sites\n`);
      if (res.error) { add(kind, "site down", "high", r, `Could not load: ${res.error}.`); continue; }
      if (res.status === 403 || res.status === 429 || res.status === 503) {
        add(kind, "site blocked", "info", r, `HTTP ${res.status} (likely bot protection); check by hand.`);
        continue;
      }
      if (res.status >= 400) { add(kind, "site down", "high", r, `HTTP ${res.status}.`); continue; }
      const from = domain(host(r.Website)), to = domain(host(res.finalUrl));
      if (to && from !== to) add(kind, "site moved", "medium", r, `Redirects to ${res.finalUrl}; renamed, sold or a new site.`);
      const parked = PARKED.find((re) => re.test(res.text));
      if (parked) { add(kind, "site parked", "high", r, `Looks parked/expired: ${snippet(res.text, parked)}`); continue; }
      const closed = CLOSED.find((re) => re.test(res.text));
      if (closed) { add(kind, "maybe closed", "high", r, `Site says ${snippet(res.text, closed)}`); continue; }
      if (!to || from === to) siteOk.set(`${kind}|${host(r.Website)}`, true);
    }
  };
  process.stderr.write(`Checking ${jobs.length} websites…\n`);
  await Promise.all(Array.from({ length: 8 }, worker));
}

// ---------- report ----------

const ORDER = { high: 0, medium: 1, low: 2, info: 3 };
findings.sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || a.check.localeCompare(b.check) || a.name.localeCompare(b.name));

const counts = sets.map((s) => `${s.rows.length} ${s.kind}s`).join(", ");
const source = venuesCsv || vendorsCsv ? "admin CSV export" : "bundled batch files (no photo/price/verified columns)";
let md = `# Data audit\n\nAudited ${counts} from the ${source}. ${findings.length} findings.\n`;
for (const kind of ["venue", "vendor"]) {
  const mine = findings.filter((f) => f.kind === kind);
  if (!sets.some((s) => s.kind === kind)) continue;
  md += `\n## ${kind[0].toUpperCase() + kind.slice(1)}s (${mine.length})\n`;
  const byCheck = Map.groupBy(mine, (f) => f.check);
  for (const [check, list] of byCheck) {
    md += `\n### ${check} (${list.length}, ${list[0].severity})\n\n`;
    // Low-stakes gaps can run to hundreds of rows; the JSON has them all.
    const shown = list[0].severity === "low" || list[0].severity === "info" ? list.slice(0, 15) : list;
    for (const f of shown) md += `- **${f.name}**: ${f.detail}${f.website && check !== "duplicate" ? ` <${f.website}>` : ""}\n`;
    if (shown.length < list.length) md += `- …and ${list.length - shown.length} more (pass --json for the full list)\n`;
  }
}

if (opt("out")) writeFileSync(opt("out"), md);
else process.stdout.write(md);
// The file /admin/venues and /admin/vendors apply ("Apply a data audit").
// `verify` is every row whose site loaded cleanly and that has no high or
// medium finding. `update` and `hide` start empty: they're filled in by hand
// once a flagged row is confirmed (SKILL.md step 3). `review` is the list to
// work through and is ignored by the admin page.
if (opt("fixes")) {
  if (flag("no-web")) process.stderr.write("--fixes needs the website checks; nothing marked checked.\n");
  const ref = (r, fromDb) => (fromDb && r.ID ? { id: r.ID, name: label(r) } : { sourceId: sourceId(r.Website), name: label(r) });
  const file = { kind: "data-audit-fixes", generatedAt: new Date().toISOString(), source };
  for (const { kind, rows, fromDb } of sets) {
    const verify = [];
    for (const r of rows) {
      if (!r.Website || flagged.has(r.origin) || (fromDb && r.Live === "no")) continue;
      if (fromDb ? !r.ID : !sourceId(r.Website)) continue;
      if (siteOk.get(`${kind}|${host(r.Website)}`)) verify.push(ref(r, fromDb));
    }
    const byOrigin = new Map(rows.map((r) => [r.origin, r]));
    const review = findings
      .filter((f) => f.kind === kind && f.severity !== "low")
      .map((f) => ({ ...ref(byOrigin.get(f.origin), fromDb), check: f.check, detail: f.detail }));
    file[`${kind}s`] = { verify, update: [], hide: [], review };
  }
  writeFileSync(opt("fixes"), JSON.stringify(file, null, 2));
}
if (opt("json")) writeFileSync(opt("json"), JSON.stringify(findings, null, 2));
process.stderr.write(`Done: ${findings.length} findings.\n`);
