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
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-10 text-center shadow-sm">
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
    .select("category, override_value")
    .eq("wedding_id", wedding.id);

  const overrideByCategory = new Map(
    (overrides ?? []).map((row: BudgetLineItemRow) => [row.category, row.override_value]),
  );

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
    override: overrideByCategory.get(category.key) ?? null,
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
