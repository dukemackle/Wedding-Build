"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { VenueShortlistEntry } from "@/lib/supabase/types";
import { cityFilterValues, cityOptions } from "@/lib/city-options";
import { priceHeadline } from "@/lib/venue-pricing";
import { dollars, venueTotalFor } from "@/lib/venue-budget";
import { BudgetPanel, parseBudgetFilter } from "./budget-panel";
import { CAPACITY_FILTER_STEPS, VENUE_SETTINGS, VENUE_TYPES, currentVenueType, venueTypeImage } from "@/lib/wedding-options";
import { updateShortlistNotes } from "./actions";
import { BookedVenueButton, ShortlistButton } from "./venue-card-shared";
import { InquiryForm } from "./inquiry-form";
import { FilterDropdown, MULTI_SEPARATOR, splitMulti } from "@/components/filter-dropdown";
import { VenueTypeIcon } from "@/components/venue-type-icon";
import { SearchShell } from "@/components/search-shell";
import { useSavedFilters } from "@/lib/use-saved-filters";
import { isInView, viewKey, type MapView } from "@/lib/map-view";
import { BirdEmptyState } from "@/components/wren-moments";
import { SignupCardButton, SignupHeart } from "@/components/public-nav";
import { venueHref, type VenueListing } from "@/lib/public-listings";
import { ConfirmedChip } from "@/components/confirmed-badge";

const VenuesMap = dynamic(() => import("./venues-map").then((m) => m.VenuesMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-parchment text-sm text-ink/50">
      Loading map...
    </div>
  ),
});


const roundTo500 = (n: number) => Math.round(n / 500) * 500;

