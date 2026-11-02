"use client";

import { useState, type ReactNode } from "react";
import { MARKET_COLORS, formatWeddingDate, type WeddingMatch } from "@/lib/marketplace";
import type { MarketListing } from "@/lib/supabase/types";

/** Cards the panel shows before "See all N matches". */
const SHOWN = 4;

/** Colours a couple can pick by hand, like the sell form allows. */
const MAX_COLORS = 3;

export type ShopYourWedding = {
  match: WeddingMatch;
  /** Live listings that suit the wedding, newest first. */
  matches: MarketListing[];
  /** The colour comes from their guest-site palette, so it isn't picked here. */
  colorsFromPalette: boolean;
  onPickColors: (colors: string[]) => void;
};

/**
 * The marketplace front page's panel for a couple still planning: their
 * colours, guest count and date as chips, and what matches all three. Navy,
 * with Wren's blues for the highlights.
 */
export function ShopYourWeddingPanel({
  shop,
  onSeeAll,
  renderCard,
}: {
  shop: ShopYourWedding;
  onSeeAll: () => void;
  renderCard: (listing: MarketListing) => ReactNode;
}) {
  const { match, matches, colorsFromPalette, onPickColors } = shop;
  const [picking, setPicking] = useState(false);
  const colors = match.colors.map((id) => MARKET_COLORS.find((c) => c.id === id)).filter((c) => c !== undefined);
  const shown = matches.slice(0, SHOWN);

  function toggle(id: string) {
    const next = match.colors.includes(id)
      ? match.colors.filter((c) => c !== id)
      : [...match.colors, id].slice(-MAX_COLORS);
    onPickColors(next);
  }

  const colorChip = (
    <>
      {colors.length > 0 ? (
        <span aria-hidden className="flex -space-x-1">
          {colors.map((c) => (
            <span key={c.id} className="h-3.5 w-3.5 rounded-full border border-white/70" style={{ background: c.dot }} />
          ))}
        </span>
      ) : (
        <span aria-hidden className="h-3.5 w-3.5 rounded-full border border-dashed border-[#5AE4FF]" />
      )}
      {colors.length > 0 ? colors.map((c) => c.label).join(", ") : "Pick your colours"}
    </>
  );

  return (
    <section className="mt-10 overflow-hidden rounded-3xl bg-forest p-5 text-parchment sm:p-8 lg:grid lg:grid-cols-[300px_1fr] lg:gap-10">
      <div className="flex flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5AE4FF]">Shop your wedding</p>
        <h2 className="mt-1.5 font-display text-[1.9rem] font-medium leading-[1.08] sm:text-4xl">
          Things that <em className="text-[#5AE4FF]">suit your day</em>
        </h2>
        <p className="mt-2 text-sm text-parchment/70">
          In your colours, enough for your guests, and rentals that are free on your date.
        </p>

        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          <li>
            {colorsFromPalette ? (
              <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5" title="From your guest site">
                {colorChip}
              </span>
            ) : (
              <button
                type="button"
                aria-expanded={picking}
                onClick={() => setPicking((p) => !p)}
                className="flex items-center gap-2 rounded-full border border-[#5AE4FF]/60 bg-white/10 px-3 py-1.5 hover:border-[#5AE4FF]"
              >
                {colorChip}
                <span aria-hidden className="text-[#5AE4FF]">✎</span>
              </button>
            )}
          </li>
          {match.guests > 0 && (
            <li className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">{match.guests} guests</li>
          )}
          {match.date && (
            <li className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">{formatWeddingDate(match.date)}</li>
          )}
        </ul>

        {picking && !colorsFromPalette && (
          <div className="mt-3 rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-parchment/70">Up to three. Pick a palette on your guest site and it fills in by itself.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MARKET_COLORS.map((c) => {
                const on = match.colors.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(c.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                      on ? "border-[#5AE4FF] bg-[#5AE4FF] text-forest" : "border-white/25 text-parchment hover:border-white/60"
                    }`}
                  >
                    <span aria-hidden className="h-3 w-3 rounded-full border border-white/70" style={{ background: c.dot }} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {matches.length > 0 && (
          <button
            type="button"
            onClick={onSeeAll}
            className="mt-5 hidden self-start rounded-full bg-[#5AE4FF] px-4 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-[#00BFFE] lg:inline-flex"
          >
            See all {matches.length} {matches.length === 1 ? "match" : "matches"} <span aria-hidden className="ml-1.5">→</span>
          </button>
        )}
      </div>

      <div className="mt-5 lg:mt-0">
        {shown.length === 0 ? (
          <div className="grid h-full place-items-center rounded-2xl border-[1.5px] border-dashed border-white/25 p-6 text-center">
            <p className="max-w-sm text-sm text-parchment/75">
              Nothing matches yet. New things are listed every week; {colorsFromPalette ? "" : "try another colour, or "}check back
              soon.
            </p>
          </div>
        ) : (
          // Phone: a row that scrolls sideways. Desktop: four across.
          <div className="-mr-5 flex snap-x gap-3 overflow-x-auto pb-1 pr-5 sm:-mr-8 sm:pr-8 lg:mr-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pr-0">
            {shown.map((l) => (
              <div key={l.id} className="w-[46vw] max-w-[220px] shrink-0 snap-start rounded-2xl bg-card p-2 text-ink lg:w-auto lg:max-w-none">
                {renderCard(l)}
              </div>
            ))}
          </div>
        )}
        {matches.length > 0 && (
          <button
            type="button"
            onClick={onSeeAll}
            className="mt-4 w-full rounded-full bg-[#5AE4FF] px-4 py-2.5 text-sm font-semibold text-forest lg:hidden"
          >
            See all {matches.length} {matches.length === 1 ? "match" : "matches"} <span aria-hidden>→</span>
          </button>
        )}
      </div>
    </section>
  );
}
