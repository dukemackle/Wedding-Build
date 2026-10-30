import { BUDGET_TO_MARKET } from "@/lib/marketplace";

/** How long after the wedding "Pass it on" keeps offering drafts. */
export const PASS_IT_ON_DAYS = 180;

/**
 * What a thing usually resells for, as a share of what the couple paid.
 * Wren's own rough figures for second-hand wedding goods, not a study: the
 * form shows them as a suggestion the seller changes.
 */
const RESALE_SHARE: Record<string, number> = {
  decor: 0.4,
  signage: 0.4,
  attire: 0.45,
  tableware: 0.4,
  florals: 0.35,
  lighting: 0.4,
  stationery: 0.3,
  other: 0.35,
};

/**
 * Words in a couple's own budget line that say it's a thing they own, and
 * which category it lists under. First match wins, so the specific words
 * come before the general ones. A line matching none (a DJ deposit, tips)
 * isn't offered.
 */
const ITEM_WORDS: [RegExp, string][] = [
  [/\b(dress|gown|veil|suit|tux|tuxedo|shoes?|heels|jumpsuit|robe|tiara|headpiece|garter)\b/, "attire"],
  [/\b(sign|signs|signage|seating chart|neon|easel|welcome board)\b/, "signage"],
  [/\b(invitations?|save the dates?|menus?|place cards?|programs?|guest ?book|card box)\b/, "stationery"],
  [/\b(lanterns?|candles?|candle ?holders?|fairy lights|string lights|lights|votives?|hurricanes?|marquee)\b/, "lighting"],
  [/\b(silk|faux|artificial|dried) (flowers?|florals?|bouquets?)\b|\bpampas\b/, "florals"],
  [/\b(chargers?|plates?|glass(es|ware)?|napkins?|flatware|cutlery|cake stand|runners?|linens?|tablecloths?)\b/, "tableware"],
  [/\b(arch|arbor|backdrop|vases?|centerpieces?|centrepieces?|garland|table numbers?|decor|décor|draping|drapes|arbour|frames?|mirrors?|favors?|favours?)\b/, "decor"],
];

/** Lines that are someone else's to keep: hired, not bought. */
const NOT_THEIRS = /\b(rental|rented|rent|hire|hired|deposit|fee|service|tip|tips)\b/;

export type PassItOnDraft = {
  /** Where it came from: a budget category key or a custom item id. */
  source: string;
  title: string;
  category: string;
  /** What the couple paid, when the budget says. */
  paidCents: number | null;
  /** Wren's suggested price, rounded to $5. */
  suggestCents: number | null;
};

function toCents(amount: number | null | undefined) {
  return amount && amount > 0 ? Math.round(amount * 100) : null;
}

function suggest(paidCents: number | null, category: string) {
  if (!paidCents) return null;
  const share = RESALE_SHARE[category] ?? RESALE_SHARE.other;
  return Math.max(500, Math.round((paidCents * share) / 500) * 500);
}

/**
 * The couple's leftovers, from their budget: their own named lines that look
 * like things they bought, then the categories that buy things (a dress, the
 * signs). A category line is a whole department (florals is mostly the
 * florist), so it gets a title but no price; only attire is near enough to one
 * thing to price from.
 */
export function passItOnDrafts({
  lineItems,
  customItems,
  listedSources,
}: {
  lineItems: { category: string; override_value: number | null; paid_amount: number | null }[];
  customItems: { id: string; label: string; amount: number | null; paid_amount: number | null }[];
  /** Sources already listed, so they aren't offered again. */
  listedSources: Set<string>;
}): PassItOnDraft[] {
  const drafts: PassItOnDraft[] = [];

  for (const item of customItems) {
    const label = item.label.trim();
    const words = label.toLowerCase();
    if (!label || NOT_THEIRS.test(words) || listedSources.has(item.id)) continue;
    const category = ITEM_WORDS.find(([pattern]) => pattern.test(words))?.[1];
    if (!category) continue;
    const paidCents = toCents(item.paid_amount) ?? toCents(item.amount);
    drafts.push({ source: item.id, title: label.slice(0, 80), category, paidCents, suggestCents: suggest(paidCents, category) });
  }

  for (const line of lineItems) {
    const market = BUDGET_TO_MARKET[line.category];
    if (!market || listedSources.has(line.category)) continue;
    const spent = toCents(line.paid_amount) ?? toCents(line.override_value);
    if (!spent) continue;
    const priced = line.category === "attire";
    drafts.push({
      source: line.category,
      title: market.sellTitle,
      category: market.sellCategory,
      paidCents: priced ? spent : null,
      suggestCents: priced ? suggest(spent, market.sellCategory) : null,
    });
  }

  return drafts;
}

/** Whether the wedding was between a day and PASS_IT_ON_DAYS ago. */
export function inPassItOnWindow(weddingDate: string | null, today = new Date()) {
  if (!weddingDate) return false;
  const days = (today.getTime() - new Date(`${weddingDate}T12:00:00`).getTime()) / 86400_000;
  return days >= 1 && days <= PASS_IT_ON_DAYS;
}

/** The share Wren used for a suggestion, for the form's hint ("about 40%"). */
export function resaleShare(category: string) {
  return RESALE_SHARE[category] ?? RESALE_SHARE.other;
}
