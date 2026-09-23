"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";

/**
 * The card every dashboard section sits in.
 *
 * `collapsible` folds the body on a phone only -- the dashboard there is one
 * long column, and the budget and RSVP detail are worth a tap rather than a
 * scroll. From `lg` up everything is always open; there's room for it.
 */
export function DashboardPanel({
  eyebrow,
  title,
  summary,
  action,
  collapsible = false,
  children,
}: {
  eyebrow: string;
  title: string;
  /** Shown in the folded header on a phone, so it still says something closed. */
  summary?: string;
  action?: { href: string; label: string };
  collapsible?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const heading = (
    <div className="min-w-0">
      <p className="font-mono-numbers text-[10px] uppercase tracking-[0.2em] text-brass">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-forest">{title}</h2>
      {collapsible && summary && !open && (
        <p className="mt-1 text-sm text-ink/60 lg:hidden">{summary}</p>
      )}
    </div>
  );

  return (
    <section className="rounded-xl border border-hairline bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex flex-1 items-start justify-between gap-4 text-left lg:pointer-events-none"
          >
            {heading}
            <ChevronDownIcon
              className={`mt-5 h-5 w-5 shrink-0 text-ink/40 transition-transform lg:hidden ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        ) : (
          heading
        )}
        {action && (
          <Link
            href={action.href}
            className={`mt-5 shrink-0 text-sm font-medium text-brass hover:text-forest ${
              collapsible ? "hidden lg:inline" : ""
            }`}
          >
            {action.label} &rarr;
          </Link>
        )}
      </div>
      <div className={collapsible && !open ? "hidden lg:block" : ""}>
        <div className="mt-5">{children}</div>
        {collapsible && action && (
          <Link
            href={action.href}
            className="mt-4 inline-block text-sm font-medium text-brass hover:text-forest lg:hidden"
          >
            {action.label} &rarr;
          </Link>
        )}
      </div>
    </section>
  );
}
