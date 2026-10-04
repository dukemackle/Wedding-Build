import { REGION_MULTIPLIERS, STATE_TO_REGION } from "@/lib/budget-categories";
import type { PriceBasis, PriceOption } from "@/lib/supabase/types";

/**
 * The headline price on a venue's listing and on its claim-form preview, worded
 * for what the number is: "Packages from $8,000", "From $95 per person",
 * "$15,000 minimum". "Ask us" venues read "Ask for pricing".
 */
export function priceHeadline(venue: { price_from: number | null; price_basis: PriceBasis | null }): string | null {
  if (venue.price_basis === "ask") return "Ask for pricing";
  if (venue.price_from == null) return null;
  const amount = `$${venue.price_from.toLocaleString()}`;
  switch (venue.price_basis) {
    case "package":
      return `Packages from ${amount}`;
    case "per_person":
      return `From ${amount} per person`;
    case "minimum":
      return `${amount} minimum`;
    default:
      return `From ${amount}`;
  }
}

export function priceOptionAmount(option: PriceOption, basis: PriceBasis | null): string {
  return `$${option.amount.toLocaleString()}${basis === "per_person" ? " pp" : ""}`;
}

/**
 * Where Simple ends and Luxury starts, by how the price is quoted, before the
 * regional adjustment. A minimum spend is read as a rental fee. Set
 * 2026-10-04 against The Knot's 2026 study ($12,900 average venue, $150-300
 * all-in per guest) and the owner's own booking: an $18,000 package with
 * lodging, setup and a catering credit, which they saw as the Simple end.
 */
const TIER_BANDS: Record<Exclude<PriceBasis, "ask">, { classicFrom: number; luxuryFrom: number }> = {
  rental: { classicFrom: 10_000, luxuryFrom: 25_000 },
  minimum: { classicFrom: 10_000, luxuryFrom: 25_000 },
  package: { classicFrom: 20_000, luxuryFrom: 40_000 },
  per_person: { classicFrom: 150, luxuryFrom: 250 },
};

/**
 * A venue's price tier, worked out from its published starting price so the
 * tier can never disagree with the price on the page. Bands scale with the
 * state's region (a $14,000 rental is cheap in New York, not in Ohio). Falls
 * back to the hand-set tier for venues with no published price.
 */
export function venuePriceTier(venue: {
  price_from: number | null;
  price_basis: PriceBasis | null;
  price_tier: string | null;
  state: string | null;
}): string | null {
  if (venue.price_basis === "ask" || venue.price_from == null || venue.price_from <= 0) {
    return venue.price_tier;
  }
  const bands = TIER_BANDS[venue.price_basis ?? "rental"];
  const region = venue.state ? STATE_TO_REGION[venue.state] : undefined;
  const scale = region ? REGION_MULTIPLIERS[region] : 1;
  if (venue.price_from < bands.classicFrom * scale) return "Simple";
  if (venue.price_from < bands.luxuryFrom * scale) return "Classic";
  return "Luxury";
}

/** The venue with its tier replaced by the one its price implies. */
export function withPriceTier<T extends Parameters<typeof venuePriceTier>[0]>(venue: T): T {
  return { ...venue, price_tier: venuePriceTier(venue) };
}
