"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { WIDE_WIDTH } from "@/lib/layout";

/**
 * The couple's saved venues or vendors, as its own page rather than a list
 * beside the map: the way a listings site shows favourites. A title, a
 * Venues/Vendors switch, a summary bar with the sort, then the same photo
 * cards as the search, each with the couple's note and when it was saved.
 *
 * Desktop: three columns. Phone: one.
 */
export function SavedPage({
  current,
  venueCount,
  vendorCount,
  summary,
  sort,
  sortOptions,
  onSort,
  onBack,
  empty,
  children,
}: {
  current: "venues" | "vendors";
  venueCount: number;
  vendorCount: number;
  /** The breakdown under the count, e.g. "2 Barn & Rustic, 1 Garden · 1 booked". */
  summary: string;
  sort: string;
  sortOptions: { value: string; label: string }[];
  onSort: (value: string) => void;
  onBack: () => void;
  empty: ReactNode;
  children: ReactNode;
}) {
  const count = current === "venues" ? venueCount : vendorCount;
  const noun = current === "venues" ? "venue" : "vendor";

  return (
    <div className={`mx-auto w-full ${WIDE_WIDTH} px-4 pb-16 pt-4 lg:px-6 lg:pt-6`}>
      <button type="button" onClick={onBack} className="text-sm text-[#2243B6] hover:underline">
        &lsaquo; Back to search
      </button>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="font-display text-4xl font-semibold leading-none text-forest lg:text-5xl">Saved</h2>
        <nav aria-label="Saved lists" className="inline-flex self-start rounded-full border border-hairline bg-card p-1 lg:self-auto">
          {(
            [
              ["venues", "Venues", venueCount],
              ["vendors", "Vendors", vendorCount],
            ] as const
          ).map(([key, label, n]) =>
            key === current ? (
              <span key={key} aria-current="page" className="rounded-full bg-forest px-4 py-1.5 text-sm text-parchment">
                {label} · {n}
              </span>
            ) : (
              <Link key={key} href={`/${key}?view=saved`} className="rounded-full px-4 py-1.5 text-sm text-ink hover:bg-ink/5">
                {label} · {n}
              </Link>
            ),
          )}
        </nav>
      </div>

      {count === 0 ? (
        <div className="mt-6">{empty}</div>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-hairline bg-card px-4 py-3 lg:px-5 lg:py-4">
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink lg:text-lg">
                {count} saved {noun}
                {count === 1 ? "" : "s"}
              </p>
              {summary && <p className="mt-0.5 text-[13px] text-ink/65">{summary}</p>}
            </div>
            <label className="relative shrink-0">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => onSort(e.target.value)}
                className="appearance-none rounded-lg border-[1.5px] border-forest bg-card py-2 pl-3 pr-8 text-sm font-semibold text-forest outline-none focus-visible:ring-2 focus-visible:ring-[#2243B6]/40"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </label>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-5 lg:grid-cols-3 lg:gap-5">{children}</div>
        </>
      )}
    </div>
  );
}

/** "2 Barn & Rustic, 1 Garden" from a list of labels, biggest first, four at most. */
export function countSummary(labels: (string | null | undefined)[], extra: string[] = []) {
  const counts = new Map<string, number>();
  for (const l of labels) if (l) counts.set(l, (counts.get(l) ?? 0) + 1);
  const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const shown = sorted.slice(0, 4).map(([l, n]) => `${n} ${l}`);
  if (sorted.length > 4) shown.push(`${sorted.length - 4} more`);
  return [shown.join(", "), ...extra].filter(Boolean).join(" · ");
}

export function savedOn(createdAt: string) {
  return `Saved ${new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

/**
 * The couple's note on a saved card: read as a line, tapped to edit. Notes
 * are where "holds our date until Nov 30" lives, so they sit on the card.
 */
export function SavedNote({
  notes,
  onSave,
}: {
  notes: string | null;
  onSave: (notes: string) => Promise<{ error?: string } | void>;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(notes ?? "");
  const [shown, setShown] = useState(notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await onSave(value.trim());
      if (result?.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setShown(value.trim());
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="mt-3 border-t border-hairline pt-3">
        <textarea
          autoFocus
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Pricing, availability, questions to ask..."
          className="w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="rounded-full bg-forest px-3 py-1 text-sm text-parchment disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save note"}
          </button>
          <button
            type="button"
            onClick={() => {
              setValue(shown);
              setEditing(false);
            }}
            className="px-2 py-1 text-sm text-ink/60 hover:text-ink"
          >
            Cancel
          </button>
          {error && <p className="text-xs text-red-800">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-hairline pt-2.5 text-[13px]">
      {shown ? (
        <button type="button" onClick={() => setEditing(true)} className="text-left text-ink hover:underline">
          <span className="text-ink/55">Your note: </span>
          {shown}
        </button>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="text-[#2243B6] hover:underline">
          + Add a note
        </button>
      )}
    </div>
  );
}
