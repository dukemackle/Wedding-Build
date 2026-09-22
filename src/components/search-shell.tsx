"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The browse-and-map layout shared by Venues and Vendors.
 *
 * Two arrangements, not one that stretches:
 *
 * - Desktop puts the map and the results side by side, each filling the
 *   viewport and scrolling on its own, under one sticky filter bar.
 * - A phone makes the map the page and puts the results in a sheet dragged up
 *   from the bottom, so the two never fight for the same 375px.
 *
 * Both arrangements come out of one tree. Rendering a `hidden lg:flex` desktop
 * branch beside an `lg:hidden` phone one would mount two Leaflet maps and pull
 * every tile twice.
 */

const DESKTOP = "(min-width: 1024px)";
/** Sheet height as a fraction of the shell, resting and fully open. */
const SHEET_PEEK = 0.5;
const SHEET_FULL = 0.92;
/** Past this fraction of the travel, a drag completes instead of springing back. */
const SNAP_AT = 0.5;

export type SearchShellView = {
  key: string;
  /** Shown on the pill beside the count, e.g. "Saved". */
  label: string;
  /** A glyph standing in for the label where there is no room for words. */
  icon: string;
  count: number;
  panel: ReactNode;
};

export type SearchShellProps = {
  search: { value: string; onChange: (value: string) => void; placeholder: string };
  /** The filter pills. */
  filters: ReactNode;
  activeFilterCount: number;
  onClearFilters: () => void;
  /**
   * Pills that swap the results pane for a panel of their own -- saved
   * listings, sent inquiries. Keeps work that used to sit in stacked cards
   * above the browser reachable without spending screen on it.
   */
  views?: SearchShellView[];
  resultCount: number;
  /** Singular; pluralised with a trailing "s". */
  resultNoun: string;
  map: ReactNode;
  /** Shown in place of the grid when nothing matches. */
  empty: ReactNode;
  children: ReactNode;
};

