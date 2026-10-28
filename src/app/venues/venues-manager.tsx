"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { VenueShortlistEntry } from "@/lib/supabase/types";
import { cityFilterValues, cityOptions } from "@/lib/city-options";
import { priceHeadline } from "@/lib/venue-pricing";
import { dollars, venueTotalFor } from "@/lib/venue-budget";
import { BudgetPanel, parseBudgetFilter } from "./budget-panel";
import { CAPACITY_FILTER_STEPS, VENUE_SETTINGS, VENUE_TYPES, currentVenueType, venueTypeImage } from "@/lib/wedding-options";
import { toggleShortlist, updateShortlistNotes } from "./actions";
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
import {
  HideIcon,
  LinkIcon,
  ListingMenu,
  ShareIcon,
  ShowIcon,
  SimilarIcon,
  UnsaveIcon,
  copyLink,
  shareLink,
  useLongPress,
  type ListingMenuItem,
} from "@/components/listing-menu";
import { SavedNote, SavedPage, countSummary, savedOn } from "@/components/saved-page";
import { useHiddenListings } from "@/lib/use-hidden-listings";
import { announceSaved } from "@/lib/saved-sync";

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
  menuItems,
  footer,
  dimmed = false,
}: {
  venue: VenueListing;
  signedIn: boolean;
  /** The ••• menu: Share, Hide, See similar on a result; Share, Remove on a saved card. */
  menuItems: ListingMenuItem[];
  /** Under the card's actions -- the note and saved date on the Saved page. */
  footer?: ReactNode;
  /** A hidden venue shown again by "Show hidden". */
  dimmed?: boolean;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const longPress = useLongPress(() => setMenuOpen(true));
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
      {...longPress}
      className={`flex flex-col overflow-hidden rounded-xl border bg-card transition-colors [-webkit-touch-callout:none] ${
        isBooked ? "border-brass" : isHighlighted ? "border-forest" : "border-hairline"
      } ${dimmed ? "opacity-60" : ""}`}
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
        <div className="flex items-start justify-between gap-2">
          <Link href={venueHref(venue)} className="min-w-0 hover:underline">
            <p className="font-mono-numbers text-lg font-bold tracking-tight text-ink">{lead}</p>
          </Link>
          <div className="-mr-1 -mt-0.5 shrink-0">
            <ListingMenu name={venue.name} items={menuItems} open={menuOpen} onOpenChange={setMenuOpen} />
          </div>
        </div>
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
        {footer}
      </div>
    </div>
  );
}

