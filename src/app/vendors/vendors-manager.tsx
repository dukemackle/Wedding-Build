"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useTransition } from "react";
import type { Vendor, VendorFavoriteEntry, VendorInquiry, VendorInquiryStatus } from "@/lib/supabase/types";
import { REGIONS } from "@/lib/wedding-options";
import { sendVendorInquiry, updateInquiryStatus, updateVendorFavoriteNotes } from "./actions";
import { SearchBox } from "@/components/search-box";
import { FilterDisclosure } from "@/components/filter-disclosure";
import { VendorFavoriteButton } from "./vendor-card-shared";

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

function InquiryForm({ vendor, onDone }: { vendor: Vendor; onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await sendVendorInquiry(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        onDone();
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-4 flex flex-col gap-3 border-t border-hairline pt-4">
      <input type="hidden" name="vendor_id" value={vendor.id} />
      <input type="hidden" name="vendor_name" value={vendor.name} />
      <input type="hidden" name="category" value={vendor.category ?? ""} />
      <label className="flex flex-col gap-1 text-sm text-ink">
        Send to
        <input
          type="email"
          name="recipient_email"
          required
          defaultValue={vendor.contact_email ?? ""}
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Message
        <textarea
          name="message"
          rows={3}
          required
          defaultValue={`Hi ${vendor.name}, we're planning our wedding and would love to get a quote for ${vendor.category?.toLowerCase() ?? "your services"}. Could you share availability and pricing?`}
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send inquiry"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function VendorCard({ vendor, isFavorited }: { vendor: Vendor; isFavorited: boolean }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col rounded-lg border border-hairline bg-parchment p-5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-display text-xl font-semibold text-forest">{vendor.name}</h3>
        {vendor.price_tier && (
          <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-brass">
            {vendor.price_tier}
          </span>
        )}
      </div>
      <p className="text-xs uppercase tracking-wide text-ink/50">
        {[
          [vendor.city, vendor.state].filter(Boolean).join(", "),
          vendor.category,
          vendor.region,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
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
      </div>

      {showForm && <InquiryForm vendor={vendor} onDone={() => setShowForm(false)} />}
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
  const vendorById = new Map(vendors.map((v) => [v.id, v]));

  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [regionFilter, setRegionFilter] = useState<string | "all">("all");
  const [stateFilter, setStateFilter] = useState<string | "all">("all");
  const [cityFilter, setCityFilter] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");

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

  const activeFilterCount = [categoryFilter, regionFilter, stateFilter, cityFilter].filter(
    (f) => f !== "all",
  ).length;

  const filteredVendors = vendors.filter(
    (v) =>
      (categoryFilter === "all" || v.category === categoryFilter) &&
      (regionFilter === "all" || v.region === regionFilter) &&
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
        <FilterDisclosure activeCount={activeFilterCount}>
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="vendor-state-filter" className="mb-1 block text-xs uppercase tracking-wide text-ink/50">
                State
              </label>
              <select
                id="vendor-state-filter"
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
              <label htmlFor="vendor-city-filter" className="mb-1 block text-xs uppercase tracking-wide text-ink/50">
                City
              </label>
              <select
                id="vendor-city-filter"
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
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                categoryFilter === "all"
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-parchment text-ink hover:border-forest"
              }`}
            >
              All categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  categoryFilter === category
                    ? "border-forest bg-forest text-parchment"
                    : "border-hairline bg-parchment text-ink hover:border-forest"
                }`}
              >
                {category}
              </button>
            ))}
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

        {filteredVendors.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/50">
            {vendors.length === 0
              ? "No vendors have been added yet."
              : "No vendors match these filters."}
          </p>
        ) : viewMode === "map" ? (
          <VendorsMap vendors={filteredVendors} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredVendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                isFavorited={favoritedIds.has(vendor.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
