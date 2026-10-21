"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RegionalCostData } from "@/lib/supabase/types";
import { estimateWeddingCost, type EstimatorTier } from "@/lib/estimator";
import { STATES, STYLE_TIERS } from "@/lib/wedding-options";

// "$66k", not "$66,000": a range is a feel for the size of it, and the short
// form fits the display type on a phone.
const thousands = (n: number) => `$${Math.round(n / 1000).toLocaleString("en-US")}k`;
const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const DEFAULT_GUESTS = 100;
const MIN_GUESTS = 25;
const MAX_GUESTS = 300;

/**
 * The landing page's live estimator, set just under the photo: the page's one
 * gold moment, because the budget is where You Do, I Do is strongest. Style as
 * three buttons (the owner prefers them to a dropdown), guests, state, a range,
 * and one way on: carry those answers straight into setup (/start reads them).
 * Approved 2026-10-21 with the photo hero (direction B).
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
    <section
      aria-label="What would your wedding cost?"
      className="grid w-full grid-cols-1 gap-6 rounded-3xl border-2 border-[#ffd301] bg-card p-6 shadow-[0_30px_70px_-36px_rgb(20_32_61/0.45)] sm:p-10 md:grid-cols-2 md:gap-12"
    >
      <div className="flex flex-col gap-5">
        <h2 className="font-display text-[30px] font-semibold leading-tight text-forest sm:text-[34px]">
          What would yours cost?
        </h2>

        <div className="flex flex-col gap-2 text-sm text-ink/80">
          Style
          <div className="flex gap-2">
            {STYLE_TIERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                aria-pressed={tier === t}
                className={`h-11 flex-1 rounded-full border text-[15px] font-medium transition-colors ${
                  tier === t
                    ? "border-forest bg-forest text-parchment"
                    : "border-hairline bg-card text-forest hover:border-forest"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-2 text-sm text-ink/80">
          <span className="flex items-baseline justify-between">
            Guests
            <span className="text-base font-semibold text-forest">{guestCount}</span>
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

        <label className="flex flex-col gap-2 text-sm text-ink/80">
          State
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="h-11 w-full rounded-xl border border-hairline bg-card px-3 text-base text-ink outline-none focus:border-forest"
          >
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className="flex flex-col items-center justify-center border-t border-hairline pt-6 text-center md:items-start md:border-l md:border-t-0 md:pl-12 md:pt-0 md:text-left"
        aria-live="polite"
      >
        <p className="text-sm text-ink/70">A typical wedding like yours</p>
        <p className="mt-2 font-display text-[46px] font-semibold leading-none text-forest sm:text-[60px]">
          {thousands(estimate.low)}–{thousands(estimate.high)}
        </p>
        <p className="mt-2.5 text-[15px] text-ink/70">About {dollars.format(perGuest)} a guest</p>
        <Link
          href={startHref}
          className="btn-motion mt-7 flex h-[50px] w-full items-center justify-center rounded-full bg-forest px-7 text-base font-medium text-parchment transition-colors hover:bg-forest/90 md:w-auto"
        >
          Use this as my budget
        </Link>
      </div>
    </section>
  );
}
