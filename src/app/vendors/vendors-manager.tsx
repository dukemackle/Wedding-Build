"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Vendor, VendorFavoriteEntry, VendorInquiry, VendorInquiryStatus } from "@/lib/supabase/types";
import { STYLE_TIERS } from "@/lib/wedding-options";
import {
  markVendorBooked,
  updateInquiryBookedAmount,
  updateInquiryStatus,
  updateVendorFavoriteNotes,
} from "./actions";
import { SearchBox } from "@/components/search-box";
import { FilterDropdown } from "@/components/filter-dropdown";
import { VendorFavoriteButton } from "./vendor-card-shared";
import { InquiryForm } from "./inquiry-form";
import { VendorFollowUps } from "./vendor-follow-ups";

const VendorsMap = dynamic(() => import("./vendors-map").then((m) => m.VendorsMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-md border border-hairline text-sm text-ink/50">
      Loading map...
    </div>
  ),
});

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
}: {
  vendor: Vendor;
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

  return (
    <div
      ref={cardRef}
      className={`flex flex-col overflow-hidden rounded-lg border bg-parchment transition-colors ${
        isHighlighted ? "border-forest ring-2 ring-forest/30" : "border-hairline"
      }`}
    >
      {vendor.image_url && (
        <Link href={`/vendors/${vendor.id}`}>
          <Image
            src={vendor.image_url}
            alt={vendor.name}
            width={400}
            height={300}
            className="aspect-[4/3] w-full border-b border-hairline object-cover"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Link href={`/vendors/${vendor.id}`} className="hover:underline">
            <h3 className="font-display text-xl font-semibold text-forest">{vendor.name}</h3>
          </Link>
          {vendor.price_tier && (
            <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-brass">
              {vendor.price_tier}
            </span>
          )}
        </div>
        <p className="text-xs uppercase tracking-wide text-ink/50">
          {[[vendor.city, vendor.state].filter(Boolean).join(", "), vendor.category]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {vendor.is_sample && (
          <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/40">Sample listing</p>
        )}
        {vendor.description && <p className="mt-3 text-sm text-ink/80">{vendor.description}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <VendorFavoriteButton vendorId={vendor.id} isFavorited={isFavorited} />
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-full border border-hairline bg-card px-3 py-1 text-sm text-forest transition-colors hover:border-forest"
            >
              Request a quote
            </button>
          )}
          {isBooked ? (
            <span className="rounded-full border border-forest/40 bg-forest/10 px-3 py-1 text-sm text-forest">
              ✓ Booked
            </span>
          ) : (
            <button
              onClick={handleMarkBooked}
              disabled={isPending}
              className="rounded-full border border-hairline bg-card px-3 py-1 text-sm text-ink transition-colors hover:border-forest disabled:opacity-60"
            >
              {isPending ? "..." : "Mark as booked"}
            </button>
          )}
        </div>

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
}: {
  vendors: Vendor[];
  inquiries: VendorInquiry[];
  favorites: VendorFavoriteEntry[];
}) {
  const favoritedIds = new Set(favorites.map((f) => f.vendor_id));
  const bookedVendorIds = new Set(
    inquiries
      .filter((i) => i.status === "booked")
      .map((i) => i.vendor_id)
      .filter((id): id is string => Boolean(id)),
  );
  const vendorById = new Map(vendors.map((v) => [v.id, v]));

  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [priceFilter, setPriceFilter] = useState<string | "all">("all");
  const [stateFilter, setStateFilter] = useState<string | "all">("all");
  const [cityFilter, setCityFilter] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");
  const [highlightedVendorId, setHighlightedVendorId] = useState<string | null>(null);
  const cardEls = useRef<Map<string, HTMLDivElement>>(new Map());

  function handleSelectVendorFromMap(vendorId: string) {
    setViewMode("list");
    setHighlightedVendorId(vendorId);
  }

  useEffect(() => {
    if (!highlightedVendorId || viewMode !== "list") return;
    const el = cardEls.current.get(highlightedVendorId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = setTimeout(() => setHighlightedVendorId(null), 2500);
    return () => clearTimeout(timeout);
  }, [highlightedVendorId, viewMode]);

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
    setStateFilter(value);
    setCityFilter("all");
  }

  const activeFilterCount = [categoryFilter, priceFilter, stateFilter, cityFilter].filter(
    (f) => f !== "all",
  ).length;

  const filteredVendors = vendors.filter(
    (v) =>
      (categoryFilter === "all" || v.category === categoryFilter) &&
      (priceFilter === "all" || v.price_tier === priceFilter) &&
      (stateFilter === "all" || v.state === stateFilter) &&
      (cityFilter === "all" || v.city === cityFilter) &&
      v.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8">
      {favorites.length > 0 && (
        <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-forest">Your favorites</h2>
          <div className="mt-4">
            {favorites.map((entry) => {
              const vendor = vendorById.get(entry.vendor_id);
              if (!vendor) return null;
              return (
                <VendorFavoriteNotes key={entry.id} entry={entry} vendorName={vendor.name} />
              );
            })}
          </div>
        </div>
      )}

      <VendorFollowUps inquiries={inquiries} />

      {inquiries.length > 0 && (
        <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-forest">
            Your inquiries
          </h2>
          <div className="mt-4">
            {inquiries.map((inquiry) => (
              <InquiryRow key={inquiry.id} inquiry={inquiry} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <div className="mb-4">
          <SearchBox value={search} onChange={setSearch} placeholder="Search vendors by name..." />
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-2">
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
            label="Category"
            allLabel="All categories"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map((category) => ({ value: category, label: category }))}
          />
          <FilterDropdown
            label="Price"
            allLabel="Any price"
            value={priceFilter}
            onChange={setPriceFilter}
            options={STYLE_TIERS.map((tier) => ({ value: tier, label: tier }))}
          />
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setStateFilter("all");
                setCityFilter("all");
                setCategoryFilter("all");
                setPriceFilter("all");
              }}
              className="text-sm text-brass hover:underline"
            >
              Clear filters ({activeFilterCount})
            </button>
          )}
        </div>

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

        {filteredVendors.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/50">
            {vendors.length === 0
              ? "No vendors have been added yet."
              : "No vendors match these filters."}
          </p>
        ) : viewMode === "map" ? (
          <VendorsMap vendors={filteredVendors} onSelectVendor={handleSelectVendorFromMap} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                isFavorited={favoritedIds.has(vendor.id)}
                isBooked={bookedVendorIds.has(vendor.id)}
                isHighlighted={highlightedVendorId === vendor.id}
                cardRef={(el) => {
                  if (el) cardEls.current.set(vendor.id, el);
                  else cardEls.current.delete(vendor.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
