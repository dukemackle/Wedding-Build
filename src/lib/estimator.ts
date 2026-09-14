import { BUDGET_CATEGORIES, computeCategoryValue } from "./budget-categories";
import type { RegionalCostData } from "./supabase/types";
import type { STYLE_TIERS } from "./wedding-options";

export type EstimatorTier = (typeof STYLE_TIERS)[number];

export type EstimateBreakdownItem = {
  key: string;
  label: string;
  amount: number;
  isRealData: boolean;
};

export type WeddingEstimate = {
  total: number;
  low: number;
  high: number;
  breakdown: EstimateBreakdownItem[];
};

// A single number reads as a quote; this is a placeholder-driven estimate,
// so it should look like one. The range narrows as more of the total is
// backed by real sourced data (regional_cost_data) instead of the generic
// multiplier model -- from +/-15% with no real data down to +/-6% when
// every category is real. Rounded to the nearest $500 on each end so the
// bounds themselves don't look falsely precise.
function estimateRange(total: number, realDataRatio: number): { low: number; high: number } {
  const variance = 0.15 - 0.09 * realDataRatio;
  const low = Math.floor((total * (1 - variance)) / 500) * 500;
  const high = Math.ceil((total * (1 + variance)) / 500) * 500;
  return { low, high };
}

const TIER_COLUMN = {
  Simple: "simple_amount",
  Classic: "classic_amount",
  Luxury: "luxury_amount",
} as const satisfies Record<EstimatorTier, keyof RegionalCostData>;

// Uses real sourced data from regional_cost_data wherever it's been
// imported for the given state/category, and falls back to the older
// placeholder region-multiplier model (computeCategoryValue) everywhere
// it hasn't -- so every state produces an estimate today, not just the
// ones with real data loaded so far. `isRealData` on each line lets the
// UI be honest about which is which.
export function estimateWeddingCost(
  regionalData: RegionalCostData[],
  state: string,
  guestCount: number,
  tier: EstimatorTier,
): WeddingEstimate {
  const byCategory = new Map(
    regionalData.filter((row) => row.state === state).map((row) => [row.category_key, row]),
  );

  const breakdown: EstimateBreakdownItem[] = BUDGET_CATEGORIES.map((category) => {
    const row = byCategory.get(category.key);
    const rawAmount = row?.[TIER_COLUMN[tier]] as number | null | undefined;

    if (row && rawAmount != null) {
      const amount = row.per_guest ? rawAmount * guestCount : rawAmount;
      return { key: category.key, label: category.label, amount: Math.round(amount), isRealData: true };
    }

    const amount = computeCategoryValue(category, guestCount, null, null, tier, state);
    return { key: category.key, label: category.label, amount, isRealData: false };
  });

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
  const realDataRatio =
    breakdown.filter((item) => item.isRealData).length / (breakdown.length || 1);
  const { low, high } = estimateRange(total, realDataRatio);

  return { total, low, high, breakdown };
}
