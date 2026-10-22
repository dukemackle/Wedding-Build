import type { Wedding } from "@/lib/supabase/types";

/**
 * The budget page's sections, in order. Fees are worked out from the other
 * lines (see estimate-add-ons.ts), so couples don't add their own lines there.
 */
export const BUDGET_SECTIONS = [
  { key: "wedding_day", label: "Wedding day" },
  { key: "rehearsal", label: "Rehearsal & welcome" },
  { key: "attire", label: "Attire & rings" },
  { key: "fees", label: "Fees & cushion" },
] as const;

export type BudgetSectionKey = (typeof BUDGET_SECTIONS)[number]["key"];

export function isBudgetSection(value: unknown): value is BudgetSectionKey {
  return BUDGET_SECTIONS.some((s) => s.key === value);
}

export type BudgetCategory = {
  key: string;
  label: string;
  /** Which section of the budget page it sits in; the wedding day if left out. */
  section?: BudgetSectionKey;
  flatBase: number;
  perGuestAmount: number;
  /**
   * Starts hidden for a new wedding (see DEFAULT_HIDDEN_CATEGORIES).
   *
   * Not "unimportant" -- these are the lines a large share of couples
   * genuinely don't have. A friend officiates, parents host the rehearsal
   * dinner, there's no planner, no second event, no favors. Showing all
   * nineteen to someone on day one reads as a list of things they're
   * forgetting rather than a plan, so the optional ones wait in the "not
   * tracking" strip until they're wanted.
   */
  optional?: boolean;
};

// Vendor catalog categories don't share spelling with budget category
// keys (e.g. "Catering" the vendor category vs "catering" the budget
// key) -- this maps one to the other. Shared between the Budget page
// (suggested vendor names) and the vendor-booking budget auto-fill in
// src/lib/budget-sync.ts. Categories with no vendor-catalog equivalent
// (favors, venue) aren't listed here; venue booking
// is synced separately since venues aren't in the vendors table.
export const VENDOR_CATEGORY_TO_BUDGET_KEY: Record<string, string> = {
  Catering: "catering",
  Bar: "bar",
  Photography: "photography",
  Videography: "videography",
  Florals: "florals",
  Music: "music",
  Cake: "cake",
  Planning: "planner",
  Transportation: "transportation",
  "Hair & Makeup": "hair_makeup",
  Officiant: "officiant",
  "Stationery & Invitations": "stationery",
  "Decor & Lighting": "florals",
  "Photo Booth": "music",
  "Bridal & Formalwear": "attire",
  Desserts: "cake",
};

// National Classic-tier figures for every state without its own rows in
// regional_cost_data. The 13 categories that have rows anywhere use the
// same national figures those rows were built from (each row is national x
// the state's cost index; sources are in each row's `source` column, mostly
// The Knot 2026 Real Weddings Study at 117 average guests), so a state with
// rows and its neighbour without them now land in the same place instead of
// thousands apart. The other six (rehearsal dinner, welcome party, hair and
// makeup, rings, officiant, tips) have no sourced figure yet and are
// unchanged. Editable per-wedding via overrides.
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { key: "venue", label: "Venue Rental", flatBase: 8570, perGuestAmount: 0 },
  // Split from a combined "Catering & Bar" category -- couples often
  // book food and bar service as two separate vendors, and a budget
  // category can only ever hold one linked vendor at a time, so
  // combining them meant a second booking would silently overwrite the
  // first. $6,927 and $2,800 nationally over 117 guests (The Knot 2026),
  // the same figures behind the catering and bar rows in regional_cost_data.
  { key: "catering", label: "Catering", flatBase: 0, perGuestAmount: 59 },
  { key: "bar", label: "Bar", flatBase: 0, perGuestAmount: 24 },
  { key: "photography", label: "Photography", flatBase: 4400, perGuestAmount: 0 },
  { optional: true, key: "videography", label: "Videography", flatBase: 4000, perGuestAmount: 0 },
  { key: "florals", label: "Florals & Decor", flatBase: 6350, perGuestAmount: 0 },
  { key: "music", label: "Music / Entertainment", flatBase: 1570, perGuestAmount: 0 },
  { section: "attire", key: "attire", label: "Wedding Attire", flatBase: 2500, perGuestAmount: 0 },
  // Hemming, bustle and fittings are almost never in the dress price, and
  // usually land in the last month when there's least slack.
  { section: "attire", key: "alterations", label: "Alterations", flatBase: 350, perGuestAmount: 0 },
  // Often paid by the wedding party themselves, so no estimate of its own --
  // it's here for the couples who are covering suits or dresses.
  { optional: true, section: "attire", key: "wedding_party_attire", label: "Wedding Party Attire", flatBase: 0, perGuestAmount: 0 },
  { optional: true, key: "planner", label: "Wedding Planner", flatBase: 3200, perGuestAmount: 0 },
  { key: "stationery", label: "Invitations & Stationery", flatBase: 0, perGuestAmount: 4.7 },
  { optional: true, key: "favors", label: "Favors & Gifts", flatBase: 0, perGuestAmount: 3 },
  { key: "cake", label: "Cake & Desserts", flatBase: 700, perGuestAmount: 0 },
  { optional: true, key: "transportation", label: "Transportation", flatBase: 1000, perGuestAmount: 0 },
  // Both scale a bit with guest count, unlike most flat-base categories
  // above -- modern rehearsal dinners and welcome parties increasingly
  // invite most/all out-of-town guests, not just the wedding party, so
  // a larger wedding plausibly means a larger one of these too.
  { section: "rehearsal", key: "rehearsal_dinner", label: "Rehearsal Dinner", flatBase: 800, perGuestAmount: 15 },
  { optional: true, section: "rehearsal", key: "welcome_party", label: "Welcome Party", flatBase: 600, perGuestAmount: 12 },
  { key: "hair_makeup", label: "Hair & Makeup", flatBase: 900, perGuestAmount: 0 },
  { section: "attire", key: "rings", label: "Wedding Rings", flatBase: 1500, perGuestAmount: 0 },
  { optional: true, key: "officiant", label: "Officiant", flatBase: 500, perGuestAmount: 0 },
  // Event liability (which many venues require) plus cancellation cover;
  // one-day policies commonly run $150-$550.
  { key: "insurance", label: "Wedding Insurance", flatBase: 250, perGuestAmount: 0 },
  // Tips for the people who work the day. Service charges are their own line
  // below: a venue's 20% on food and drink isn't a tip.
  { section: "fees", key: "gratuities", label: "Tips & Gratuities", flatBase: 700, perGuestAmount: 0 },
  // Worked out from the lines above, not priced on their own (see
  // src/lib/estimate-add-ons.ts), so these bases are never used.
  { section: "fees", key: "service_charge", label: "Service Charges", flatBase: 0, perGuestAmount: 0 },
  { section: "fees", key: "sales_tax", label: "Sales Tax", flatBase: 0, perGuestAmount: 0 },
  { section: "fees", key: "contingency", label: "Cushion for Surprises", flatBase: 0, perGuestAmount: 0 },
];

