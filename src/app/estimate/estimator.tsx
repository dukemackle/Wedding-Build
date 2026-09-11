"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RegionalCostData } from "@/lib/supabase/types";
import { estimateWeddingCost, type EstimatorTier } from "@/lib/estimator";
import { STATES, STYLE_TIERS } from "@/lib/wedding-options";
import { BudgetBarChart } from "@/app/budget/budget-chart";

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

export function Estimator({ regionalData }: { regionalData: RegionalCostData[] }) {
  const [state, setState] = useState<string>("California");
  const [guestCount, setGuestCount] = useState(DEFAULT_GUESTS);
  const [tier, setTier] = useState<EstimatorTier>("Classic");

  const estimate = useMemo(
    () => estimateWeddingCost(regionalData, state, guestCount, tier),
    [regionalData, state, guestCount, tier],
  );

  const realDataCount = estimate.breakdown.filter((item) => item.isRealData).length;

  return (
    <div className="w-full">
      <div className="w-full rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

          <div className="flex flex-col gap-1 text-sm text-ink sm:col-span-2">
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
        <p className="mt-2 font-display text-5xl font-semibold text-forest sm:text-6xl">
          {currency.format(estimate.total)}
        </p>
        <p className="mt-2 text-sm text-ink/60">
          {tier} style &middot; {guestCount} guests &middot; {state}
        </p>
      </div>

      <BudgetOverview breakdown={estimate.breakdown} />

      <p className="mt-4 text-center text-xs text-ink/50">
        {realDataCount} of {estimate.breakdown.length} categories use real, sourced pricing data
        for {state}; the rest use a regional estimate until more data is added.
      </p>

      <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-8 text-center shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-forest">
          Ready to plan for real?
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          Turn this estimate into a real budget you can track, with venues, guests, and vendors
          all in one free account.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-block rounded-full bg-forest px-6 py-2 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
        >
          Start planning for free
        </Link>
      </div>
    </div>
  );
}

function BudgetOverview({
  breakdown,
}: {
  breakdown: { key: string; label: string; amount: number }[];
}) {
  return (
    <div className="mt-6 w-full rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-8">
      <span className="font-display text-2xl font-semibold text-forest">Cost breakdown</span>
      <p className="mt-1 text-sm text-ink/70">Where this estimate goes, highest to lowest.</p>
      <div className="mt-6">
        <BudgetBarChart items={breakdown} />
      </div>
    </div>
  );
}
