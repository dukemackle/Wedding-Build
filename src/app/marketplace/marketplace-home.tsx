"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { BirdEmptyState } from "@/components/wren-moments";
import { WIDE_WIDTH } from "@/lib/layout";
import { MARKET_CATEGORIES, formatPrice } from "@/lib/marketplace";
import type { PassItOnDraft } from "@/lib/pass-it-on";
import type { MarketListing } from "@/lib/supabase/types";

/** Soft fills mixed from the palette (Lemon, Sky, Royal, Gold) with white. */
const TINTS = ["#fff7c2", "#dff7ff", "#fff3cc", "#e3e9ff"];

/** Tile labels that must fit a quarter of a phone. */
const SHORT_LABELS: Record<string, string> = { attire: "Dresses" };

/** How many listings "Just listed" shows before "See all". */
const JUST_LISTED = 8;

/** Drafts the "Pass it on" card shows before "+N more". */
const DRAFTS_SHOWN = 3;

/**
 * The marketplace's front page: categories and the newest listings, with the
 * map one tap away. A map with a handful of pins makes a young marketplace
 * look empty; tiles and cards look the same with ten listings as with ten
 * thousand.
 */
export function MarketplaceHome({
  listings,
  signedIn,
  placeLabel,
  counts,
  passItOn = null,
  onBrowse,
  renderCard,
}: {
  listings: MarketListing[];
  signedIn: boolean;
  /** "Encinitas", when we know where the couple's wedding is. */
  placeLabel: string | null;
  counts: { saved: number; selling: number; unread: number };
  /** After the wedding, the couple's unlisted leftovers from their budget. */
  passItOn?: PassItOnDraft[] | null;
  /** Opens the full browse screen, filtered, in map or grid. */
  onBrowse: (opts: { q?: string; category?: string; type?: string; mode: "map" | "grid"; view?: string }) => void;
  renderCard: (listing: MarketListing) => ReactNode;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "sale" | "rent">("all");
  const shown = type === "all" ? listings : listings.filter((l) => l.listing_type === type);
  const newest = shown.slice(0, JUST_LISTED);
  const typeFilter = type === "all" ? undefined : type;
  const sellHref = signedIn ? "/marketplace/new" : "/signup?next=/marketplace/new";

  const perCategory = new Map<string, number>();
  for (const l of shown) perCategory.set(l.category, (perCategory.get(l.category) ?? 0) + 1);
  const emptyCategory = MARKET_CATEGORIES.find((c) => c.value !== "other" && !perCategory.get(c.value));

  return (
    <div className={`mx-auto mt-6 w-full ${WIDE_WIDTH} pb-24`}>
      {/* Phone: one column, sell card under the search. Desktop: side by side. */}
      <section className="grid gap-5 rounded-3xl border border-hairline bg-[#fbf8f1] p-5 sm:p-8 lg:grid-cols-[1fr_340px] lg:items-center lg:gap-10">
        <div>
          <h2 className="font-display text-[2.1rem] font-medium leading-[1.05] text-forest sm:text-5xl">
            Loved once, <em className="text-brass">ready for another “I do”</em>
          </h2>
          <p className="mt-3 max-w-lg text-[15px] text-ink/65">
            Décor, dresses and details from real weddings. Buy them, rent them, or pass yours on.
          </p>
          <form
            className="mt-5 flex flex-wrap items-center gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              onBrowse({ q: q.trim() || undefined, type: typeFilter, mode: "grid" });
            }}
          >
            <label className="flex w-full items-center gap-2 rounded-full border border-hairline bg-card px-4 py-3 shadow-sm focus-within:border-forest sm:w-auto sm:min-w-[300px] sm:flex-1 lg:max-w-md">
              <svg aria-hidden width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-ink/40">
                <circle cx="7" cy="7" r="5" />
                <path d="M11 11l4 4" />
              </svg>
              <span className="sr-only">Search the marketplace</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Arches, centerpieces, a veil…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
              />
            </label>
            <div role="group" aria-label="Buy or rent" className="flex rounded-full border border-hairline bg-card p-1">
              {(
                [
                  ["all", "Everything"],
                  ["sale", "Buy"],
                  ["rent", "Rent"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={type === value}
                  onClick={() => setType(value)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    type === value ? "bg-forest text-parchment" : "text-ink/60 hover:text-forest"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-hairline bg-card p-5 shadow-[0_10px_30px_-18px_rgba(20,32,61,0.35)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a6b00]">Pass it on</p>
          {passItOn && passItOn.length > 0 ? (
            <>
              <h3 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-forest">
                Wren found {passItOn.length === 1 ? "one thing" : `${passItOn.length} things`} from your wedding
              </h3>
              <p className="mt-1 text-sm text-ink/60">From your budget. Add a photo and {passItOn.length === 1 ? "it’s" : "they’re"} listed.</p>
              <ul className="mt-3">
                {passItOn.slice(0, DRAFTS_SHOWN).map((d) => (
                  <li key={d.source} className="border-t border-hairline">
                    <Link
                      href={`/marketplace/new?pass=1&from=${encodeURIComponent(d.source)}`}
                      className="group flex items-center gap-3 py-2.5"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[1.5px] border-dashed border-[#d8cdb3] text-forest/70 group-hover:border-forest/50">
                        <CategoryIcon category={d.category} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-forest group-hover:underline">{d.title}</span>
                        <span className="block text-xs text-ink/50">
                          {d.paidCents ? `You paid ${formatPrice(d.paidCents)}` : "Add a photo and a price"}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-[#2243B6]">
                        {d.suggestCents ? `suggest ${formatPrice(d.suggestCents)}` : "List it"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <Link
                  href="/marketplace/new?pass=1"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD301] px-4 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-[#FFF12F]"
                >
                  List my wedding <span aria-hidden>→</span>
                </Link>
                {passItOn.length > DRAFTS_SHOWN && (
                  <span className="text-sm text-ink/55">+{passItOn.length - DRAFTS_SHOWN} more</span>
                )}
              </div>
              <div className="mt-3 border-t border-hairline pt-3">
                {signedIn && (
              <span className="flex gap-3 text-sm">
                <button type="button" onClick={() => onBrowse({ mode: "grid", view: "selling" })} className="text-[#2243B6] hover:underline">
                  Selling · {counts.selling}
                </button>
                <button type="button" onClick={() => onBrowse({ mode: "grid", view: "saved" })} className="text-[#2243B6] hover:underline">
                  Saved · {counts.saved}
                </button>
                <Link href="/marketplace/inbox" className="text-[#2243B6] hover:underline">
                  Messages{counts.unread > 0 ? ` · ${counts.unread}` : ""}
                </Link>
              </span>
            )}
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-forest">
                Wedding over? Your décor isn’t done.
              </h3>
              <p className="mt-1.5 text-sm text-ink/60">A few photos and a price, and the next couple can give it another day.</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href={sellHref}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FFD301] px-4 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-[#FFF12F]"
                >
                  Sell something <span aria-hidden>→</span>
                </Link>
                {signedIn && (
              <span className="flex gap-3 text-sm">
                <button type="button" onClick={() => onBrowse({ mode: "grid", view: "selling" })} className="text-[#2243B6] hover:underline">
                  Selling · {counts.selling}
                </button>
                <button type="button" onClick={() => onBrowse({ mode: "grid", view: "saved" })} className="text-[#2243B6] hover:underline">
                  Saved · {counts.saved}
                </button>
                <Link href="/marketplace/inbox" className="text-[#2243B6] hover:underline">
                  Messages{counts.unread > 0 ? ` · ${counts.unread}` : ""}
                </Link>
              </span>
            )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionHead title="Shop by category" />
        <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8">
          {MARKET_CATEGORIES.map((c, i) => {
            const n = perCategory.get(c.value) ?? 0;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => onBrowse({ category: c.value, type: typeFilter, mode: "grid" })}
                className="group rounded-2xl border border-hairline bg-card px-1 py-3 text-center transition hover:-translate-y-0.5 hover:border-forest/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-2 sm:py-4"
              >
                <span
                  className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full text-forest sm:h-14 sm:w-14"
                  style={{ background: TINTS[i % TINTS.length] }}
                >
                  <CategoryIcon category={c.value} />
                </span>
                <span className="block text-xs font-medium text-forest sm:text-sm">{SHORT_LABELS[c.value] ?? c.label}</span>
                <span className={`block text-[10.5px] sm:text-xs ${n ? "text-ink/50" : "font-medium text-[#9a6b00]"}`}>
                  {n ? `${n} listed` : "Be the first"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <SectionHead
          title="Just listed"
          action={
            shown.length > 0 && (
              <button type="button" onClick={() => onBrowse({ type: typeFilter, mode: "grid" })} className="text-sm font-medium text-[#2243B6] hover:underline">
                See all {shown.length}
              </button>
            )
          }
        />
        {shown.length === 0 && listings.length === 0 ? (
          <BirdEmptyState>
            <p className="text-sm text-ink/60">Nothing listed yet. Be the first to pass something on.</p>
          </BirdEmptyState>
        ) : (
          // Phone: a row that scrolls sideways. Desktop: four across.
          <div className="-mr-6 flex snap-x gap-3 overflow-x-auto pb-2 pr-6 sm:mr-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:pr-0 lg:grid-cols-4">
            {newest.map((l) => (
              <div key={l.id} className="w-[46vw] max-w-[220px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                {renderCard(l)}
              </div>
            ))}
            {newest.length < JUST_LISTED && (
              <div className="flex w-[60vw] max-w-[240px] shrink-0 snap-start flex-col justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-[#d8cdb3] bg-[#fbf8f1] p-5 sm:w-auto sm:max-w-none">
                <p className="font-display text-xl font-semibold leading-snug text-forest">
                  {emptyCategory
                    ? `No ${emptyCategory.label.toLowerCase()} listed${placeLabel ? ` near ${placeLabel}` : ""} yet`
                    : "Got something left over?"}
                </p>
                <p className="text-sm text-ink/60">Sitting in a closet or a garage? Another couple is looking for it.</p>
                <Link href={sellHref} className="self-start rounded-full border border-forest px-3.5 py-1.5 text-sm font-medium text-forest hover:bg-forest hover:text-parchment">
                  List it in a few minutes
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      {shown.length > 0 && (
        <button
          type="button"
          onClick={() => onBrowse({ type: typeFilter, mode: "map" })}
          className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-medium text-parchment shadow-[0_10px_24px_-8px_rgba(20,32,61,0.6)] hover:bg-forest/90"
        >
          <svg aria-hidden width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M1 3l4.5-2 5 2 4.5-2v12l-4.5 2-5-2L1 15z" />
            <path d="M5.5 1v12M10.5 3v12" />
          </svg>
          Map · {shown.length}
        </button>
      )}
    </div>
  );
}

function SectionHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <h2 className="font-display text-2xl font-semibold text-forest sm:text-[1.75rem]">{title}</h2>
      {action}
    </div>
  );
}

/** Line drawings for the eight categories, sized by their circle. */
export function CategoryIcon({ category, className = "h-6 w-6 sm:h-7 sm:w-7" }: { category: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    decor: (
      <>
        <path d="M5 27V13a10 10 0 0120 0v14" />
        <path d="M9 27V14a6 6 0 0112 0v13" />
        <circle cx="8" cy="9" r="1.5" fill="#e0a100" stroke="none" />
        <circle cx="22" cy="9" r="1.5" fill="#e0a100" stroke="none" />
      </>
    ),
    signage: (
      <>
        <rect x="5" y="5" width="20" height="14" rx="2" />
        <path d="M10 19l-3 8M20 19l3 8M10 10h10M12 14h6" />
      </>
    ),
    attire: (
      <>
        <path d="M12 4h6l-1 6 7 17H6l7-17z" />
        <path d="M13 10h4" />
      </>
    ),
    tableware: <path d="M9 4h12l-1 9a5 5 0 01-10 0zM15 18v8M10 27h10" />,
    florals: (
      <>
        <circle cx="15" cy="10" r="4" />
        <circle cx="9" cy="14" r="3.5" />
        <circle cx="21" cy="14" r="3.5" />
        <path d="M15 17v10M11 22l4 2 4-2" />
      </>
    ),
    lighting: (
      <>
        <path d="M15 3v4M10 7h10l-2 4h-6z" />
        <rect x="10" y="11" width="10" height="14" rx="2" />
        <path d="M15 15v5" stroke="#e0a100" strokeWidth="2" />
      </>
    ),
    stationery: (
      <>
        <rect x="5" y="8" width="20" height="15" rx="2" />
        <path d="M5 9l10 7 10-7" />
      </>
    ),
    other: (
      <>
        <rect x="6" y="12" width="18" height="13" rx="1.5" />
        <path d="M4 8h22v4H4zM15 8v17M15 8c-2-5-7-5-6-1M15 8c2-5 7-5 6-1" />
      </>
    ),
  };
  return (
    <svg aria-hidden viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[category] ?? paths.other}
    </svg>
  );
}
