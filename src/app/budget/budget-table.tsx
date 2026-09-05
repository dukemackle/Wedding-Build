"use client";

import { useState, useTransition } from "react";
import type { ComponentType } from "react";
import { setBudgetOverride, clearBudgetOverride } from "./actions";
import {
  VenueIcon,
  CateringIcon,
  PhotographyIcon,
  VideographyIcon,
  FloralsIcon,
  MusicIcon,
  AttireIcon,
  PlannerIcon,
  StationeryIcon,
  FavorsIcon,
  CakeIcon,
  TransportationIcon,
} from "@/components/icons";

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  venue: VenueIcon,
  catering: CateringIcon,
  photography: PhotographyIcon,
  videography: VideographyIcon,
  florals: FloralsIcon,
  music: MusicIcon,
  attire: AttireIcon,
  planner: PlannerIcon,
  stationery: StationeryIcon,
  favors: FavorsIcon,
  cake: CakeIcon,
  transportation: TransportationIcon,
};

export type BudgetRow = {
  key: string;
  label: string;
  isPerGuest: boolean;
  computed: number;
  override: number | null;
  purchasedFrom: string | null;
  paidBy: string | null;
  suggestions: string[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function BudgetRowItem({
  row,
  payerSuggestions,
}: {
  row: BudgetRow;
  payerSuggestions: string[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const effectiveValue = row.override ?? row.computed;
  const datalistId = `purchased-from-${row.key}`;
  const payerDatalistId = `paid-by-${row.key}`;
  const Icon = CATEGORY_ICONS[row.key];

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-ink">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-brass" />}
            {row.label}
          </p>
          {row.isPerGuest && (
            <p className="text-xs text-ink/50">Scales with guest count</p>
          )}
          {!isEditing && row.purchasedFrom && (
            <p className="mt-1 text-xs text-brass">Purchased from {row.purchasedFrom}</p>
          )}
          {!isEditing && row.paidBy && (
            <p className="mt-1 text-xs text-ink/50">Paid by {row.paidBy}</p>
          )}
        </div>

        {isEditing ? (
          <form action={handleSave} className="flex flex-col items-start gap-2 sm:items-end">
            <input type="hidden" name="category" value={row.key} />
            <input
              type="number"
              name="override_value"
              min={0}
              defaultValue={effectiveValue}
              autoFocus
              className="w-28 rounded-md border border-hairline bg-parchment px-2 py-1 text-right font-mono-numbers text-ink outline-none focus:border-forest"
            />
            <input
              type="text"
              name="purchased_from"
              list={row.suggestions.length > 0 ? datalistId : undefined}
              placeholder="Purchased from (optional)"
              defaultValue={row.purchasedFrom ?? ""}
              className="w-full rounded-md border border-hairline bg-parchment px-2 py-1 text-sm text-ink outline-none focus:border-forest sm:w-56"
            />
            {row.suggestions.length > 0 && (
              <datalist id={datalistId}>
                {row.suggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            )}
            <input
              type="text"
              name="paid_by"
              list={payerSuggestions.length > 0 ? payerDatalistId : undefined}
              placeholder="Paid by (optional)"
              defaultValue={row.paidBy ?? ""}
              className="w-full rounded-md border border-hairline bg-parchment px-2 py-1 text-sm text-ink outline-none focus:border-forest sm:w-56"
            />
            {payerSuggestions.length > 0 && (
              <datalist id={payerDatalistId}>
                {payerSuggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            )}
            <div className="flex items-center gap-2">
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
            </div>
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
  payerSuggestions,
}: {
  rows: BudgetRow[];
  total: number;
  payerSuggestions: string[];
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
        <BudgetRowItem key={row.key} row={row} payerSuggestions={payerSuggestions} />
      ))}
    </div>
  );
}