function VenueCard({
  venue,
  isShortlisted,
  isBooked,
  onBookedToggled,
  isHighlighted,
  onHover,
  onLeave,
  signedIn,
  budgetGuests,
}: {
  venue: VenueListing;
  signedIn: boolean;
  /** Set while the budget filter is on: the card adds its estimated total. */
  budgetGuests?: number;
  isShortlisted: boolean;
  isBooked: boolean;
  onBookedToggled: (bookedVenueId: string | null) => void;
  isHighlighted?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
}) {
  const [showInquiry, setShowInquiry] = useState(false);
  const image = venue.image_url || venueTypeImage(venue.venue_type);

  // Capacity leads the card, where a property listing would put its price.
  // It is the number a couple actually filters a venue on, and unlike price it
  // is data we hold for every listing.
  const lead = venue.capacity ? `${venue.capacity} guests` : venue.name;
  // A published price says more than the tier worked out from it, so the tier
  // only shows on venues without one (2026-10-22: tiers are on their way out).
  const price = priceHeadline({ price_from: venue.price_from, price_basis: venue.price_basis ?? null });
  const facts = [venue.venue_type, venue.setting, !price && venue.price_tier].filter(Boolean).join(" · ");
  // A package or minimum is already the total; only the others need working out.
  const total = budgetGuests ? venueTotalFor(venue, budgetGuests) : null;
  const estimate = total && (total.estimated || venue.price_basis === "per_person") ? total : null;
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
        <Link href={venueHref(venue)}>
          <Image
            src={image}
            alt={venue.venue_type ? `${venue.venue_type} illustration` : "Venue illustration"}
            width={400}
            height={250}
            className="aspect-[16/10] max-h-44 w-full object-cover lg:max-h-none"
          />
        </Link>
        {isBooked || venue.is_sample ? (
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-parchment">
            {isBooked ? "Booked venue" : "Sample listing"}
          </span>
        ) : (
          venue.source === "claimed" && <ConfirmedChip className="absolute left-2 top-2" />
        )}
        <div className="absolute right-2 top-2">
          {signedIn ? (
            <ShortlistButton venueId={venue.id} isShortlisted={isShortlisted} overlay />
          ) : (
            <SignupHeart name={venue.name} next={venueHref(venue)} />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <Link href={venueHref(venue)} className="hover:underline">
          <p className="font-mono-numbers text-lg font-bold tracking-tight text-ink">{lead}</p>
        </Link>
        {facts && <p className="mt-0.5 text-sm text-ink/80">{facts}</p>}
        {price && (
          <p className={`mt-0.5 text-sm ${venue.price_basis === "ask" ? "text-ink/60" : "font-medium text-ink"}`}>{price}</p>
        )}
        {estimate && (
          <p className="text-[13px] text-ink/60">
            {estimate.estimated
              ? `About ${dollars(roundTo500(estimate.total))} with food & drink (est.)`
              : `About ${dollars(roundTo500(estimate.total))} for ${budgetGuests} guests`}
          </p>
        )}
        {place && <p className="mt-0.5 text-[13px] text-ink/55">{place}</p>}
        <Link
          href={venueHref(venue)}
          className="mt-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-ink/40 hover:text-brass"
        >
          {venue.name}
        </Link>
        {!signedIn ? (
          <div className="mt-3 flex flex-col gap-2">
            <SignupCardButton name={venue.name} next={venueHref(venue)} />
          </div>
        ) : (
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
        )}
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
  signedIn = true,
  budgetDefaults = null,
}: {
  venues: VenueListing[];
  shortlist: VenueShortlistEntry[];
  bookedVenueId: string | null;
  /** A signed-in couple's guest count and venue, food & drink budget, to prefill the Budget filter. */
  budgetDefaults?: { guests: number; budget: number } | null;
  /** False on the public page: no Saved view, and card actions link to signup. */
  signedIn?: boolean;
}) {
  const [bookedVenueId, setBookedVenueId] = useState(initialBookedVenueId);
  const { values: filters, set: setFilter, update: updateFilters } = useSavedFilters(
    "youdoido:venue-filters",
    {
      state: "all",
      city: "all",
      capacity: "all",
      setting: "all",
      budget: "all",
      type: "all",
      q: "",
    },
  );
  const {
    state: stateFilter,
    city: cityFilter,
    capacity: capacityFilter,
    setting: settingFilter,
    budget: budgetFilter,
    type: savedType,
    q: search,
  } = filters;
  // Any number of types, joined; a filter saved before the 2026-10-22
  // categories maps to the nearest one.
  const typeFilters = splitMulti(savedType)
    .map((t) => currentVenueType(t))
    .filter((t): t is NonNullable<typeof t> => t != null);
  const typeFilter = typeFilters.length ? typeFilters.join(MULTI_SEPARATOR) : "all";
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [hoveredVenueId, setHoveredVenueId] = useState<string | null>(null);

  const shortlistedIds = new Set(shortlist.map((s) => s.venue_id));
  const venueById = new Map(venues.map((v) => [v.id, v]));

  const availableStates = useMemo(
    () =>
      Array.from(new Set(venues.map((v) => v.state).filter((s): s is string => Boolean(s)))).sort(),
    [venues],
  );

  const availableCities = useMemo(() => cityOptions(venues, stateFilter), [venues, stateFilter]);

  function handleStateFilterChange(value: string) {
    updateFilters({ state: value, city: "all" });
  }

  const activeFilterCount = [
    typeFilter,
    settingFilter,
    budgetFilter,
    capacityFilter,
    stateFilter,
    cityFilter,
  ].filter((f) => f !== "all").length;
  const budget = useMemo(() => parseBudgetFilter(budgetFilter), [budgetFilter]);

  // Most listings don't have a price or capacity yet, so a blank one isn't a
  // mismatch: those venues stay in, after the confirmed matches, rather than
  // vanishing from the budget and capacity filters. A venue whose starting
  // price is already over budget is the only one the budget hides.
  const filteredVenues = useMemo(() => {
    const totals = new Map(
      budget ? venues.map((v) => [v.id, venueTotalFor(v, budget.guests)?.total ?? null]) : [],
    );
    const unknownForFilters = (v: VenueListing) =>
      (budget !== null && totals.get(v.id) == null) || (capacityFilter !== "all" && v.capacity == null);
    const types = new Set<string>(splitMulti(typeFilter));
    return venues
      .filter(
        (v) =>
          (types.size === 0 || types.has(currentVenueType(v.venue_type) ?? "")) &&
          (settingFilter === "all" || v.setting === settingFilter) &&
          (!budget || (totals.get(v.id) ?? 0) <= budget.budget) &&
          (capacityFilter === "all" || v.capacity == null || v.capacity >= Number(capacityFilter)) &&
          (stateFilter === "all" || v.state === stateFilter) &&
          (cityFilter === "all" || v.city === cityFilter) &&
          v.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
      .sort((a, b) => Number(unknownForFilters(a)) - Number(unknownForFilters(b)));
  }, [venues, typeFilter, settingFilter, budget, capacityFilter, stateFilter, cityFilter, search]);

  // Like Zillow, the list is what the map shows: pan or zoom and it follows.
  // Until the map has drawn, it is everything the filters match.
  const listedVenues = useMemo(
    () => (mapView ? filteredVenues.filter((v) => isInView(v, mapView)) : filteredVenues),
    [filteredVenues, mapView],
  );

  function clearFilters() {
    updateFilters({
      state: "all",
      city: "all",
      capacity: "all",
      setting: "all",
      budget: "all",
      type: "all",
    });
  }

  return (
    <SearchShell
      search={{ value: search, onChange: (v) => setFilter("q", v), placeholder: "Search venues by name..." }}
      activeFilterCount={activeFilterCount}
      onClearFilters={clearFilters}
      resultCount={listedVenues.length}
      totalCount={filteredVenues.length}
      pageKey={`${JSON.stringify(filters)}|${viewKey(mapView)}`}
      resultNoun="venue"
      views={!signedIn ? [] : [
        {
          key: "saved",
          label: "Saved",
          icon: "♥",
          count: shortlist.length,
          panel:
            shortlist.length === 0 ? (
              <BirdEmptyState>
                <p className="text-sm text-ink/60">Nothing saved yet. Tap the heart on a venue to keep it here.</p>
              </BirdEmptyState>
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
            onChange={(v) => updateFilters(cityFilterValues(v))}
            options={availableCities}
            emptyMessage="No cities for this state"
            searchPlaceholder="Type your city"
          />
          <FilterDropdown
            label="Capacity"
            allLabel="Any size"
            value={capacityFilter}
            onChange={(v) => setFilter("capacity", v)}
            options={CAPACITY_FILTER_STEPS.map((step) => ({
              value: String(step),
              label: `${step}+ guests`,
            }))}
          />
          <FilterDropdown
            label="Setting"
            allLabel="Any setting"
            value={settingFilter}
            onChange={(v) => setFilter("setting", v)}
            options={VENUE_SETTINGS.map((setting) => ({ value: setting, label: setting }))}
          />
          <FilterDropdown
            label="Budget"
            allLabel="Any budget"
            value={budgetFilter}
            onChange={(v) => setFilter("budget", v)}
            options={[]}
            activeLabel={budget ? `Under ${dollars(budget.budget, true)} · ${budget.guests} guests` : undefined}
            panel={(close) => (
              <BudgetPanel
                value={budgetFilter}
                defaults={budgetDefaults}
                onApply={(v) => setFilter("budget", v)}
                close={close}
              />
            )}
          />
          <FilterDropdown
            label="Venue type"
            allLabel="All venue types"
            value={typeFilter}
            onChange={(v) => setFilter("type", v)}
            multiple
            options={VENUE_TYPES.map((type) => ({
              value: type,
              label: type,
              icon: <VenueTypeIcon type={type} />,
            }))}
          />
        </>
      }
      map={
        <VenuesMap
          venues={filteredVenues}
          shortlistedIds={shortlistedIds}
          hoveredVenueId={hoveredVenueId}
          onHoverVenue={setHoveredVenueId}
          onViewChange={setMapView}
          heightClassName="h-full w-full"
          signedIn={signedIn}
        />
      }
      empty={
        <p className="py-8 text-center text-sm text-ink/50">
          {venues.length === 0
            ? "No venues have been added yet."
            : filteredVenues.length === 0
              ? "No venues match these filters."
              : "No venues in this part of the map. Zoom out or move the map to see more."}
        </p>
      }
    >
      {listedVenues.map((venue) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          isShortlisted={shortlistedIds.has(venue.id)}
          isBooked={bookedVenueId === venue.id}
          onBookedToggled={setBookedVenueId}
          isHighlighted={hoveredVenueId === venue.id}
          onHover={() => setHoveredVenueId(venue.id)}
          onLeave={() => setHoveredVenueId(null)}
          signedIn={signedIn}
          budgetGuests={budget?.guests}
        />
      ))}
    </SearchShell>
  );
}
