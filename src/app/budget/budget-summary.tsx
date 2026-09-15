"use client";

import { useState, useTransition } from "react";
import { setBudgetTarget } from "./actions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * The three numbers that answer "where do we stand", sitting directly above
 * the columns they summarise: total estimate over Estimate, total actual over
 * Actual, and the budget target to the right with what's left.
 *
 * The target is edited here rather than in a card of its own -- showing the
 * same number in two places invites them to disagree, and this is where
 * someone is already looking when they think about it.
 */
export function BudgetSummary({
  totalEstimate,
  totalActual,
  target,
  categoryCount,
  contractCount,
}: {
  totalEstimate: number;
  totalActual: number;
  target: number | null;
  categoryCount: number;
  contractCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const pct = target && target > 0 ? Math.min(100, (totalActual / target) * 100) : 0;
  const remaining = target != null ? target - totalActual : null;
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
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-6 sm:contents">
          {/* Widths match the row grid below so each total lands over its column. */}
          <div className="sm:text-right">
            <p className="font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/50">
              Total estimate
            </p>
            <p className="mt-1 font-mono-numbers text-xl text-forest sm:text-2xl">
              {currency.format(totalEstimate)}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="font-mono-numbers text-[10px] uppercase tracking-[0.16em] text-ink/50">
              Total actual
            </p>
            <p
              className={`mt-1 font-mono-numbers text-xl sm:text-2xl ${
                isOver ? "text-brass" : "text-forest"
              }`}
            >
              {currency.format(totalActual)}
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
                    : `${currency.format(remaining ?? 0)} left`}
                  {target > 0 && ` · ${Math.round((totalActual / target) * 100)}% used`}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
    </div>
  );
}
