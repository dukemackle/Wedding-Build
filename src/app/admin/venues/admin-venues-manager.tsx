"use client";

import { useRef, useState, useTransition } from "react";
import type { Venue, VenueFaq } from "@/lib/supabase/types";
import { VenueImportPanel } from "./venue-import-panel";
import { ClaimLinkPanel } from "../claim-link-panel";
import { getClaimLink, regenerateClaimLink } from "./claim-actions";
import { STATES, STYLE_TIERS, VENUE_SETTINGS, VENUE_TYPES } from "@/lib/wedding-options";
import { FilterBar, StatusChips } from "../_listing/listing-toolbar";
import {
  BulkBar,
  buttonClass,
  Checkbox,
  Completeness,
  LastChecked,
  Pagination,
  RowMenu,
  StatusPill,
  Thumb,
  type MenuItem,
} from "../_listing/listing-ui";
import { listingQueryString, type ListingParams, type ListingStatus } from "../_listing/params";
import { VENUE_STATUSES } from "./listing-config";
import {
  addVenueFaq,
  bulkDeleteVenues,
  bulkMarkVenuesVerified,
  bulkSetVenueActive,
  createVenue,
  deleteVenueFaq,
  markVenueVerified,
  setVenueActive,
  updateVenue,
} from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function VenueForm({
  venue,
  onDone,
}: {
  venue?: Venue;
  onDone: () => void;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const action = venue ? updateVenue : createVenue;
      if (venue) formData.set("id", venue.id);
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        onDone();
      }
    });
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Name
        <input name="name" required defaultValue={venue?.name ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Venue type
        <select name="venue_type" defaultValue={venue?.venue_type ?? ""} className={inputClass}>
          <option value="">—</option>
          {VENUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Setting
        <select name="setting" defaultValue={venue?.setting ?? ""} className={inputClass}>
          <option value="">—</option>
          {VENUE_SETTINGS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        State
        <select name="state" defaultValue={venue?.state ?? ""} className={inputClass}>
          <option value="">—</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        City
        <input name="city" defaultValue={venue?.city ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Capacity
        <input
          name="capacity"
          type="number"
          min="0"
          defaultValue={venue?.capacity ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Price tier
        <select name="price_tier" defaultValue={venue?.price_tier ?? ""} className={inputClass}>
          <option value="">—</option>
          {STYLE_TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Image URL
        <input name="image_url" defaultValue={venue?.image_url ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Contact email
        <input
          name="contact_email"
          type="email"
          defaultValue={venue?.contact_email ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Contact phone
        <input name="contact_phone" defaultValue={venue?.contact_phone ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Website
        <input name="website" defaultValue={venue?.website ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Latitude
        <input
          name="latitude"
          type="number"
          step="any"
          defaultValue={venue?.latitude ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Longitude
        <input
          name="longitude"
          type="number"
          step="any"
          defaultValue={venue?.longitude ?? ""}
          className={inputClass}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Description
        <textarea
          name="description"
          rows={2}
          defaultValue={venue?.description ?? ""}
          className={inputClass}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        About <span className="text-ink/50">(longer write-up, shown on the venue page)</span>
        <textarea name="about" rows={4} defaultValue={venue?.about ?? ""} className={inputClass} />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        What&apos;s included
        <textarea
          name="included"
          rows={3}
          placeholder="e.g. Two nights at the lodge, $4,000 in event rentals with setup and takedown"
          defaultValue={venue?.included ?? ""}
          className={inputClass}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Amenities <span className="text-ink/50">(comma separated)</span>
        <input
          name="amenities"
          placeholder="Bridal suite, On-site parking, Rain backup, Pet friendly"
          defaultValue={venue?.amenities?.join(", ") ?? ""}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
        <input type="checkbox" name="is_sample" defaultChecked={venue?.is_sample ?? false} />
        Sample / placeholder listing (not a real vendor)
      </label>
      {error && <p className="text-sm text-red-800 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Saving..." : venue ? "Save changes" : "Add venue"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 text-sm text-ink hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function VenueFaqEditor({ venue, faqs }: { venue: Venue; faqs: VenueFaq[] }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    formData.set("venue_id", venue.id);
    formData.set("sort_order", String(faqs.length));
    startTransition(async () => {
      const result = await addVenueFaq(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        formRef.current?.reset();
      }
    });
  }

  function handleDelete(faqId: string) {
    const formData = new FormData();
    formData.set("id", faqId);
    formData.set("venue_id", venue.id);
    startTransition(async () => {
      const result = await deleteVenueFaq(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="mt-4 border-t border-hairline pt-4">
      <p className="text-sm text-ink">
        FAQs <span className="text-ink/50">({faqs.length})</span>
      </p>

      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="mt-2 flex items-start justify-between gap-3 rounded-md border border-hairline bg-parchment p-3"
        >
          <div>
            <p className="text-sm text-ink">{faq.question}</p>
            <p className="mt-0.5 text-xs text-ink/60">{faq.answer}</p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(faq.id)}
            disabled={isPending}
            className="shrink-0 text-xs text-ink/50 hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      <form ref={formRef} action={handleAdd} className="mt-3 flex flex-col gap-2">
        <input name="question" placeholder="Question" className={inputClass} />
        <textarea name="answer" rows={2} placeholder="Answer" className={inputClass} />
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-md border border-hairline px-3 py-1.5 text-sm text-ink hover:border-forest disabled:opacity-60"
        >
          {isPending ? "Adding..." : "+ Add FAQ"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}

/** What a couple needs from a listing. Mirrors VENUE_LISTING.incompleteFilter. */
function venueChecks(venue: Venue): [string, boolean][] {
  return [
    ["photo", !!venue.image_url],
    ["description", !!(venue.description || venue.about)],
    ["capacity", venue.capacity != null],
    ["price", !!(venue.price_from || venue.price_tier)],
    ["contact", !!(venue.contact_email || venue.contact_phone || venue.website)],
  ];
}

// Desktop columns: select, photo, venue, type, source, complete, checked, inquiries, status, actions.
const GRID =
  "lg:grid lg:grid-cols-[20px_48px_minmax(0,2fr)_minmax(0,1fr)_72px_84px_minmax(0,150px)_80px_64px_112px] lg:items-center lg:gap-3";

function VenueRow({
  venue,
  faqs,
  inquiries,
  selected,
  onToggleSelect,
}: {
  venue: Venue;
  faqs: VenueFaq[];
  inquiries: number;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const [panel, setPanel] = useState<"edit" | "claim" | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const formData = new FormData();
    formData.set("id", venue.id);
    formData.set("active", String(!venue.active));
    startTransition(async () => {
      await setVenueActive(formData);
    });
  }

  function markVerified() {
    const formData = new FormData();
    formData.set("id", venue.id);
    startTransition(async () => {
      await markVenueVerified(formData);
    });
  }

  const menu: MenuItem[] = [
    { label: "Still right", onSelect: markVerified, disabled: isPending },
    { label: venue.active ? "Hide" : "Make live", onSelect: toggleActive, disabled: isPending },
    ...(venue.is_sample ? [] : [{ label: "Claim link", onSelect: () => setPanel("claim") }]),
    { label: "View listing", onSelect: () => window.open(`https://wrenwed.com/venues/${venue.id}`, "_blank") },
  ];
  const place = [venue.city, venue.state].filter(Boolean).join(", ") || "—";

  return (
    <div className={`border-b border-hairline last:border-b-0 ${selected ? "bg-forest/[0.03]" : ""}`}>
      {/* Desktop: one table row. */}
      <div className={`hidden px-3 py-2 text-sm ${GRID}`}>
        <Checkbox checked={selected} onChange={onToggleSelect} label={`Select ${venue.name}`} />
        <Thumb src={venue.image_url} />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">
            {venue.name}
            {venue.is_sample && <span className="ml-2 text-[11px] font-normal uppercase text-ink/40">Sample</span>}
          </p>
          <p className="truncate text-xs text-ink/50">
            {place}
            {venue.source === "claimed" && <span className="text-forest"> · Claimed</span>}
          </p>
        </div>
        <span className="truncate text-ink/80">{venue.venue_type ?? "—"}</span>
        <span className="text-xs text-ink/50">{venue.source ?? "seed"}</span>
        <Completeness checks={venueChecks(venue)} />
        <span className="truncate text-xs">
          <LastChecked at={venue.last_verified_at} short />
        </span>
        <span className="font-mono-numbers text-ink/80">{inquiries}</span>
        <StatusPill active={venue.active} />
        <div className="flex justify-end gap-1.5">
          <button type="button" onClick={() => setPanel(panel === "edit" ? null : "edit")} className={buttonClass}>
            Edit
          </button>
          <RowMenu items={menu} />
        </div>
      </div>

      {/* Phone: a card. */}
      <div className="flex items-start gap-3 p-3 lg:hidden">
        <Checkbox checked={selected} onChange={onToggleSelect} label={`Select ${venue.name}`} className="mt-1" />
        <Thumb src={venue.image_url} />
        <button type="button" onClick={() => setPanel(panel === "edit" ? null : "edit")} className="min-w-0 flex-1 text-left">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate font-medium text-ink">{venue.name}</span>
            <StatusPill active={venue.active} />
          </span>
          <span className="block truncate text-xs text-ink/50">
            {[venue.venue_type, place].filter(Boolean).join(" · ")}
          </span>
          <span className="mt-1 flex items-center gap-2 overflow-hidden whitespace-nowrap text-xs">
            <Completeness checks={venueChecks(venue)} />
            <LastChecked at={venue.last_verified_at} short />
          </span>
        </button>
        <RowMenu items={menu} />
      </div>

      {panel === "edit" && (
        <div className="border-t border-hairline bg-parchment/60 p-4">
          <VenueForm venue={venue} onDone={() => setPanel(null)} />
          <VenueFaqEditor venue={venue} faqs={faqs} />
        </div>
      )}
      {panel === "claim" && (
        <div className="px-3 pb-3">
          <ClaimLinkPanel
            target={{ name: venue.name, city: venue.city, contactEmail: venue.contact_email, kind: "venue" }}
            getLink={() => getClaimLink(venue.id)}
            newLink={() => regenerateClaimLink(venue.id)}
            onClose={() => setPanel(null)}
          />
        </div>
      )}
    </div>
  );
}

export function AdminVenuesManager({
  heading,
  notice,
  venues,
  total,
  params,
  statusCounts,
  faqsByVenueId,
  inquiriesByVenueId,
}: {
  heading: React.ReactNode;
  notice?: React.ReactNode;
  venues: Venue[];
  total: number;
  params: ListingParams;
  statusCounts: Record<ListingStatus, number>;
  faqsByVenueId: Record<string, VenueFaq[]>;
  inquiriesByVenueId: Record<string, number>;
}) {
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, startBulk] = useTransition();
  const [bulkError, setBulkError] = useState<string | undefined>(undefined);

  // A selection belongs to the page it was made on.
  const pageKey = venues.map((v) => v.id).join();
  const [selectionKey, setSelectionKey] = useState(pageKey);
  if (selectionKey !== pageKey) {
    setSelectionKey(pageKey);
    setSelected(new Set());
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected = venues.length > 0 && venues.every((v) => selected.has(v.id));

  function runBulk(action: (formData: FormData) => Promise<{ error?: string }>, extra?: Record<string, string>) {
    const formData = new FormData();
    for (const id of selected) formData.append("id", id);
    for (const [key, value] of Object.entries(extra ?? {})) formData.set(key, value);
    startBulk(async () => {
      const result = await action(formData);
      if (result?.error) setBulkError(result.error);
      else {
        setBulkError(undefined);
        setSelected(new Set());
      }
    });
  }

  function bulkDelete() {
    const n = selected.size;
    if (!window.confirm(`Delete ${n} venue${n === 1 ? "" : "s"} for good? Hiding them can be undone; this can't.`)) return;
    runBulk(bulkDeleteVenues);
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>{heading}</div>
        <div className="flex flex-wrap gap-2">
        <a href={`/admin/venues/export${listingQueryString(params, { page: 1 })}`} className={`${buttonClass} hidden lg:inline-block`}>
          Export CSV
        </a>
        <button type="button" onClick={() => setImporting((v) => !v)} className={buttonClass}>
          Import from a spreadsheet
        </button>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="rounded-md bg-forest px-3 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90"
        >
          + Add venue
        </button>
        </div>
      </div>

      {notice}

      {(importing || adding) && (
        <div className="mb-4 rounded-lg border border-hairline bg-card p-5 shadow-sm">
          {importing && <VenueImportPanel onDone={() => setImporting(false)} />}
          {adding && <VenueForm onDone={() => setAdding(false)} />}
        </div>
      )}

      <StatusChips params={params} statuses={VENUE_STATUSES} counts={statusCounts} />

      <div className="rounded-lg border border-hairline bg-card shadow-sm">
        <FilterBar
          params={params}
          statuses={VENUE_STATUSES}
          counts={statusCounts}
          kindLabel="Type"
          kindOptions={VENUE_TYPES}
          states={STATES}
        />

        {selected.size > 0 && (
          <BulkBar
            count={selected.size}
            noun="venue"
            pending={bulkPending}
            error={bulkError}
            onClear={() => setSelected(new Set())}
            actions={[
              { label: "Make live", onSelect: () => runBulk(bulkSetVenueActive, { active: "true" }) },
              { label: "Hide", onSelect: () => runBulk(bulkSetVenueActive, { active: "false" }) },
              { label: "Mark still right", onSelect: () => runBulk(bulkMarkVenuesVerified) },
              { label: "Delete", onSelect: bulkDelete, danger: true },
            ]}
          />
        )}

        {venues.length > 0 && (
          <div
            className={`hidden border-b border-hairline px-3 py-2 font-mono-numbers text-[11px] uppercase tracking-wide text-ink/50 ${GRID}`}
          >
            <Checkbox
              checked={allSelected}
              onChange={() => setSelected(allSelected ? new Set() : new Set(venues.map((v) => v.id)))}
              label="Select all on this page"
            />
            <span />
            <span>Venue</span>
            <span>Type</span>
            <span>Source</span>
            <span>Complete</span>
            <span>Last checked</span>
            <span>Inquiries</span>
            <span>Status</span>
            <span />
          </div>
        )}

        {venues.map((venue) => (
          <VenueRow
            key={venue.id}
            venue={venue}
            faqs={faqsByVenueId[venue.id] ?? []}
            inquiries={inquiriesByVenueId[venue.id] ?? 0}
            selected={selected.has(venue.id)}
            onToggleSelect={() => toggle(venue.id)}
          />
        ))}
        {venues.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-ink/50">No venues match these filters.</p>
        )}

        <Pagination params={params} total={total} noun="venue" />
      </div>
    </div>
  );
}
