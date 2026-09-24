"use client";

import { useState, useTransition } from "react";
import { setBudgetTarget } from "./actions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * Segment colours for the "where it's going" bar, validated rather than
 * picked by eye: all four sit inside the usable lightness band, clear the
 * chroma floor so none reads as grey, hold >= 3:1 against the card, and stay
 * 16.7 apart in normal vision.
 *
 * Their worst colour-blind separation is 7.2 (deuteranopia), which is inside
 * the band that is only acceptable alongside a second, non-colour cue. That
 * is why each segment is separated by a visible gap and why every slice is
 * named with its share in the key below -- the colour speeds up reading, it
 * never carries the meaning on its own.
 */
const SLICE_COLORS = ["#0d8266", "#b07d0a", "#d2426b", "#3b76c4"];
const REST_COLOR = "#c2c7c0";

/**
 * The numbers that answer "where do we stand", sitting directly above the
 * columns they summarise: the projected total (real numbers where entered,
 * Wren's estimate everywhere else), what's been quoted so far with what's
 * been paid under it, and the budget target to the right.
 *
 * Over/left is measured against the projection, not the quotes. The quotes
 * alone leave out every line that has no number yet, so they read as "under
 * budget" right up until the last vendor is booked -- and the Dashboard
 * already compares the projection, so measuring anything else here made the
 * two pages give different "over" figures for the same wedding.
 *
 * The target is edited here rather than in a card of its own -- showing the
 * same number in two places invites them to disagree, and this is where
 * someone is already looking when they think about it.
 */
