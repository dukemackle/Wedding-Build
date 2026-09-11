"use client";

import { useMemo, useState, useTransition } from "react";
import type { Vendor, VendorContactLog, VendorContactType } from "@/lib/supabase/types";
import { REGIONS, STATES } from "@/lib/wedding-options";
import { downloadCsv, toCsv } from "@/lib/csv";
import {
  addVendorContactLog,
  bulkSetVendorActive,
  createVendor,
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
      <label className={`${labelClass} sm:col-span-2`}>
        Description
        <textarea
          name="description"
          rows={2}
          defaultValue={vendor?.description ?? ""}
          className={inputClass}
        />
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

function VendorRow({
  vendor,
  stats,
  logs = [],
  selected,
  onToggleSelect,
}: {
  vendor: Vendor;
  stats?: VendorStats;
  logs?: VendorContactLog[];
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const formData = new FormData();
    formData.set("id", vendor.id);
    formData.set("active", String(!vendor.active));
    startTransition(async () => {
      await setVendorActive(formData);
    });
  }

  if (editing) {
    return (
      <div className="border-b border-hairline py-4 last:border-b-0">
        <VendorForm vendor={vendor} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="border-b border-hairline py-3 last:border-b-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={`Select ${vendor.name}`}
            className="mt-1"
          />
          <div>
            <p className={vendor.active ? "text-ink" : "text-ink/40 line-through"}>
              {vendor.name}
            </p>
            <p className="mt-0.5 text-xs text-ink/50">
              {[vendor.category, vendor.city, vendor.state].filter(Boolean).join(" · ") || "—"}
            </p>
            <p className="mt-0.5 font-mono-numbers text-xs text-ink/40">
              {stats
                ? `${stats.sent} inquir${stats.sent === 1 ? "y" : "ies"} · ${stats.booked} booked${
                    stats.bookedAmount > 0 ? ` · ${formatCurrency(stats.bookedAmount)}` : ""
                  }`
                : "No inquiries yet"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLog((v) => !v)}
            className="rounded-md border border-hairline px-3 py-1 text-xs text-ink hover:border-forest"
          >
            {showLog ? "Hide log" : `Log (${logs.length})`}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md border border-hairline px-3 py-1 text-xs text-ink hover:border-forest"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={toggleActive}
            disabled={isPending}
            className="rounded-md border border-hairline px-3 py-1 text-xs text-ink hover:border-forest disabled:opacity-60"
          >
            {vendor.active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
      {showLog && <ContactLog vendorId={vendor.id} logs={logs} />}
    </div>
  );
}

function exportVendorsCsv(vendors: Vendor[], statsByVendorName: Record<string, VendorStats>) {
  const csv = toCsv(
    [
      "Name",
      "Category",
      "Region",
      "State",
      "City",
      "Contact email",
      "Active",
      "Inquiries",
      "Booked",
      "Booked amount",
    ],
    vendors.map((vendor) => {
      const stats = statsByVendorName[vendor.name];
      return [
        vendor.name,
        vendor.category ?? "",
        vendor.region ?? "",
        vendor.state ?? "",
        vendor.city ?? "",
        vendor.contact_email ?? "",
        vendor.active ? "yes" : "no",
        stats?.sent ?? 0,
        stats?.booked ?? 0,
        stats?.bookedAmount ?? 0,
      ];
    }),
  );
  downloadCsv("vendors.csv", csv);
}

export function AdminVendorsManager({
  vendors,
  statsByVendorName = {},
  logsByVendorId = {},
}: {
  vendors: Vendor[];
  statsByVendorName?: Record<string, VendorStats>;
  logsByVendorId?: Record<string, VendorContactLog[]>;
}) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkPending, startBulkTransition] = useTransition();
  const [bulkError, setBulkError] = useState<string | undefined>(undefined);

  const filteredVendors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((vendor) =>
      [vendor.name, vendor.category, vendor.region, vendor.state, vendor.city]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [vendors, query]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkSetActive(active: boolean) {
    const formData = new FormData();
    for (const id of selected) formData.append("id", id);
    formData.set("active", String(active));
    startBulkTransition(async () => {
      const result = await bulkSetVendorActive(formData);
      if (result?.error) setBulkError(result.error);
      else {
        setBulkError(undefined);
        setSelected(new Set());
      }
    });
  }

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, category, region..."
          className={`${inputClass} min-w-[220px] flex-1`}
        />
        <p className="text-sm text-ink/60">{filteredVendors.length} vendors</p>
        <button
          type="button"
          onClick={() => exportVendorsCsv(filteredVendors, statsByVendorName)}
          className="rounded-md border border-hairline px-3 py-1.5 text-sm text-ink/70 transition-colors hover:border-forest"
        >
          Export CSV
        </button>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md bg-forest px-3 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            + Add vendor
          </button>
        )}
      </div>
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-hairline bg-parchment px-4 py-2">
          <p className="text-sm text-ink">
            {selected.size} vendor{selected.size === 1 ? "" : "s"} selected
          </p>
          <button
            type="button"
            onClick={() => bulkSetActive(true)}
            disabled={bulkPending}
            className="rounded-md border border-hairline px-3 py-1 text-xs text-ink hover:border-forest disabled:opacity-60"
          >
            Activate
          </button>
          <button
            type="button"
            onClick={() => bulkSetActive(false)}
            disabled={bulkPending}
            className="rounded-md border border-hairline px-3 py-1 text-xs text-ink hover:border-forest disabled:opacity-60"
          >
            Deactivate
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-xs text-ink/60 hover:underline"
          >
            Clear
          </button>
          {bulkError && <p className="text-xs text-red-800">{bulkError}</p>}
        </div>
      )}
      {adding && (
        <div className="mb-4 border-b border-hairline pb-4">
          <VendorForm onDone={() => setAdding(false)} />
        </div>
      )}
      {filteredVendors.map((vendor) => (
        <VendorRow
          key={vendor.id}
          vendor={vendor}
          stats={statsByVendorName[vendor.name]}
          logs={logsByVendorId[vendor.id]}
          selected={selected.has(vendor.id)}
          onToggleSelect={() => toggleSelect(vendor.id)}
        />
      ))}
      {filteredVendors.length === 0 && (
        <p className="text-sm text-ink/50">
          {vendors.length === 0 ? "No vendors yet." : "No vendors match that search."}
        </p>
      )}
    </div>
  );
}
