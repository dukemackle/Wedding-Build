"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { describeLastVerified, freshnessOf } from "@/lib/listing-freshness";
import { LISTING_PAGE_SIZE, listingQueryString, type ListingParams } from "./params";

export const buttonClass =
  "rounded-md border border-hairline bg-card px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60";

export function Thumb({ src }: { src: string | null }) {
  if (!src) {
    return (
      <div
        title="No photo"
        className="h-12 w-12 shrink-0 rounded-md bg-[repeating-linear-gradient(45deg,#f1f1ef,#f1f1ef_4px,#e7e8e5_4px,#e7e8e5_8px)] lg:h-9 lg:w-12"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- listing photos come from arbitrary hosts
    <img src={src} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-md object-cover lg:h-9 lg:w-12" />
  );
}

/** Five dots, one per thing a couple needs from a listing, with the missing ones named on hover. */
export function Completeness({ checks }: { checks: [label: string, ok: boolean][] }) {
  const done = checks.filter(([, ok]) => ok).length;
  const missing = checks.filter(([, ok]) => !ok).map(([label]) => label);
  return (
    <span
      title={missing.length ? `Missing: ${missing.join(", ")}` : "Complete"}
      className="inline-flex items-center gap-1.5"
    >
      <span className="inline-flex gap-0.5">
        {checks.map(([label, ok]) => (
          <span key={label} className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-forest" : "bg-hairline"}`} />
        ))}
      </span>
      <span className="font-mono-numbers text-xs text-ink/50">
        {done}/{checks.length}
      </span>
    </span>
  );
}

/** `short` drops the leading "checked" where the column heading already says it, or space is tight. */
export function LastChecked({ at, short = false }: { at: string | null; short?: boolean }) {
  const freshness = freshnessOf(at);
  const tone =
    freshness === "unverified"
      ? "text-red-800"
      : freshness === "stale"
        ? "text-amber-700"
        : freshness === "due"
          ? "text-ink/70"
          : "text-ink/50";
  const text = describeLastVerified(at);
  return <span className={tone}>{short ? text.replace(/^checked /, "") : text}</span>;
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs ${
        active ? "bg-forest/10 text-forest" : "bg-ink/5 text-ink/50"
      }`}
    >
      {active ? "Live" : "Hidden"}
    </span>
  );
}

export type MenuItem = { label: string; onSelect: () => void; danger?: boolean; disabled?: boolean };

/** The "⋯" button: actions that don't earn a button of their own on every row. */
export function RowMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-hairline bg-card px-2.5 py-1 text-sm text-ink hover:border-forest"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-hairline bg-card py-1 shadow-sm">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-parchment disabled:opacity-50 ${
                item.danger ? "text-red-800" : "text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  className = "",
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className={`h-4 w-4 shrink-0 accent-forest ${className}`}
    />
  );
}

export function BulkBar({
  count,
  noun,
  pending,
  error,
  onClear,
  actions,
}: {
  count: number;
  noun: string;
  pending: boolean;
  error?: string;
  onClear: () => void;
  actions: MenuItem[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-forest/5 px-3 py-2.5">
      <p className="text-sm font-medium text-ink">
        {count} {noun}
        {count === 1 ? "" : "s"} selected
      </p>
      <button type="button" onClick={onClear} className="text-xs text-ink/60 hover:underline">
        Clear
      </button>
      <span className="flex-1" />
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onSelect}
          disabled={pending}
          className={`${buttonClass} ${action.danger ? "text-red-800" : ""}`}
        >
          {action.label}
        </button>
      ))}
      {error && <p className="w-full text-xs text-red-800">{error}</p>}
    </div>
  );
}

export function Pagination({ params, total, noun }: { params: ListingParams; total: number; noun: string }) {
  const pathname = usePathname();
  const first = total === 0 ? 0 : (params.page - 1) * LISTING_PAGE_SIZE + 1;
  const last = Math.min(params.page * LISTING_PAGE_SIZE, total);
  const hasPrev = params.page > 1;
  const hasNext = last < total;
  const linkClass = `${buttonClass} inline-block`;

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm text-ink/60">
      <span className="font-mono-numbers text-xs">
        {first.toLocaleString()}–{last.toLocaleString()} of {total.toLocaleString()} {noun}s
      </span>
      <span className="flex gap-2">
        {hasPrev && (
          <Link href={`${pathname}${listingQueryString(params, { page: params.page - 1 })}`} className={linkClass}>
            ← Prev
          </Link>
        )}
        {hasNext && (
          <Link href={`${pathname}${listingQueryString(params, { page: params.page + 1 })}`} className={linkClass}>
            Next →
          </Link>
        )}
      </span>
    </div>
  );
}
