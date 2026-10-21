// The three budget lines that aren't a vendor at all but land on top of
// vendors' prices: the venue or caterer's service charge, sales tax, and a
// cushion for surprises. Each is worked out from the other lines rather than
// priced on its own, so they follow the couple's real quotes once entered.

/**
 * Average combined state + local sales tax rate (%), July 1, 2026.
 * Source: Tax Foundation, "State and Local Sales Tax Rates, Midyear 2026"
 * (taxfoundation.org/data/all/state/2026-sales-tax-rates-midyear/, read
 * 2026-10-21). Population-weighted averages: the rate at a given venue can
 * be higher or lower. Refresh each January and July with /data-refresh.
 */
export const SALES_TAX_RATES: Record<string, number> = {
  Alabama: 9.46,
  Alaska: 1.82,
  Arizona: 8.54,
  Arkansas: 9.48,
  California: 9.03,
  Colorado: 7.89,
  Connecticut: 6.35,
  Delaware: 0,
  "District of Columbia": 6.0,
  Florida: 6.98,
  Georgia: 7.56,
  Hawaii: 4.5,
  Idaho: 6.03,
  Illinois: 8.98,
  Indiana: 7.0,
  Iowa: 6.94,
  Kansas: 8.71,
  Kentucky: 6.0,
  Louisiana: 10.13,
  Maine: 5.5,
  Maryland: 6.0,
  Massachusetts: 6.25,
  Michigan: 6.0,
  Minnesota: 8.14,
  Mississippi: 7.06,
  Missouri: 8.44,
  Montana: 0,
  Nebraska: 6.98,
  Nevada: 8.24,
  "New Hampshire": 0,
  "New Jersey": 6.6,
  "New Mexico": 7.68,
  "New York": 8.54,
  "North Carolina": 7.1,
  "North Dakota": 7.09,
  Ohio: 7.29,
  Oklahoma: 9.06,
  Oregon: 0,
  Pennsylvania: 6.34,
  "Rhode Island": 7.0,
  "South Carolina": 7.49,
  "South Dakota": 6.11,
  Tennessee: 9.61,
  Texas: 8.2,
  Utah: 7.42,
  Vermont: 6.43,
  Virginia: 5.77,
  Washington: 9.57,
  "West Virginia": 6.6,
  Wisconsin: 5.72,
  Wyoming: 5.39,
};
export const SALES_TAX_SOURCE = "Tax Foundation, July 2026";
/** The population-weighted national average in the same release, for no state. */
const NATIONAL_SALES_TAX = 7.53;

/**
 * Lines that are usually goods or meals, and so usually taxed. Services
 * (photography, music, planning) are untaxed in many states, and states
 * differ on venue rental, so they're left out: this is an estimate, not
 * tax advice.
 */
const TAXABLE_KEYS = [
  "catering",
  "bar",
  "cake",
  "florals",
  "attire",
  "rings",
  "stationery",
  "favors",
  "rehearsal_dinner",
  "welcome_party",
];

/**
 * Venues and caterers commonly add an 18-25% service charge to food and
 * drink; 20% is our assumption, not a measured figure. It isn't a tip.
 */
const SERVICE_CHARGE_RATE = 0.2;
const SERVICE_CHARGE_KEYS = ["catering", "bar"];

const CONTINGENCY_RATE = 0.05;

export const ADD_ON_KEYS = ["service_charge", "sales_tax", "contingency"] as const;
export type AddOnKey = (typeof ADD_ON_KEYS)[number];

export function isAddOn(key: string): key is AddOnKey {
  return (ADD_ON_KEYS as readonly string[]).includes(key);
}

export function salesTaxRate(state: string | null): number {
  return state && state in SALES_TAX_RATES ? SALES_TAX_RATES[state] : NATIONAL_SALES_TAX;
}

/**
 * Each add-on's amount from the other lines' amounts, plus a short line on
 * how it was worked out for the UI. `amounts` should hold only the lines the
 * couple is counting (hidden lines left out) at their real figure where
 * they have one.
 */
export function computeAddOns(
  amounts: Map<string, number>,
  state: string | null,
): Record<AddOnKey, { amount: number; basis: string }> {
  const sum = (keys: string[]) => keys.reduce((total, key) => total + (amounts.get(key) ?? 0), 0);
  const rate = salesTaxRate(state);

  const serviceCharge = Math.round(sum(SERVICE_CHARGE_KEYS) * SERVICE_CHARGE_RATE);
  const salesTax = Math.round((sum(TAXABLE_KEYS) * rate) / 100);
  let everythingElse = serviceCharge + salesTax;
  for (const [key, amount] of amounts) {
    if (!isAddOn(key)) everythingElse += amount;
  }
  const contingency = Math.round(everythingElse * CONTINGENCY_RATE);

  return {
    service_charge: {
      amount: serviceCharge,
      basis: "20% of catering and bar. Often 18–25%; check your contract.",
    },
    sales_tax: {
      amount: salesTax,
      basis: state
        ? `${rate}% average in ${state} (${SALES_TAX_SOURCE}) on food, drink and goods.`
        : `${rate}% national average (${SALES_TAX_SOURCE}) on food, drink and goods.`,
    },
    contingency: {
      amount: contingency,
      basis: "5% of everything else, for overtime, extra rentals and last-minute fixes.",
    },
  };
}
