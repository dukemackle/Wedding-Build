"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { FilterDropdown } from "@/components/filter-dropdown";
import { SearchShell } from "@/components/search-shell";
import { BirdEmptyState } from "@/components/wren-moments";
import { isInView, viewKey, type MapView } from "@/lib/map-view";
import {
  MARKET_CATEGORIES,
  MARKET_CONDITIONS,
  MARKET_DISTANCES,
  MARKET_PRICE_BANDS,
  categoryLabel,
  formatPrice,
  guestFit,
  listedAgo,
  milesBetween,
  pinListings,
} from "@/lib/marketplace";
import type { MarketListing } from "@/lib/supabase/types";
import { toggleSave } from "./actions";
import { CategoryIcon, MarketplaceHome } from "./marketplace-home";

const MarketplaceMap = dynamic(() => import("./marketplace-map").then((m) => m.MarketplaceMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-parchment" />,
});

type Filters = {
  q: string;
  category: string;
  price: string;
  condition: string;
  distance: string;
  type: string;
  fits: string;
};
const NO_FILTERS: Filters = {
  q: "",
  category: "all",
  price: "all",
  condition: "all",
  distance: "all",
  type: "all",
  fits: "all",
};

export type MarketOrigin = { latitude: number; longitude: number; label: string };

