"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { createElement, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ComponentType, SVGProps } from "react";
import type { Vendor, VendorFavoriteEntry, VendorInquiry, VendorInquiryStatus } from "@/lib/supabase/types";
import { STYLE_TIERS } from "@/lib/wedding-options";
import {
  markVendorBooked,
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
import { isBasicListing, vendorHref } from "@/lib/public-listings";
import { useSavedFilters } from "@/lib/use-saved-filters";
import { isInView, viewKey, type MapView } from "@/lib/map-view";
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
}: {
  vendor: Vendor;
  signedIn: boolean;
  isFavorited: boolean;
  isBooked: boolean;
  isHighlighted?: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isBooked, setIsBooked] = useState(initialIsBooked);
  const [isPending, startTransition] = useTransition();

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
      className={`flex flex-col overflow-hidden rounded-xl border bg-card transition-colors ${
        isHighlighted ? "border-forest ring-2 ring-forest/30" : "border-hairline"
      }`}
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
            <SignupHeart next={vendorHref(vendor)} />
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <Link href={vendorHref(vendor)} className="hover:underline">
          <p className="font-display text-lg font-semibold leading-snug tracking-tight text-ink">
            {vendor.name}
          </p>
        </Link>
        {(vendor.category || vendor.price_tier) && (
          <p className="mt-0.5 text-sm text-ink/80">
            {[vendor.category, vendor.price_tier].filter(Boolean).join(" · ")}
          </p>
        )}
        {place && <p className="mt-0.5 text-[13px] text-ink/55">{place}</p>}
        {isBasicListing(vendor) && (
          <span className="mt-1.5 self-start rounded-full border border-hairline px-2 py-0.5 text-[11px] text-ink/60">
            Basic listing · from Instagram
          </span>
        )}

        {!signedIn ? (
          <div className="mt-3 flex flex-col gap-2">
            <SignupCardButton next={vendorHref(vendor)} />
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
      </div>
    </div>
  );
}

function VendorFavoriteNotes({ entry, vendorName }: { entry: VendorFavoriteEntry; vendorName: string }) {
  const [saved, setSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateVendorFavoriteNotes(formData);
      setSaved(!result?.error);
    });
  }

  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <p className="text-ink">{vendorName}</p>
      <form action={handleSave} className="mt-2 flex items-start gap-3">
        <input type="hidden" name="vendor_id" value={entry.vendor_id} />
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
}: {
  vendors: Vendor[];
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

  const { values: filters, set: setFilter, update: updateFilters } = useSavedFilters(
    "youdoido:vendor-filters",
    { state: "all", city: "all", category: "all", price: "all", q: "" },
  );
  const { state: stateFilter, city: cityFilter, category: categoryFilter, price: priceFilter, q: search } =
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

  const availableCities = useMemo(
    () =>
      Array.from(
        new Set(
          vendors
            .filter((v) => stateFilter === "all" || v.state === stateFilter)
            .map((v) => v.city)
            .filter((c): c is string => Boolean(c)),
        ),
      ).sort(),
    [vendors, stateFilter],
  );

  function handleStateFilterChange(value: string) {
    updateFilters({ state: value, city: "all" });
  }

  const activeFilterCount = [categoryFilter, priceFilter, stateFilter, cityFilter].filter(
    (f) => f !== "all",
  ).length;

  // Few vendors have a price tier yet, so a blank one isn't a mismatch: those
  // vendors stay in, after the confirmed matches, rather than vanishing.
  const filteredVendors = useMemo(
    () =>
      vendors
        .filter(
          (v) =>
            (categoryFilter === "all" || v.category === categoryFilter) &&
            (priceFilter === "all" || !v.price_tier || v.price_tier === priceFilter) &&
            (stateFilter === "all" || v.state === stateFilter) &&
            (cityFilter === "all" || v.city === cityFilter) &&
            v.name.toLowerCase().includes(search.trim().toLowerCase()),
        )
        .sort(
          (a, b) =>
            Number(priceFilter !== "all" && !a.price_tier) -
            Number(priceFilter !== "all" && !b.price_tier),
        ),
    [vendors, categoryFilter, priceFilter, stateFilter, cityFilter, search],
  );

  // Like Zillow, the list is what the map shows: pan or zoom and it follows.
  // Until the map has drawn, it is everything the filters match.
  const listedVendors = useMemo(() => {
    const inView = mapView ? filteredVendors.filter((v) => isInView(v, mapView)) : filteredVendors;
    const selected = selectedVendorId ? inView.find((v) => v.id === selectedVendorId) : undefined;
    return selected ? [selected, ...inView.filter((v) => v !== selected)] : inView;
  }, [filteredVendors, mapView, selectedVendorId]);

  function clearFilters() {
    updateFilters({ state: "all", city: "all", category: "all", price: "all" });
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
          panel:
            favorites.length === 0 ? (
              <BirdEmptyState>
                <p className="text-sm text-ink/60">Nothing saved yet. Tap the heart on a vendor to keep it here.</p>
              </BirdEmptyState>
            ) : (
              <div>
                {favorites.map((entry) => {
                  const vendor = vendorById.get(entry.vendor_id);
                  if (!vendor) return null;
                  return (
                    <VendorFavoriteNotes key={entry.id} entry={entry} vendorName={vendor.name} />
                  );
                })}
              </div>
            ),
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
            onChange={(v) => setFilter("city", v)}
            options={availableCities.map((city) => ({ value: city, label: city }))}
            emptyMessage="No cities for this state"
          />
          <FilterDropdown
            label="Category"
            allLabel="All categories"
            value={categoryFilter}
            onChange={(v) => setFilter("category", v)}
            options={categories.map((category) => ({ value: category, label: category }))}
          />
          <FilterDropdown
            label="Price"
            allLabel="Any price"
            value={priceFilter}
            onChange={(v) => setFilter("price", v)}
            options={STYLE_TIERS.map((tier) => ({ value: tier, label: tier }))}
          />
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
          cardRef={(el) => {
            if (el) cardEls.current.set(vendor.id, el);
            else cardEls.current.delete(vendor.id);
          }}
        />
      ))}
    </SearchShell>
  );
}
