import type { Wedding } from "@/lib/supabase/types";

export type BudgetCategory = {
  key: string;
  label: string;
  flatBase: number;
  perGuestAmount: number;
};

// Placeholder national-average estimates in USD. Editable per-wedding via overrides.
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { key: "venue", label: "Venue Rental", flatBase: 12000, perGuestAmount: 0 },
  { key: "catering", label: "Catering & Bar", flatBase: 0, perGuestAmount: 150 },
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
) {
  const base = category.flatBase + category.perGuestAmount * guestCount;
  const regionMult = region ? (REGION_MULTIPLIERS[region] ?? 1) : 1;
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
