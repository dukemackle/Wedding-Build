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
