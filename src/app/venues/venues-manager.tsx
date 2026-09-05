"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import type { Venue, VenueShortlistEntry } from "@/lib/supabase/types";
import { REGIONS, VENUE_TYPES } from "@/lib/wedding-options";
import { updateShortlistNotes } from "./actions";
import { ShortlistButton } from "./venue-card-shared";
import { SearchBox } from "@/components/search-box";
import { FilterDisclosure } from "@/components/filter-disclosure";

const VenuesMap = dynamic(() => import("./venues-map").then((m) => m.VenuesMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-md border border-hairline text-sm text-ink/50">
      Loading map...
    </div>
  ),
});

const VENUE_TYPE_IMAGES: Record<string, string> = {
  "Barn / Rustic": "/venue-types/barn-rustic.svg",
  "Ballroom / Hotel": "/venue-types/ballroom-hotel.svg",
  "Garden / Outdoor": "/venue-types/garden-outdoor.svg",
  "Beach / Waterfront": "/venue-types/beach-waterfront.svg",
  "Historic / Estate": "/venue-types/historic-estate.svg",
  "Restaurant / Vineyard": "/venue-types/restaurant-vineyard.svg",
};
const DEFAULT_VENUE_IMAGE = "/venue-types/historic-estate.svg";

function VenueCard({ venue, isShortlisted }: { venue: Venue; isShortlisted: boolean }) {
  const image =
    (venue.venue_type && VENUE_TYPE_IMAGES[venue.venue_type]) || DEFAULT_VENUE_IMAGE;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-parchment">
      <Image
        src={image}
        alt={venue.venue_type ? `${venue.venue_type} illustration` : "Venue illustration"}
        width={400}
        height={300}
        className="aspect-[4/3] w-full border-b border-hairline object-cover"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-display text-xl font-semibold text-forest">{venue.name}</h3>
          {venue.price_tier && (
            <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-brass">
              {venue.price_tier}
            </span>
          )}
        </div>
        <p className="text-xs uppercase tracking-wide text-ink/50">
          {[
            [venue.city, venue.state].filter(Boolean).join(", "),
            venue.region,
            venue.venue_type,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {venue.capacity && (
          <p className="mt-1 font-mono-numbers text-sm text-ink/70">
            Up to {venue.capacity} guests
          </p>
        )}
        {venue.description && (
          <p className="mt-3 text-sm text-ink/80">{venue.description}</p>
        )}
        <div className="mt-4">
          <ShortlistButton venueId={venue.id} isShortlisted={isShortlisted} />
        </div>
      </div>
    </div>
  );
}

function ShortlistNotes({ entry, venueName }: { entry: VenueShortlistEntry; venueName: string }) {
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateShortlistNotes(formData);
      setSaved(!result?.error);
    });
  }

  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <p className="text-ink">{venueName}</p>
      <form action={handleSave} className="mt-2 flex items-start gap-3">
        <input type="hidden" name="venue_id" value={entry.venue_id} />
        <textarea
          name="notes"
          rows={2}
          placeholder="Notes (pricing, availability, questions to ask)..."
          defaultValue={entry.notes ?? ""}
          onChange={() => setSaved(false)}
          className="flex-1 rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md border border-hairline px-3 py-2 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60"
        >
          {isPending ? "Saving..." : saved ? "Saved" : "Save"}
        </button>
      </form>
    </div>
  );
}

export function VenuesManager({
  venues,
  shortlist,
}: {
  venues: Venue[];
  shortlist: VenueShortlistEntry[];
}) {
  const [regionFilter, setRegionFilter] = useState<string | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string | "all">("all");
  const [stateFilter, setStateFilter] = useState<string | "all">("all");
  const [cityFilter, setCityFilter] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");

  const shortlistedIds = new Set(shortlist.map((s) => s.venue_id));
  const venueById = new Map(venues.map((v) => [v.id, v]));

  const availableStates = useMemo(
    () =>
      Array.from(new Set(venues.map((v) => v.state).filter((s): s is string => Boolean(s)))).sort(),
    [venues],
  );

  const availableCities = useMemo(
    () =>
      Array.from(
        new Set(
          venues
            .filter((v) => stateFilter === "all" || v.state === stateFilter)
            .map((v) => v.city)
            .filter((c): c is string => Boolean(c)),
        ),
      ).sort(),
    [venues, stateFilter],
  );

  function handleStateFilterChange(value: string) {
    setStateFilter(value);
    setCityFilter("all");
  }

  const activeFilterCount = [regionFilter, typeFilter, stateFilter, cityFilter].filter(
    (f) => f !== "all",
  ).length;

  const filteredVenues = venues.filter(
    (v) =>
      (regionFilter === "all" || v.region === regionFilter) &&
      (typeFilter === "all" || v.venue_type === typeFilter) &&
      (stateFilter === "all" || v.state === stateFilter) &&
      (cityFilter === "all" || v.city === cityFilter) &&
      v.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8">
      {shortlist.length > 0 && (
        <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-forest">
            Your favorites
          </h2>
          <div className="mt-4">
            {shortlist.map((entry) => {
              const venue = venueById.get(entry.venue_id);
              if (!venue) return null;
              return <ShortlistNotes key={entry.id} entry={entry} venueName={venue.name} />;
            })}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <div className="mb-4">
          <SearchBox value={search} onChange={setSearch} placeholder="Search venues by name..." />
        </div>
        <FilterDisclosure activeCount={activeFilterCount}>
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="state-filter" className="mb-1 block text-xs uppercase tracking-wide text-ink/50">
                State
              </label>
              <select
                id="state-filter"
                value={stateFilter}
                onChange={(e) => handleStateFilterChange(e.target.value)}
                className="w-full max-w-xs rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest sm:w-auto"
              >
                <option value="all">All states</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city-filter" className="mb-1 block text-xs uppercase tracking-wide text-ink/50">
                City
              </label>
              <select
                id="city-filter"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                disabled={availableCities.length === 0}
                className="w-full max-w-xs rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest disabled:opacity-50 sm:w-auto"
              >
                <option value="all">All cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRegionFilter("all")}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                regionFilter === "all"
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-parchment text-ink hover:border-forest"
              }`}
            >
              All regions
            </button>
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setRegionFilter(region)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  regionFilter === region
                    ? "border-forest bg-forest text-parchment"
                    : "border-hairline bg-parchment text-ink hover:border-forest"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                typeFilter === "all"
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-parchment text-ink hover:border-forest"
              }`}
            >
              All venue types
            </button>
            {VENUE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  typeFilter === type
                    ? "border-forest bg-forest text-parchment"
                    : "border-hairline bg-parchment text-ink hover:border-forest"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </FilterDisclosure>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              viewMode === "list"
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-parchment text-ink hover:border-forest"
            }`}
          >
            List view
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              viewMode === "map"
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-parchment text-ink hover:border-forest"
            }`}
          >
            Map view
          </button>
        </div>

        {filteredVenues.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/50">
            {venues.length === 0
              ? "No venues have been added yet."
              : "No venues match these filters."}
          </p>
        ) : viewMode === "map" ? (
          <VenuesMap venues={filteredVenues} shortlistedIds={shortlistedIds} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                isShortlisted={shortlistedIds.has(venue.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