export function SearchShell({
  search,
  filters,
  activeFilterCount,
  onClearFilters,
  views = [],
  resultCount,
  resultNoun,
  map,
  empty,
  children,
}: SearchShellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(true);
  const [activeView, setActiveView] = useState<string | null>(null);

  // The shell fills whatever is left under the nav. Measured rather than
  // hardcoded: the nav is one row on a phone and two from sm up.
  useEffect(() => {
    let frame = 0;

    function measure() {
      const el = rootRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      // The site footer sits below this screen. Leaving room for it is what
      // keeps the page from scrolling -- the panes scroll, the page does not.
      const footer = document.querySelector("footer");
      const footerHeight = footer ? footer.getBoundingClientRect().height : 0;
      setAvailableHeight(Math.max(420, window.innerHeight - top - footerHeight));
    }

    // Measured on a frame rather than straight away, and again whenever the
    // footer resizes: it lays out taller before its responsive styles land,
    // and reading it too early leaves a dead strip under the map.
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }

    schedule();
    window.addEventListener("resize", schedule);
    const footer = document.querySelector("footer");
    const observer = footer ? new ResizeObserver(schedule) : null;
    if (footer && observer) observer.observe(footer);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    function sync() {
      setIsDesktop(query.matches);
    }
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const view = views.find((v) => v.key === activeView) ?? null;
  const heading = view
    ? `${view.count} ${view.label.toLowerCase()}`
    : `${resultCount} ${resultNoun}${resultCount === 1 ? "" : "s"}`;

  const results = view ? (
    view.panel
  ) : resultCount === 0 ? (
    empty
  ) : (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">{children}</div>
  );

  function toggleView(key: string) {
    setActiveView((current) => (current === key ? null : key));
  }

  const viewPills = views.map((v) => (
    <ViewPill
      key={v.key}
      label={v.label}
      icon={v.icon}
      count={v.count}
      active={activeView === v.key}
      onToggle={() => toggleView(v.key)}
      compact={!isDesktop}
    />
  ));

  return (
    <div
      ref={rootRef}
      // Breaks out of the page's horizontal padding and eats its bottom
      // padding, so the map reaches all four edges.
      className="relative -mx-6 -mb-16 -mt-8 flex flex-col"
      style={availableHeight ? { height: availableHeight } : undefined}
    >
      {/* Controls. A floating overlay on a phone, a solid bar on desktop --
          `lg:contents` drops these wrapper rows so their children become
          items of the bar itself. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[700] flex flex-col gap-2 p-3 lg:static lg:z-auto lg:flex-row lg:items-center lg:gap-2 lg:border-b lg:border-hairline lg:bg-card lg:px-5 lg:py-2.5">
        <div className="pointer-events-auto flex items-center gap-2 lg:contents">
          <input
            type="search"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder}
            className="min-w-0 flex-1 rounded-full border border-hairline bg-card px-4 py-2 text-sm text-ink shadow-md outline-none focus:border-forest lg:w-60 lg:flex-none lg:shadow-none"
          />
          <>{viewPills}</>
        </div>
        <div className="pointer-events-auto -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] lg:contents [&::-webkit-scrollbar]:hidden">
          {filters}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="shrink-0 whitespace-nowrap rounded-full border border-hairline bg-card px-3 py-1.5 text-sm text-brass shadow-md lg:border-none lg:bg-transparent lg:px-0 lg:shadow-none lg:hover:underline"
            >
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
        <div className="hidden lg:block lg:flex-1" />
      </div>

      <div className="relative min-h-0 flex-1 lg:flex">
        {/* One map, positioned two ways. */}
        <div className="search-shell-map absolute inset-0 z-0 lg:static lg:w-[58%] lg:shrink-0">{map}</div>

        <ResultsPane
          heading={heading}
          isDesktop={isDesktop}
          onBack={view ? () => setActiveView(null) : undefined}
        >
          {results}
        </ResultsPane>
      </div>
    </div>
  );
}

function ViewPill({
  label,
  icon,
  count,
  active,
  onToggle,
  compact,
}: {
  label: string;
  icon: string;
  count: number;
  active: boolean;
  onToggle: () => void;
  compact: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      // A phone shows just the count -- the labels would push the search field
      // down to nothing once there is more than one of these.
      aria-label={`${label} (${count})`}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm shadow-md transition-colors lg:order-last lg:shadow-none ${
        active
          ? "border-brass bg-brass text-card"
          : "border-brass/50 bg-card text-brass hover:border-brass"
      }`}
    >
      {compact ? (
        <>
          <span aria-hidden>{icon}</span>
          {count}
        </>
      ) : (
        `${label} · ${count}`
      )}
    </button>
  );
}

/**
 * The results: a column beside the map on desktop, a sheet over it on a phone.
 * Drag the handle, or tap the heading, to move between peek and full.
 */
function ResultsPane({
  heading,
  isDesktop,
  onBack,
  children,
}: {
  heading: string;
  isDesktop: boolean;
  onBack?: () => void;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  // Live offset while a finger is down; null when settled.
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const startY = useRef(0);
  const travel = useRef(1);
  const ref = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const parent = ref.current?.parentElement;
    travel.current = Math.max(1, (parent?.clientHeight ?? 1) * (SHEET_FULL - SHEET_PEEK));
    startY.current = e.clientY;
    setDragOffset(0);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragOffset === null) return;
      // Down is positive; clamped so the sheet can't go past either snap.
      const raw = e.clientY - startY.current;
      const min = expanded ? 0 : -travel.current;
      const max = expanded ? travel.current : 0;
      setDragOffset(Math.min(max, Math.max(min, raw)));
    },
    [dragOffset, expanded],
  );

  const onPointerUp = useCallback(() => {
    if (dragOffset === null) return;
    if (Math.abs(dragOffset) / travel.current > SNAP_AT) setExpanded((v) => !v);
    setDragOffset(null);
  }, [dragOffset]);

  const sheetStyle = isDesktop
    ? undefined
    : {
        height: `${(expanded ? SHEET_FULL : SHEET_PEEK) * 100}%`,
        transform: dragOffset === null ? undefined : `translateY(${dragOffset}px)`,
        transition: dragOffset === null ? "height 220ms ease, transform 220ms ease" : "none",
      };

  return (
    <div
      ref={ref}
      style={sheetStyle}
      className="absolute inset-x-0 bottom-0 z-[600] flex flex-col rounded-t-2xl border-t border-hairline bg-card shadow-[0_-6px_24px_rgb(11_74_58/0.18)] lg:static lg:z-auto lg:min-w-0 lg:flex-1 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none"
    >
      <div
        onPointerDown={isDesktop ? undefined : onPointerDown}
        onPointerMove={isDesktop ? undefined : onPointerMove}
        onPointerUp={isDesktop ? undefined : onPointerUp}
        onPointerCancel={isDesktop ? undefined : onPointerUp}
        className="shrink-0 touch-none px-4 pb-2 pt-2.5 lg:cursor-auto lg:touch-auto lg:border-b lg:border-hairline lg:px-4 lg:py-3"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-hairline lg:hidden" />
        <div className="mt-2 flex items-baseline justify-center gap-3 lg:mt-0 lg:justify-between">
          <button
            type="button"
            onClick={isDesktop ? undefined : () => setExpanded((v) => !v)}
            aria-expanded={isDesktop ? undefined : expanded}
            className="font-display text-base font-semibold text-forest lg:cursor-default lg:text-lg"
          >
            {heading}
          </button>
          {onBack && (
            <button type="button" onClick={onBack} className="text-sm text-brass hover:underline">
              Back to all
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
    </div>
  );
}
