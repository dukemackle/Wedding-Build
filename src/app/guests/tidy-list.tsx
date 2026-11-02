"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * The list's loose ends in one card, each with the one button that fixes it.
 * Sides, groups and priorities feed the seating chart and the budget, so a
 * list imported with none of them set isn't really usable yet.
 *
 * "Hide for now" remembers the total it was hidden at and comes back when
 * there's more to do than that (a fresh import, say).
 */

const HIDDEN_KEY = "guests-tidy-hidden-at";

export type TidyAction =
  | { kind: "button"; label: string; onClick: () => void; primary?: boolean }
  | { kind: "link"; label: string; href: string };

export type TidyItem = {
  key: string;
  count: number;
  title: string;
  detail: ReactNode;
  action: TidyAction;
  icon: ReactNode;
};

function readHiddenAt() {
  try {
    const raw = window.localStorage.getItem(HIDDEN_KEY);
    return raw == null ? null : Number(raw);
  } catch {
    return null;
  }
}

export function useTidyHidden(total: number) {
  const [hiddenAt, setHiddenAt] = useState<number | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads browser storage once mounted
    setHiddenAt(readHiddenAt());
  }, []);
  const hidden = hiddenAt != null && total <= hiddenAt;
  function hide() {
    setHiddenAt(total);
    try {
      window.localStorage.setItem(HIDDEN_KEY, String(total));
    } catch {
      // Private window: it stays hidden until the page reloads.
    }
  }
  return { hidden, hide };
}

export function TidyList({ items, onHide }: { items: TidyItem[]; onHide: () => void }) {
  const open = items.filter((i) => i.count > 0);
  if (open.length === 0) return null;
  // Rough: a quick-sort guest takes a couple of seconds, the rest a minute or two each.
  const minutes = Math.max(
    5,
    Math.round(
      open.reduce((sum, i) => sum + (i.key === "unsorted" ? i.count * 2.5 : 90), 0) / 60 / 5,
    ) * 5,
  );

  return (
    <section
      aria-labelledby="tidy-title"
      className="rounded-lg border border-hairline bg-card p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="tidy-title" className="font-display text-2xl font-semibold text-forest sm:text-[28px]">
          Tidy your list
        </h2>
        <p className="text-xs text-ink/60 sm:text-sm">
          {open.length} {open.length === 1 ? "thing" : "things"} · about {minutes} minutes ·{" "}
          <button type="button" onClick={onHide} className="text-[#2243B6] hover:underline">
            Hide for now
          </button>
        </p>
      </div>
      <p className="mt-1 text-sm text-ink/60 max-sm:hidden">
        Sides, groups and priorities feed your seating chart and budget, so they&rsquo;re worth getting right.
      </p>
      <ul className="mt-3 flex flex-col">
        {open.map((item) => (
          <li
            key={item.key}
            className="flex flex-col gap-3 border-t border-hairline py-3.5 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
              <span
                aria-hidden="true"
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-forest ${
                  item.action.kind === "button" && item.action.primary ? "bg-[#FFF12F]" : "bg-[#F3F1EC]"
                }`}
              >
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-forest">{item.title}</p>
                <p className="text-sm text-ink/60">{item.detail}</p>
              </div>
            </div>
            {item.action.kind === "button" ? (
              <button
                type="button"
                onClick={item.action.onClick}
                className={`${item.action.primary ? "btn-primary" : "btn-secondary"} shrink-0 whitespace-nowrap max-sm:w-full`}
              >
                {item.action.label}
              </button>
            ) : (
              <a href={item.action.href} className="btn-secondary shrink-0 whitespace-nowrap max-sm:w-full">
                {item.action.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const TidyIcons = {
  sort: (
    <svg {...iconProps}>
      <path d="M4 6h16M4 12h10M4 18h7" />
      <path d="m16 15 2 2 4-4" />
    </svg>
  ),
  duplicate: (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5M21 20c0-3-3-5-6-5" />
    </svg>
  ),
  address: (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  name: (
    <svg {...iconProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
};
