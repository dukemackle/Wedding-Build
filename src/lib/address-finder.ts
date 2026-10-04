import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Budget } from "@/lib/import-pins";
import { geocode, STATE_ABBR } from "@/lib/listing-pin";

// Finds the street address of listings that were added without one, from the
// listing's own website, so the map pin is the actual place rather than its
// town's centre. Runs from the batch import (the scheduled routine calls it
// until done), a few listings per call: each can take four outbound requests
// (home page, contact page, geocode, update, plus redirects) against
// Cloudflare's 50.

/**
 * Requests one listing can cost: home and contact page at two each (one
 * redirect, see fetchPage), plus the geocode and the update.
 */
export const FIND_COST = 6;
/**
 * Most lookups one call spends on the finder. The import endpoint runs the
 * venue steps and then the vendor steps in the same Worker invocation, each
 * with its own database reads, so the finder keeps well inside the 50.
 */
export const FINDER_BUDGET = 24;
/** A found address must geocode within this of the listing's current pin (its town). */
const MAX_KM = 40;

type Found = { street: string; city: string | null; zip: string | null };
type Candidate = {
  id: string;
  website: string;
  city: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
};

function kmBetween(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/**
 * The page at `url`, following at most one redirect by hand: Cloudflare counts
 * every hop as a subrequest, and `redirect: "follow"` would take as many as a
 * site cares to send (one vendor chain blew the per-call cap). Two requests,
 * never more.
 */
async function fetchPage(url: string): Promise<string | null> {
  try {
    let res = await get(url);
    const next = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && next) res = await get(new URL(next, url).href);
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return null;
    return await readCapped(res);
  } catch {
    return null;
  }
}

/**
 * Most of a page that is read. Reading and regex-scanning 2 MB pages ran the
 * Worker past its CPU limit (Cloudflare error 1102), which failed the whole
 * import call and stopped the batch routine. Footers sit at the end, but a
 * venue's home page is rarely past this; a longer one just isn't searched to
 * the bottom.
 */
const MAX_PAGE_BYTES = 300_000;

/** The body up to MAX_PAGE_BYTES, without downloading the rest. */
async function readCapped(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  while (bytes < MAX_PAGE_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    text += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {});
  return text.slice(0, MAX_PAGE_BYTES);
}

function get(url: string) {
  return fetch(url, {
    signal: AbortSignal.timeout(8000),
    redirect: "manual",
    headers: { "user-agent": "Mozilla/5.0 (compatible; YouDoIDoBot/1.0; +https://youdoido.com)" },
  });
}

/** schema.org PostalAddress in the page's JSON-LD -- the most reliable source when a site has it. */
function fromJsonLd(html: string, state: string): Found | null {
  for (const match of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data: unknown;
    try {
      data = JSON.parse(match[1].trim());
    } catch {
      continue;
    }
    const stack = [data];
    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object") continue;
      if (Array.isArray(node)) {
        stack.push(...node);
        continue;
      }
      const record = node as Record<string, unknown>;
      const street = record.streetAddress;
      if (typeof street === "string" && /\d/.test(street) && sameState(String(record.addressRegion ?? ""), state)) {
        return {
          street: clean(street),
          city: typeof record.addressLocality === "string" ? clean(record.addressLocality) : null,
          zip: typeof record.postalCode === "string" ? record.postalCode.slice(0, 5) : null,
        };
      }
      stack.push(...Object.values(record));
    }
  }
  return null;
}

/**
 * "12300 Huber Rd, Seguin, TX 78155" in the page text. Needs the listing's
 * own state and a ZIP right after it, which keeps out phone numbers, dates
 * and a sister property in another state.
 */
function fromText(html: string, state: string): Found | null {
  const text = html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, ", ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&rsquo;/g, "'")
    .replace(/\s+/g, " ");
  const abbr = STATE_ABBR[state];
  if (!abbr) return null;
  const pattern = new RegExp(
    String.raw`\b(\d{1,6}[A-Za-z]?\s+[A-Za-z0-9.#'\- ]{2,60}?)\s*,\s*(?:(?:Suite|Ste|Unit|#)\s*[A-Za-z0-9-]+\s*,\s*)?([A-Za-z.'\- ]{2,40}?)\s*,?\s+(?:${abbr}|${state})\.?\s*,?\s+(\d{5})(?:-\d{4})?\b`,
    "gi",
  );
  for (const m of text.matchAll(pattern)) {
    let street = clean(m[1]);
    // "Open 7 days a week 12300 Huber Rd" -- start at the last house number
    // that still has a street name after it.
    const later = [...street.matchAll(/\b\d{1,6}[A-Za-z]?\s+[A-Za-z]+\s+\S+/g)].pop();
    if (later?.index) street = street.slice(later.index);
    // A street needs a name after the number, not just "2024 Weddings".
    if (!/\d+[A-Za-z]?\s+\S+\s+\S+/.test(street) && !/\d+\s+(?:FM|RM|CR|US|SH|Hwy|Highway|Route|Rt)\b/i.test(street)) continue;
    return { street, city: clean(m[2]), zip: m[3] };
  }
  return null;
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").replace(/^[\s,]+|[\s,]+$/g, "");
}