export function BudgetSummary({
  totalEstimate,
  totalActual,
  totalPaid,
  target,
  categoryCount,
  contractCount,
  items,
  quotedCount,
  headerAction,
}: {
  totalEstimate: number;
  /** Lines with a real number entered, plus custom items. */
  totalActual: number;
  totalPaid: number;
  target: number | null;
  categoryCount: number;
  contractCount: number;
  /** Every line's estimate, for the proportion bar. */
  items: { key: string; label: string; amount: number }[];
  /** Lines with a real number entered, not just an estimate. */
  quotedCount: number;
  /** Sits under the heading, top-left of the card -- the import trigger. */
  headerAction?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  // Top four plus a single "everything else".
  //
  // Four, not five, because of the colours: five categorical hues could not be
  // made distinguishable under colour-blind simulation no matter how they were
  // chosen -- the fifth always collided with one of the others. Cutting the
  // series is the standard fix, and the top four still carry the point, since
  // venue and catering alone are usually half a wedding.
  const proportion = (() => {
    const sum = items.reduce((t, i) => t + i.amount, 0);
    if (sum <= 0) return [];
    const sorted = [...items].sort((a, b) => b.amount - a.amount);
    const top = sorted.slice(0, SLICE_COLORS.length);
    const restAmount = sorted.slice(SLICE_COLORS.length).reduce((t, i) => t + i.amount, 0);
    const slices = top.map((i) => ({
      key: i.key,
      label: i.label,
      pct: Math.round((i.amount / sum) * 100),
    }));
    if (restAmount > 0) {
      slices.push({
        key: "__rest",
        label: "Everything else",
        pct: Math.round((restAmount / sum) * 100),
      });
    }
    return slices.filter((s) => s.pct > 0);
  })();

  const pct = target && target > 0 ? Math.min(100, (totalEstimate / target) * 100) : 0;
  const remaining = target != null ? target - totalEstimate : null;
  const isOver = remaining != null && remaining < 0;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await setBudgetTarget(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setEditing(false);
      }
    });
  }

  return (
    <div className="border-b border-hairline bg-gradient-to-b from-parchment/60 to-card px-5 py-5 sm:px-8 sm:py-6">
      {/* Same track widths and gap as the rows below, so each total sits
          exactly over the column it sums. If one changes, change both. */}
      <div className="sm:grid sm:grid-cols-[1fr_7rem_7.5rem_11rem] sm:items-end sm:gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Your budget</h2>
          <p className="mt-0.5 text-sm text-ink/60">
            {categoryCount} {categoryCount === 1 ? "category" : "categories"}
            {contractCount > 0 &&
              ` · ${contractCount} with ${contractCount === 1 ? "a contract" : "contracts"}`}
          </p>
          {headerAction && <div className="mt-2.5 flex flex-wrap gap-2">{headerAction}</div>}
        </div>

        <div className="mt-4 flex flex-wrap items-start gap-6 sm:contents">
          {/* Widths match the row grid below so each total lands over its column. */}
          <div className="sm:text-right">
            <p className="font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/50">
              Projected
            </p>
            <p
              className={`mt-1 font-mono-numbers text-xl sm:text-2xl ${
                isOver ? "text-brass" : "text-forest"
              }`}
            >
              {currency.format(totalEstimate)}
            </p>
          </div>

          <div className="relative sm:text-right">
            <p className="font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/50">
              Quoted so far
            </p>
            <p className="mt-1 font-mono-numbers text-xl text-forest sm:text-2xl">
              {currency.format(totalActual)}
            </p>
            {/* Hangs below on wide screens so the three big numbers keep a
                shared baseline. */}
            <p className="mt-0.5 font-mono-numbers text-[11px] text-ink/55 sm:absolute sm:right-0 sm:top-full sm:whitespace-nowrap">
              {currency.format(totalPaid)} paid
            </p>
          </div>

          <div className="min-w-[11rem] flex-1 border-t border-hairline pt-3 sm:flex-none sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <p className="font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/50">
              Budget
            </p>

            {editing || target == null ? (
              <form action={handleSubmit} className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  name="budget_target"
                  min={0}
                  defaultValue={target ?? ""}
                  placeholder="Set a budget"
                  autoFocus={editing}
                  className="w-32 rounded-md border border-hairline bg-parchment px-2 py-1 font-mono-numbers text-ink outline-none focus:border-forest"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-full bg-forest px-3 py-1 font-mono-numbers text-xs text-parchment disabled:opacity-50"
                >
                  Save
                </button>
                {target != null && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="font-mono-numbers text-xs text-ink/50 hover:text-forest"
                  >
                    Cancel
                  </button>
                )}
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                title="Change your budget"
                className="mt-1 block font-mono-numbers text-xl text-forest underline-offset-4 hover:underline sm:text-2xl"
              >
                {currency.format(target)}
              </button>
            )}

            {target != null && !editing && (
              <>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest/10">
                  <div
                    className={`h-1.5 rounded-full transition-[width] ${
                      isOver ? "bg-brass" : "bg-forest"
                    }`}
                    style={{ width: `${isOver ? 100 : pct}%` }}
                  />
                </div>
                <p
                  className={`mt-1.5 font-mono-numbers text-[11px] ${
                    isOver ? "text-brass" : "text-ink/60"
                  }`}
                >
                  {isOver
                    ? `${currency.format(Math.abs(remaining))} over`
                    : `${currency.format(remaining ?? 0)} under`}
                  {target > 0 && ` · ${Math.round((totalEstimate / target) * 100)}%`}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {proportion.length > 0 && (
        <div className="mt-5 border-t border-hairline pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/50">
              Where it&apos;s going
            </p>
            <p className="font-mono-numbers text-[11px] text-ink/55">
              {quotedCount} of {categoryCount} {quotedCount === 1 ? "line has" : "lines have"} a
              real number
            </p>
          </div>

          {/* The 2px gaps are the non-colour cue the palette's CVD margin
              requires -- segment boundaries stay visible even when two fills
              are hard to tell apart. */}
          <div className="mt-2 flex h-3 gap-[2px]">
            {proportion.map((slice, i) => (
              <span
                key={slice.key}
                title={`${slice.label} — ${slice.pct}%`}
                className="first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${slice.pct}%`,
                  backgroundColor: slice.key === "__rest" ? REST_COLOR : SLICE_COLORS[i],
                }}
              />
            ))}
          </div>

          <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-ink/70">
            {proportion.map((slice, i) => (
              <span key={slice.key} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: slice.key === "__rest" ? REST_COLOR : SLICE_COLORS[i],
                  }}
                />
                {slice.label}
                <span className="font-mono-numbers font-medium text-ink">{slice.pct}%</span>
              </span>
            ))}
          </p>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
    </div>
  );
}
