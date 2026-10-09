"use client";

import { useState, type ReactNode } from "react";

/**
 * The two shells every block on the guests page sits in.
 *
 * This page used to be ten separate cards in one column: site settings, banner
 * photo, address collection, invites, reminders, guestbook, songs, the list
 * itself, registry, site details. Each was a reasonable card on its own, and
 * together they were a page nobody could find anything on -- the guest list,
 * the reason for the page, was eighth.
 *
 * So the blocks are grouped into four cards, and the ones that are alternate
 * ways of doing the same job (three ways to reach a guest; four kinds of guest
 * site content) share a card and take turns inside it.
 */
export function SectionCard({
  title,
  description,
  action,
  collapsible,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Phone only: the card folds down to its title and a one-line summary.
      Desktop always shows it open. */
  collapsible?: { summary?: ReactNode; defaultOpen?: boolean };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(collapsible?.defaultOpen ?? false);
  // Folded applies below lg only; from lg up everything shows regardless.
  const folded = collapsible && !open ? "hidden lg:block" : "";

  return (
    <section className="w-full rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {collapsible ? (
          <h2 className="font-display text-2xl font-semibold text-forest">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="flex items-center gap-2 text-left lg:pointer-events-none"
            >
              {title}
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`h-5 w-5 shrink-0 text-ink/50 transition-transform lg:hidden ${open ? "rotate-180" : ""}`}
              >
                <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </h2>
        ) : (
          <h2 className="font-display text-2xl font-semibold text-forest">{title}</h2>
        )}
        {action && <div className={folded}>{action}</div>}
      </div>
      {collapsible?.summary && !open && (
        <p className="mt-1 text-sm text-ink/70 lg:hidden">{collapsible.summary}</p>
      )}
      {description && <p className={`mt-1 text-sm text-ink/70 ${folded}`}>{description}</p>}
      <div className={`mt-5 ${folded}`}>{children}</div>
    </section>
  );
}

export type CardTab = {
  key: string;
  /** Shown on the desktop pill and in the mobile dropdown. Keep it short. */
  label: string;
  content: ReactNode;
  /** A tab with nothing to show -- no stragglers, no songs -- is left out. */
  hidden?: boolean;
};

export function TabbedCard({
  title,
  description,
  action,
  header,
  tabs,
  collapsible,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** Content that stays put above the tabs, whichever one is open. */
  header?: ReactNode;
  tabs: CardTab[];
  collapsible?: { summary?: ReactNode; defaultOpen?: boolean };
}) {
  const visible = tabs.filter((t) => !t.hidden);
  const [active, setActive] = useState(visible[0]?.key);

  // Every tab empty means the card has nothing to say at all.
  if (visible.length === 0) return null;

  const current = visible.find((t) => t.key === active) ?? visible[0];

  return (
    <SectionCard title={title} description={description} action={action} collapsible={collapsible}>
      {header && <div className="mb-5">{header}</div>}

      {visible.length > 1 && (
        <>
          {/* Phone: a dropdown. A row of pills at 375px either scrolls
              sideways or wraps into a three-line strip taller than the
              content under it. */}
          <select
            value={current.key}
            onChange={(e) => setActive(e.target.value)}
            className="w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest sm:hidden"
            aria-label={`${title} section`}
          >
            {visible.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Desktop: the choices all visible, which is the point of the room. */}
          <div className="hidden flex-wrap gap-2 sm:flex" role="tablist">
            {visible.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={t.key === current.key}
                onClick={() => setActive(t.key)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  t.key === current.key
                    ? "border-forest bg-forest text-parchment"
                    : "border-hairline bg-parchment text-ink hover:border-forest"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className={visible.length > 1 ? "mt-5" : ""}>{current.content}</div>
    </SectionCard>
  );
}
