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

const fieldClass =
  "h-11 w-full rounded-md border border-hairline bg-parchment px-3 text-base text-ink outline-none focus:border-forest";

/**
 * The landing hero's live estimator: the page's one gold moment, because the
 * budget is where You Do, I Do is strongest. Three answers, a range, and a
 * way to carry those answers straight into setup (/start reads them).
 */
export function HomeEstimatorCard({ regionalData }: { regionalData: RegionalCostData[] }) {
  const [state, setState] = useState<string>("California");
  const [tier, setTier] = useState<EstimatorTier>("Classic");
  const [guestCount, setGuestCount] = useState(DEFAULT_GUESTS);

  const estimate = useMemo(
    () => estimateWeddingCost(regionalData, state, guestCount, tier),
    [regionalData, state, guestCount, tier],
  );
  const perGuest = guestCount > 0 ? Math.round(estimate.total / guestCount) : 0;
  const startHref = `/signup?next=${encodeURIComponent(
    `/start?${new URLSearchParams({ state, tier, guests: String(guestCount) })}`,
  )}`;

  return (
    <div className="w-full rounded-2xl border-2 border-[#ffd301] bg-card p-5 shadow-[0_30px_70px_-30px_rgb(224_161_0/0.6)] sm:p-7">
      <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">What would yours cost?</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-ink/80">
          State
          <select value={state} onChange={(e) => setState(e.target.value)} className={fieldClass}>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink/80">
          Style
          <select value={tier} onChange={(e) => setTier(e.target.value as EstimatorTier)} className={fieldClass}>
            {STYLE_TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-1.5 text-sm text-ink/80">
        <span className="flex items-baseline justify-between">
          Guests
          <span className="font-mono-numbers text-base text-forest">{guestCount}</span>
        </span>
        <input
          type="range"
          min={MIN_GUESTS}
          max={MAX_GUESTS}
          step={5}
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="h-2 w-full accent-forest"
        />
      </label>

      <div className="mt-5 border-t border-hairline pt-4" aria-live="polite">
        <p className="font-mono-numbers text-[28px] font-medium leading-tight tabular-nums text-ink sm:text-[38px]">
          {currency.format(estimate.low)}–{currency.format(estimate.high)}
        </p>
        <p className="mt-1 text-sm text-ink/70">
          Typical total · about {currency.format(perGuest)} a guest
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-1">
        <Link
          href={startHref}
          className="flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-forest px-5 text-[15px] font-medium text-parchment transition-colors hover:bg-forest/90"
        >
          Plan with these numbers
        </Link>
        <Link href="/estimate" className="py-2 text-center text-[15px] text-brass hover:underline">
          See the full breakdown
        </Link>
      </div>
    </div>
  );
}
