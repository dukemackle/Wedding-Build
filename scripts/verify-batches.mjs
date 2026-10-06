// Checks new venue and vendor batch rows against the businesses' own websites
// before they merge, so a listing is right the day it goes live. Run with:
//
//   npm run verify:batches                  rows new since origin/main
//   npm run verify:batches -- --all         every row (slow; an audit)
//   npm run verify:batches -- --state ohio  only that state's files
//   npm run verify:batches -- --base <ref>  compare against another ref
//
// The format checkers (check:venues, add-vendors' check-batches) prove a row
// will import. This proves it is true: the website loads, isn't a parked or
// for-sale domain, names the business, and carries the phone and email we
// list, and for venues the capacity. A field the site doesn't show is a failure -- the fix is to blank it
// or source it properly, because a blank field is better than a wrong one.
// Sites that block automated visits fail too: confirm by hand and replace the
// row, or drop it. Exits 1 on any failure; warnings are worth a look.

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const ALL = flag("--all");
const STATE = option("--state")?.toLowerCase().replace(/\s+/g, "-");
const BASE = option("--base") ?? "origin/main";

const DIRS = ["src/lib/batches/venues", "src/lib/batches/vendors"];

// Pull every `tsv: \`...\`` table out of a batch file's source and return its
// rows as objects keyed by header. Reading the text (not importing the TS)
// lets the same code read the base ref through `git show`.
function rowsOf(source, file) {
  const rows = [];
  for (const [, tsv] of source.matchAll(/tsv:\s*`([\s\S]*?)`/g)) {
    const [head, ...lines] = tsv.split("\n").filter((l) => l.trim());
    const cols = head.split("\t").map((c) => c.trim());
    for (const line of lines) {
      const cells = line.split("\t");
      const row = { file };
      cols.forEach((c, i) => (row[c] = (cells[i] ?? "").trim()));
      rows.push(row);
    }
  }
  return rows;
}

const keyOf = (r) => `${r.Name}|${r.Website || r.Instagram}`.toLowerCase();