export function MarketplaceBrowser({
  listings,
  mine,
  savedIds,
  signedIn,
  origin: weddingOrigin,
  unread = 0,
  guestCount = 0,
  startBrowsing = false,
  initial = {},
}: {
  listings: MarketListing[];
  /** The viewer's own listings in every state but removed. */
  mine: MarketListing[];
  savedIds: string[];
  signedIn: boolean;
  /** Where "within X miles" measures from: the couple's venue, when we know it. */
  origin: MarketOrigin | null;
  /** Conversations with unread messages. */
  unread?: number;
  /** The viewer's guest count, for "fits my wedding". */
  guestCount?: number;
  /** Skip the front page (categories and newest) and open the browse screen. */
  startBrowsing?: boolean;
  /** Filters to open with, from a link (the budget page's suggestions). */
  initial?: Partial<Filters>;
}) {
  const [home, setHome] = useState(!startBrowsing);
  const [filters, setFilters] = useState<Filters>(() => ({
    ...NO_FILTERS,
    ...Object.fromEntries(Object.entries(initial).filter(([, v]) => v)),
  }));
  const [origin, setOrigin] = useState<MarketOrigin | null>(weddingOrigin);
  const [locating, setLocating] = useState(false);
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [mode, setMode] = useState<"map" | "grid">("map");
  const [saved, setSaved] = useState(() => new Set(savedIds));
  const [, startTransition] = useTransition();

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function onToggleSave(id: string) {
    const next = !saved.has(id);
    setSaved((current) => {
      const copy = new Set(current);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });
    startTransition(async () => {
      await toggleSave(id, next);
    });
  }

  // Without a venue to measure from, the distance filter asks the browser
  // where this is, once.
  function chooseDistance(value: string) {
    if (value === "all" || origin) {
      set("distance", value);
      return;
    }
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({ latitude: position.coords.latitude, longitude: position.coords.longitude, label: "you" });
        set("distance", value);
        setLocating(false);
      },
      () => setLocating(false),
      { maximumAge: 600_000, timeout: 10_000 },
    );
  }

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const maxMiles = filters.distance === "all" || !origin ? null : Number(filters.distance);
    const band = MARKET_PRICE_BANDS.find((b) => b.value === filters.price);
    return listings.filter(
      (l) =>
        (filters.category === "all" || l.category === filters.category) &&
        (filters.condition === "all" || l.condition === filters.condition) &&
        (!band || (l.price_cents >= band.min && l.price_cents < band.max)) &&
        (!q || l.title.toLowerCase().includes(q) || (l.description ?? "").toLowerCase().includes(q)) &&
        (filters.type === "all" || l.listing_type === filters.type) &&
        (filters.fits === "all" || guestFit(l.quantity, guestCount) !== null) &&
        (maxMiles === null ||
          (l.latitude != null &&
            l.longitude != null &&
            milesBetween(origin!, { latitude: l.latitude, longitude: l.longitude }) <= maxMiles)),
    );
  }, [listings, filters, origin, guestCount]);

  const pinned = useMemo(() => pinListings(filtered), [filtered]);

  // The list follows the map, like Venues. A listing whose town we couldn't
  // place is never on the map, so it stays in the list rather than vanishing.
  const listed = useMemo(() => {
    if (!mapView || mode === "grid") return filtered;
    const inView = new Set(pinned.filter((l) => isInView(l, mapView)).map((l) => l.id));
    return filtered.filter((l) => inView.has(l.id) || l.latitude == null);
  }, [filtered, pinned, mapView, mode]);

  const activeFilterCount = (["category", "price", "condition", "distance", "type", "fits"] as const).filter(
    (k) => filters[k] !== "all",
  ).length;

  const savedListings = listings.filter((l) => saved.has(l.id));

  // The front page hands over to the browse screen, which reads ?view= on
  // mount to open Saved or Selling.
  function browse({ view, mode: nextMode, ...picked }: { q?: string; category?: string; type?: string; mode: "map" | "grid"; view?: string }) {
    const url = new URL(window.location.href);
    if (view) url.searchParams.set("view", view);
    else url.searchParams.delete("view");
    window.history.replaceState(window.history.state, "", url);
    setFilters({ ...NO_FILTERS, ...Object.fromEntries(Object.entries(picked).filter(([, v]) => v)) });
    setMapView(null);
    setMode(nextMode);
    setHome(false);
    window.scrollTo(0, 0);
  }

  function goHome() {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(window.history.state, "", url);
    setFilters(NO_FILTERS);
    setHome(true);
  }

  if (home) {
    return (
      <MarketplaceHome
        listings={listings}
        signedIn={signedIn}
        placeLabel={weddingOrigin?.label ?? null}
        counts={{ saved: savedListings.length, selling: mine.length, unread }}
        onBrowse={browse}
        renderCard={(l) => (
          <ListingCard
            listing={l}
            guestCount={guestCount}
            saved={saved.has(l.id)}
            onToggleSave={signedIn ? onToggleSave : undefined}
          />
        )}
      />
    );
  }

  return (
    <SearchShell
      search={{ value: filters.q, onChange: (v) => set("q", v), placeholder: "Search the marketplace…" }}
      activeFilterCount={activeFilterCount}
      onClearFilters={() => setFilters((f) => ({ ...NO_FILTERS, q: f.q }))}
      resultCount={listed.length}
      totalCount={filtered.length}
      pageKey={`${JSON.stringify(filters)}|${viewKey(mapView)}`}
      resultNoun="listing"
      gridClassName="grid-cols-2 xl:grid-cols-3"
      mode={mode}
      onModeChange={(next) => {
        // The map reports its view again when it comes back.
        setMapView(null);
        setMode(next);
      }}
      views={
        signedIn
          ? [
              {
                key: "saved",
                label: "Saved",
                icon: "♥",
                count: savedListings.length,
                panel:
                  savedListings.length === 0 ? (
                    <BirdEmptyState>
                      <p className="text-sm text-ink/60">Nothing saved yet. Tap the heart on a listing to keep it here.</p>
                    </BirdEmptyState>
                  ) : (
                    <Grid>
                      {savedListings.map((l) => (
                        <ListingCard key={l.id} listing={l} saved onToggleSave={onToggleSave} guestCount={guestCount} />
                      ))}
                    </Grid>
                  ),
              },
              {
                key: "selling",
                label: "Selling",
                icon: "🏷",
                count: mine.length,
                panel:
                  mine.length === 0 ? (
                    <BirdEmptyState>
                      <p className="text-sm text-ink/60">
                        Nothing listed yet.{" "}
                        <Link href="/marketplace/new" className="text-brass underline">
                          Sell something
                        </Link>{" "}
                        left over from your wedding.
                      </p>
                    </BirdEmptyState>
                  ) : (
                    <Grid>
                      {mine.map((l) => (
                        <ListingCard key={l.id} listing={l} />
                      ))}
                    </Grid>
                  ),
              },
            ]
          : []
      }
      filters={
        <>
          <button
            type="button"
            onClick={goHome}
            aria-label="Marketplace home"
            className="shrink-0 whitespace-nowrap rounded-full border border-hairline bg-card px-3 py-1.5 text-sm text-forest shadow-md hover:border-forest lg:shadow-none"
          >
            <span aria-hidden>←</span>
            <span aria-hidden className="lg:hidden 2xl:inline"> Home</span>
          </button>
          <Link
            href={signedIn ? "/marketplace/new" : "/signup?next=/marketplace/new"}
            className="shrink-0 whitespace-nowrap rounded-full bg-forest px-3.5 py-1.5 text-sm font-medium text-parchment shadow-md hover:bg-forest/90 lg:order-last lg:ml-2 lg:shadow-none"
          >
            + Sell
          </Link>
          {signedIn && (
            <Link
              href="/marketplace/inbox"
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-hairline bg-card px-3 py-1.5 text-sm text-forest shadow-md hover:border-forest lg:order-last lg:shadow-none"
            >
              Messages
              {unread > 0 && (
                <span className="rounded-full bg-[#2243B6] px-1.5 text-[11px] font-semibold leading-4 text-white">{unread}</span>
              )}
            </Link>
          )}
          <FilterDropdown
            label={locating ? "Finding you…" : origin && origin.label !== "you" ? `Near ${origin.label}` : "Distance"}
            allLabel="Any distance"
            value={filters.distance}
            onChange={chooseDistance}
            options={MARKET_DISTANCES.map((miles) => ({ value: String(miles), label: `Within ${miles} miles` }))}
          />
          {guestCount > 0 && (
            <FilterDropdown
              label="Fits my wedding"
              allLabel="Any quantity"
              value={filters.fits}
              onChange={(v) => set("fits", v)}
              options={[{ value: "yes", label: `Enough for ${guestCount} guests or their tables` }]}
            />
          )}
          <FilterDropdown
            label="Buy/rent"
            allLabel="Buy or rent"
            value={filters.type}
            onChange={(v) => set("type", v)}
            options={[
              { value: "sale", label: "For sale" },
              { value: "rent", label: "For rent" },
            ]}
          />
          <FilterDropdown
            label="Category"
            allLabel="All categories"
            value={filters.category}
            onChange={(v) => set("category", v)}
            options={MARKET_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          />
          <FilterDropdown
            label="Price"
            allLabel="Any price"
            value={filters.price}
            onChange={(v) => set("price", v)}
            options={MARKET_PRICE_BANDS.map((b) => ({ value: b.value, label: b.label }))}
          />
          <FilterDropdown
            label="Condition"
            allLabel="Any condition"
            value={filters.condition}
            onChange={(v) => set("condition", v)}
            options={MARKET_CONDITIONS.map((c) => ({ value: c.value, label: c.label }))}
          />
        </>
      }
      map={<MarketplaceMap listings={pinned} onViewChange={setMapView} />}
      empty={
        <BirdEmptyState>
          <p className="text-sm text-ink/60">
            {listings.length === 0
              ? "Nothing listed yet. Be the first to pass something on."
              : filters.category !== "all" && !listings.some((l) => l.category === filters.category)
                ? <>
                    No {categoryLabel(filters.category).toLowerCase()} listed yet. Have some left over?{" "}
                    <Link href={signedIn ? "/marketplace/new" : "/signup?next=/marketplace/new"} className="text-brass underline">
                      Be the first to list them
                    </Link>
                    .
                  </>
              : filtered.length === 0
                ? "Nothing matches these filters."
                : "Nothing in this part of the map. Zoom out or move the map to see more."}
          </p>
        </BirdEmptyState>
      }
    >
      {listed.map((l) => (
        <ListingCard
          guestCount={guestCount}
          key={l.id}
          listing={l}
          saved={saved.has(l.id)}
          onToggleSave={signedIn ? onToggleSave : undefined}
        />
      ))}
    </SearchShell>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">{children}</div>;
}

/**
 * Photo first, price on the photo: the photo sells the thing, so it gets the
 * room, and the words under it are one line each.
 */
function ListingCard({
  listing,
  saved = false,
  onToggleSave,
  guestCount = 0,
}: {
  listing: MarketListing;
  guestCount?: number;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
}) {
  const fit = guestFit(listing.quantity, guestCount);
  const badge = listing.status === "sold" ? "Sold" : listing.status === "pending" ? "Pending" : null;
  return (
    <div className="group relative">
      <Link href={`/marketplace/${listing.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-hairline bg-[#fbf8f1]">
          {listing.photo_urls[0] ? (
            <Image
              src={listing.photo_urls[0]}
              alt={listing.title}
              fill
              sizes="(min-width: 1280px) 14vw, (min-width: 1024px) 20vw, 50vw"
              className={`object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none ${badge === "Sold" ? "opacity-60" : ""}`}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-forest/40">
              <CategoryIcon category={listing.category} className="h-16 w-16" />
            </span>
          )}
          {badge ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-forest px-2.5 py-0.5 text-xs font-semibold text-parchment">
              {badge}
            </span>
          ) : (
            <span
              className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm ${
                listing.listing_type === "rent" ? "bg-[#2243B6] text-white" : "bg-white/95 text-forest"
              }`}
            >
              {listing.listing_type === "rent" ? "Rent" : "Buy"}
            </span>
          )}
          <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-[#FFD301] px-2 py-0.5 text-sm font-bold text-forest shadow-sm">
            {formatPrice(listing.price_cents, listing.listing_type)}
            {listing.original_price_cents && (
              <s className="ml-1.5 text-[11px] font-normal text-forest/60">was {formatPrice(listing.original_price_cents)}</s>
            )}
          </span>
        </div>
        <p className="mt-2 truncate text-[15px] font-medium text-forest">{listing.title}</p>
        <p className="truncate text-xs text-ink/50">
          {listing.city}, {listing.state} · {categoryLabel(listing.category)}
          {listing.quantity > 1 && ` · ${listing.quantity} pieces`} · {listedAgo(listing.created_at)}
        </p>
        {fit && !badge && <p className="mt-0.5 truncate text-xs font-medium text-[#9a6b00]">{fit.replace("Enough for your ", "Fits your ")}</p>}
      </Link>
      {onToggleSave && (
        <button
          type="button"
          onClick={() => onToggleSave(listing.id)}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save"}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full shadow transition-all active:scale-90 motion-reduce:transition-none ${
            saved ? "bg-[#FFD301] text-forest" : "bg-white/90 text-ink/50 hover:text-brass"
          }`}
        >
          {saved ? "♥" : "♡"}
        </button>
      )}
    </div>
  );
}
