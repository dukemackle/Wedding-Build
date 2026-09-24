"use client";

import { useMemo, useState, useTransition } from "react";
import type { AttireItem, AttirePartyMember, AttireShortlistEntry } from "@/lib/supabase/types";
import { ATTIRE_CATEGORIES, STYLE_TIERS } from "@/lib/wedding-options";
import { ATTIRE_CATEGORY_META, canBuy, canRent, lowestPrice, swatch } from "@/lib/attire";
import { toggleAttireShortlist, updateAttireShortlistNotes, updatePartyMember } from "./actions";
import { AttireCard, AttireImage, ColorDots, HeartButton, PricePills } from "./attire-card";
import { AttireQuickView } from "./attire-quick-view";
import { PartyBoard } from "./party-board";

type Category = (typeof ATTIRE_CATEGORIES)[number];
type View = "browse" | "saved" | "party";
type Mode = "any" | "buy" | "rent";
type Sort = "featured" | "price-asc" | "price-desc" | "newest" | "name";

/**
 * The attributes people shop by. Each only appears in the sidebar once some
 * item in the current category has a value for it, so the filters grow with
 * the catalog instead of showing empty headings today.
 */
const FACETS = [
  { key: "silhouette", label: "Silhouette" },
  { key: "neckline", label: "Neckline" },
  { key: "sleeves", label: "Sleeves" },
  { key: "length", label: "Length" },
  { key: "fabric", label: "Fabric" },
  { key: "designer", label: "Designer" },
  { key: "price_tier", label: "Price tier" },
] as const;
type FacetKey = (typeof FACETS)[number]["key"] | "colors";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name" },
];

const PARTY_CATEGORIES: Category[] = ["Bridesmaid Dress", "Groomsmen Attire"];

