/**
 * How people found us (2026-11-03). Three signals, kept side by side because
 * each misses what another catches:
 *
 * - heard_from: what they tell us, from a fixed list (the only one that sees
 *   word of mouth);
 * - via: which of our own links brought a business to its claim form
 *   (`?via=` on every claim link we send);
 * - first_touch: where their very first visit came from (referring site, utm
 *   tags, landing page), kept in this browser until they sign up or claim.
 *
 * Shared by client and server: the option lists and `cleanFirstTouch` run on
 * both sides; nothing here touches the database.
 */

export const COUPLE_HEARD_FROM = [
  ["google", "Google or another search"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["pinterest", "Pinterest"],
  ["facebook", "Facebook"],
  ["friend", "A friend or family member"],
  ["vendor", "A venue or vendor"],
  ["ai", "ChatGPT or another AI"],
  ["other", "Somewhere else"],
] as const;

export const BUSINESS_HEARD_FROM = [
  ["google", "Found my listing on Google"],
  ["inquiry", "A couple's inquiry through You Do, I Do"],
  ["our_email", "An email from You Do, I Do"],
  ["social", "Instagram, Facebook or TikTok"],
  ["colleague", "Another venue or vendor"],
  ["couple", "A couple told me about it"],
  ["ai", "ChatGPT or another AI"],
  ["other", "Somewhere else"],
] as const;

const HEARD_FROM_KEYS = new Set<string>([...COUPLE_HEARD_FROM, ...BUSINESS_HEARD_FROM].map(([k]) => k));
const LABELS = new Map<string, string>([...BUSINESS_HEARD_FROM, ...COUPLE_HEARD_FROM].map(([k, l]) => [k, l]));

export function cleanHeardFrom(value: unknown): string | null {
  return typeof value === "string" && HEARD_FROM_KEYS.has(value) ? value : null;
}

export function heardFromLabel(value: string | null | undefined): string | null {
  return value ? (LABELS.get(value) ?? value) : null;
}

/** Where a claim link was sent from; appended as `?via=` so the click carries it. */
export const CLAIM_VIA = {
  inquiry: "A couple's inquiry email",
  follow_up: "A couple's follow-up email",
  self_serve: "Asked for a link at /list/edit",
  new_listing: "Listed themselves at /list",
  admin: "A link you sent",
  approved: "The link in their approval email",
} as const;
export type ClaimVia = keyof typeof CLAIM_VIA;

export function withVia(url: string | null, via: ClaimVia): string | null {
  return url ? `${url}?via=${via}` : null;
}

export function cleanVia(value: unknown): ClaimVia | null {
  return typeof value === "string" && value in CLAIM_VIA ? (value as ClaimVia) : null;
}

/** A first visit: no names, emails or full URLs, just where from. */
export type FirstTouch = {
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing?: string;
  at?: string;
};

const FIRST_TOUCH_KEYS = ["referrer", "utm_source", "utm_medium", "utm_campaign", "landing", "at"] as const;
export const FIRST_TOUCH_STORAGE_KEY = "ydid_first_touch";

/** Whatever arrived, cut down to the known keys and short strings, or null. */
export function cleanFirstTouch(value: unknown): FirstTouch | null {
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!raw || typeof raw !== "object") return null;
  const out: FirstTouch = {};
  for (const key of FIRST_TOUCH_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim().slice(0, 120);
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** "google.com", "instagram / social", "Direct": the one-line summary for the admin. */
export function firstTouchLabel(ft: FirstTouch | null | undefined): string | null {
  if (!ft) return null;
  if (ft.utm_source) return [ft.utm_source, ft.utm_medium].filter(Boolean).join(" / ");
  if (ft.referrer) return ft.referrer;
  return "Direct (typed or bookmarked)";
}

/** The first visit as this browser remembers it (client only). */
export function readFirstTouch(): FirstTouch | null {
  try {
    return cleanFirstTouch(window.localStorage.getItem(FIRST_TOUCH_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** A claim's three signals as short lines for the admin, leaving out what wasn't recorded. */
export function foundUsLines(row: { heard_from: string | null; arrived_via: string | null; first_touch: FirstTouch | null }): string[] {
  const lines: string[] = [];
  const said = heardFromLabel(row.heard_from);
  if (said) lines.push(`Said: ${said}`);
  const via = cleanVia(row.arrived_via);
  if (via) lines.push(`Link: ${CLAIM_VIA[via]}`);
  const first = firstTouchLabel(row.first_touch);
  if (first) lines.push(`First visit: ${first}`);
  return lines;
}
