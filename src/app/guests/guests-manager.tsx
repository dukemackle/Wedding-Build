"use client";

import { useRef, useState, useTransition } from "react";
import type { Guest, GuestStatus } from "@/lib/supabase/types";
import { addGuest, updateGuest, deleteGuest, importGuestsFromCsv } from "./actions";

const STATUSES: GuestStatus[] = ["invited", "confirmed", "declined", "pending"];

const STATUS_LABELS: Record<GuestStatus, string> = {
  invited: "Invited",
  confirmed: "Confirmed",
  declined: "Declined",
  pending: "Pending",
};

const STATUS_BADGE_CLASS: Record<GuestStatus, string> = {
  invited: "border-hairline text-ink/70",
  confirmed: "border-forest/40 bg-forest/10 text-forest",
  declined: "border-red-200 bg-red-50 text-red-700",
  pending: "border-brass/40 bg-brass/10 text-brass",
};

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function csvField(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function guestsToCsv(guests: Guest[]) {
  const headers = ["name", "household", "plus_one", "status", "meal", "notes"];
  const rows = guests.map((guest) =>
    [
      guest.name,
      guest.household ?? "",
      guest.plus_one ? "yes" : "no",
      guest.status,
      guest.meal ?? "",
      guest.notes ?? "",
    ]
      .map((value) => csvField(String(value)))
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

function downloadGuestsCsv(guests: Guest[]) {
  const blob = new Blob([guestsToCsv(guests)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `guests-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function GuestFields({ guest }: { guest?: Guest }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Name
        <input
          name="name"
          required
          defaultValue={guest?.name ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Household
        <input
          name="household"
          placeholder="Optional"
          defaultValue={guest?.household ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Status
        <select name="status" defaultValue={guest?.status ?? "invited"} className={inputClass}>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Meal
        <input
          name="meal"
          placeholder="Optional"
          defaultValue={guest?.meal ?? ""}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
        <input
          type="checkbox"
          name="plus_one"
          defaultChecked={guest?.plus_one ?? false}
          className="h-4 w-4 rounded border-hairline"
        />
        Bringing a plus one
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Notes
        <textarea
          name="notes"
          rows={2}
          placeholder="Optional"
          defaultValue={guest?.notes ?? ""}
          className={inputClass}
        />
      </label>
    </div>
  );
}

function AddGuestForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addGuest(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        formRef.current?.reset();
        onDone();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-6 rounded-lg border border-hairline bg-parchment p-6"
    >
      <GuestFields />
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add guest"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ImportCsvForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<{ imported: number; skipped: number } | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = await importGuestsFromCsv(formData);
      if (response?.error) {
        setError(response.error);
        setResult(undefined);
      } else {
        setError(undefined);
        setResult({ imported: response.imported ?? 0, skipped: response.skipped ?? 0 });
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-6 rounded-lg border border-hairline bg-parchment p-6"
    >
      <p className="text-sm text-ink">
        Upload a CSV with columns: <code className="font-mono-numbers text-xs">name</code>{" "}
        (required), <code className="font-mono-numbers text-xs">household</code>,{" "}
        <code className="font-mono-numbers text-xs">plus_one</code> (yes/no),{" "}
        <code className="font-mono-numbers text-xs">status</code> (invited/confirmed/declined/
        pending), <code className="font-mono-numbers text-xs">meal</code>,{" "}
        <code className="font-mono-numbers text-xs">notes</code>.{" "}
        <a href="/guests-template.csv" download className="text-brass hover:underline">
          Download a template
        </a>
        .
      </p>
      <input
        type="file"
        name="file"
        accept=".csv,text/csv"
        required
        className="mt-3 block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-card file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-forest"
      />
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      {result && (
        <p className="mt-3 text-sm text-forest">
          Imported {result.imported} guest{result.imported === 1 ? "" : "s"}
          {result.skipped > 0
            ? ` — skipped ${result.skipped} row${result.skipped === 1 ? "" : "s"} without a name.`
            : "."}
        </p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Importing..." : "Import CSV"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-forest"
        >
          Close
        </button>
      </div>
    </form>
  );
}

function GuestRow({ guest }: { guest: Guest }) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateGuest(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setIsEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Remove ${guest.name} from the guest list?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", guest.id);
      const result = await deleteGuest(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (isEditing) {
    return (
      <div className="border-b border-hairline py-4 last:border-b-0">
        <form action={handleSave}>
          <input type="hidden" name="id" value={guest.id} />
          <GuestFields guest={guest} />
          {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-b border-hairline py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink">{guest.name}</span>
          {guest.plus_one && (
            <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-ink/60">
              +1
            </span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_BADGE_CLASS[guest.status]}`}
          >
            {STATUS_LABELS[guest.status]}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink/50">
          {[guest.household, guest.meal].filter(Boolean).join(" · ") || "—"}
        </p>
        {guest.notes && <p className="mt-1 text-sm text-ink/70">{guest.notes}</p>}
        {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button onClick={() => setIsEditing(true)} className="text-xs text-brass hover:underline">
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-ink/50 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export function GuestsManager({ guests }: { guests: Guest[] }) {
  const [filter, setFilter] = useState<GuestStatus | "all">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  const counts: Record<GuestStatus | "all", number> = {
    all: guests.length,
    invited: guests.filter((g) => g.status === "invited").length,
    confirmed: guests.filter((g) => g.status === "confirmed").length,
    declined: guests.filter((g) => g.status === "declined").length,
    pending: guests.filter((g) => g.status === "pending").length,
  };

  const headcount = guests
    .filter((g) => g.status === "confirmed")
    .reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);

  const filteredGuests = filter === "all" ? guests : guests.filter((g) => g.status === filter);

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <p className="text-sm text-ink/70">
          <span className="font-mono-numbers text-2xl text-forest">{headcount}</span>{" "}
          confirmed headcount — feeds your Budget guest count unless overridden on the
          Dashboard.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowAddForm((v) => !v);
              setShowImportForm(false);
            }}
            className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            {showAddForm ? "Close" : "+ Add guest"}
          </button>
          <button
            onClick={() => {
              setShowImportForm((v) => !v);
              setShowAddForm(false);
            }}
            className="rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-ink transition-colors hover:border-forest"
          >
            {showImportForm ? "Close" : "Import CSV"}
          </button>
          <button
            onClick={() => downloadGuestsCsv(guests)}
            disabled={guests.length === 0}
            className="rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-ink transition-colors hover:border-forest disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {showAddForm && <AddGuestForm onDone={() => setShowAddForm(false)} />}
      {showImportForm && <ImportCsvForm onDone={() => setShowImportForm(false)} />}

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              filter === status
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-parchment text-ink hover:border-forest"
            }`}
          >
            {status === "all" ? "All" : STATUS_LABELS[status]} ({counts[status]})
          </button>
        ))}
      </div>

      {filteredGuests.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">
          {guests.length === 0
            ? "No guests yet — add your first one above."
            : "No guests match this filter."}
        </p>
      ) : (
        filteredGuests.map((guest) => <GuestRow key={guest.id} guest={guest} />)
      )}
    </div>
  );
}
