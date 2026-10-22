"use client";

import { useState } from "react";

/** The budget filter's saved value: "150:40000" (guests:budget), or "all". */
export function parseBudgetFilter(value: string): { guests: number; budget: number } | null {
  const [guests, budget] = value.split(":").map(Number);
  return guests > 0 && budget > 0 ? { guests, budget } : null;
}

/**
 * The menu behind the Budget pill: guests and a venue, food & drink budget.
 * Signed-in couples open it filled in from their guest list and budget page;
 * nothing filters until they apply it.
 */
export function BudgetPanel({
  value,
  defaults,
  onApply,
  close,
}: {
  value: string;
  defaults?: { guests: number; budget: number } | null;
  onApply: (value: string) => void;
  close: () => void;
}) {
  const start = parseBudgetFilter(value) ?? defaults ?? null;
  const [guests, setGuests] = useState(start ? String(start.guests) : "");
  const [budget, setBudget] = useState(start ? start.budget.toLocaleString() : "");
  const g = Number(guests);
  const b = Number(budget.replace(/[$,\s]/g, ""));
  const ready = Number.isInteger(g) && g > 0 && b > 0;

  function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    onApply(`${g}:${Math.round(b)}`);
    close();
  }

  const input =
    "mt-1 w-full rounded-md border border-hairline bg-parchment/60 px-2.5 py-1.5 font-mono-numbers text-base text-ink placeholder:text-ink/40 focus:border-forest focus:outline-none sm:text-sm";

  return (
    <form onSubmit={apply} className="p-3">
      <div className="grid grid-cols-[5.5rem_1fr] gap-2">
        <label className="text-xs font-medium text-ink/70">
          Guests
          <input
            inputMode="numeric"
            value={guests}
            onChange={(e) => setGuests(e.target.value.replace(/\D/g, ""))}
            placeholder="150"
            className={input}
          />
        </label>
        <label className="text-xs font-medium text-ink/70">
          Venue, food &amp; drink
          <input
            inputMode="numeric"
            value={budget}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              setBudget(digits ? Number(digits).toLocaleString() : "");
            }}
            placeholder="40,000"
            className={input}
          />
        </label>
      </div>
      {defaults && !parseBudgetFilter(value) && (
        <p className="mt-2 text-xs text-ink/50">Filled in from your guest list and budget.</p>
      )}
      <button
        type="submit"
        disabled={!ready}
        className="mt-3 w-full rounded-full bg-forest px-3 py-1.5 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-40"
      >
        Show venues in budget
      </button>
      <p className="mt-2 text-xs leading-snug text-ink/50">
        Room-only rentals include our estimate for food and drink. Venues that don&rsquo;t publish prices still show.
      </p>
    </form>
  );
}
