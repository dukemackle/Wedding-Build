"use client";

import { useState, useTransition } from "react";
import { setBudgetOverride, clearBudgetOverride } from "./actions";

export type BudgetRow = {
  key: string;
  label: string;
  isPerGuest: boolean;
  computed: number;
  override: number | null;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function BudgetRowItem({ row }: { row: BudgetRow }) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const effectiveValue = row.override ?? row.computed;

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await setBudgetOverride(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setIsEditing(false);
      }
    });
  }

  function handleClear() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("category", row.key);
      const result = await clearBudgetOverride(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 border-b border-hairline py-4 last:border-b-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-ink">{row.label}</p>
          {row.isPerGuest && (
            <p className="text-xs text-ink/50">Scales with guest count</p>
          )}
        </div>

        {isEditing ? (
          <form action={handleSave} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="category" value={row.key} />
            <input
              type="number"
              name="override_value"
              min={0}
              defaultValue={effectiveValue}
              autoFocus
              className="w-28 rounded-md border border-hairline bg-parchment px-2 py-1 text-right font-mono-numbers text-ink outline-none focus:border-forest"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-forest px-3 py-1 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-hairline px-3 py-1 text-sm text-ink transition-colors hover:border-forest"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <span className="font-mono-numbers text-ink">
              {currency.format(effectiveValue)}
            </span>
            {row.override !== null && (
              <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-brass">
                actual
              </span>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-brass hover:underline"
            >
              Edit
            </button>
            {row.override !== null && (
              <button
                onClick={handleClear}
                disabled={isPending}
                className="text-xs text-ink/50 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-800">{error}</p>}
    </div>
  );
}

export function BudgetTable({
  rows,
  total,
}: {
  rows: BudgetRow[];
  total: number;
}) {
  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex items-baseline justify-between border-b border-hairline pb-6">
        <span className="font-display text-2xl font-semibold text-forest">
          Estimated total
        </span>
        <span className="font-mono-numbers text-3xl text-forest">
          {currency.format(total)}
        </span>
      </div>

      {rows.map((row) => (
        <BudgetRowItem key={row.key} row={row} />
      ))}
    </div>
  );
}
