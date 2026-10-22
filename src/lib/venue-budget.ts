import { BUDGET_CATEGORIES, computeCategoryValue } from "@/lib/budget-categories";
import type { PriceBasis } from "@/lib/supabase/types";

/**
 * "Fits my budget" on /venues (2026-10-22). Every venue is compared on the
 * same thing: the room plus food and drink for the couple's guest count.
 * Per-person prices and food minimums already include the food; a room-only
 * rental gets our catering-and-bar estimate added, the same national figure
 * the budget page starts from, adjusted for the venue's state.
 */

const FOOD_AND_DRINK = BUDGET_CATEGORIES.filter((c) => c.key === "catering" || c.key === "bar");

/** The budget categories a "venue, food & drink" budget is the sum of. */
export const VENUE_BUDGET_KEYS = ["venue", "catering", "bar"] as const;

export function foodAndDrinkEstimate(guests: number, state: string | null): number {
  return FOOD_AND_DRINK.reduce((sum, c) => sum + computeCategoryValue(c, guests, null, null, null, state), 0);
}

/**
 * The least this venue could cost for `guests` with food and drink, or null
 * when it publishes no price. `estimated` marks a total that includes our
 * food-and-drink figure rather than only the venue's own.
 */
export function venueTotalFor(
  venue: { price_from: number | null; price_basis: PriceBasis | null; state: string | null },
  guests: number,
): { total: number; estimated: boolean } | null {
  if (venue.price_from == null || venue.price_basis == null || venue.price_basis === "ask") return null;
  switch (venue.price_basis) {
    case "per_person":
      return { total: venue.price_from * guests, estimated: false };
    case "rental":
      return { total: venue.price_from + foodAndDrinkEstimate(guests, venue.state), estimated: true };
    default:
      return { total: venue.price_from, estimated: false };
  }
}

/** "$31,000", or "$31.5k" when `short`. */
export function dollars(amount: number, short = false): string {
  if (short && amount >= 1000) return `$${Number((amount / 1000).toFixed(amount >= 100000 ? 0 : 1))}k`;
  return `$${Math.round(amount).toLocaleString()}`;
}
