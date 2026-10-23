"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { createElement, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import type { VendorFavoriteEntry, VendorInquiry, VendorInquiryStatus } from "@/lib/supabase/types";
import { cityFilterValues, cityOptions } from "@/lib/city-options";
import {
  markVendorBooked,
  toggleVendorFavorite,
  updateInquiryBookedAmount,
  updateInquiryStatus,
  updateVendorFavoriteNotes,
} from "./actions";
import { FilterDropdown } from "@/components/filter-dropdown";
import { SearchShell } from "@/components/search-shell";
import { VendorFavoriteButton } from "./vendor-card-shared";
import { InquiryForm } from "./inquiry-form";
import { VendorFollowUps } from "./vendor-follow-ups";
import { BirdEmptyState } from "@/components/wren-moments";
import { SignupCardButton, SignupHeart } from "@/components/public-nav";
import { vendorHref, type VendorListing } from "@/lib/public-listings";
import { useSavedFilters } from "@/lib/use-saved-filters";
import { isInView, viewKey, type MapView } from "@/lib/map-view";
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
import {
  AttireIcon,
  BarIcon,
  BuntingIcon,
  CakeIcon,
  CateringIcon,
  FloralsIcon,
  HairMakeupIcon,
  MusicIcon,
  OfficiantIcon,
  PhotographyIcon,
  PlannerIcon,
  StationeryIcon,
  TransportationIcon,
  VendorsIcon,
  VideographyIcon,
} from "@/components/icons";

const VendorsMap = dynamic(() => import("./vendors-map").then((m) => m.VendorsMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-parchment text-sm text-ink/50">
      Loading map...
    </div>
  ),
});

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/** The line icon a photo-less vendor card shows, keyed by listing category. */
const VENDOR_CATEGORY_ICONS: Record<string, IconComponent> = {
  Catering: CateringIcon,
  Bar: BarIcon,
  Photography: PhotographyIcon,
  Videography: VideographyIcon,
  Florals: FloralsIcon,
  Music: MusicIcon,
  Cake: CakeIcon,
  Desserts: CakeIcon,
  Planning: PlannerIcon,
  Transportation: TransportationIcon,
  "Hair & Makeup": HairMakeupIcon,
  Officiant: OfficiantIcon,
  "Stationery & Invitations": StationeryIcon,
  "Decor & Lighting": BuntingIcon,
  Rentals: BuntingIcon,
  "Photo Booth": PhotographyIcon,
  "Bridal & Formalwear": AttireIcon,
};

function vendorCategoryIcon(category: string | null): IconComponent {
  return (category && VENDOR_CATEGORY_ICONS[category]) || VendorsIcon;
}

const STATUSES: VendorInquiryStatus[] = ["sent", "responded", "booked", "declined"];

const STATUS_LABELS: Record<VendorInquiryStatus, string> = {
  sent: "Sent",
  responded: "Responded",
  booked: "Booked",
  declined: "Declined",
};

const STATUS_BADGE_CLASS: Record<VendorInquiryStatus, string> = {
  sent: "border-hairline text-ink/70",
  responded: "border-brass/40 bg-brass/10 text-brass",
  booked: "border-forest/40 bg-forest/10 text-forest",
  declined: "border-red-200 bg-red-50 text-red-700",
};

