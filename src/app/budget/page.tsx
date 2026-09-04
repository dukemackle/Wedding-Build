import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type { Wedding } from "@/lib/supabase/types";
import {
  BUDGET_CATEGORIES,
  computeCategoryValue,
  effectiveGuestCount,
} from "@/lib/budget-categories";
import { BudgetTable, type BudgetRow } from "./budget-table";

type BudgetLineItemRow = {
  category: string;
  override_value: number | null;
  purchased_from: string | null;
};

const VENDOR_CATEGORY_TO_BUDGET_KEY: Record<string, string> = {
  Catering: "catering",
  Photography: "photography",
  Videography: "videography",
  Florals: "florals",
  Music: "music",
  Cake: "cake",
  Planning: "planner",
  Transportation: "transportation",
};

export default async function BudgetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Budget
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            The estimate depends on your date, region, season, and style —
            add those on the Dashboard first.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { data: guests } = await supabase
    .from("guests")
    .select("status, plus_one")
    .eq("wedding_id", wedding.id);

  const guestCount = effectiveGuestCount(wedding, guests ?? []);

  const { data: overrides } = await supabase
    .from("budget_line_items")
    .select("category, override_value, purchased_from")
    .eq("wedding_id", wedding.id);

  const overrideByCategory = new Map(
    (overrides ?? []).map((row: BudgetLineItemRow) => [row.category, row]),
  );

  const [
    { data: venueFavoriteRows },
    { data: vendorFavoriteRows },
    { data: bookedInquiryRows },
    { data: attireShortlistRows },
  ] = await Promise.all([
    supabase.from("venue_shortlist").select("venue_id").eq("wedding_id", wedding.id),
    supabase.from("vendor_favorites").select("vendor_id").eq("wedding_id", wedding.id),
    supabase
      .from("vendor_inquiries")
      .select("vendor_id")
      .eq("wedding_id", wedding.id)
      .eq("status", "booked"),
    supabase.from("attire_shortlist").select("attire_item_id").eq("wedding_id", wedding.id),
  ]);

  const venueIds = (venueFavoriteRows ?? []).map((r) => r.venue_id);
  const { data: favoritedVenues } = venueIds.length
    ? await supabase.from("venues").select("name").in("id", venueIds)
    : { data: [] };

  const vendorIds = Array.from(
    new Set(
      [...(vendorFavoriteRows ?? []), ...(bookedInquiryRows ?? [])]
        .map((r) => r.vendor_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const { data: suggestedVendors } = vendorIds.length
    ? await supabase.from("vendors").select("name, category").in("id", vendorIds)
    : { data: [] };

  const attireIds = (attireShortlistRows ?? []).map((r) => r.attire_item_id);
  const { data: favoritedAttire } = attireIds.length
    ? await supabase.from("attire_items").select("name").in("id", attireIds)
    : { data: [] };

  const suggestionsByCategory: Record<string, string[]> = {};
  for (const venue of favoritedVenues ?? []) {
    (suggestionsByCategory.venue ??= []).push(venue.name);
  }
  for (const item of favoritedAttire ?? []) {
    (suggestionsByCategory.attire ??= []).push(item.name);
  }
  for (const vendor of suggestedVendors ?? []) {
    const budgetKey = vendor.category ? VENDOR_CATEGORY_TO_BUDGET_KEY[vendor.category] : undefined;
    if (budgetKey) {
      (suggestionsByCategory[budgetKey] ??= []).push(vendor.name);
    }
  }

  const rows: BudgetRow[] = BUDGET_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
    isPerGuest: category.perGuestAmount > 0,
    computed: computeCategoryValue(
      category,
      guestCount,
      wedding.region,
      wedding.season,
      wedding.style_tier,
    ),
    override: overrideByCategory.get(category.key)?.override_value ?? null,
    purchasedFrom: overrideByCategory.get(category.key)?.purchased_from ?? null,
    suggestions: Array.from(new Set(suggestionsByCategory[category.key] ?? [])),
  }));

  const total = rows.reduce((sum, row) => sum + (row.override ?? row.computed), 0);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} />
      <div className="w-full max-w-2xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Budget
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
          Estimated wedding cost
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          Based on {wedding.region ?? "your region"},{" "}
          {(wedding.season ?? "your season").toLowerCase()} season, a{" "}
          {wedding.style_tier ?? "your"} style, and {guestCount} guest
          {guestCount === 1 ? "" : "s"}. Estimates are placeholders — click
          Edit on any line to enter a real quote.
        </p>

        <BudgetTable rows={rows} total={total} />
      </div>
    </main>
  );
}
