"use client";

import { useRef, useState, useTransition } from "react";
import type {
  Vendor,
  VendorContactLog,
  VendorContactType,
  VendorFaq,
} from "@/lib/supabase/types";
import { REGIONS, STATES } from "@/lib/wedding-options";
import { ClaimLinkPanel } from "../claim-link-panel";
import { getVendorClaimLink, regenerateVendorClaimLink } from "./claim-actions";
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
import { VENDOR_STATUSES } from "./listing-config";
import {
  addVendorContactLog,
  addVendorFaq,
  bulkDeleteVendors,
  bulkSetVendorActive,
  markVendorsVerified,
  createVendor,
  deleteVendorFaq,
  setVendorActive,
  updateVendor,
} from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

export type VendorStats = { sent: number; booked: number; bookedAmount: number };

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const CONTACT_TYPE_LABELS: Record<VendorContactType, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
};

function VendorForm({
  vendor,
  onDone,
}: {
  vendor?: Vendor;
  onDone: () => void;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const action = vendor ? updateVendor : createVendor;
      if (vendor) formData.set("id", vendor.id);
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
        <input name="name" required defaultValue={vendor?.name ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Category
        <input
          name="category"
          placeholder="Photography, Catering, ..."
          defaultValue={vendor?.category ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Region
        <select name="region" defaultValue={vendor?.region ?? ""} className={inputClass}>
          <option value="">—</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        State
        <select name="state" defaultValue={vendor?.state ?? ""} className={inputClass}>
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
        <input name="city" defaultValue={vendor?.city ?? ""} className={inputClass} />
      </label>
      <label className={labelClass}>
        Price tier
        <input
          name="price_tier"
          placeholder="$, $$, or $$$"
          defaultValue={vendor?.price_tier ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Latitude
        <input
          name="latitude"
          type="number"
          step="any"
          defaultValue={vendor?.latitude ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Longitude
        <input
          name="longitude"
          type="number"
          step="any"
          defaultValue={vendor?.longitude ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Contact email
        <input
          name="contact_email"
          type="email"
          defaultValue={vendor?.contact_email ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Image URL
        <input name="image_url" defaultValue={vendor?.image_url ?? ""} className={inputClass} />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Description
        <textarea
          name="description"
          rows={2}
          defaultValue={vendor?.description ?? ""}
          className={inputClass}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        About <span className="text-ink/50">(longer write-up, shown on the vendor page)</span>
        <textarea name="about" rows={4} defaultValue={vendor?.about ?? ""} className={inputClass} />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        What&apos;s included
        <textarea
          name="included"
          rows={3}
          placeholder="e.g. 8 hours of coverage, second shooter, online gallery within 6 weeks"
          defaultValue={vendor?.included ?? ""}
          className={inputClass}
        />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Services &amp; extras <span className="text-ink/50">(comma separated)</span>
        <input
          name="amenities"
          placeholder="Engagement session, Drone footage, Travels nationwide"
          defaultValue={vendor?.amenities?.join(", ") ?? ""}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
        <input type="checkbox" name="is_sample" defaultChecked={vendor?.is_sample ?? false} />
        Sample / placeholder listing (not a real vendor)
      </label>
      {error && <p className="text-sm text-red-800 sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Saving..." : vendor ? "Save changes" : "Add vendor"}
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

function ContactLog({ vendorId, logs }: { vendorId: string; logs: VendorContactLog[] }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("vendor_id", vendorId);
    startTransition(async () => {
      const result = await addVendorContactLog(formData);
      if (result?.error) setError(result.error);
      else setError(undefined);
    });
  }

  return (
    <div className="mt-3 rounded-md border border-hairline bg-parchment p-4">
      {logs.length === 0 ? (
        <p className="text-sm text-ink/50">No contact logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {logs.map((log) => (
            <li key={log.id} className="text-sm">
              <span className="font-mono-numbers text-xs text-ink/50">
                {formatDateTime(log.created_at)}
              </span>{" "}
              <span className="text-xs font-medium text-forest">
                {CONTACT_TYPE_LABELS[log.contact_type]}
              </span>
              <p className="text-ink/80">{log.note}</p>
            </li>
          ))}
        </ul>
      )}
      <form
        action={handleSubmit}
        className="mt-3 flex flex-col gap-2 border-t border-hairline pt-3 sm:flex-row sm:items-start"
      >
        <select name="contact_type" defaultValue="note" className={`${inputClass} sm:w-32`}>
          <option value="note">Note</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
        </select>
        <input
          name="note"
          required
          placeholder="What happened?"
          className={`${inputClass} flex-1`}
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-3 py-2 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Logging..." : "Log"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}

function VendorFaqEditor({ vendor, faqs }: { vendor: Vendor; faqs: VendorFaq[] }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAdd(formData: FormData) {
    formData.set("vendor_id", vendor.id);
    formData.set("sort_order", String(faqs.length));
    startTransition(async () => {
      const result = await addVendorFaq(formData);
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
    formData.set("vendor_id", vendor.id);
    startTransition(async () => {
      const result = await deleteVendorFaq(formData);
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

/** What a couple needs from a listing. Mirrors VENDOR_LISTING.incompleteFilter. */
function vendorChecks(vendor: Vendor): [string, boolean][] {
  return [
    ["photo", !!vendor.image_url],
    ["description", !!(vendor.description || vendor.about)],
    ["category", !!vendor.category],
    ["price", !!(vendor.price_tier || vendor.price_from)],
    ["email", !!vendor.contact_email],
  ];
}

// Desktop columns: select, photo, vendor, category, price, source, complete, checked, inquiries, saves, status, actions.
const GRID =
  "lg:grid lg:grid-cols-[20px_48px_minmax(0,2fr)_minmax(0,1fr)_48px_72px_84px_minmax(0,150px)_112px_48px_64px_112px] lg:items-center lg:gap-3";

function VendorRow({
  vendor,
  stats,
  saves,
  logs,
  faqs,
  selected,
  onToggleSelect,
}: {
  vendor: Vendor;
  stats?: VendorStats;
  saves: number;
  logs: VendorContactLog[];
  faqs: VendorFaq[];
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const [panel, setPanel] = useState<"edit" | "log" | "claim" | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const formData = new FormData();
    formData.set("id", vendor.id);
    formData.set("active", String(!vendor.active));
    startTransition(async () => {
      await setVendorActive(formData);
    });
  }

  function markVerified() {
    const formData = new FormData();
    formData.set("id", vendor.id);
    startTransition(async () => {
      await markVendorsVerified(formData);
    });
  }

  const menu: MenuItem[] = [
    { label: "Still right", onSelect: markVerified, disabled: isPending },
    { label: vendor.active ? "Hide" : "Make live", onSelect: toggleActive, disabled: isPending },
    { label: `Contact log (${logs.length})`, onSelect: () => setPanel("log") },
    ...(vendor.is_sample ? [] : [{ label: "Claim link", onSelect: () => setPanel("claim") }]),
    { label: "View listing", onSelect: () => window.open(`https://youdoido.com/vendors/${vendor.id}`, "_blank") },
  ];
  const place = [vendor.city, vendor.state].filter(Boolean).join(", ") || "—";
  const inquiryText = stats ? `${stats.sent} · ${stats.booked} booked` : "0";
  const inquiryTitle =
    stats && stats.bookedAmount > 0 ? `${inquiryText}, ${formatCurrency(stats.bookedAmount)}` : inquiryText;

  return (
    <div className={`border-b border-hairline last:border-b-0 ${selected ? "bg-forest/[0.03]" : ""}`}>
      {/* Desktop: one table row. */}
      <div className={`hidden px-3 py-2 text-sm ${GRID}`}>
        <Checkbox checked={selected} onChange={onToggleSelect} label={`Select ${vendor.name}`} />
        <Thumb src={vendor.image_url} />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">
            {vendor.name}
            {vendor.is_sample && <span className="ml-2 text-[11px] font-normal uppercase text-ink/40">Sample</span>}
          </p>
          <p className="truncate text-xs text-ink/50">
            {place}
            {vendor.source === "claimed" && <span className="text-forest"> · Claimed</span>}
          </p>
        </div>
        <span className="truncate text-ink/80">{vendor.category ?? "—"}</span>
        <span className="font-mono-numbers text-ink/80">{vendor.price_tier ?? "—"}</span>
        <span className="text-xs text-ink/50">{vendor.source ?? "seed"}</span>
        <Completeness checks={vendorChecks(vendor)} />
        <span className="truncate text-xs">
          <LastChecked at={vendor.last_verified_at} short />
        </span>
        <span title={inquiryTitle} className="truncate font-mono-numbers text-xs text-ink/80">
          {inquiryText}
        </span>
        <span className="font-mono-numbers text-ink/80">{saves}</span>
        <StatusPill active={vendor.active} />
        <div className="flex justify-end gap-1.5">
          <button type="button" onClick={() => setPanel(panel === "edit" ? null : "edit")} className={buttonClass}>
            Edit
          </button>
          <RowMenu items={menu} />
        </div>
      </div>

      {/* Phone: a card. */}
      <div className="flex items-start gap-3 p-3 lg:hidden">
        <Checkbox checked={selected} onChange={onToggleSelect} label={`Select ${vendor.name}`} className="mt-1" />
        <Thumb src={vendor.image_url} />
        <button type="button" onClick={() => setPanel(panel === "edit" ? null : "edit")} className="min-w-0 flex-1 text-left">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate font-medium text-ink">{vendor.name}</span>
            <StatusPill active={vendor.active} />
          </span>
          <span className="block truncate text-xs text-ink/50">
            {[vendor.category, vendor.price_tier, place].filter(Boolean).join(" · ")}
          </span>
          <span className="mt-1 flex items-center gap-2 overflow-hidden whitespace-nowrap text-xs">
            <Completeness checks={vendorChecks(vendor)} />
            <LastChecked at={vendor.last_verified_at} short />
          </span>
        </button>
        <RowMenu items={menu} />
      </div>

      {panel === "edit" && (
        <div className="border-t border-hairline bg-parchment/60 p-4">
          <VendorForm vendor={vendor} onDone={() => setPanel(null)} />
          <VendorFaqEditor vendor={vendor} faqs={faqs} />
        </div>
      )}
      {panel === "claim" && (
        <div className="px-3 pb-3">
          <ClaimLinkPanel
            target={{ name: vendor.name, city: vendor.city, contactEmail: vendor.contact_email, kind: "vendor" }}
            getLink={() => getVendorClaimLink(vendor.id)}
            newLink={() => regenerateVendorClaimLink(vendor.id)}
            onClose={() => setPanel(null)}
          />
        </div>
      )}
      {panel === "log" && (
        <div className="px-3 pb-3">
          <ContactLog vendorId={vendor.id} logs={logs} />
          <button type="button" onClick={() => setPanel(null)} className="mt-2 text-xs text-ink/60 hover:underline">
            Close log
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminVendorsManager({
  heading,
  notice,
  vendors,
  total,
  params,
  statusCounts,
  categories,
  statsByVendorName,
  savesByVendorId,
  logsByVendorId,
  faqsByVendorId,
}: {
  heading: React.ReactNode;
  notice?: React.ReactNode;
  vendors: Vendor[];
  total: number;
  params: ListingParams;
  statusCounts: Record<ListingStatus, number>;
  categories: string[];
  statsByVendorName: Record<string, VendorStats>;
  savesByVendorId: Record<string, number>;
  logsByVendorId: Record<string, VendorContactLog[]>;
  faqsByVendorId: Record<string, VendorFaq[]>;
}) {
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, startBulk] = useTransition();
  const [bulkError, setBulkError] = useState<string | undefined>(undefined);

  // A selection belongs to the page it was made on.
  const pageKey = vendors.map((v) => v.id).join();
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

  const allSelected = vendors.length > 0 && vendors.every((v) => selected.has(v.id));

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
    if (!window.confirm(`Delete ${n} vendor${n === 1 ? "" : "s"} for good? Hiding them can be undone; this can't.`)) return;
    runBulk(bulkDeleteVendors);
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>{heading}</div>
        <div className="flex flex-wrap gap-2">
        <a href={`/admin/vendors/export${listingQueryString(params, { page: 1 })}`} className={`${buttonClass} hidden lg:inline-block`}>
          Export CSV
        </a>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="rounded-md bg-forest px-3 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90"
        >
          + Add vendor
        </button>
        </div>
      </div>

      {notice}

      {adding && (
        <div className="mb-4 rounded-lg border border-hairline bg-card p-5 shadow-sm">
          <VendorForm onDone={() => setAdding(false)} />
        </div>
      )}

      <StatusChips params={params} statuses={VENDOR_STATUSES} counts={statusCounts} />

      <div className="rounded-lg border border-hairline bg-card shadow-sm">
        <FilterBar
          params={params}
          statuses={VENDOR_STATUSES}
          counts={statusCounts}
          kindLabel="Category"
          kindOptions={categories}
          states={STATES}
        />

        {selected.size > 0 && (
          <BulkBar
            count={selected.size}
            noun="vendor"
            pending={bulkPending}
            error={bulkError}
            onClear={() => setSelected(new Set())}
            actions={[
              { label: "Make live", onSelect: () => runBulk(bulkSetVendorActive, { active: "true" }) },
              { label: "Hide", onSelect: () => runBulk(bulkSetVendorActive, { active: "false" }) },
              { label: "Mark still right", onSelect: () => runBulk(markVendorsVerified) },
              { label: "Delete", onSelect: bulkDelete, danger: true },
            ]}
          />
        )}

        {vendors.length > 0 && (
          <div
            className={`hidden border-b border-hairline px-3 py-2 font-mono-numbers text-[11px] uppercase tracking-wide text-ink/50 ${GRID}`}
          >
            <Checkbox
              checked={allSelected}
              onChange={() => setSelected(allSelected ? new Set() : new Set(vendors.map((v) => v.id)))}
              label="Select all on this page"
            />
            <span />
            <span>Vendor</span>
            <span>Category</span>
            <span>Price</span>
            <span>Source</span>
            <span>Complete</span>
            <span>Last checked</span>
            <span>Inquiries</span>
            <span>Saves</span>
            <span>Status</span>
            <span />
          </div>
        )}

        {vendors.map((vendor) => (
          <VendorRow
            key={vendor.id}
            vendor={vendor}
            stats={statsByVendorName[vendor.name]}
            saves={savesByVendorId[vendor.id] ?? 0}
            logs={logsByVendorId[vendor.id] ?? []}
            faqs={faqsByVendorId[vendor.id] ?? []}
            selected={selected.has(vendor.id)}
            onToggleSelect={() => toggle(vendor.id)}
          />
        ))}
        {vendors.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-ink/50">No vendors match these filters.</p>
        )}

        <Pagination params={params} total={total} noun="vendor" />
      </div>
    </div>
  );
}
