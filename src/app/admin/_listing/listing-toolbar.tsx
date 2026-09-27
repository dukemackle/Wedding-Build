"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  LISTING_SOURCES,
  SORT_LABELS,
  listingQueryString,
  type ListingParams,
  type ListingSort,
  type ListingStatus,
} from "./params";

export const STATUS_LABELS: Record<ListingStatus, string> = {
  all: "All",
  live: "Live",
  hidden: "Hidden",
  unverified: "Never checked",
  stale: "Out of date",
  incomplete: "Incomplete",
  claimed: "Claimed",
  no_email: "No email",
};

// Chips that count problems to work through, as opposed to plain slices.
const NEEDS_WORK: ListingStatus[] = ["unverified", "stale", "incomplete", "no_email"];

const selectClass =
  "rounded-md border border-hairline bg-card px-2.5 py-2 text-sm text-ink outline-none focus:border-forest";
const setClass = "border-forest bg-forest/5 text-forest";

function useNavigate(params: ListingParams) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function navigate(changes: Partial<ListingParams>) {
    // Any change to what's being looked at starts again from page one.
    const query = listingQueryString(params, { page: 1, ...changes });
    startTransition(() => router.replace(`${pathname}${query}`, { scroll: false }));
  }

  return { navigate, isPending };
}

export function StatusChips({
  params,
  statuses,
  counts,
}: {
  params: ListingParams;
  statuses: ListingStatus[];
  counts: Record<ListingStatus, number>;
}) {
  const { navigate } = useNavigate(params);

  return (
    <div className="mb-3 hidden flex-wrap gap-2 lg:flex">
      {statuses.map((status) => {
        const on = params.status === status;
        const warn = NEEDS_WORK.includes(status) && counts[status] > 0;
        return (
          <button
            key={status}
            type="button"
            onClick={() => navigate({ status })}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
              on ? "border-forest bg-forest text-parchment" : "border-hairline bg-card text-ink hover:border-forest"
            }`}
          >
            {STATUS_LABELS[status]}
            <span
              className={`font-mono-numbers text-xs ${
                on ? "text-parchment/70" : warn ? "text-amber-700" : "text-ink/45"
              }`}
            >
              {counts[status].toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FilterBar({
  params,
  statuses,
  counts,
  kindLabel,
  kindOptions,
  states,
}: {
  params: ListingParams;
  statuses: ListingStatus[];
  counts: Record<ListingStatus, number>;
  kindLabel: string;
  kindOptions: readonly string[];
  states: readonly string[];
}) {
  const { navigate, isPending } = useNavigate(params);
  const [q, setQ] = useState(params.q);
  const [showFilters, setShowFilters] = useState(false);

  // Search as you type, once typing pauses -- a request per keystroke would
  // race itself and flicker the list.
  useEffect(() => {
    if (q.trim() === params.q) return;
    const timer = setTimeout(() => navigate({ q: q.trim() }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navigate is rebuilt every render
  }, [q, params.q]);

  const activeFilters = [params.state, params.kind, params.source].filter(Boolean).length;

  const dropdowns = (
    <>
      <select
        aria-label="State"
        value={params.state}
        onChange={(e) => navigate({ state: e.target.value })}
        className={`${selectClass} ${params.state ? setClass : ""}`}
      >
        <option value="">All states</option>
        {states.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        aria-label={kindLabel}
        value={params.kind}
        onChange={(e) => navigate({ kind: e.target.value })}
        className={`${selectClass} ${params.kind ? setClass : ""}`}
      >
        <option value="">Any {kindLabel.toLowerCase()}</option>
        {kindOptions.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
      <select
        aria-label="Source"
        value={params.source}
        onChange={(e) => navigate({ source: e.target.value })}
        className={`${selectClass} ${params.source ? setClass : ""}`}
      >
        <option value="">Any source</option>
        {LISTING_SOURCES.map((s) => (
          <option key={s} value={s}>
            From {s}
          </option>
        ))}
      </select>
    </>
  );

  const sort = (
    <select
      aria-label="Sort"
      value={params.sort}
      onChange={(e) => navigate({ sort: e.target.value as ListingSort })}
      className={selectClass}
    >
      {(Object.keys(SORT_LABELS) as ListingSort[]).map((s) => (
        <option key={s} value={s}>
          Sort: {SORT_LABELS[s]}
        </option>
      ))}
    </select>
  );

  return (
    <div className={`border-b border-hairline p-3 transition-opacity ${isPending ? "opacity-70" : ""}`}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, city or email…"
          className="min-w-0 flex-1 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest"
        />

        {/* Desktop: everything in one row, status lives in the chips above. */}
        <div className="hidden items-center gap-2 lg:flex">
          {dropdowns}
          {sort}
        </div>

        {/* Phone: status as a dropdown, the rest behind a Filters button. */}
        <div className="grid grid-cols-[1fr_auto] gap-2 lg:hidden">
          <select
            aria-label="Status"
            value={params.status}
            onChange={(e) => navigate({ status: e.target.value as ListingStatus })}
            className={`${selectClass} ${params.status !== "all" ? setClass : ""}`}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]} ({counts[s].toLocaleString()})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`${selectClass} ${activeFilters > 0 ? setClass : ""}`}
          >
            Filters{activeFilters > 0 ? ` · ${activeFilters}` : ""}
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-col gap-2 lg:hidden [&>select]:w-full">
            {dropdowns}
            {sort}
          </div>
        )}
      </div>
    </div>
  );
}