function VendorCard({
  vendor,
  isFavorited,
  isBooked: initialIsBooked,
  isHighlighted,
  cardRef,
  signedIn,
  menuItems,
  footer,
  dimmed = false,
}: {
  vendor: VendorListing;
  signedIn: boolean;
  /** The ••• menu: Share, Hide, See similar on a result; Share, Remove on a saved card. */
  menuItems: ListingMenuItem[];
  /** Under the card's actions -- the note and saved date on the Saved page. */
  footer?: ReactNode;
  /** A hidden vendor shown again by "Show hidden". */
  dimmed?: boolean;
  isFavorited: boolean;
  isBooked: boolean;
  isHighlighted?: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isBooked, setIsBooked] = useState(initialIsBooked);
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const longPress = useLongPress(() => setMenuOpen(true));

  function handleMarkBooked() {
    const formData = new FormData();
    formData.set("vendor_id", vendor.id);
    formData.set("vendor_name", vendor.name);
    formData.set("category", vendor.category ?? "");

    startTransition(async () => {
      const result = await markVendorBooked(formData);
      if (!result?.error) {
        setIsBooked(true);
      }
    });
  }

  // The business name leads; the category and price sit under it as one
  // line, the way a property card puts beds and baths under the address.
  const place = [vendor.city, vendor.state].filter(Boolean).join(", ");

  return (
    <div
      ref={cardRef}
      {...longPress}
      className={`flex flex-col overflow-hidden rounded-xl border bg-card transition-colors [-webkit-touch-callout:none] ${
        isHighlighted ? "border-forest ring-2 ring-forest/30" : "border-hairline"
      } ${dimmed ? "opacity-60" : ""}`}
    >
      <div className="relative">
        {vendor.image_url ? (
          <Link href={vendorHref(vendor)}>
            <Image
              src={vendor.image_url}
              alt={vendor.name}
              width={400}
              height={250}
              className="aspect-[16/10] max-h-44 w-full object-cover lg:max-h-none"
            />
          </Link>
        ) : (
          // No photo: the category's line icon on a tinted band, the way
          // venues fall back to an illustration of their type. (A monogram
          // used to sit here, and names like "[SALON] 718" made it a stray "[".)
          <Link
            href={vendorHref(vendor)}
            className="flex aspect-[16/10] max-h-44 w-full items-center justify-center bg-forest/5 lg:max-h-none"
          >
            {createElement(vendorCategoryIcon(vendor.category), {
              className: "h-12 w-12 text-forest/30",
              strokeWidth: 1.25,
            })}
          </Link>
        )}
        {(isBooked || vendor.is_sample) && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-parchment">
            {isBooked ? "Booked" : "Sample listing"}
          </span>
        )}
        <div className="absolute right-2 top-2">
          {signedIn ? (
            <VendorFavoriteButton vendorId={vendor.id} isFavorited={isFavorited} overlay />
          ) : (
            <SignupHeart name={vendor.name} next={vendorHref(vendor)} />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={vendorHref(vendor)} className="min-w-0 hover:underline">
            <p className="font-display text-lg font-semibold leading-snug tracking-tight text-ink">
              {vendor.name}
            </p>
          </Link>
          <div className="-mr-1 -mt-0.5 shrink-0">
            <ListingMenu name={vendor.name} items={menuItems} open={menuOpen} onOpenChange={setMenuOpen} />
          </div>
        </div>
        {(vendor.category || vendor.price_tier) && (
          <p className="mt-0.5 text-sm text-ink/80">
            {[vendor.category, vendor.price_tier].filter(Boolean).join(" · ")}
          </p>
        )}
        {place && <p className="mt-0.5 text-[13px] text-ink/55">{place}</p>}

        {!signedIn ? (
          <div className="mt-3 flex flex-col gap-2">
            <SignupCardButton name={vendor.name} next={vendorHref(vendor)} />
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full rounded-full border border-hairline bg-card px-3 py-1.5 text-sm text-forest transition-colors hover:border-forest"
              >
                Request a quote
              </button>
            )}
            {isBooked ? (
              <span className="w-full rounded-full border border-forest/40 bg-forest/10 px-3 py-1.5 text-center text-sm text-forest">
                ✓ Booked
              </span>
            ) : (
              <button
                onClick={handleMarkBooked}
                disabled={isPending}
                className="w-full rounded-full border border-hairline bg-card px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60"
              >
                {isPending ? "..." : "Mark as booked"}
              </button>
            )}
          </div>

        )}
        {showForm && <InquiryForm vendor={vendor} onDone={() => setShowForm(false)} />}
        {footer}
      </div>
    </div>
  );
}