export function VenuesManager({
  venues,
  shortlist,
  bookedVenueId: initialBookedVenueId,
  signedIn = true,
  budgetDefaults = null,
  vendorSavedCount = 0,
}: {
  venues: VenueListing[];
  /** For the Saved page's Venues/Vendors switch. */
  vendorSavedCount?: number;
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
  const { hidden, hide, unhide } = useHiddenListings("youdoido:hidden-venues");
  const [showHidden, setShowHidden] = useState(false);
  const [savedSort, setSavedSort] = useState("date");

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
          (showHidden || !hidden.has(v.id)) &&
          v.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
      .sort((a, b) => Number(unknownForFilters(a)) - Number(unknownForFilters(b)));
  }, [venues, typeFilter, settingFilter, budget, capacityFilter, stateFilter, cityFilter, search, showHidden, hidden]);

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

  // Same type, same town: the filters set to this venue's, so the map shows its neighbours.
  function seeSimilar(venue: VenueListing) {
    const type = currentVenueType(venue.venue_type);
    updateFilters({
      type: type ?? "all",
      state: venue.state ?? "all",
      city: venue.state && venue.city ? venue.city : "all",
      q: "",
    });
  }

  function resultMenu(venue: VenueListing): ListingMenuItem[] {
    return [
      { label: "See similar", icon: <SimilarIcon />, onSelect: () => seeSimilar(venue) },
      hidden.has(venue.id)
        ? { label: "Unhide", icon: <ShowIcon />, onSelect: () => unhide(venue.id) }
        : { label: "Hide", icon: <HideIcon />, onSelect: () => hide(venue.id) },
      { label: "Share", icon: <ShareIcon />, onSelect: () => shareLink(venue.name, venueHref(venue)) },
    ];
  }

  function savedMenu(venue: VenueListing): ListingMenuItem[] {
    return [
      { label: "Share", icon: <ShareIcon />, onSelect: () => shareLink(venue.name, venueHref(venue)) },
      { label: "Copy link", icon: <LinkIcon />, onSelect: () => copyLink(venueHref(venue)) },
      {
        label: "Remove from saved",
        icon: <UnsaveIcon />,
        onSelect: async () => {
          const formData = new FormData();
          formData.set("venue_id", venue.id);
          formData.set("is_shortlisted", "true");
          const result = await toggleShortlist(formData);
          if (result?.error) return result.error;
          announceSaved("venue", venue.id, false);
        },
      },
    ];
  }

  function savedPage(close: () => void) {
    const entries = shortlist.flatMap((entry) => {
      const venue = venueById.get(entry.venue_id);
      return venue ? [{ entry, venue }] : [];
    });
    const last = Number.MAX_SAFE_INTEGER;
    entries.sort((a, b) =>
      savedSort === "capacity"
        ? (b.venue.capacity ?? -1) - (a.venue.capacity ?? -1)
        : savedSort === "price"
          ? (a.venue.price_from ?? last) - (b.venue.price_from ?? last)
          : savedSort === "name"
            ? a.venue.name.localeCompare(b.venue.name)
            : b.entry.created_at.localeCompare(a.entry.created_at),
    );
    const booked = entries.some(({ venue }) => venue.id === bookedVenueId);
    return (
      <SavedPage
        current="venues"
        venueCount={entries.length}
        vendorCount={vendorSavedCount}
        summary={countSummary(
          entries.map(({ venue }) => currentVenueType(venue.venue_type)),
          booked ? ["1 booked"] : [],
        )}
        sort={savedSort}
        onSort={setSavedSort}
        sortOptions={[
          { value: "date", label: "Date saved" },
          { value: "capacity", label: "Capacity" },
          { value: "price", label: "Price" },
          { value: "name", label: "Name" },
        ]}
        onBack={close}
        empty={
          <BirdEmptyState>
            <p className="text-sm text-ink/60">Nothing saved yet. Tap the heart on a venue to keep it here.</p>
          </BirdEmptyState>
        }
      >
        {entries.map(({ entry, venue }) => (
          <VenueCard
            key={entry.id}
            venue={venue}
            isShortlisted
            isBooked={bookedVenueId === venue.id}
            onBookedToggled={setBookedVenueId}
            signedIn={signedIn}
            menuItems={savedMenu(venue)}
            footer={
              <>
                <SavedNote
                  notes={entry.notes}
                  onSave={(notes) => {
                    const formData = new FormData();
                    formData.set("venue_id", venue.id);
                    formData.set("notes", notes);
                    return updateShortlistNotes(formData);
                  }}
                />
                <p className="mt-2 text-xs text-ink/45">{savedOn(entry.created_at)}</p>
              </>
            }
          />
        ))}
      </SavedPage>
    );
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
          fullPage: true,
          panel: savedPage,
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
            searchPlaceholder="Type your state"
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
          {hidden.size > 0 && (
            <button
              type="button"
              onClick={() => setShowHidden((v) => !v)}
              aria-pressed={showHidden}
              className="shrink-0 whitespace-nowrap rounded-full border border-hairline bg-card px-3 py-1.5 text-sm text-ink shadow-md hover:border-forest lg:shadow-none"
            >
              {showHidden ? "Hide hidden" : `Show hidden (${hidden.size})`}
            </button>
          )}
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
          outline={{ city: cityFilter, state: stateFilter }}
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
          menuItems={resultMenu(venue)}
          dimmed={hidden.has(venue.id)}
        />
      ))}
    </SearchShell>
  );
}