/**
 * What a brand-new wedding starts with hidden. Used as the column default in
 * migration 0067; existing weddings keep whatever they already had.
 */
export const DEFAULT_HIDDEN_CATEGORIES = BUDGET_CATEGORIES.filter((c) => c.optional).map(
  (c) => c.key,
);

export const REGION_MULTIPLIERS: Record<string, number> = {
  Northeast: 1.25,
  "Mid-Atlantic": 1.15,
  Southeast: 0.9,
  Midwest: 0.85,
  Southwest: 0.9,
  "Mountain West": 0.95,
  "Pacific Northwest": 1.05,
  "West Coast": 1.3,
};

// Placeholder state -> region mapping so the cost model can take a state
// as input today, ahead of real per-state data landing (see the cost
// estimator data-collection plan). Every state currently just inherits
// its region's multiplier above -- this is not real state-level pricing,
// it's a stand-in that lets the estimator UI collect "state" now without
// the formula changing shape again once real numbers replace it.
export const STATE_TO_REGION: Record<string, keyof typeof REGION_MULTIPLIERS> = {
  Connecticut: "Northeast",
  Maine: "Northeast",
  Massachusetts: "Northeast",
  "New Hampshire": "Northeast",
  "Rhode Island": "Northeast",
  Vermont: "Northeast",
  Delaware: "Mid-Atlantic",
  "District of Columbia": "Mid-Atlantic",
  Maryland: "Mid-Atlantic",
  "New Jersey": "Mid-Atlantic",
  "New York": "Mid-Atlantic",
  Pennsylvania: "Mid-Atlantic",
  Alabama: "Southeast",
  Arkansas: "Southeast",
  Florida: "Southeast",
  Georgia: "Southeast",
  Kentucky: "Southeast",
  Louisiana: "Southeast",
  Mississippi: "Southeast",
  "North Carolina": "Southeast",
  "South Carolina": "Southeast",
  Tennessee: "Southeast",
  Virginia: "Southeast",
  "West Virginia": "Southeast",
  Illinois: "Midwest",
  Indiana: "Midwest",
  Iowa: "Midwest",
  Kansas: "Midwest",
  Michigan: "Midwest",
  Minnesota: "Midwest",
  Missouri: "Midwest",
  Nebraska: "Midwest",
  "North Dakota": "Midwest",
  Ohio: "Midwest",
  "South Dakota": "Midwest",
  Wisconsin: "Midwest",
  Arizona: "Southwest",
  "New Mexico": "Southwest",
  Oklahoma: "Southwest",
  Texas: "Southwest",
  Colorado: "Mountain West",
  Idaho: "Mountain West",
  Montana: "Mountain West",
  Nevada: "Mountain West",
  Utah: "Mountain West",
  Wyoming: "Mountain West",
  Alaska: "Pacific Northwest",
  Oregon: "Pacific Northwest",
  Washington: "Pacific Northwest",
  California: "West Coast",
  Hawaii: "West Coast",
};

export const SEASON_MULTIPLIERS: Record<string, number> = {
  Winter: 0.85,
  Spring: 1.0,
  Summer: 1.15,
  Fall: 1.15,
};

export const STYLE_TIER_MULTIPLIERS: Record<string, number> = {
  Simple: 0.7,
  Classic: 1.0,
  Luxury: 1.8,
};

export function computeCategoryValue(
  category: BudgetCategory,
  guestCount: number,
  region: string | null,
  season: string | null,
  styleTier: string | null,
  state?: string | null,
) {
  const base = category.flatBase + category.perGuestAmount * guestCount;
  const effectiveRegion = (state && STATE_TO_REGION[state]) || region;
  const regionMult = effectiveRegion ? (REGION_MULTIPLIERS[effectiveRegion] ?? 1) : 1;
  const seasonMult = season ? (SEASON_MULTIPLIERS[season] ?? 1) : 1;
  const styleMult = styleTier ? (STYLE_TIER_MULTIPLIERS[styleTier] ?? 1) : 1;
  return Math.round(base * regionMult * seasonMult * styleMult);
}

export function effectiveGuestCount(
  wedding: Pick<Wedding, "guest_count_override">,
  guests: { status: string; plus_one: boolean }[],
) {
  if (wedding.guest_count_override != null) return wedding.guest_count_override;
  return guests
    .filter((g) => g.status === "confirmed")
    .reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);
}
