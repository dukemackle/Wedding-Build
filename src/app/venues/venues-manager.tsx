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
import { FilterDropdown } from "@/components/filter-dropdown";
import { SearchShell } from "@/components/search-shell";

const VenuesMap = dynamic(() => import("./venues-map").then((m) => m.VenuesMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-parchment text-sm text-ink/50">
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

  // Capacity leads the card, where a property listing would put its price.
  // It is the number a couple actually filters a venue on, and unlike price it
  // is data we hold for every listing.
  const lead = venue.capacity ? `${venue.capacity} guests` : venue.name;
  const facts = [venue.venue_type, venue.setting, venue.price_tier].filter(Boolean).join(" · ");
  const place = [venue.city, venue.state].filter(Boolean).join(", ");

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`flex flex-col overflow-hidden rounded-xl border bg-card transition-colors ${
        isBooked ? "border-brass" : isHighlighted ? "border-forest" : "border-hairline"
      }`}
    >
      <div className="relative">
        <Link href={`/venues/${venue.id}`}>
          <Image
            src={image}
            alt={venue.venue_type ? `${venue.venue_type} illustration` : "Venue illustration"}
            width={400}
            height={250}
            className="aspect-[16/10] max-h-44 w-full object-cover lg:max-h-none"
          />
        </Link>
        {(isBooked || venue.is_sample) && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-parchment">
            {isBooked ? "Booked venue" : "Sample listing"}
          </span>
        )}
        <div className="absolute right-2 top-2">
          <ShortlistButton venueId={venue.id} isShortlisted={isShortlisted} overlay />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <Link href={`/venues/${venue.id}`} className="hover:underline">
          <p className="font-mono-numbers text-lg font-bold tracking-tight text-ink">{lead}</p>
        </Link>
        {facts && <p className="mt-0.5 text-sm text-ink/80">{facts}</p>}
        {place && <p className="mt-0.5 text-[13px] text-ink/55">{place}</p>}
        <Link
          href={`/venues/${venue.id}`}
          className="mt-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-ink/40 hover:text-brass"
        >
          {venue.name}
        </Link>
        <div className="mt-3 flex flex-col gap-2">
          <BookedVenueButton
            venueId={venue.id}
            isBooked={isBooked}
            onToggled={onBookedToggled}
          />
          {!showInquiry && (
            <button
              type="button"
              onClick={() => setShowInquiry(true)}
              className="w-full rounded-full border border-hairline px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest"
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

  function clearFilters() {
    setStateFilter("all");
    setCityFilter("all");
    setCapacityFilter("all");
    setSettingFilter("all");
    setPriceFilter("all");
    setTypeFilter("all");
  }

  return (
    <SearchShell
      search={{ value: search, onChange: setSearch, placeholder: "Search venues by name..." }}
      activeFilterCount={activeFilterCount}
      onClearFilters={clearFilters}
      resultCount={filteredVenues.length}
      resultNoun="venue"
      views={[
        {
          key: "saved",
          label: "Saved",
          icon: "♥",
          count: shortlist.length,
          panel:
            shortlist.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink/50">
                Nothing saved yet. Tap the heart on a venue to keep it here.
              </p>
            ) : (
              <div>
                {shortlist.map((entry) => {
                  const venue = venueById.get(entry.venue_id);
                  if (!venue) return null;
                  return <ShortlistNotes key={entry.id} entry={entry} venueName={venue.name} />;
                })}
              </div>
            ),
        },
      ]}
      filters={
        <>
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
        </>
      }
      map={
        <VenuesMap
          venues={filteredVenues}
          shortlistedIds={shortlistedIds}
          hoveredVenueId={hoveredVenueId}
          onHoverVenue={setHoveredVenueId}
          heightClassName="h-full w-full"
        />
      }
      empty={
        <p className="py-8 text-center text-sm text-ink/50">
          {venues.length === 0
            ? "No venues have been added yet."
            : "No venues match these filters."}
        </p>
      }
    >
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
    </SearchShell>
  );
}