function BookedAmountField({ inquiry }: { inquiry: VendorInquiry }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  function handleSubmit(formData: FormData) {
    formData.set("inquiry_id", inquiry.id);
    startTransition(async () => {
      const result = await updateInquiryBookedAmount(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setSaved(true);
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-2 flex items-center gap-2">
      <label className="text-xs text-ink/60">Booked for</label>
      <input
        type="number"
        name="booked_amount"
        min="0"
        step="1"
        placeholder="$ amount"
        defaultValue={inquiry.booked_amount ?? ""}
        onChange={() => setSaved(false)}
        className="w-28 rounded-md border border-hairline bg-parchment px-2 py-1 text-sm text-ink outline-none focus:border-forest"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-hairline px-2 py-1 text-xs text-ink transition-colors hover:border-forest disabled:opacity-60"
      >
        {isPending ? "Saving..." : saved ? "Saved" : "Save"}
      </button>
      {error && <p className="text-xs text-red-800">{error}</p>}
    </form>
  );
}

function InquiryRow({ inquiry }: { inquiry: VendorInquiry }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(inquiry.status);
  const [error, setError] = useState<string | undefined>(undefined);

  function handleChange(newStatus: VendorInquiryStatus) {
    const formData = new FormData();
    formData.set("inquiry_id", inquiry.id);
    formData.set("status", newStatus);
    startTransition(async () => {
      const result = await updateInquiryStatus(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setStatus(newStatus);
      }
    });
  }

  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-ink">{inquiry.vendor_name}</p>
          <p className="mt-1 text-xs text-ink/50">
            {inquiry.category ?? "—"} · sent {new Date(inquiry.sent_at).toLocaleDateString()}
          </p>
        </div>
        <select
          value={status}
          disabled={isPending}
          onChange={(e) => handleChange(e.target.value as VendorInquiryStatus)}
          className={`rounded-full border px-3 py-1 text-sm ${STATUS_BADGE_CLASS[status]}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      {inquiry.message && <p className="mt-2 text-sm text-ink/70">{inquiry.message}</p>}
      {status === "booked" && <BookedAmountField inquiry={inquiry} />}
      {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
    </div>
  );
}

export function VendorsManager({
  vendors,
  inquiries,
  favorites,
  signedIn = true,
  venueSavedCount = 0,
}: {
  vendors: VendorListing[];
  /** For the Saved page's Venues/Vendors switch. */
  venueSavedCount?: number;
  inquiries: VendorInquiry[];
  favorites: VendorFavoriteEntry[];
  /** False on the public page: no Saved / Inquiries views, and card actions link to signup. */
  signedIn?: boolean;
}) {
  const favoritedIds = new Set(favorites.map((f) => f.vendor_id));
  const bookedVendorIds = new Set(
    inquiries
      .filter((i) => i.status === "booked")
      .map((i) => i.vendor_id)
      .filter((id): id is string => Boolean(id)),
  );
  const vendorById = new Map(vendors.map((v) => [v.id, v]));
  const { hidden, hide, unhide } = useHiddenListings("youdoido:hidden-vendors");
  const [showHidden, setShowHidden] = useState(false);
  const [savedSort, setSavedSort] = useState("date");

  const { values: filters, set: setFilter, update: updateFilters } = useSavedFilters(
    "youdoido:vendor-filters",
    { state: "all", city: "all", category: "all", q: "" },
  );
  const { state: stateFilter, city: cityFilter, category: categoryFilter, q: search } =
    filters;
  const [mapView, setMapView] = useState<MapView | null>(null);
  // The vendor last opened from a pin, kept at the top of the list.
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [highlightedVendorId, setHighlightedVendorId] = useState<string | null>(null);
  const cardEls = useRef<Map<string, HTMLDivElement>>(new Map());

  function handleSelectVendorFromMap(vendorId: string) {
    setSelectedVendorId(vendorId);
    setHighlightedVendorId(vendorId);
  }

  useEffect(() => {
    if (!highlightedVendorId) return;
    const el = cardEls.current.get(highlightedVendorId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = setTimeout(() => setHighlightedVendorId(null), 2500);
    return () => clearTimeout(timeout);
  }, [highlightedVendorId]);

  const categories = Array.from(
    new Set(vendors.map((v) => v.category).filter((c): c is string => Boolean(c))),
  );

  const availableStates = useMemo(
    () =>
      Array.from(new Set(vendors.map((v) => v.state).filter((s): s is string => Boolean(s)))).sort(),
    [vendors],
  );

  const availableCities = useMemo(() => cityOptions(vendors, stateFilter), [vendors, stateFilter]);

  function handleStateFilterChange(value: string) {
    updateFilters({ state: value, city: "all" });
  }

  const activeFilterCount = [categoryFilter, stateFilter, cityFilter].filter(
    (f) => f !== "all",
  ).length;

  // No price filter until vendors carry published prices: with almost none
  // tiered, it only reordered the list while looking like it narrowed it.
  const filteredVendors = useMemo(
    () =>
      vendors
        .filter(
          (v) =>
            (categoryFilter === "all" || v.category === categoryFilter) &&
            (stateFilter === "all" || v.state === stateFilter) &&
            (cityFilter === "all" || v.city === cityFilter) &&
            (showHidden || !hidden.has(v.id)) &&
            v.name.toLowerCase().includes(search.trim().toLowerCase()),
        ),
    [vendors, categoryFilter, stateFilter, cityFilter, search, showHidden, hidden],
  );

  // Like Zillow, the list is what the map shows: pan or zoom and it follows.
  // Until the map has drawn, it is everything the filters match.
  const listedVendors = useMemo(() => {
    const inView = mapView ? filteredVendors.filter((v) => isInView(v, mapView)) : filteredVendors;
    const selected = selectedVendorId ? inView.find((v) => v.id === selectedVendorId) : undefined;
    return selected ? [selected, ...inView.filter((v) => v !== selected)] : inView;
  }, [filteredVendors, mapView, selectedVendorId]);

  function clearFilters() {
    updateFilters({ state: "all", city: "all", category: "all" });
  }

  // Same category, same town: the filters set to this vendor's, so the map shows its neighbours.
  function seeSimilar(vendor: VendorListing) {
    updateFilters({
      category: vendor.category ?? "all",
      state: vendor.state ?? "all",
      city: vendor.state && vendor.city ? vendor.city : "all",
      q: "",
    });
  }

  function resultMenu(vendor: VendorListing): ListingMenuItem[] {
    return [
      { label: "See similar", icon: <SimilarIcon />, onSelect: () => seeSimilar(vendor) },
      hidden.has(vendor.id)
        ? { label: "Unhide", icon: <ShowIcon />, onSelect: () => unhide(vendor.id) }
        : { label: "Hide", icon: <HideIcon />, onSelect: () => hide(vendor.id) },
      { label: "Share", icon: <ShareIcon />, onSelect: () => shareLink(vendor.name, vendorHref(vendor)) },
    ];
  }

  function savedMenu(vendor: VendorListing): ListingMenuItem[] {
    return [
      { label: "Share", icon: <ShareIcon />, onSelect: () => shareLink(vendor.name, vendorHref(vendor)) },
      { label: "Copy link", icon: <LinkIcon />, onSelect: () => copyLink(vendorHref(vendor)) },
      {
        label: "Remove from saved",
        icon: <UnsaveIcon />,
        onSelect: async () => {
          const formData = new FormData();
          formData.set("vendor_id", vendor.id);
          formData.set("is_favorited", "true");
          const result = await toggleVendorFavorite(formData);
          if (result?.error) return result.error;
          announceSaved("vendor", vendor.id, false);
        },
      },
    ];
  }

  function savedPage(close: () => void) {
    const entries = favorites.flatMap((entry) => {
      const vendor = vendorById.get(entry.vendor_id);
      return vendor ? [{ entry, vendor }] : [];
    });
    entries.sort((a, b) =>
      savedSort === "category"
        ? (a.vendor.category ?? "~").localeCompare(b.vendor.category ?? "~") || a.vendor.name.localeCompare(b.vendor.name)
        : savedSort === "name"
          ? a.vendor.name.localeCompare(b.vendor.name)
          : b.entry.created_at.localeCompare(a.entry.created_at),
    );
    const booked = entries.filter(({ vendor }) => bookedVendorIds.has(vendor.id)).length;
    return (
      <SavedPage
        current="vendors"
        venueCount={venueSavedCount}
        vendorCount={entries.length}
        summary={countSummary(
          entries.map(({ vendor }) => vendor.category),
          booked ? [`${booked} booked`] : [],
        )}
        sort={savedSort}
        onSort={setSavedSort}
        sortOptions={[
          { value: "date", label: "Date saved" },
          { value: "category", label: "Category" },
          { value: "name", label: "Name" },
        ]}
        onBack={close}
        empty={
          <BirdEmptyState>
            <p className="text-sm text-ink/60">Nothing saved yet. Tap the heart on a vendor to keep it here.</p>
          </BirdEmptyState>
        }
      >
        {entries.map(({ entry, vendor }) => (
          <VendorCard
            key={entry.id}
            vendor={vendor}
            isFavorited
            isBooked={bookedVendorIds.has(vendor.id)}
            signedIn={signedIn}
            menuItems={savedMenu(vendor)}
            footer={
              <>
                <SavedNote
                  notes={entry.notes}
                  onSave={(notes) => {
                    const formData = new FormData();
                    formData.set("vendor_id", vendor.id);
                    formData.set("notes", notes);
                    return updateVendorFavoriteNotes(formData);
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
      search={{ value: search, onChange: (v) => setFilter("q", v), placeholder: "Search vendors by name..." }}
      activeFilterCount={activeFilterCount}
      onClearFilters={clearFilters}
      resultCount={listedVendors.length}
      totalCount={filteredVendors.length}
      pageKey={`${JSON.stringify(filters)}|${viewKey(mapView)}`}
      resultNoun="vendor"
      views={!signedIn ? [] : [
        {
          key: "saved",
          label: "Saved",
          icon: "♥",
          count: favorites.length,
          fullPage: true,
          panel: savedPage,
        },
        {
          key: "inquiries",
          label: "Inquiries",
          icon: "✉",
          count: inquiries.length,
          panel: (
            <div>
              <VendorFollowUps inquiries={inquiries} />
              {inquiries.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink/50">
                  No quotes requested yet.
                </p>
              ) : (
                inquiries.map((inquiry) => <InquiryRow key={inquiry.id} inquiry={inquiry} />)
              )}
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
            label="Category"
            allLabel="All categories"
            value={categoryFilter}
            onChange={(v) => setFilter("category", v)}
            options={categories.map((category) => ({ value: category, label: category }))}
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
        <VendorsMap
          vendors={filteredVendors}
          onSelectVendor={handleSelectVendorFromMap}
          onViewChange={setMapView}
          heightClassName="h-full w-full"
        />
      }
      empty={
        <p className="py-8 text-center text-sm text-ink/50">
          {vendors.length === 0
            ? "No vendors have been added yet."
            : filteredVendors.length === 0
              ? "No vendors match these filters."
              : "No vendors in this part of the map. Zoom out or move the map to see more."}
        </p>
      }
    >
      {listedVendors.map((vendor) => (
        <VendorCard
          key={vendor.id}
          vendor={vendor}
          isFavorited={favoritedIds.has(vendor.id)}
          isBooked={bookedVendorIds.has(vendor.id)}
          isHighlighted={highlightedVendorId === vendor.id}
          signedIn={signedIn}
          menuItems={resultMenu(vendor)}
          dimmed={hidden.has(vendor.id)}
          cardRef={(el) => {
            if (el) cardEls.current.set(vendor.id, el);
            else cardEls.current.delete(vendor.id);
          }}
        />
      ))}
    </SearchShell>
  );
}
