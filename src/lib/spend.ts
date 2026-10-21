/**
 * Spend & renewals (/admin/spend): what the company pays for and when it
 * renews. One row per service in ops_services, holding its current price, not
 * every charge. These are the owner's running notes, not the books.
 */

export type OpsService = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  category: SpendCategory;
  plan: string | null;
  /** null = price not known yet. */
  amount_cents: number | null;
  billing_cycle: BillingCycle;
  next_renewal: string | null;
  paid_with: string | null;
  status: "active" | "cancelled";
  notes: string | null;
};

export const SPEND_CATEGORIES = {
  domain: "Domain",
  software: "Software",
  infra: "Hosting & infra",
  ai: "AI",
  legal: "Legal & LLC",
  mail: "Mail",
  other: "Other",
} as const;
export type SpendCategory = keyof typeof SPEND_CATEGORIES;

export const BILLING_CYCLES = {
  monthly: "Monthly",
  yearly: "Yearly",
  one_time: "One-time",
} as const;
export type BillingCycle = keyof typeof BILLING_CYCLES;

/** How far ahead a renewal counts as "soon". */
export const RENEWAL_WARNING_DAYS = 14;

export function formatUsd(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** What a recurring service costs per month, spread evenly; null for one-time or unknown. */
export function monthlyCents(s: Pick<OpsService, "amount_cents" | "billing_cycle">): number | null {
  if (s.amount_cents === null || s.billing_cycle === "one_time") return null;
  return s.billing_cycle === "yearly" ? Math.round(s.amount_cents / 12) : s.amount_cents;
}

/** Whole days from today (UTC) to a yyyy-mm-dd date; negative once it has passed. */
export function daysUntil(date: string, today = new Date()): number {
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((Date.parse(`${date}T00:00:00Z`) - start) / 86_400_000);
}

export function spendTotals(services: OpsService[], today = new Date()) {
  const active = services.filter((s) => s.status === "active");
  let monthly = 0;
  let yearly = 0;
  for (const s of active) {
    if (s.amount_cents === null) continue;
    if (s.billing_cycle === "monthly") {
      monthly += s.amount_cents;
      yearly += s.amount_cents * 12;
    } else if (s.billing_cycle === "yearly") {
      monthly += s.amount_cents / 12;
      yearly += s.amount_cents;
    }
  }
  const dueSoon = active
    .filter((s) => s.next_renewal && daysUntil(s.next_renewal, today) <= RENEWAL_WARNING_DAYS)
    .sort((a, b) => a.next_renewal!.localeCompare(b.next_renewal!));
  return {
    monthlyCents: Math.round(monthly),
    yearlyCents: Math.round(yearly),
    unpriced: active.filter((s) => s.amount_cents === null).length,
    activeCount: active.length,
    dueSoon,
  };
}
