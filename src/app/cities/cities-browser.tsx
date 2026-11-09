"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { REGIONS, US_MAP, type Region } from "@/lib/cities";

export type CityCard = {
  slug: string;
  name: string;
  state: string;
  region: Region;
  venues: number;
  vendors: number;
  /** Too few checked listings for the hub to be indexed yet. */
  soon: boolean;
  venuesHref: string;
  vendorsHref: string;
  point: { x: number; y: number } | null;
};

/**
 * Search, region jump links and the cards; on wide screens a US map with a pin
 * per city beside them. Hovering a card lights its pin and the other way
 * round. Every card and pin is a plain link, so the page works (and is
 * crawled) without this script.
 */
export function CitiesBrowser({ cities }: { cities: CityCard[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const shown = useMemo(
    () => (q ? cities.filter((c) => `${c.name} ${c.state}`.toLowerCase().includes(q)) : cities),
    [cities, q],
  );
  const regions = REGIONS.map((region) => ({ region, cities: shown.filter((c) => c.region === region) })).filter(
    (r) => r.cities.length,
  );

  return (
    <div className="pt-6 lg:pt-8">
      <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">Search a city</span>
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/50"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a city or state"
            className="h-12 w-full rounded-full border border-hairline bg-white pl-11 pr-4 text-base text-ink placeholder:text-ink/45 focus:border-ink focus:outline-none"
          />
        </label>
        {!q && (
          <nav aria-label="Regions" className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 lg:mx-0 lg:flex-wrap lg:px-0 lg:pb-0">
            {REGIONS.map((region) => (
              <a
                key={region}
                href={`#${regionId(region)}`}
                className="shrink-0 rounded-full border border-hairline bg-white px-4 py-2 text-[15px] text-ink transition-colors hover:border-ink"
              >
                {region}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-10 xl:gap-14">
        <UsMap cities={cities} shown={shown} active={active} onActive={setActive} />

        <div className="min-w-0">
          {regions.length === 0 && (
            <div className="rounded-[20px] bg-[#fbf8f1] p-6 text-ink lg:p-8">
              <p className="font-display text-[26px] font-semibold leading-tight">No city page for &ldquo;{query.trim()}&rdquo; yet</p>
              <p className="mt-2 text-ink/70">Every venue and vendor is still on the map, wherever they are.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/venues" className="btn-motion inline-flex h-11 items-center justify-center rounded-full bg-[#2243b6] px-5 font-medium text-white hover:bg-[#1b3796]">
                  Browse all venues
                </Link>
                <Link href="/vendors" className="btn-motion inline-flex h-11 items-center justify-center rounded-full border-[1.5px] border-ink px-5 font-medium text-ink hover:bg-ink/5">
                  Browse all vendors
                </Link>
              </div>
            </div>
          )}
          {regions.map(({ region, cities: list }) => (
            <section key={region} id={regionId(region)} className="scroll-mt-24 pb-10">
              <h2 className="mb-4 flex items-baseline gap-2 border-b border-hairline pb-2 font-display text-[28px] font-semibold leading-tight text-ink lg:text-[32px]">
                {region}
                <span className="font-sans text-sm font-normal text-ink/55">
                  {list.length} {list.length === 1 ? "city" : "cities"}
                </span>
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                {list.map((c) => (
                  <Card key={c.slug} city={c} active={active === c.slug} onActive={setActive} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function regionId(region: Region): string {
  return region.toLowerCase().replace(/[^a-z]+/g, "-");
}

/**
 * Text first: listings have no photos yet, so each card carries a small US
 * outline with the city marked instead, which also tells a couple where it is.
 */
function Card({ city, active, onActive }: { city: CityCard; active: boolean; onActive: (slug: string | null) => void }) {
  return (
    <article
      id={city.slug}
      onMouseEnter={() => onActive(city.slug)}
      onMouseLeave={() => onActive(null)}
      onFocus={() => onActive(city.slug)}
      onBlur={() => onActive(null)}
      className={`scroll-mt-24 rounded-[18px] border bg-white p-4 transition-[border-color,box-shadow] lg:p-5 ${
        active ? "border-ink shadow-[0_10px_30px_-18px_rgba(20,32,61,0.55)]" : "border-hairline"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[26px] font-semibold leading-tight text-ink">
            <Link href={city.venuesHref} className="hover:underline">
              {city.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-ink/60">
            {city.state}
            {city.soon && (
              <span className="ml-2 rounded-full bg-[#fbf8f1] px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink/70">
                Coming soon
              </span>
            )}
          </p>
        </div>
        {city.point && <MiniMap point={city.point} soon={city.soon} />}
      </div>
      <p className="mt-3 text-[15px] text-ink">
        <b className="font-semibold">{city.venues.toLocaleString()}</b> venues
        <span className="text-ink/40"> · </span>
        <b className="font-semibold">{city.vendors.toLocaleString()}</b> vendors
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Link
          href={city.venuesHref}
          aria-label={`Wedding venues in ${city.name}`}
          className="btn-motion inline-flex h-10 items-center justify-center rounded-full bg-[#2243b6] px-4 text-[15px] font-medium text-white transition-colors hover:bg-[#1b3796]"
        >
          Venues
        </Link>
        <Link
          href={city.vendorsHref}
          aria-label={`Wedding vendors in ${city.name}`}
          className="btn-motion inline-flex h-10 items-center justify-center rounded-full border-[1.5px] border-ink px-4 text-[15px] font-medium text-ink transition-colors hover:bg-ink/5"
        >
          Vendors
        </Link>
      </div>
    </article>
  );
}

function MiniMap({ point, soon }: { point: { x: number; y: number }; soon: boolean }) {
  return (
    <div aria-hidden="true" className="relative w-[88px] shrink-0" style={{ aspectRatio: `${US_MAP.width} / ${US_MAP.height}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the same static outline as the big map */}
      <img src={US_MAP.src} alt="" className="absolute inset-0 h-full w-full" />
      <span
        style={{ left: `${(point.x / US_MAP.width) * 100}%`, top: `${(point.y / US_MAP.height) * 100}%` }}
        className={`absolute block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#14203d] ${
          soon ? "bg-white" : "bg-[#ffd301]"
        }`}
      />
    </div>
  );
}

/** Wide screens only: on a phone the map is too small to tap a pin. */
function UsMap({
  cities,
  shown,
  active,
  onActive,
}: {
  cities: CityCard[];
  shown: CityCard[];
  active: string | null;
  onActive: (slug: string | null) => void;
}) {
  const visible = new Set(shown.map((c) => c.slug));
  const label = cities.find((c) => c.slug === active);
  return (
    <div className="hidden lg:block">
      <div className="sticky top-24">
        <div className="relative" style={{ aspectRatio: `${US_MAP.width} / ${US_MAP.height}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- a static outline, no optimisation needed */}
          <img src={US_MAP.src} alt="" className="absolute inset-0 h-full w-full" />
          {cities.map((c) =>
            c.point ? (
              <Link
                key={c.slug}
                href={c.venuesHref}
                aria-label={`Wedding venues in ${c.name}`}
                onMouseEnter={() => onActive(c.slug)}
                onMouseLeave={() => onActive(null)}
                onFocus={() => onActive(c.slug)}
                onBlur={() => onActive(null)}
                style={{ left: `${(c.point.x / US_MAP.width) * 100}%`, top: `${(c.point.y / US_MAP.height) * 100}%` }}
                className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-opacity ${
                  visible.has(c.slug) ? "" : "pointer-events-none opacity-20"
                } ${active === c.slug ? "z-10" : ""}`}
              >
                <span
                  className={`block rounded-full border-2 border-[#14203d] transition-transform motion-reduce:transition-none ${
                    c.soon ? "bg-white" : "bg-[#ffd301]"
                  } ${active === c.slug ? "h-4 w-4 scale-125" : "h-3 w-3"}`}
                />
              </Link>
            ) : null,
          )}
          {label?.point && (
            <span
              aria-hidden="true"
              style={{ left: `${(label.point.x / US_MAP.width) * 100}%`, top: `${(label.point.y / US_MAP.height) * 100}%` }}
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-full bg-[#14203d] px-3 py-1 text-sm font-medium text-white"
            >
              {label.name} · {label.venues.toLocaleString()} venues
            </span>
          )}
        </div>
        <p className="mt-3 flex items-center gap-4 text-[13px] text-ink/60">
          <span className="flex items-center gap-1.5">
            <span className="block h-3 w-3 rounded-full border-2 border-[#14203d] bg-[#ffd301]" /> Ready to browse
          </span>
          <span className="flex items-center gap-1.5">
            <span className="block h-3 w-3 rounded-full border-2 border-[#14203d] bg-white" /> Coming soon
          </span>
        </p>
      </div>
    </div>
  );
}
