"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { RegionalCostData } from "@/lib/supabase/types";
import { estimateWeddingCost, type EstimatorTier } from "@/lib/estimator";
import { STATES, STYLE_TIERS } from "@/lib/wedding-options";
import { BudgetBarChart } from "@/app/budget/budget-chart";
import { applyEstimateToWedding } from "@/app/budget/actions";

/**
 * What the couple's Budget is priced from right now, so the Estimator can
 * tell them what "Apply" would change. Only passed on the signed-in page.
 */
export type SavedBudgetSettings = {
  state: string | null;
  tier: string | null;
  guestCount: number;
  season: string | null;
  target: number | null;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";

const DEFAULT_GUESTS = 100;
const MIN_GUESTS = 10;
const MAX_GUESTS = 300;

export function Estimator({
  regionalData,
  initialState = "California",
  initialGuestCount = DEFAULT_GUESTS,
  initialTier = "Classic",
  ctaHref = "/signup",
  ctaLabel = "Start planning for free",
  ctaTitle = "Ready to plan for real?",
  ctaBody = "Turn this estimate into a real budget you can track, with venues, guests, and vendors all in one free account.",
  split = false,
  saved,
}: {
  regionalData: RegionalCostData[];
  initialState?: string;
  initialGuestCount?: number;
  initialTier?: EstimatorTier;
  ctaHref?: string;
  ctaLabel?: string;
  ctaTitle?: string;
  ctaBody?: string;
  /**
   * From 1024px, put the controls and total in a sticky column on the left and
   * the breakdown beside them, so a wide page holds two panels rather than one
   * stretched stack. Off for the public page, which sits in a narrow column.
   */
  split?: boolean;
  /** Turns the closing card into "Apply to my budget". */
  saved?: SavedBudgetSettings;
}) {
  const [state, setState] = useState<string>(initialState);
  const [guestCount, setGuestCount] = useState(initialGuestCount);
  const [tier, setTier] = useState<EstimatorTier>(initialTier);

  const estimate = useMemo(
    // With the couple's season, so the figure matches what their Budget
    // shows once applied.
    () => estimateWeddingCost(regionalData, state, guestCount, tier, { season: saved?.season }),
    [regionalData, state, guestCount, tier, saved?.season],
  );

  const realDataCount = estimate.breakdown.filter((item) => item.isRealData).length;

  return (
    <div
      className={
        split
          ? "w-full lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-8"
          : "w-full"
      }
    >
      <div className={split ? "lg:sticky lg:top-8" : undefined}>
        <div className="w-full rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-8">
          <div
            className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${split ? "lg:grid-cols-1" : ""}`}
          >
            <label className="flex flex-col gap-1 text-sm text-ink">
              State
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={inputClass}
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-1 text-sm text-ink">
              Style
              <div className="flex gap-2">
                {STYLE_TIERS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                      tier === t
                        ? "border-forest bg-forest text-parchment"
                        : "border-hairline bg-parchment text-ink hover:border-forest"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`flex flex-col gap-1 text-sm text-ink sm:col-span-2 ${split ? "lg:col-span-1" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <span>Guest count</span>
                <span className="font-mono-numbers text-forest">{guestCount}</span>
              </div>
              <input
                type="range"
                min={MIN_GUESTS}
                max={MAX_GUESTS}
                step={5}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full accent-forest"
              />
              <div className="flex justify-between text-xs text-ink/50">
                <span>{MIN_GUESTS}</span>
                <span>{MAX_GUESTS}+</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full rounded-lg border border-hairline bg-card p-6 text-center shadow-sm sm:p-10">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Estimated total
          </p>
          <p
            className={`mt-2 font-display text-4xl font-semibold text-forest sm:text-5xl ${split ? "lg:text-4xl" : ""}`}
          >
            {currency.format(estimate.low)} &ndash; {currency.format(estimate.high)}
          </p>
          <p className="mt-2 text-sm text-ink/60">
            {tier} style &middot; {guestCount} guests &middot; {state}
          </p>
        </div>
      </div>

      <div>
        <BudgetOverview breakdown={estimate.breakdown} split={split} />

        <p className="mt-4 text-center text-xs text-ink/50">
          {realDataCount} of {estimate.breakdown.length} categories use real, sourced pricing data
          for {state}; the rest use a regional estimate until more data is added.
        </p>

        {saved ? (
          <ApplyCard
            saved={saved}
            state={state}
            tier={tier}
            guestCount={guestCount}
            total={estimate.total}
            backHref={ctaHref}
          />
        ) : (
          <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-8 text-center shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-forest">{ctaTitle}</h2>
            <p className="mt-2 text-sm text-ink/70">{ctaBody}</p>
            <Link
              href={ctaHref}
              className="mt-6 inline-block rounded-full bg-forest px-6 py-2 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetOverview({
  breakdown,
  split,
}: {
  breakdown: { key: string; label: string; amount: number }[];
  split: boolean;
}) {
  return (
    <div
      className={`mt-6 w-full rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-8 ${split ? "lg:mt-0" : ""}`}
    >
      <span className="font-display text-2xl font-semibold text-forest">Cost breakdown</span>
      <p className="mt-1 text-sm text-ink/70">Where this estimate goes, highest to lowest.</p>
      <div className="mt-6">
        <BudgetBarChart items={breakdown} />
      </div>
    </div>
  );
}

/**
 * Saves what's on screen as the settings the Budget is priced from. Only the
 * lines without a real number move; the copy says so, because "apply" on a
 * budget otherwise sounds like it could overwrite quotes.
 */
function ApplyCard({
  saved,
  state,
  tier,
  guestCount,
  total,
  backHref,
}: {
  saved: SavedBudgetSettings;
  state: string;
  tier: EstimatorTier;
  guestCount: number;
  total: number;
  backHref: string;
}) {
  const [setTarget, setSetTarget] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Rounded like a number a couple would actually write down.
  const suggestedTarget = Math.round(total / 500) * 500;
  const guestsChanged = guestCount !== saved.guestCount;
  const settingsChanged = state !== saved.state || tier !== saved.tier || guestsChanged;
  const key = `${state}|${tier}|${guestCount}|${setTarget}`;
  const justApplied = appliedKey === key;
  const canApply = !justApplied && (settingsChanged || (setTarget && suggestedTarget !== saved.target));

  function handleApply() {
    const formData = new FormData();
    formData.set("state", state);
    formData.set("style_tier", tier);
    if (guestsChanged) formData.set("guest_count", String(guestCount));
    if (setTarget) formData.set("budget_target", String(suggestedTarget));
    startTransition(async () => {
      const result = await applyEstimateToWedding(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setAppliedKey(key);
      }
    });
  }

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-8">
      <h2 className="font-display text-2xl font-semibold text-forest">Use this for my budget</h2>
      <p className="mt-2 text-sm text-ink/70">
        Every Budget line you haven&apos;t entered a real number for is priced from these
        settings. Apply them and those lines will match this breakdown. Lines with a quote stay
        exactly as they are.
      </p>

      <p className="mt-4 font-mono-numbers text-xs text-ink/60">
        {settingsChanged ? (
          <>
            Now: {saved.tier ?? "No style"} &middot; {saved.guestCount} guests &middot;{" "}
            {saved.state ?? "no state"} &rarr;{" "}
            <span className="text-forest">
              {tier} &middot; {guestCount} guests &middot; {state}
            </span>
          </>
        ) : (
          <>These are already your budget&apos;s settings.</>
        )}
      </p>

      <label className="mt-4 flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={setTarget}
          onChange={(e) => setSetTarget(e.target.checked)}
          className="mt-1 accent-forest"
        />
        <span>
          Also set my budget target to{" "}
          <span className="font-mono-numbers text-forest">{currency.format(suggestedTarget)}</span>
          {saved.target != null && (
            <span className="text-ink/55"> (now {currency.format(saved.target)})</span>
          )}
        </span>
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleApply}
          disabled={!canApply || isPending}
          className="rounded-full bg-forest px-6 py-2 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-40"
        >
          {isPending ? "Applying…" : "Apply to my budget"}
        </button>
        <Link href={backHref} className="font-mono-numbers text-sm text-brass hover:underline">
          Back to my Budget
        </Link>
      </div>

      {justApplied && (
        <p className="mt-3 text-sm text-forest">Applied. Your Budget and Dashboard now use these.</p>
      )}
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
    </div>
  );
}