function countBy(values: (string | null | undefined)[]) {
  const counts = new Map<string, number>();
  for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function Chevron({ open }: { open: boolean }) {
  return <span className="text-base leading-none text-ink/50">{open ? "−" : "+"}</span>;
}

function FacetSection({
  label,
  defaultOpen,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-hairline py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-[0.14em] text-ink"
        aria-expanded={open}
      >
        {label}
        <Chevron open={open} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

type Filters = {
  mode: Mode;
  maxPrice: number | null;
  selected: Partial<Record<FacetKey, string[]>>;
};

const EMPTY_FILTERS: Filters = { mode: "any", maxPrice: null, selected: {} };

function FilterPanel({
  items,
  filters,
  setFilters,
}: {
  items: AttireItem[];
  filters: Filters;
  setFilters: (f: Filters) => void;
}) {
  const prices = items.map(lowestPrice).filter((p): p is number => p != null);
  const floor = prices.length ? Math.floor(Math.min(...prices) / 10) * 10 : 0;
  const ceiling = prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 0;
  const colors = countBy(items.flatMap((i) => i.colors ?? []));

  function toggle(key: FacetKey, value: string) {
    const current = filters.selected[key] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setFilters({ ...filters, selected: { ...filters.selected, [key]: next } });
  }

  return (
    <div>
      <div className="border-b border-hairline pb-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink">Buy or rent</p>
        <div className="mt-3 flex rounded-full bg-ink/5 p-1">
          {(["any", "buy", "rent"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilters({ ...filters, mode: m })}
              className={`flex-1 rounded-full py-1.5 text-sm capitalize transition-colors ${
                filters.mode === m ? "bg-card font-medium text-forest shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              {m === "any" ? "Either" : m}
            </button>
          ))}
        </div>
      </div>

      {ceiling > floor && (
        <FacetSection label="Price" defaultOpen>
          <input
            type="range"
            min={floor}
            max={ceiling}
            step={10}
            value={filters.maxPrice ?? ceiling}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFilters({ ...filters, maxPrice: v >= ceiling ? null : v });
            }}
            className="w-full accent-forest"
            aria-label="Maximum price"
          />
          <div className="mt-1 flex justify-between font-mono-numbers text-xs text-ink/60">
            <span>${floor.toLocaleString()}</span>
            <span>
              {filters.maxPrice != null ? "up to " : ""}${(filters.maxPrice ?? ceiling).toLocaleString()}
            </span>
          </div>
        </FacetSection>
      )}

      {colors.length > 0 && (
        <FacetSection label="Colour" defaultOpen>
          <div className="grid grid-cols-4 gap-x-2 gap-y-3">
            {colors.map(([c, n]) => {
              const on = filters.selected.colors?.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggle("colors", c)}
                  className="flex flex-col items-center gap-1 text-[11px] leading-tight text-ink/70"
                  title={`${c} (${n})`}
                >
                  <span
                    className={`h-8 w-8 rounded-full border ${on ? "border-forest ring-2 ring-forest ring-offset-2" : "border-ink/15"}`}
                    style={{ backgroundColor: swatch(c) }}
                  />
                  <span className="text-center">{c}</span>
                </button>
              );
            })}
          </div>
        </FacetSection>
      )}

      {FACETS.map(({ key, label }) => {
        const values =
          key === "price_tier"
            ? STYLE_TIERS.map((t) => [t, items.filter((i) => i.price_tier === t).length] as [string, number]).filter(
                ([, n]) => n > 0,
              )
            : countBy(items.map((i) => i[key]));
        if (values.length === 0) return null;
        const selected = filters.selected[key] ?? [];
        return (
          <FacetSection key={key} label={label} defaultOpen={key === "silhouette" || selected.length > 0}>
            <div className="flex flex-col gap-2">
              {values.map(([v, n]) => (
                <label key={v} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/80">
                  <input
                    type="checkbox"
                    checked={selected.includes(v)}
                    onChange={() => toggle(key, v)}
                    className="h-4 w-4 accent-forest"
                  />
                  <span className="flex-1">{v}</span>
                  <span className="font-mono-numbers text-xs text-ink/40">{n}</span>
                </label>
              ))}
            </div>
          </FacetSection>
        );
      })}
    </div>
  );
}

function applyFilters(items: AttireItem[], f: Filters, search: string) {
  const q = search.trim().toLowerCase();
  return items.filter((i) => {
    if (f.mode === "buy" && !canBuy(i)) return false;
    if (f.mode === "rent" && !canRent(i)) return false;
    if (f.maxPrice != null) {
      const p = lowestPrice(i);
      if (p == null || p > f.maxPrice) return false;
    }
    for (const [key, values] of Object.entries(f.selected) as [FacetKey, string[]][]) {
      if (!values?.length) continue;
      if (key === "colors") {
        if (!values.some((v) => i.colors?.includes(v))) return false;
      } else if (!values.includes(i[key] ?? "")) return false;
    }
    if (q) {
      const haystack = [i.name, i.designer, i.style, i.silhouette, i.description, ...(i.colors ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

function sortItems(items: AttireItem[], sort: Sort) {
  const sorted = [...items];
  const price = (i: AttireItem) => lowestPrice(i) ?? Number.POSITIVE_INFINITY;
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => price(a) - price(b));
    case "price-desc":
      return sorted.sort((a, b) => (lowestPrice(b) ?? -1) - (lowestPrice(a) ?? -1));
    case "newest":
      return sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }
}

function PartyPromo({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="col-span-2 flex flex-col justify-end rounded-md bg-gradient-to-br from-forest to-[#123f33] p-6 text-left text-parchment sm:col-span-1 sm:aspect-[3/4] lg:p-7"
    >
      <span className="font-mono-numbers text-[11px] uppercase tracking-[0.2em] text-brass">The party</span>
      <span className="mt-2 font-display text-3xl font-semibold leading-[1.05]">Dress the whole party to match</span>
      <span className="mt-3 text-sm leading-relaxed text-parchment/80">
        Give each bridesmaid and groomsman a look, track who&apos;s ordered, and send everyone one link.
      </span>
      <span className="mt-5 self-start rounded-full border border-parchment px-4 py-2 text-xs font-medium uppercase tracking-[0.12em]">
        Open the party board
      </span>
    </button>
  );
}

function SavedNotes({ entry }: { entry: AttireShortlistEntry }) {
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const result = await updateAttireShortlistNotes(fd);
          setSaved(!result?.error);
        })
      }
      className="mt-3 flex items-start gap-2"
    >
      <input type="hidden" name="attire_item_id" value={entry.attire_item_id} />
      <textarea
        name="notes"
        rows={2}
        placeholder="Notes: size, alterations, who's wearing it…"
        defaultValue={entry.notes ?? ""}
        onChange={() => setSaved(false)}
        className="min-w-0 flex-1 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest"
      />
      <button
        type="submit"
        disabled={isPending || saved}
        className="rounded-md border border-hairline px-3 py-2 text-sm text-ink transition-colors hover:border-forest disabled:opacity-50"
      >
        {isPending ? "Saving…" : saved ? "Saved" : "Save"}
      </button>
    </form>
  );
}

export function AttireBrowser({
  items,
  shortlist,
  party,
  vendorNames,
  shareToken,
  initialView = "browse",
}: {
  initialView?: View;
  items: AttireItem[];
  shortlist: AttireShortlistEntry[];
  party: AttirePartyMember[];
  vendorNames: Record<string, string>;
  shareToken: string | null;
}) {
  const [view, setView] = useState<View>(initialView);
  const [category, setCategory] = useState<Category>("Wedding Dress");
  const [styleTab, setStyleTab] = useState<string>("all");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [openId, setOpenId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dense, setDense] = useState(false);

  // Saved state lives here so the heart on a card, the quick view and the
  // Saved tab all agree the moment one of them changes.
  const [savedIds, setSavedIds] = useState(() => new Set(shortlist.map((s) => s.attire_item_id)));
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const [lastShortlist, setLastShortlist] = useState(shortlist);
  if (shortlist !== lastShortlist) {
    setLastShortlist(shortlist);
    setSavedIds(new Set(shortlist.map((s) => s.attire_item_id)));
  }

  const [partyState, setPartyState] = useState(party);
  const [lastParty, setLastParty] = useState(party);
  if (party !== lastParty) {
    setLastParty(party);
    setPartyState(party);
  }

  const active = useMemo(() => items.filter((i) => i.is_active !== false), [items]);
  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const inCategory = useMemo(() => active.filter((i) => i.category === category), [active, category]);
  const styles = useMemo(() => countBy(inCategory.map((i) => i.style)), [inCategory]);
  const inTab = styleTab === "all" ? inCategory : inCategory.filter((i) => i.style === styleTab);
  const results = sortItems(applyFilters(inTab, filters, search), sort);

  const activeChips: { label: string; clear: () => void }[] = [
    ...(filters.mode !== "any"
      ? [{ label: filters.mode === "buy" ? "Buy" : "Rent", clear: () => setFilters({ ...filters, mode: "any" }) }]
      : []),
    ...(filters.maxPrice != null
      ? [{ label: `Under $${filters.maxPrice.toLocaleString()}`, clear: () => setFilters({ ...filters, maxPrice: null }) }]
      : []),
    ...(Object.entries(filters.selected) as [FacetKey, string[]][]).flatMap(([key, values]) =>
      (values ?? []).map((v) => ({
        label: v,
        clear: () =>
          setFilters({ ...filters, selected: { ...filters.selected, [key]: values.filter((x) => x !== v) } }),
      })),
    ),
  ];

  function chooseCategory(c: Category) {
    setCategory(c);
    setStyleTab("all");
    setFilters(EMPTY_FILTERS);
    setView("browse");
  }

  function toggleSave(id: string) {
    const wasSaved = savedIds.has(id);
    setSavedIds((s) => {
      const next = new Set(s);
      if (wasSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    setPendingIds((s) => new Set(s).add(id));
    const fd = new FormData();
    fd.set("attire_item_id", id);
    fd.set("is_shortlisted", String(wasSaved));
    startTransition(async () => {
      const result = await toggleAttireShortlist(fd);
      if (result?.error) {
        setSavedIds((s) => {
          const next = new Set(s);
          if (wasSaved) next.add(id);
          else next.delete(id);
          return next;
        });
      }
      setPendingIds((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    });
  }

  function assign(memberId: string, itemId: string) {
    setPartyState((all) => all.map((m) => (m.id === memberId ? { ...m, attire_item_id: itemId } : m)));
    const fd = new FormData();
    fd.set("id", memberId);
    fd.set("attire_item_id", itemId);
    startTransition(async () => {
      await updatePartyMember(fd);
    });
  }

  const openItem = openId ? itemById.get(openId) : undefined;
  const savedItems = items.filter((i) => savedIds.has(i.id));
  const shortlistByItem = new Map(shortlist.map((s) => [s.attire_item_id, s]));
  const meta = ATTIRE_CATEGORY_META[category];
  const showPromo = PARTY_CATEGORIES.includes(category) || category === "Groom Attire";
  const promoAt = Math.min(3, results.length);

  const tabs: { key: View; label: string; count?: number }[] = [
    { key: "browse", label: "Browse" },
    { key: "saved", label: "Saved", count: savedIds.size },
    { key: "party", label: "Party board", count: partyState.length },
  ];

  return (
    <div className="-mx-6">
      {/* Header band */}
      <section className="border-b border-hairline bg-gradient-to-r from-[#f3efe6] to-[#f8f6f1] px-4 py-6 sm:px-8 lg:px-10 lg:py-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-numbers text-xs uppercase tracking-[0.25em] text-brass">Attire</p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-none text-forest sm:text-5xl">
              What you&apos;ll wear, down the aisle
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70 sm:text-base">
              Gowns, suits, the whole party and the rings. Save what you love, add fitting notes your partner can see,
              and dress the party from one board.
            </p>
          </div>
          <div className="flex rounded-full border border-hairline bg-card p-1 shadow-sm" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={view === t.key}
                onClick={() => setView(t.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors lg:flex-none lg:px-5 ${
                  view === t.key ? "bg-forest font-medium text-parchment" : "text-ink/70 hover:text-forest"
                }`}
              >
                {t.label}
                {t.count ? (
                  <span
                    className={`rounded-full px-1.5 font-mono-numbers text-[11px] ${
                      view === t.key ? "bg-parchment/20" : "bg-forest/10 text-forest"
                    }`}
                  >
                    {t.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      {view === "browse" && (
        <>
          {/* Category circles */}
          <nav
            aria-label="Categories"
            className="flex gap-4 overflow-x-auto px-4 pb-1 pt-5 [scrollbar-width:none] sm:px-8 lg:justify-center lg:gap-8 lg:px-10 lg:pt-8"
          >
            {ATTIRE_CATEGORIES.map((c) => {
              const on = c === category;
              const count = active.filter((i) => i.category === c).length;
              const cover = active.find((i) => i.category === c && i.image_urls?.length);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => chooseCategory(c)}
                  className="group flex w-[76px] shrink-0 flex-col items-center text-center lg:w-[120px]"
                  aria-pressed={on}
                >
                  <span
                    className={`relative block h-[68px] w-[68px] overflow-hidden rounded-full border-2 bg-[#f1ece2] lg:h-[108px] lg:w-[108px] ${
                      on ? "border-forest" : "border-transparent group-hover:border-hairline"
                    }`}
                  >
                    {cover ? (
                      <AttireImage item={cover} sizes="108px" className="rounded-full" />
                    ) : (
                      <span
                        className="absolute inset-0 bg-[length:70%] bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${ATTIRE_CATEGORY_META[c].art})` }}
                      />
                    )}
                  </span>
                  <span
                    className={`mt-2 text-[10px] font-medium uppercase leading-tight tracking-[0.12em] lg:text-[11px] ${
                      on ? "text-forest" : "text-ink"
                    }`}
                  >
                    {ATTIRE_CATEGORY_META[c].label}
                  </span>
                  <span className="hidden text-[11px] text-ink/50 lg:block">{count} styles</span>
                </button>
              );
            })}
          </nav>

          {/* Style tabs */}
          {styles.length > 1 && (
            <div className="flex gap-6 overflow-x-auto whitespace-nowrap border-b border-hairline px-4 pb-0 pt-4 text-sm [scrollbar-width:none] sm:px-8 lg:justify-center lg:gap-8 lg:px-10 lg:pt-6 lg:text-[15px]">
              {[["all", 0] as [string, number], ...styles].map(([s]) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyleTab(s)}
                  className={`shrink-0 border-b-2 pb-3 transition-colors ${
                    styleTab === s ? "border-forest font-medium text-ink" : "border-transparent text-ink/50 hover:text-ink"
                  }`}
                >
                  {s === "all" ? `All ${meta.styleLabel}` : s}
                </button>
              ))}
            </div>
          )}

          {/* Phone: sticky filter/sort bar */}
          <div className="sticky top-0 z-20 flex gap-2 border-b border-hairline bg-parchment/95 px-4 py-2.5 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex-1 rounded-full border border-hairline bg-card py-2 text-sm font-medium"
            >
              Filter{activeChips.length ? ` · ${activeChips.length}` : ""}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="flex-1 appearance-none rounded-full border border-hairline bg-card py-2 text-center text-sm font-medium"
              aria-label="Sort"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.value === "featured" ? "Sort" : s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="px-4 pb-24 sm:px-8 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:pb-16 lg:pt-6">
            {/* Desktop sidebar */}
            <aside className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
              <FilterPanel items={inTab} filters={filters} setFilters={setFilters} />
            </aside>

            <section className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pb-4 pt-4 lg:pt-0">
                <h2 className="font-display text-2xl font-semibold text-forest lg:text-3xl">
                  {styleTab === "all" ? meta.label : styleTab}
                </h2>
                <span className="font-mono-numbers text-xs text-ink/50">
                  {results.length} {results.length === 1 ? "item" : "items"}
                </span>
                <div className="hidden flex-wrap gap-2 lg:flex">
                  {activeChips.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={chip.clear}
                      className="rounded-full border border-hairline bg-card px-3 py-1 text-xs hover:border-forest"
                    >
                      {chip.label} ✕
                    </button>
                  ))}
                  {activeChips.length > 1 && (
                    <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-xs text-brass underline">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex w-full items-center gap-3 lg:ml-auto lg:w-auto">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, designer, colour…"
                    className="w-full rounded-full border border-hairline bg-card px-4 py-2 text-sm outline-none focus:border-forest lg:w-64"
                  />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="hidden rounded-md border border-hairline bg-card px-3 py-2 text-sm lg:block"
                    aria-label="Sort"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        Sort: {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setDense((d) => !d)}
                    className="hidden rounded-md border border-hairline bg-card px-2.5 py-2 text-xs text-ink/70 hover:border-forest xl:block"
                    title={dense ? "Bigger photos" : "More per row"}
                  >
                    {dense ? "▦ 4" : "▦ 5"}
                  </button>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-hairline bg-card p-12 text-center">
                  <p className="font-display text-2xl text-forest">
                    {inCategory.length === 0 ? "New styles are on the way" : "Nothing matches those filters"}
                  </p>
                  {inCategory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilters(EMPTY_FILTERS);
                        setSearch("");
                        setStyleTab("all");
                      }}
                      className="mt-4 rounded-full border border-forest px-4 py-2 text-sm text-forest"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 ${
                    dense ? "xl:grid-cols-5 2xl:grid-cols-6" : "2xl:grid-cols-5"
                  }`}
                >
                  {results.map((item, idx) => (
                    <FragmentWithPromo
                      key={item.id}
                      promo={showPromo && idx === promoAt ? <PartyPromo onClick={() => setView("party")} /> : null}
                    >
                      <AttireCard
                        item={item}
                        saved={savedIds.has(item.id)}
                        pending={pendingIds.has(item.id)}
                        vendorName={item.vendor_id ? vendorNames[item.vendor_id] : undefined}
                        onToggleSave={() => toggleSave(item.id)}
                        onOpen={() => setOpenId(item.id)}
                        priority={idx < 4}
                      />
                    </FragmentWithPromo>
                  ))}
                  {showPromo && promoAt === results.length && <PartyPromo onClick={() => setView("party")} />}
                </div>
              )}
            </section>
          </div>

          {/* Phone: filter sheet */}
          {sheetOpen && (
            <div className="fixed inset-0 z-50 flex flex-col justify-end bg-ink/40 lg:hidden" onClick={() => setSheetOpen(false)}>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[85vh] flex-col rounded-t-2xl bg-card"
                role="dialog"
                aria-label="Filters"
              >
                <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
                  <p className="font-display text-xl font-semibold text-forest">Filter</p>
                  <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-sm text-brass">
                    Clear all
                  </button>
                </div>
                <div className="overflow-y-auto px-5 pt-4">
                  <FilterPanel items={inTab} filters={filters} setFilters={setFilters} />
                </div>
                <div className="border-t border-hairline p-4">
                  <button
                    type="button"
                    onClick={() => setSheetOpen(false)}
                    className="w-full rounded-full bg-forest py-3 font-medium text-parchment"
                  >
                    Show {results.length} {results.length === 1 ? "item" : "items"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {view === "saved" && (
        <div className="px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
          {savedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-hairline bg-card p-12 text-center">
              <p className="font-display text-2xl text-forest">Nothing saved yet</p>
              <p className="mt-2 text-sm text-ink/60">Tap the heart on anything you like and it lands here.</p>
              <button
                type="button"
                onClick={() => setView("browse")}
                className="mt-4 rounded-full bg-forest px-5 py-2 text-sm font-medium text-parchment"
              >
                Start browsing
              </button>
            </div>
          ) : (
            ATTIRE_CATEGORIES.map((c) => {
              const inCat = savedItems.filter((i) => i.category === c);
              if (!inCat.length) return null;
              return (
                <section key={c} className="mb-10">
                  <h2 className="mb-4 font-display text-2xl font-semibold text-forest">
                    {ATTIRE_CATEGORY_META[c].label}
                    <span className="ml-2 font-mono-numbers text-xs font-normal text-ink/50">{inCat.length}</span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {inCat.map((item) => {
                      const entry = shortlistByItem.get(item.id);
                      return (
                        <article key={item.id} className="flex gap-4 rounded-xl border border-hairline bg-card p-3 sm:p-4">
                          <button
                            type="button"
                            onClick={() => setOpenId(item.id)}
                            className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-md sm:w-32"
                          >
                            <AttireImage item={item} sizes="128px" />
                          </button>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <button type="button" onClick={() => setOpenId(item.id)} className="min-w-0 text-left">
                                <h3 className="truncate font-medium text-ink">{item.name}</h3>
                                <p className="truncate text-xs text-ink/55">
                                  {[item.designer ?? (item.vendor_id ? vendorNames[item.vendor_id] : null), item.silhouette ?? item.style]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              </button>
                              <HeartButton saved pending={pendingIds.has(item.id)} onToggle={() => toggleSave(item.id)} className="border border-hairline" />
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <PricePills item={item} />
                              <ColorDots colors={item.colors} />
                            </div>
                            {entry ? (
                              <SavedNotes entry={entry} />
                            ) : (
                              <p className="mt-3 text-xs text-ink/40">Notes open once this save finishes.</p>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      )}

      {view === "party" && (
        <div className="px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
          <PartyBoard
            party={partyState}
            items={items}
            savedIds={savedIds}
            shareToken={shareToken}
            onOpenItem={setOpenId}
          />
        </div>
      )}

      {openItem && (
        <AttireQuickView
          item={openItem}
          saved={savedIds.has(openItem.id)}
          pending={pendingIds.has(openItem.id)}
          vendorName={openItem.vendor_id ? vendorNames[openItem.vendor_id] : undefined}
          party={partyState}
          onToggleSave={() => toggleSave(openItem.id)}
          onAssign={(memberId) => assign(memberId, openItem.id)}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

function FragmentWithPromo({ promo, children }: { promo: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      {promo}
      {children}
    </>
  );
}