function baseSource(path) {
  try {
    return execFileSync("git", ["show", `${BASE}:${path}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return ""; // file is new on this branch
  }
}

const targets = [];
for (const dir of DIRS) {
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".ts") || name === "index.ts") continue;
    if (STATE && name !== `${STATE}.ts`) continue;
    const path = `${dir}/${name}`;
    const rows = rowsOf(readFileSync(path, "utf8"), path);
    if (ALL) {
      targets.push(...rows);
      continue;
    }
    const seen = new Set(rowsOf(baseSource(path), path).map(keyOf));
    targets.push(...rows.filter((r) => !seen.has(keyOf(r))));
  }
}

if (!targets.length) {
  console.log(ALL ? "No batch rows found." : `No new batch rows since ${BASE}.`);
  process.exit(0);
}
console.log(`Verifying ${targets.length} row(s) against their websites...\n`);

// ---- fetching ---------------------------------------------------------------

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const pages = new Map(); // url -> Promise<{status, text, finalUrl} | {error}>

function fetchPage(url) {
  if (!pages.has(url)) {
    pages.set(
      url,
      (async () => {
        try {
          const res = await fetch(url, {
            redirect: "follow",
            signal: AbortSignal.timeout(20000),
            headers: { "user-agent": UA, accept: "text/html,*/*", "accept-language": "en-US" },
          });
          const html = res.ok ? await res.text() : "";
          return { status: res.status, html, text: textOf(html), finalUrl: res.url };
        } catch (e) {
          return { error: e.cause?.code ?? e.name ?? String(e) };
        }
      })(),
    );
  }
  return pages.get(url);
}

// Visible text plus the places a name or phone hides in markup: title, meta
// tags, tel:/mailto: links and JSON-LD.
function textOf(html) {
  const extras = [
    ...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi),
    ...html.matchAll(/<meta[^>]+content="([^"]*)"/gi),
    ...html.matchAll(/href="(?:tel|mailto):([^"]*)"/gi),
    ...html.matchAll(/<script[^>]+ld\+json[^>]*>([\s\S]*?)<\/script>/gi),
  ].map((m) => m[1]);
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decode(`${extras.join(" ")} ${body}`);
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&rsquo;|&lsquo;|&#8217;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

// Gather the page we list plus the homepage, then contact pages only when a
// field is still unfound.
async function siteText(website, need) {
  const url = new URL(website);
  const first = await fetchPage(url.href);
  if (first.error || first.status >= 400) return { first };
  const origin = new URL(first.finalUrl || url.href).origin;
  // Raw markup rides along: emails and phones often sit in attributes or
  // scripts that the visible text drops.
  const texts = [first.text, first.html];
  const home = await fetchPage(origin + "/");
  if (!home.error && home.status < 400) texts.push(home.text, home.html);
  let all = texts.join(" ");
  if (need(all)) {
    for (const path of ["/contact", "/contact-us", "/contact/", "/about", "/weddings", "/events", "/faq"]) {
      const p = await fetchPage(origin + path);
      if (!p.error && p.status < 400) all += ` ${p.text} ${p.html}`;
      if (!need(all)) break;
    }
  }
  return { first, all, html: first.html };
}

// ---- matching ---------------------------------------------------------------

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const FILLER = new Set(
  "the and of at a an by co company llc inc ltd studio studios events event weddings wedding photography photo films film video videography design designs floral florals flowers catering music band dj entertainment productions bakery cakes cake beauty makeup hair venue house llc".split(
    " ",
  ),
);

function nameFound(name, text) {
  const n = norm(name);
  const t = norm(text);
  if (t.includes(n)) return true;
  const squashed = t.replace(/ /g, "");
  if (squashed.includes(n.replace(/ /g, ""))) return true;
  const words = n.split(" ").filter((w) => w.length > 2 && !FILLER.has(w));
  if (!words.length) return false;
  const hits = words.filter((w) => new RegExp(`\\b${w}\\b`).test(t)).length;
  return hits / words.length >= 0.75;
}

const digits = (s) => s.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
function phoneFound(phone, text) {
  const want = digits(phone);
  if (want.length < 10) return false;
  const seen = (text.match(/\+?1?[\s.(-]*\d{3}[\s.)-]*\d{3}[\s.-]*\d{4}/g) ?? []).map(digits);
  return seen.includes(want);
}

const emailFound = (email, text) => text.toLowerCase().includes(email.toLowerCase());

// "300", "1,200" or "1200" as a number of its own, not inside a longer one.
function capacityFound(capacity, text) {
  const n = capacity.replace(/\D/g, "");
  if (!n) return false;
  const pattern = n.length > 3 ? `${n.slice(0, -3)},?${n.slice(-3)}` : n;
  return new RegExp(`(?<![\\d,.])${pattern}(?![\\d,]|\\.\\d)`).test(text);
}

const PARKED =
  /domain (?:is|may be) for sale|buy this domain|this domain is parked|parked free|domain has expired|hugedomains|sedo domain parking|website is (?:currently )?unavailable|account (?:has been )?suspended/i;
const CLOSED =
  /permanently closed|(?:we have|we've|has) (?:officially )?closed|no longer (?:in business|operating|accepting (?:new )?(?:bookings|weddings|inquiries))|closing our doors|retired from (?:weddings|photography)/i;

// ---- run --------------------------------------------------------------------

async function verify(r) {
  const fails = [];
  const warns = [];
  // A vendor listed from Instagram alone (a Basic listing). Instagram blocks
  // automated visits, so the bar in the add-vendors skill is checked by hand.
  if (!r.Website && r.Instagram)
    return { fails, warns: ["Instagram only: confirm by hand it's active, shows weddings, and names its town, phone and email"] };
  if (!r.Website) return { fails: ["no website, so nothing to verify against"], warns };

  const need = (all) =>
    !nameFound(r.Name, all) ||
    (r.Phone && !phoneFound(r.Phone, all)) ||
    (r.Email && !emailFound(r.Email, all)) ||
    (r.Capacity && !capacityFound(r.Capacity, all));
  const { first, all = "", html = "" } = await siteText(r.Website, need);

  if (first.error) return { fails: [`website didn't load (${first.error})`], warns };
  // 202 with an empty body is a bot challenge page, not the site.
  if ([401, 403, 429, 503].includes(first.status) || (first.status === 202 && first.html.length < 2000))
    return { fails: [`site blocks automated visits (${first.status}); confirm by hand or drop the row`], warns };
  if (first.status >= 400) return { fails: [`website returns ${first.status}`], warns };
  if (PARKED.test(all)) fails.push("domain looks parked, expired or for sale");
  if (!all.trim() || all.trim().length < 200)
    warns.push("page has almost no text (rendered by script?); check the details by hand");

  if (!nameFound(r.Name, all)) fails.push(`"${r.Name}" doesn't appear on the site`);
  if (r.Phone && !phoneFound(r.Phone, all)) fails.push(`phone ${r.Phone} isn't on the site; blank it or fix it`);
  if (r.Email && !emailFound(r.Email, all) && !/__cf_email__|email-protection/.test(html))
    fails.push(`email ${r.Email} isn't on the site; blank it or fix it`);
  if (r.Capacity && !capacityFound(r.Capacity, all))
    fails.push(`capacity ${r.Capacity} isn't on the site; blank it or fix it`);
  const closed = all.match(CLOSED);
  if (closed) warns.push(`site says "${closed[0]}"; check the business is still open`);

  const t = norm(all);
  if (r.City && !t.includes(norm(r.City)) && !t.includes(norm(r.State ?? "")))
    warns.push(`neither ${r.City} nor ${r.State} appears on the site`);
  return { fails, warns };
}

let failed = 0;
let warned = 0;
const queue = [...targets];
const results = [];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (let r = queue.shift(); r; r = queue.shift()) results.push([r, await verify(r)]);
  }),
);

results.sort((a, b) => a[0].file.localeCompare(b[0].file) || a[0].Name.localeCompare(b[0].Name));
for (const [r, { fails, warns }] of results) {
  if (!fails.length && !warns.length) continue;
  console.log(`${fails.length ? "FAIL" : "warn"}  ${r.Name}  (${r.file.replace("src/lib/batches/", "")})`);
  for (const f of fails) console.log(`        x ${f}`);
  for (const w of warns) console.log(`        ! ${w}`);
  if (fails.length) failed++;
  else warned++;
}

const ok = results.length - failed - warned;
console.log(`\n${ok} verified, ${warned} with warnings, ${failed} failed (of ${results.length}).`);
process.exit(failed ? 1 : 0);
