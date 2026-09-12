import type { Wedding } from "@/lib/supabase/types";

export type BudgetCategory = {
  key: string;
  label: string;
  flatBase: number;
  perGuestAmount: number;
};

// Vendor catalog categories don't share spelling with budget category
// keys (e.g. "Catering" the vendor category vs "catering" the budget
// key) -- this maps one to the other. Shared between the Budget page
// (suggested vendor names) and the vendor-booking budget auto-fill in
// src/lib/budget-sync.ts. Categories with no vendor-catalog equivalent
// (attire, stationery, favors, venue) aren't listed here; venue booking
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
};

// Placeholder national-average estimates in USD. Editable per-wedding via overrides.
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { key: "venue", label: "Venue Rental", flatBase: 12000, perGuestAmount: 0 },
  // Split from a combined "Catering & Bar" category -- couples often
  // book food and bar service as two separate vendors, and a budget
  // category can only ever hold one linked vendor at a time, so
  // combining them meant a second booking would silently overwrite the
  // first. The 107/43 split mirrors the ~71%/29% ratio from the
  // original source data (catering $6,927 vs bar $2,800 nationally,
  // see the cost-data spreadsheet methodology).
  { key: "catering", label: "Catering", flatBase: 0, perGuestAmount: 107 },
  { key: "bar", label: "Bar", flatBase: 0, perGuestAmount: 43 },
  { key: "photography", label: "Photography", flatBase: 3500, perGuestAmount: 0 },
  { key: "videography", label: "Videography", flatBase: 2500, perGuestAmount: 0 },
  { key: "florals", label: "Florals & Decor", flatBase: 3000, perGuestAmount: 0 },
  { key: "music", label: "Music / Entertainment", flatBase: 2200, perGuestAmount: 0 },
  { key: "attire", label: "Wedding Attire", flatBase: 2800, perGuestAmount: 0 },
  { key: "planner", label: "Wedding Planner", flatBase: 2500, perGuestAmount: 0 },
  { key: "stationery", label: "Invitations & Stationery", flatBase: 300, perGuestAmount: 6 },
  { key: "favors", label: "Favors & Gifts", flatBase: 0, perGuestAmount: 8 },
  { key: "cake", label: "Cake & Desserts", flatBase: 600, perGuestAmount: 0 },
  { key: "transportation", label: "Transportation", flatBase: 800, perGuestAmount: 0 },
];

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
