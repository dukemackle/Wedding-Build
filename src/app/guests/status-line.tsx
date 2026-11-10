"use client";

import { useState, type ReactNode } from "react";

export type StatusItem = {
  key: string;
  /** The quiet one-liner in the header. */
  label: ReactNode;
  /** Brass dot: something here wants a click (sheet changes to sync). */
  attention?: boolean;
  /** Opens under the line; kept mounted so a half-finished sync survives a close. */
  panel: ReactNode;
};

/**
 * The header's second line: the Google Sheet, the per-event headcounts and
 * the meal tally, each as a few words that open their full panel.
 *
 * These used to be three cards stacked between the header and the list, so
 * the first guest sat a screen down. They're things you check, not things
 * you work in, so they fold to one line until asked for.
 */
export function StatusLine({ items }: { items: StatusItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (items.length === 0) return null;

  return (
    <div className="mt-2 border-t border-hairline pt-2.5">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-ink/70">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-expanded={open === item.key}
            onClick={() => setOpen((o) => (o === item.key ? null : item.key))}
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-md text-left underline-offset-4 hover:text-forest hover:underline ${
              open === item.key ? "text-forest underline" : ""
            }`}
          >
            {item.attention && <span className="h-2 w-2 shrink-0 rounded-full bg-brass" aria-hidden="true" />}
            {item.label}
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className={`h-3.5 w-3.5 shrink-0 text-ink/40 transition-transform ${open === item.key ? "rotate-180" : ""}`}
            >
              <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div key={item.key} hidden={open !== item.key} className="mt-3">
          {item.panel}
        </div>
      ))}
    </div>
  );
}

/** "38 chicken · 29 fish · 5 not chosen" as a short phrase for the line. */
export function MealsPanel({ breakdown }: { breakdown: [string, number][] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-hairline bg-parchment px-4 py-3 text-sm text-ink/70">
      <span className="text-xs uppercase tracking-[0.15em] text-ink/40">Meals for the caterer</span>
      {breakdown.map(([meal, count]) => (
        <span key={meal}>
          <span className="font-mono-numbers text-forest">{count}</span>{" "}
          {meal === "Not selected" ? <span className="text-ink/50">not chosen yet</span> : meal}
        </span>
      ))}
      <span className="text-xs text-ink/50">Guests who said yes, plus-ones included.</span>
    </div>
  );
}
