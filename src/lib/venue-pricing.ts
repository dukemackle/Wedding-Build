import type { PriceBasis, PriceOption } from "@/lib/supabase/types";
import type { STYLE_TIERS } from "@/lib/wedding-options";

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
 * The interim Simple/Classic/Luxury tier for a published price, so a batch row
 * that records the figure still lands in the Price filter. Per-person prices
 * use per-guest bands; every other basis is a whole-event figure. Bands as in
 * the add-venues skill. The tier is on its way out (2026-10-22): the figure is
 * the fact, and the planned "fits my budget" filter reads it directly.
 */
export function tierFromPrice(
  priceFrom: number | null,
  basis: PriceBasis | null,
): (typeof STYLE_TIERS)[number] | null {
  if (priceFrom == null || basis == null || basis === "ask") return null;
  const [classic, luxury] = basis === "per_person" ? [100, 200] : [6000, 15000];
  return priceFrom < classic ? "Simple" : priceFrom <= luxury ? "Classic" : "Luxury";
}
