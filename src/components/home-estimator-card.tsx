"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RegionalCostData } from "@/lib/supabase/types";
import { estimateWeddingCost, type EstimatorTier } from "@/lib/estimator";
import { STATES, STYLE_TIERS } from "@/lib/wedding-options";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const DEFAULT_GUESTS = 100;
const MIN_GUESTS = 25;
const MAX_GUESTS = 300;

const selectClass =
  "w-full rounded-md border border-hairline bg-parchment px-4 py-3 text-base text-ink outline-none focus:border-forest";

export function HomeEstimatorCard({ regionalData }: { regionalData: RegionalCostData[] }) {
  const [state, setState] = useState<string>("California");
  const [tier, setTier] = useState<EstimatorTier>("Classic");
  const [guestCount, setGuestCount] = useState(DEFAULT_GUESTS);

  const estimate = useMemo(
    () => estimateWeddingCost(regionalData, state, guestCount, tier),
    [regionalData, state, guestCount, tier],
  );

  const topLines = useMemo(
    () => [...estimate.breakdown].sort((a, b) => b.amount - a.amount).slice(0, 3),
    [estimate.breakdown],
  );

  const perGuest = guestCount > 0 ? Math.round(estimate.total / guestCount) : 0;

  return (
    <div className="w-full rounded-xl border border-hairline bg-card p-8 shadow-md sm:p-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-forest sm:text-3xl">
          Quick Estimator
        </h2>
        <span className="rounded-full bg-forest/10 px-3 py-1.5 font-mono-numbers text-xs uppercase tracking-wide text-forest">
          No sign-up
        </span>
      </div>

      <label className="mt-7 flex flex-col gap-1.5 text-base font-medium text-ink">
        Your state
        <select value={state} onChange={(e) => setState(e.target.value)} className={selectClass}>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-6 flex flex-col gap-1.5 text-base font-medium text-ink">
        Style
        <div className="flex gap-2">
          {STYLE_TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`flex-1 rounded-md border px-4 py-3 text-base transition-colors ${
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

      <div className="mt-6 flex flex-col gap-1.5 text-base font-medium text-ink">
        <div className="flex items-baseline justify-between">
          <span>Guest count</span>
          <span className="font-mono-numbers text-lg text-forest">{guestCount}</span>
        </div>
        <input
          type="range"
          min={MIN_GUESTS}
          max={MAX_GUESTS}
          step={5}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="h-2 w-full accent-forest"
        />
      </div>

      <div className="mt-8 border-t border-hairline pt-7">
        <p className="font-mono-numbers text-sm uppercase tracking-[0.2em] text-brass">
          Estimated total
        </p>
        <p className="mt-2 font-display text-5xl font-semibold text-forest sm:text-6xl">
          {currency.format(estimate.total)}
        </p>
        <p className="mt-2 text-sm text-ink/60">
          {tier} style &middot; {guestCount} guests &middot; {state}
        </p>

        <p className="mt-6 font-mono-numbers text-2xl font-semibold text-forest">
          {currency.format(perGuest)}{" "}
          <span className="font-body text-base font-normal text-ink/60">per guest</span>
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {topLines.map((line) => (
            <div key={line.key} className="flex items-center justify-between text-base">
              <span className="text-ink/70">{line.label}</span>
              <span className="font-mono-numbers text-ink">{currency.format(line.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/estimate"
        className="btn-motion mt-8 block w-full rounded-full bg-brass px-4 py-3.5 text-center font-display text-xl font-semibold text-parchment shadow-sm transition-colors hover:bg-brass/90"
      >
        See full breakdown &rarr;
      </Link>
    </div>
  );
}
