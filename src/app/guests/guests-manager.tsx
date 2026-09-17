"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type { Guest, GuestPriority, GuestStatus } from "@/lib/supabase/types";
import {
  addGuest,
  updateGuest,
  deleteGuest,
  importGuestsFromGoogleSheet,
  setGuestThanked,
} from "./actions";
import { draftThankYouNote, saveThankYouNote } from "./thank-you-actions";
import { GuestImportFileTab } from "./guest-import-panel";
import { FilterDisclosure } from "@/components/filter-disclosure";
import { SearchBox } from "@/components/search-box";
import { MEAL_OPTIONS } from "@/lib/meal-options";

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

const PRIORITIES: GuestPriority[] = ["must_invite", "would_like", "if_room"];

const PRIORITY_LABELS: Record<GuestPriority, string> = {
  must_invite: "Must Invite",
  would_like: "Would Like to Invite",
  if_room: "If There's Room",
};

const PRIORITY_BADGE_CLASS: Record<GuestPriority, string> = {
  must_invite: "border-forest/40 bg-forest/10 text-forest",
  would_like: "border-brass/40 bg-brass/10 text-brass",
  if_room: "border-hairline text-ink/70",
};

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function csvField(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** One definition, so the CSV and the Excel file can't drift apart -- and so
 *  the headings we export are ones our own importer reads back. */
const EXPORT_COLUMNS: { header: string; value: (guest: Guest) => string }[] = [
  { header: "Name", value: (g) => g.name },
  { header: "Household", value: (g) => g.household ?? "" },
  { header: "Email", value: (g) => g.email ?? "" },
  { header: "Phone", value: (g) => g.phone ?? "" },
  { header: "Street Address", value: (g) => g.address_line1 ?? "" },
  { header: "Address Line 2", value: (g) => g.address_line2 ?? "" },
  { header: "City", value: (g) => g.city ?? "" },
  { header: "State", value: (g) => g.state ?? "" },
  { header: "ZIP", value: (g) => g.postal_code ?? "" },
  { header: "Country", value: (g) => g.country ?? "" },
  { header: "Plus One", value: (g) => (g.plus_one ? "yes" : "no") },
  { header: "Plus One Name", value: (g) => g.plus_one_name ?? "" },
  { header: "Status", value: (g) => g.status },
  { header: "Priority", value: (g) => g.priority },
  { header: "Meal", value: (g) => g.meal ?? "" },
  { header: "Notes", value: (g) => g.notes ?? "" },
  { header: "Gift", value: (g) => g.gift_description ?? "" },
  { header: "Thanked", value: (g) => (g.thanked ? "yes" : "no") },
];

function guestsToCsv(guests: Guest[]) {
  const rows = guests.map((guest) =>
    EXPORT_COLUMNS.map((col) => csvField(col.value(guest))).join(","),
  );
  return [EXPORT_COLUMNS.map((c) => c.header).join(","), ...rows].join("\n");
}

function exportFileName(extension: string) {
  return `guests-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

async function downloadGuestsXlsx(guests: Guest[]) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const data = [
    EXPORT_COLUMNS.map((col) => ({ value: col.header, fontWeight: "bold" as const })),
    ...guests.map((guest) => EXPORT_COLUMNS.map((col) => ({ value: col.value(guest) }))),
  ];
  await writeXlsxFile(data, {
    columns: EXPORT_COLUMNS.map((col) => ({ width: Math.max(12, col.header.length + 4) })),
  }).toFile(exportFileName("xlsx"));
}

function downloadGuestsCsv(guests: Guest[]) {
  const blob = new Blob([guestsToCsv(guests)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFileName("csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function GuestFields({ guest }: { guest?: Guest }) {
  const mealValue = guest?.meal ?? "";
  const customMeal =
    mealValue && !(MEAL_OPTIONS as readonly string[]).includes(mealValue) ? mealValue : null;
  const [bringingPlusOne, setBringingPlusOne] = useState(guest?.plus_one ?? false);

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
        Email
        <input
          type="email"
          name="email"
          placeholder="Optional — needed to send an RSVP invite"
          defaultValue={guest?.email ?? ""}
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
        Invite priority
        <select
          name="priority"
          defaultValue={guest?.priority ?? "must_invite"}
          className={inputClass}
        >
          {PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Meal
        <select name="meal" defaultValue={mealValue} className={inputClass}>
          <option value="">Not selected</option>
          {customMeal && <option value={customMeal}>{customMeal}</option>}
          {MEAL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
        <input
          type="checkbox"
          name="plus_one"
          checked={bringingPlusOne}
          onChange={(e) => setBringingPlusOne(e.target.checked)}
          className="h-4 w-4 rounded border-hairline"
        />
        Bringing a plus one
      </label>
      {bringingPlusOne && (
        <label className={`${labelClass} sm:col-span-2`}>
          Plus one&apos;s name
          <input
            name="plus_one_name"
            placeholder="Optional"
            defaultValue={guest?.plus_one_name ?? ""}
            className={inputClass}
          />
        </label>
      )}
      <label className={`${labelClass} sm:col-span-2`}>
        Gift
        <input
          name="gift_description"
          placeholder="Optional — what they gave, e.g. the blue Dutch oven"
          defaultValue={guest?.gift_description ?? ""}
          className={inputClass}
        />
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

function ImportResultMessage({
  error,
  result,
}: {
  error: string | undefined;
  result: { imported: number } | undefined;
}) {
  return (
    <>
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      {result && (
        <p className="mt-3 text-sm text-forest">
          Imported {result.imported} guest{result.imported === 1 ? "" : "s"}.
        </p>
      )}
    </>
  );
}

function ImportSheetTab({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<{ imported: number } | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = await importGuestsFromGoogleSheet(formData);
      if (response?.error) {
        setError(response.error);
        setResult(undefined);
      } else {
        setError(undefined);
        setResult({ imported: response.imported ?? 0 });
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      <p className="text-sm text-ink">
        Paste a Google Sheet link. Same loose heading matching as a file upload.
      </p>
      <label className="mt-3 flex flex-col gap-1 text-sm text-ink">
        Google Sheet URL
        <input
          type="url"
          name="sheet_url"
          required
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className="rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>
      <p className="mt-2 text-xs text-ink/50">
        Make sure the sheet&apos;s access is set to &quot;Anyone with the link.&quot; You can
        switch it back to private after importing.
      </p>
      <ImportResultMessage error={error} result={result} />
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Importing..." : "Import guests"}
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

function ImportGuestsForm({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<"file" | "sheet">("file");

  return (
    <div className="mb-6 rounded-lg border border-hairline bg-parchment p-6">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("file")}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            tab === "file"
              ? "border-forest bg-forest text-parchment"
              : "border-hairline bg-card text-ink hover:border-forest"
          }`}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setTab("sheet")}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            tab === "sheet"
              ? "border-forest bg-forest text-parchment"
              : "border-hairline bg-card text-ink hover:border-forest"
          }`}
        >
          Google Sheet link
        </button>
      </div>
      {tab === "file" ? <GuestImportFileTab onDone={onDone} /> : <ImportSheetTab onDone={onDone} />}
    </div>
  );
}

function ThankYouPanel({ guest }: { guest: Guest }) {
  const [note, setNote] = useState(guest.thank_you_note ?? "");
  const [error, setError] = useState<string | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [isDrafting, startDrafting] = useTransition();
  const [isSaving, startSaving] = useTransition();

  function handleDraft() {
    const formData = new FormData();
    formData.set("guest_id", guest.id);
    setError(undefined);
    startDrafting(async () => {
      const result = await draftThankYouNote(formData);
      if (result.error) setError(result.error);
      else if (result.draft) {
        setNote(result.draft);
        setSaved(false);
      }
    });
  }

  function handleSave() {
    const formData = new FormData();
    formData.set("guest_id", guest.id);
    formData.set("thank_you_note", note);
    setError(undefined);
    startSaving(async () => {
      const result = await saveThankYouNote(formData);
      if (result.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="mt-3 rounded-md border border-hairline bg-parchment p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
          Thank-you note
        </p>
        <button
          type="button"
          onClick={handleDraft}
          disabled={isDrafting}
          className="rounded-full border border-hairline px-3 py-1 text-xs text-forest transition-colors hover:border-forest disabled:opacity-50"
        >
          {isDrafting ? "Drafting…" : note ? "Draft again" : "Draft with Wren"}
        </button>
      </div>

      {guest.gift_description ? (
        <p className="mt-2 text-xs text-ink/55">For: {guest.gift_description}</p>
      ) : (
        <p className="mt-2 text-xs text-ink/55">
          Add what they gave under Edit, and Wren can draft the note.
        </p>
      )}

      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        rows={4}
        placeholder="Write it yourself, or let Wren start you off."
        className="mt-2 w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-forest"
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-xs text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save note"}
        </button>
        {note && (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(note)}
            className="rounded-full border border-hairline px-4 py-1.5 font-mono-numbers text-xs text-ink/70 transition-colors hover:border-forest hover:text-forest"
          >
            Copy
          </button>
        )}
        {saved && <span className="font-mono-numbers text-[11px] text-forest">Saved</span>}
      </div>

      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  );
}

function GuestRow({ guest }: { guest: Guest }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
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

  function handleToggleThanked() {
    const formData = new FormData();
    formData.set("guest_id", guest.id);
    formData.set("thanked", String(!guest.thanked));
    startTransition(async () => {
      const result = await setGuestThanked(formData);
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
    <div className="border-b border-hairline py-4 last:border-b-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="flex gap-3">
        {guest.photo_url && (
          <Image
            src={guest.photo_url}
            alt={guest.name}
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full border border-hairline object-cover"
          />
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink">{guest.name}</span>
            {guest.plus_one && (
              <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-ink/60">
                +1{guest.plus_one_name ? ` ${guest.plus_one_name}` : ""}
              </span>
            )}
            <span
              className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_BADGE_CLASS[guest.status]}`}
            >
              {STATUS_LABELS[guest.status]}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs ${PRIORITY_BADGE_CLASS[guest.priority]}`}
            >
              {PRIORITY_LABELS[guest.priority]}
            </span>
            {guest.thanked && (
              <span className="rounded-full border border-forest/40 bg-forest/10 px-2 py-0.5 text-xs text-forest">
                Thanked
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink/50">
            {[guest.household, guest.email, guest.meal].filter(Boolean).join(" · ") || "—"}
          </p>
          {guest.gift_description && (
            <p className="mt-1 text-sm text-ink/70">
              <span className="text-ink/45">Gift:</span> {guest.gift_description}
            </p>
          )}
          {guest.notes && <p className="mt-1 text-sm text-ink/70">{guest.notes}</p>}
          {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <button
          onClick={() => setShowThankYou((open) => !open)}
          className="text-xs text-brass hover:underline"
        >
          {showThankYou ? "Hide note" : "Thank-you note"}
        </button>
        <button
          onClick={handleToggleThanked}
          disabled={isPending}
          className="text-xs text-brass hover:underline"
        >
          {guest.thanked ? "Mark un-thanked" : "Mark thanked"}
        </button>
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

      {showThankYou && <ThankYouPanel guest={guest} />}
    </div>
  );
}

function personCount(guest: Guest) {
  return 1 + (guest.plus_one ? 1 : 0);
}

export function GuestsManager({ guests }: { guests: Guest[] }) {
  const [filter, setFilter] = useState<GuestStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<GuestPriority | "all">("all");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  const counts: Record<GuestStatus | "all", number> = {
    all: guests.length,
    invited: guests.filter((g) => g.status === "invited").length,
    confirmed: guests.filter((g) => g.status === "confirmed").length,
    declined: guests.filter((g) => g.status === "declined").length,
    pending: guests.filter((g) => g.status === "pending").length,
  };

  const priorityCounts: Record<GuestPriority | "all", number> = {
    all: guests.length,
    must_invite: guests.filter((g) => g.priority === "must_invite").length,
    would_like: guests.filter((g) => g.priority === "would_like").length,
    if_room: guests.filter((g) => g.priority === "if_room").length,
  };

  const tierPersonCounts: Record<GuestPriority, number> = {
    must_invite: guests
      .filter((g) => g.priority === "must_invite")
      .reduce((sum, g) => sum + personCount(g), 0),
    would_like: guests
      .filter((g) => g.priority === "would_like")
      .reduce((sum, g) => sum + personCount(g), 0),
    if_room: guests
      .filter((g) => g.priority === "if_room")
      .reduce((sum, g) => sum + personCount(g), 0),
  };

  const cumulativeMustInvite = tierPersonCounts.must_invite;
  const cumulativeWouldLike = cumulativeMustInvite + tierPersonCounts.would_like;
  const cumulativeIfRoom = cumulativeWouldLike + tierPersonCounts.if_room;

  const headcount = guests
    .filter((g) => g.status === "confirmed")
    .reduce((sum, g) => sum + 1 + (g.plus_one ? 1 : 0), 0);

  const thankedCount = guests.filter((g) => g.thanked).length;

  const confirmedGuests = guests.filter((g) => g.status === "confirmed");
  const mealCounts = new Map<string, number>();
  for (const guest of confirmedGuests) {
    const key = guest.meal || "Not selected";
    mealCounts.set(key, (mealCounts.get(key) ?? 0) + 1);
  }
  const mealBreakdown = Array.from(mealCounts.entries()).sort((a, b) => b[1] - a[1]);

  const activeFilterCount = [filter, priorityFilter].filter((f) => f !== "all").length;

  const filteredGuests = guests.filter(
    (g) =>
      (filter === "all" || g.status === filter) &&
      (priorityFilter === "all" || g.priority === priorityFilter) &&
      g.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="text-sm text-ink/70">
            <span className="font-mono-numbers text-2xl text-forest">{headcount}</span>{" "}
            confirmed headcount — feeds your Budget guest count unless overridden on the
            Dashboard.
          </p>
          {guests.length > 0 && (
            <p className="mt-1 text-xs text-ink/50">
              {thankedCount} of {guests.length} guests thanked for their gift.
            </p>
          )}
        </div>
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
            {showImportForm ? "Close" : "Import guests"}
          </button>
          <button
            onClick={() => downloadGuestsXlsx(guests)}
            disabled={guests.length === 0}
            className="rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-ink transition-colors hover:border-forest disabled:opacity-50"
          >
            Export Excel
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
      {showImportForm && <ImportGuestsForm onDone={() => setShowImportForm(false)} />}

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-md border border-hairline bg-parchment px-4 py-3 text-sm text-ink/70 sm:gap-3">
        <span>
          <span className="font-mono-numbers text-forest">{cumulativeMustInvite}</span> Must
          Invite
        </span>
        <span className="text-ink/30">&rarr;</span>
        <span>
          <span className="font-mono-numbers text-brass">{cumulativeWouldLike}</span> incl. Would
          Like
        </span>
        <span className="text-ink/30">&rarr;</span>
        <span>
          <span className="font-mono-numbers text-ink">{cumulativeIfRoom}</span> incl. If There&apos;s
          Room
        </span>
      </div>

      {confirmedGuests.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-hairline bg-parchment px-4 py-3 text-sm text-ink/70">
          <span className="text-xs uppercase tracking-[0.15em] text-ink/40">Meal counts</span>
          {mealBreakdown.map(([meal, count]) => (
            <span key={meal}>
              <span className="font-mono-numbers text-forest">{count}</span>{" "}
              {meal === "Not selected" ? <span className="text-ink/50">Not selected</span> : meal}
            </span>
          ))}
        </div>
      )}

      <div className="mb-4">
        <SearchBox value={search} onChange={setSearch} placeholder="Search guests by name..." />
      </div>

      <FilterDisclosure activeCount={activeFilterCount}>
        <div className="flex flex-wrap gap-2">
          {(["all", ...PRIORITIES] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setPriorityFilter(priority)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                priorityFilter === priority
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-parchment text-ink hover:border-forest"
              }`}
            >
              {priority === "all" ? "All priorities" : PRIORITY_LABELS[priority]} (
              {priorityCounts[priority]})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
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
      </FilterDisclosure>

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