function sameState(region: string, state: string) {
  const r = region.trim().toLowerCase();
  return r === "" || r === state.toLowerCase() || r === (STATE_ABBR[state] ?? "").toLowerCase();
}

/** Exported for the check script; the import uses it through findAddresses. */
export function findIn(html: string, state: string): Found | null {
  return fromJsonLd(html, state) ?? fromText(html, state);
}

/** A same-site contact/visit/directions link, where an address sits when the home page has none. */
function contactLink(html: string, base: string): string | null {
  for (const m of html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = `${m[1]} ${m[2].replace(/<[^>]+>/g, "")}`.toLowerCase();
    if (!/contact|visit|location|directions|find-us|find us|getting-here/.test(label)) continue;
    try {
      const url = new URL(m[1], base);
      if (url.hostname.replace(/^www\./, "") === new URL(base).hostname.replace(/^www\./, "")) return url.href;
    } catch {
      // Not a URL; try the next link.
    }
  }
  return null;
}

async function lookUp(row: Candidate): Promise<{ address: string; latitude: number; longitude: number } | null> {
  if (!row.state) return null;
  const home = await fetchPage(row.website);
  if (!home) return null;
  let found = findIn(home, row.state);
  if (!found) {
    const contact = contactLink(home, row.website);
    const page = contact && contact !== row.website ? await fetchPage(contact) : null;
    if (page) found = findIn(page, row.state);
  }
  if (!found) return null;

  const pin = await geocode(
    [found.street, found.city ?? row.city, `${STATE_ABBR[row.state] ?? row.state} ${found.zip ?? ""}`.trim()]
      .filter(Boolean)
      .join(", "),
  );
  // Rejects an address that isn't near the listing's town: a head office, a
  // sister venue, or a wrong match by the geocoder.
  if (!pin || kmBetween(pin, row) > MAX_KM) return null;
  return { address: found.street, ...pin };
}

/**
 * Looks up as many listings with no address as `budget` allows, from their
 * own websites. Each is stamped `address_checked_at` whether or not one was
 * found, so a site without an address isn't fetched again every call.
 * Returns how many are still to check.
 */
export async function findAddresses(
  table: "venues" | "vendors",
  budget: Budget,
): Promise<{ remaining: number; found: number; error?: string }> {
  budget.left -= 1;
  const take = Math.max(0, Math.floor(Math.min(budget.left, FINDER_BUDGET) / FIND_COST));
  const admin = createAdminSupabaseClient();
  const { data, count, error } = await admin
    .from(table)
    .select("id, website, city, state, latitude, longitude", { count: "exact" })
    .is("address", null)
    .is("address_checked_at", null)
    .not("website", "is", null)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .limit(Math.max(take, 1))
    .returns<Candidate[]>();
  // 42703: migration 0092 isn't applied yet. Skip rather than fail the import.
  if (error) return error.code === "42703" ? { remaining: 0, found: 0 } : { remaining: 0, found: 0, error: error.message };
  if (take === 0) return { remaining: count ?? 0, found: 0 };

  const rows = (data ?? []).slice(0, take).map((row) => ({ ...row, latitude: Number(row.latitude), longitude: Number(row.longitude) }));
  budget.left -= rows.length * FIND_COST;
  const results = await Promise.all(
    rows.map(async (row) => {
      const hit = await lookUp(row);
      const { error } = await admin
        .from(table)
        .update({ ...(hit ?? {}), address_checked_at: new Date().toISOString() })
        .eq("id", row.id);
      return { hit: !!hit, error: error?.message };
    }),
  );
  const failed = results.find((r) => r.error);
  if (failed) return { remaining: 0, found: 0, error: failed.error };
  return {
    remaining: Math.max(0, (count ?? 0) - rows.length),
    found: results.filter((r) => r.hit).length,
  };
}
