import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type { RegionalCostData, Wedding } from "@/lib/supabase/types";
import { effectiveGuestCount } from "@/lib/budget-categories";
import { REGION_REPRESENTATIVE_STATE, type EstimatorTier } from "@/lib/estimator";
import { STYLE_TIERS } from "@/lib/wedding-options";
import { Estimator } from "@/app/estimate/estimator";

export default async function BudgetEstimatePage() {
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
            Add your wedding details on the Dashboard so the estimator can start from your own
            region and guest count.
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

  const { data: regionalData } = await supabase
    .from("regional_cost_data")
    .select("*")
    .returns<RegionalCostData[]>();

  const guestCount = effectiveGuestCount(wedding, guests ?? []);
  const initialState = wedding.region ? REGION_REPRESENTATIVE_STATE[wedding.region] : undefined;
  const initialTier = STYLE_TIERS.includes(wedding.style_tier as EstimatorTier)
    ? (wedding.style_tier as EstimatorTier)
    : undefined;

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} />
      <div className="w-full max-w-2xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Budget</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Cost estimator</h1>
        <p className="mt-2 text-sm text-ink/70">
          Play with state, style, and guest count to see how the cost changes. This is separate
          from your saved Budget above &mdash; nothing here affects your real numbers.
        </p>

        <div className="mt-8">
          <Estimator
            regionalData={regionalData ?? []}
            initialState={initialState}
            initialGuestCount={guestCount > 0 ? guestCount : undefined}
            initialTier={initialTier}
            ctaHref="/budget"
            ctaLabel="Back to my Budget"
            ctaTitle="Comparing to your real budget?"
            ctaBody="Your actual Budget page tracks real quotes and overrides per category &mdash; this estimator is just for exploring what-ifs."
          />
        </div>
      </div>
    </main>
  );
}
