"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { Venue, VenueShortlistEntry } from "@/lib/supabase/types";
import { CAPACITY_FILTER_STEPS, STYLE_TIERS, VENUE_SETTINGS, VENUE_TYPES } from "@/lib/wedding-options";
import { updateShortlistNotes } from "./actions";
import { BookedVenueButton, ShortlistButton } from "./venue-card-shared";
import { InquiryForm } from "./inquiry-form";
import { SearchBox } from "@/components/search-box";
import { FilterDropdown } from "@/components/filter-dropdown";

const VenuesMap = dynamic(() => import("./venues-map").then((m) => m.VenuesMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] w-full items-center justify-center rounded-md border border-hairline text-sm text-ink/50 lg:h-[640px]">
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

function VenueCard({
  venue,
  isShortlisted,
  isBooked,
  onBookedToggled,
  isHighlighted,
  onHover,
  onLeave,
}: {
  venue: Venue;
  isShortlisted: boolean;
  isBooked: boolean;
  onBookedToggled: (bookedVenueId: string | null) => void;
  isHighlighted?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}) {
  const [showInquiry, setShowInquiry] = useState(false);
  const image =
    venue.image_url || (venue.venue_type && VENUE_TYPE_IMAGES[venue.venue_type]) || DEFAULT_VENUE_IMAGE;

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`flex flex-col overflow-hidden rounded-lg border bg-parchment transition-colors ${
        isBooked ? "border-brass" : isHighlighted ? "border-forest" : "border-hairline"
      }`}
    >
      <Link href={`/venues/${venue.id}`}>
        <Image
          src={image}
          alt={venue.venue_type ? `${venue.venue_type} illustration` : "Venue illustration"}
          width={400}
          height={300}
          className="aspect-[4/3] w-full border-b border-hairline object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <Link href={`/venues/${venue.id}`} className="hover:underline">
            <h3 className="font-display text-xl font-semibold text-forest">{venue.name}</h3>
          </Link>
          {venue.price_tier && (
            <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-brass">
              {venue.price_tier}
            </span>
          )}
        </div>
        <p className="text-xs uppercase tracking-wide text-ink/50">
          {[
            [venue.city, venue.state].filter(Boolean).join(", "),
            venue.setting,
            venue.venue_type,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {venue.is_sample && (
          <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">Sample listing</p>
        )}
        {venue.capacity && (
          <p className="mt-1 font-mono-numbers text-sm text-ink/70">
            Up to {venue.capacity} guests
          </p>
        )}
        {venue.description && (
          <p className="mt-3 text-sm text-ink/80">{venue.description}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ShortlistButton venueId={venue.id} isShortlisted={isShortlisted} />
          <BookedVenueButton
            venueId={venue.id}
            isBooked={isBooked}
            onToggled={onBookedToggled}
          />
          {!showInquiry && (
            <button
              type="button"
              onClick={() => setShowInquiry(true)}
              className="rounded-full border border-hairline px-3 py-1 text-sm text-ink transition-colors hover:border-forest"
            >
              Request a quote
            </button>
          )}
        </div>
        {showInquiry && (
          <InquiryForm venue={venue} onDone={() => setShowInquiry(false)} />
        )}
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
  bookedVenueId: initialBookedVenueId,
}: {
  venues: Venue[];
  shortlist: VenueShortlistEntry[];
  bookedVenueId: string | null;
}) {
  const [bookedVenueId, setBookedVenueId] = useState(initialBookedVenueId);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [settingFilter, setSettingFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [hoveredVenueId, setHoveredVenueId] = useState<string | null>(null);

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

  const activeFilterCount = [
    typeFilter,
    settingFilter,
    priceFilter,
    capacityFilter,
    stateFilter,
    cityFilter,
  ].filter((f) => f !== "all").length;

  const filteredVenues = venues.filter(
    (v) =>
      (typeFilter === "all" || v.venue_type === typeFilter) &&
      (settingFilter === "all" || v.setting === settingFilter) &&
      (priceFilter === "all" || v.price_tier === priceFilter) &&
      (capacityFilter === "all" || (v.capacity ?? 0) >= Number(capacityFilter)) &&
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
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="State"
            allLabel="All states"
            value={stateFilter}
            onChange={handleStateFilterChange}
            options={availableStates.map((state) => ({ value: state, label: state }))}
          />
          <FilterDropdown
            label="City"
            allLabel="All cities"
            value={cityFilter}
            onChange={setCityFilter}
            options={availableCities.map((city) => ({ value: city, label: city }))}
            emptyMessage="No cities for this state"
          />
          <FilterDropdown
            label="Capacity"
            allLabel="Any size"
            value={capacityFilter}
            onChange={setCapacityFilter}
            options={CAPACITY_FILTER_STEPS.map((step) => ({
              value: String(step),
              label: `${step}+ guests`,
            }))}
          />
          <FilterDropdown
            label="Setting"
            allLabel="Any setting"
            value={settingFilter}
            onChange={setSettingFilter}
            options={VENUE_SETTINGS.map((setting) => ({ value: setting, label: setting }))}
          />
          <FilterDropdown
            label="Price"
            allLabel="Any price"
            value={priceFilter}
            onChange={setPriceFilter}
            options={STYLE_TIERS.map((tier) => ({ value: tier, label: tier }))}
          />
          <FilterDropdown
            label="Venue type"
            allLabel="All venue types"
            value={typeFilter}
            onChange={setTypeFilter}
            options={VENUE_TYPES.map((type) => ({ value: type, label: type }))}
          />
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setStateFilter("all");
                setCityFilter("all");
                setCapacityFilter("all");
                setSettingFilter("all");
                setPriceFilter("all");
                setTypeFilter("all");
              }}
              className="text-sm text-brass hover:underline"
            >
              Clear filters ({activeFilterCount})
            </button>
          )}
        </div>

        {filteredVenues.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/50">
            {venues.length === 0
              ? "No venues have been added yet."
              : "No venues match these filters."}
          </p>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="order-1 lg:order-2 lg:w-1/2">
              <div className="lg:sticky lg:top-6">
                <VenuesMap
                  venues={filteredVenues}
                  shortlistedIds={shortlistedIds}
                  hoveredVenueId={hoveredVenueId}
                  onHoverVenue={setHoveredVenueId}
                />
              </div>
            </div>
            <div className="order-2 lg:order-1 lg:w-1/2 lg:max-h-[640px] lg:overflow-y-auto lg:pr-2">
              <div className="grid grid-cols-1 gap-4">
                {filteredVenues.map((venue) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    isShortlisted={shortlistedIds.has(venue.id)}
                    isBooked={bookedVenueId === venue.id}
                    onBookedToggled={setBookedVenueId}
                    isHighlighted={hoveredVenueId === venue.id}
                    onHover={() => setHoveredVenueId(venue.id)}
                    onLeave={() => setHoveredVenueId(null)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
