"use client";

import { useState, useTransition } from "react";
import { setBudgetTarget } from "./actions";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";

export function BudgetTarget({
  target,
  actualSpending,
}: {
  target: number | null;
  actualSpending: number;
}) {
  const [editing, setEditing] = useState(target == null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

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

  const pct = target && target > 0 ? Math.min(100, (actualSpending / target) * 100) : 0;
  const remaining = target != null ? target - actualSpending : null;
  const isOver = remaining != null && remaining < 0;

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-8">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-2xl font-semibold text-forest">Your budget</span>
        {!editing && target != null && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-brass hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form action={handleSubmit} className="mt-4 flex flex-wrap items-center gap-3">
          <input
            name="budget_target"
            type="number"
            min="0"
            step="1"
            defaultValue={target ?? ""}
            placeholder="e.g. 35000"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-forest px-4 py-2 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
          {target != null && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-ink/60 hover:underline"
            >
              Cancel
            </button>
          )}
        </form>
      ) : (
        <p className="mt-2 font-mono-numbers text-3xl text-forest">
          {currency.format(target ?? 0)}
        </p>
      )}
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}

      {target != null && (
        <div className="mt-6 border-t border-hairline pt-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-ink/70">Actual spending so far</span>
            <span className="font-mono-numbers text-lg text-ink">
              {currency.format(actualSpending)}
            </span>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-forest/10">
            <div
              className={`h-3 rounded-full transition-[width] ${isOver ? "bg-brass" : "bg-forest"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink/50">
            {remaining != null && remaining >= 0
              ? `${currency.format(remaining)} remaining`
              : `${currency.format(Math.abs(remaining ?? 0))} over so far`}
          </p>
        </div>
      )}
    </div>
  );
}
