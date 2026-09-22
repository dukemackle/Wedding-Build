"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type {
  Guest,
  GuestPriority,
  GuestSide,
  GuestStatus,
  GuestType,
} from "@/lib/supabase/types";
import {
  GUEST_SIDES,
  GUEST_SORT_LABELS,
  GUEST_TYPES,
  GUEST_TYPE_LABELS,
  SIDE_COLORS,
  groupGuests,
  guestSideColor,
  guestSideLabel,
  sideTheme,
  type GuestSort,
  type SideTheme,
} from "@/lib/guest-groups";
import {
  addGuest,
  updateGuest,
  deleteGuest,
  importGuestsFromGoogleSheet,
  setGuestGrouping,
  setGuestThanked,
  setSideColors,
} from "./actions";
import { draftThankYouNote, saveThankYouNote } from "./thank-you-actions";
import { SpreadsheetLink } from "@/components/spreadsheet-link";
import { GuestImportFileTab } from "./guest-import-panel";
import { FilterDisclosure } from "@/components/filter-disclosure";
import { SearchBox } from "@/components/search-box";
import { MEAL_OPTIONS } from "@/lib/meal-options";

const STATUSES: GuestStatus[] = ["invited", "confirmed", "declined", "pending"];

const STATUS_LABELS: Record<GuestStatus, string> = {
  invited: "Invited",
  confirmed: "Confirmed",
  declined: "Declined",
  // "Pending" read as a stuck process rather than as what it means: nobody
  // has heard back, and on an imported list nobody has even asked yet.
  pending: "No reply",
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

/**
 * What a badge says on a row, as against in a form. "Would Like to Invite" is
 * three words of a line that has 270 copies of itself underneath it.
 */
const PRIORITY_SHORT_LABELS: Record<GuestPriority, string> = {
  must_invite: "Must",
  would_like: "Would like",
  if_room: "If room",
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
  { header: "Side", value: (g) => g.side ?? "" },
  { header: "Type", value: (g) => g.guest_type ?? "" },
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

function GuestFields({ guest, theme }: { guest?: Guest; theme: SideTheme }) {
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
        Side
        <select name="side" defaultValue={guest?.side ?? ""} className={inputClass}>
          <option value="">Not set</option>
          {GUEST_SIDES.map((side) => (
            <option key={side} value={side}>
              {theme.labels[side]}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Family or friends
        <select name="guest_type" defaultValue={guest?.guest_type ?? ""} className={inputClass}>
          <option value="">Not set</option>
          {GUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {GUEST_TYPE_LABELS[type]}
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

function AddGuestForm({ onDone, theme }: { onDone: () => void; theme: SideTheme }) {
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
      <GuestFields theme={theme} />
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

/**
 * Everything on a guest that isn't the name, on one line.
 *
 * All of it truncates: the row is fixed-height by design, and the full text
 * is one click away under Edit. A row that grows to fit its notes is how the
 * old list got to four lines a guest.
 */
function guestMeta(guest: Guest) {
  return (
    [
      guest.household,
      guest.email,
      guest.meal,
      guest.gift_description && `Gift: ${guest.gift_description}`,
      guest.notes,
    ].filter(Boolean) as string[]
  ).join(" · ");
}

/**
 * The actions that used to sit in a four-link strip on the right of every
 * row. At 1440px that strip was pinned to the far edge with the name at the
 * near one and a hand's width of nothing between them -- so it folds into one
 * button, and the row closes up behind it.
 */
function GuestRowMenu({
  guest,
  theme,
  onEdit,
  onThankYou,
  showingThankYou,
}: {
  guest: Guest;
  theme: SideTheme;
  onEdit: () => void;
  onThankYou: () => void;
  showingThankYou: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function setGrouping(field: "side" | "guest_type", value: string) {
    const formData = new FormData();
    formData.set("guest_id", guest.id);
    formData.set(field, value);
    startTransition(async () => {
      await setGuestGrouping(formData);
    });
  }

  function handleDelete() {
    if (!confirm(`Remove ${guest.name} from the guest list?`)) return;
    const formData = new FormData();
    formData.set("id", guest.id);
    startTransition(async () => {
      await deleteGuest(formData);
    });
  }

  function handleToggleThanked() {
    const formData = new FormData();
    formData.set("guest_id", guest.id);
    formData.set("thanked", String(!guest.thanked));
    startTransition(async () => {
      await setGuestThanked(formData);
    });
  }

  const itemClass =
    "block w-full rounded px-2 py-1.5 text-left text-xs text-ink transition-colors hover:bg-parchment";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for ${guest.name}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full border px-2 py-0.5 font-mono-numbers text-xs leading-5 transition-colors ${
          open
            ? "border-forest bg-forest text-parchment"
            : "border-hairline text-ink/60 hover:border-forest hover:text-forest"
        }`}
      >
        •••
      </button>

      {open && (
        <>
          {/* Clicking anywhere else closes it -- no library, no listener. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div className="absolute right-0 z-30 mt-1 w-52 rounded-lg border border-hairline bg-card p-2 shadow-lg">
            <p className="px-2 pb-1 font-mono-numbers text-[10px] uppercase tracking-[0.15em] text-ink/40">
              Side
            </p>
            <div className="flex items-center gap-1 px-1 pb-2">
              {GUEST_SIDES.map((side) => (
                <button
                  key={side}
                  type="button"
                  title={theme.labels[side]}
                  onClick={() => setGrouping("side", side)}
                  className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    guest.side === side ? "border-ink/50" : "border-transparent"
                  }`}
                  style={{ backgroundColor: theme.colors[side] }}
                />
              ))}
              <button
                type="button"
                title="No side"
                onClick={() => setGrouping("side", "")}
                className={`h-6 w-6 rounded-full border-2 border-dashed transition-transform hover:scale-110 ${
                  guest.side ? "border-hairline" : "border-ink/50"
                }`}
              />
            </div>

            <p className="px-2 pb-1 font-mono-numbers text-[10px] uppercase tracking-[0.15em] text-ink/40">
              Family or friends
            </p>
            <div className="flex flex-wrap gap-1 px-1 pb-2">
              {GUEST_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGrouping("guest_type", guest.guest_type === type ? "" : type)}
                  className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                    guest.guest_type === type
                      ? "border-forest bg-forest text-parchment"
                      : "border-hairline text-ink/70 hover:border-forest"
                  }`}
                >
                  {GUEST_TYPE_LABELS[type]}
                </button>
              ))}
            </div>

            <div className="border-t border-hairline pt-1">
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  onEdit();
                  setOpen(false);
                }}
              >
                Edit details
              </button>
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  onThankYou();
                  setOpen(false);
                }}
              >
                {showingThankYou ? "Hide thank-you note" : "Thank-you note"}
              </button>
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  handleToggleThanked();
                  setOpen(false);
                }}
              >
                {guest.thanked ? "Mark un-thanked" : "Mark thanked"}
              </button>
              <button
                type="button"
                className={`${itemClass} text-red-800`}
                onClick={() => {
                  handleDelete();
                  setOpen(false);
                }}
              >
                Remove from list
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The row's controls while a sorting pass is on: one click sets the value and
 * moves you down the list. Everything else is out of the way, because the job
 * in this mode is 270 clicks and nothing else.
 */
function AssignStrip({
  guest,
  field,
  theme,
  onSet,
}: {
  guest: Guest;
  field: "side" | "guest_type";
  theme: SideTheme;
  onSet: (field: "side" | "guest_type", value: string) => void;
}) {
  if (field === "side") {
    return (
      <div className="flex shrink-0 items-center gap-1">
        {GUEST_SIDES.map((side) => (
          <button
            key={side}
            type="button"
            title={theme.labels[side]}
            onClick={() => onSet("side", side)}
            // Bigger on a phone: a 20px swatch is not a thumb-sized target,
            // and this mode is 270 taps in a row.
            className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 sm:h-5 sm:w-5 ${
              guest.side === side ? "border-ink/50" : "border-transparent"
            }`}
            style={{ backgroundColor: theme.colors[side] }}
          />
        ))}
        <button
          type="button"
          title="No side"
          onClick={() => onSet("side", "")}
          className={`h-7 w-7 rounded-full border-2 border-dashed transition-transform hover:scale-110 sm:h-5 sm:w-5 ${
            guest.side ? "border-hairline" : "border-ink/50"
          }`}
        />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
      {GUEST_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onSet("guest_type", guest.guest_type === type ? "" : type)}
          className={`rounded-full border px-2 py-1 text-[11px] leading-4 transition-colors sm:px-1.5 sm:py-0 sm:leading-5 ${
            guest.guest_type === type
              ? "border-forest bg-forest text-parchment"
              : "border-hairline text-ink/70 hover:border-forest"
          }`}
        >
          {GUEST_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}

function GuestRow({
  guest,
  theme,
  assigning,
  onAssign,
}: {
  guest: Guest;
  theme: SideTheme;
  /** Which field the sorting pass is setting, if one is on. */
  assigning: "side" | "guest_type" | null;
  onAssign: (guestId: string, field: "side" | "guest_type", value: string) => void;
}) {
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

  if (isEditing) {
    return (
      <div className="border-b border-hairline py-4 last:border-b-0">
        <form action={handleSave}>
          <input type="hidden" name="id" value={guest.id} />
          <GuestFields guest={guest} theme={theme} />
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

  const meta = guestMeta(guest);

  const badges = (
    <>
      {guest.plus_one && (
        <span
          title={guest.plus_one_name ? `Plus one: ${guest.plus_one_name}` : "Plus one"}
          className="shrink-0 rounded-full border border-hairline px-1.5 text-[11px] leading-4 text-ink/60"
        >
          +1
        </span>
      )}
      <span
        className={`shrink-0 rounded-full border px-1.5 text-[11px] leading-4 ${STATUS_BADGE_CLASS[guest.status]}`}
      >
        {STATUS_LABELS[guest.status]}
      </span>
      <span
        title={PRIORITY_LABELS[guest.priority]}
        className={`shrink-0 rounded-full border px-1.5 text-[11px] leading-4 ${PRIORITY_BADGE_CLASS[guest.priority]}`}
      >
        {PRIORITY_SHORT_LABELS[guest.priority]}
      </span>
      {guest.thanked && (
        <span title="Thanked" className="shrink-0 font-mono-numbers text-[11px] leading-4 text-forest">
          ✓
        </span>
      )}
    </>
  );

  return (
    <div className="border-b border-hairline last:border-b-0">
      {/* One line on a wide screen, two on a phone: the meta drops under the
          name rather than being squeezed beside it. */}
      <div className="flex items-center gap-2 py-1.5">
        <span
          title={guestSideLabel(guest, theme)}
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: guestSideColor(guest, theme) }}
        />
        {guest.photo_url && (
          <Image
            src={guest.photo_url}
            alt={guest.name}
            width={22}
            height={22}
            className="h-[22px] w-[22px] shrink-0 rounded-full border border-hairline object-cover"
          />
        )}

        <div className="min-w-0 flex-1">
          {/* Wide: name and badges share one line and the meta sits beside
              them. Narrow: the name gets the line to itself -- badges beside
              a name on a 375px screen truncate it to "Aaron Bache...". */}
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm text-ink">{guest.name}</span>
            <span className="hidden shrink-0 items-center gap-1.5 sm:flex">{badges}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 sm:hidden">{badges}</div>
        </div>

        {meta && !assigning && (
          <p className="hidden min-w-0 basis-[38%] truncate text-xs text-ink/45 lg:block">{meta}</p>
        )}

        {assigning ? (
          <AssignStrip
            guest={guest}
            field={assigning}
            theme={theme}
            onSet={(field, value) => onAssign(guest.id, field, value)}
          />
        ) : (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-transparent px-2 py-0.5 text-xs leading-5 text-brass transition-colors hover:border-hairline"
          >
            Edit
          </button>
          <GuestRowMenu
            guest={guest}
            theme={theme}
            onEdit={() => setIsEditing(true)}
            onThankYou={() => setShowThankYou((open) => !open)}
            showingThankYou={showThankYou}
          />
        </div>
        )}
      </div>

      {error && <p className="pb-2 text-xs text-red-800">{error}</p>}
      {showThankYou && <div className="pb-3">{<ThankYouPanel guest={guest} />}</div>}
    </div>
  );
}

function personCount(guest: Guest) {
  return 1 + (guest.plus_one ? 1 : 0);
}

/**
 * The key at the top of the list: which colour means whose side, and a
 * palette to change either one. Two colours only -- "both" is deliberately
 * neutral, and a guest with no side set is pale grey.
 */
function SideColorKey({
  theme,
  sideACurrent,
  sideBCurrent,
  onPicked,
}: {
  theme: SideTheme;
  sideACurrent: string;
  sideBCurrent: string;
  /** So every dot in the list repaints with the key, not just the key. */
  onPicked: (colors: { a: string; b: string }) => void;
}) {
  // Only the two real sides are pickable: "both" is deliberately neutral.
  const [editing, setEditing] = useState<"a" | "b" | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  // The picked colour, shown before the server has confirmed it. Without this
  // the swatch doesn't move until the page revalidates, which reads as a
  // button that does nothing.
  const [pending, setPending] = useState<{ a?: string; b?: string }>({});
  const [, startTransition] = useTransition();

  const shown = {
    a: pending.a ?? sideACurrent,
    b: pending.b ?? sideBCurrent,
  };

  function pick(side: "a" | "b", color: string) {
    const nextA = side === "a" ? color : shown.a;
    const nextB = side === "b" ? color : shown.b;
    const formData = new FormData();
    formData.set("side_a_color", nextA);
    formData.set("side_b_color", nextB);
    setPending({ a: nextA, b: nextB });
    onPicked({ a: nextA, b: nextB });
    setEditing(null);
    setError(undefined);
    startTransition(async () => {
      const result = await setSideColors(formData);
      if (result?.error) {
        setError(result.error);
        setPending({});
      }
    });
  }

  return (
    <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/60">
      {(["a", "b"] as const).map((side) => (
        <button
          key={side}
          type="button"
          onClick={() => setEditing((open) => (open === side ? null : side))}
          className="flex items-center gap-1.5 rounded-full border border-transparent px-1.5 py-0.5 transition-colors hover:border-hairline"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: shown[side] }}
          />
          {theme.labels[side]}
        </button>
      ))}
      <span className="flex items-center gap-1.5 px-1.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.colors.both }} />
        Both
      </span>
      {error && <span className="text-red-800">{error}</span>}

      {editing && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setEditing(null)}
            className="fixed inset-0 z-20 cursor-default"
          />
          <div className="absolute left-0 top-7 z-30 flex w-56 flex-wrap gap-2 rounded-lg border border-hairline bg-card p-3 shadow-lg">
            <p className="w-full font-mono-numbers text-[10px] uppercase tracking-[0.15em] text-ink/40">
              {theme.labels[editing]}
            </p>
            {SIDE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.name}
                onClick={() => pick(editing, color.value)}
                className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${
                  shown[editing] === color.value ? "border-ink/60" : "border-transparent"
                }`}
                style={{ backgroundColor: color.value }}
              />
            ))}
            <p className="w-full text-[11px] leading-4 text-ink/45">
              Colours the dot on every guest you&apos;ve put on this side. Guests with no side
              set stay grey.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export function GuestsManager({
  guests,
  spreadsheetUrl,
  partnerAName,
  partnerBName,
  sideAColor,
  sideBColor,
}: {
  guests: Guest[];
  /** A Google Sheet they've imported from before, if there is one. */
  spreadsheetUrl: string | null;
  partnerAName: string | null;
  partnerBName: string | null;
  sideAColor: string | null;
  sideBColor: string | null;
}) {
  const [filter, setFilter] = useState<GuestStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<GuestPriority | "all">("all");
  const [sideFilter, setSideFilter] = useState<GuestSide | "all" | "none">("all");
  const [typeFilter, setTypeFilter] = useState<GuestType | "all" | "none">("all");
  const [sort, setSort] = useState<GuestSort>("name");
  const [assigning, setAssigning] = useState<"side" | "guest_type" | null>(null);
  // What this session has set but the server hasn't sent back yet. A sorting
  // pass is a click a second; waiting for a round trip before the dot changes
  // colour makes it feel broken.
  const [overrides, setOverrides] = useState<
    Record<string, { side?: GuestSide | null; guest_type?: GuestType | null }>
  >({});
  const [, startAssigning] = useTransition();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  const [pickedColors, setPickedColors] = useState<{ a?: string; b?: string }>({});
  const theme = sideTheme({
    partnerAName,
    partnerBName,
    sideAColor: pickedColors.a ?? sideAColor,
    sideBColor: pickedColors.b ?? sideBColor,
  });

  function handleAssign(guestId: string, field: "side" | "guest_type", value: string) {
    setOverrides((current) => ({
      ...current,
      [guestId]: {
        ...current[guestId],
        [field]: (value || null) as GuestSide & GuestType & null,
      },
    }));
    const formData = new FormData();
    formData.set("guest_id", guestId);
    formData.set(field, value);
    startAssigning(async () => {
      await setGuestGrouping(formData);
    });
  }

  const guestList = guests.map((guest) =>
    overrides[guest.id] ? { ...guest, ...overrides[guest.id] } : guest,
  );

  const unassignedSideCount = guestList.filter((g) => !g.side).length;
  const unassignedTypeCount = guestList.filter((g) => !g.guest_type).length;

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

  const activeFilterCount = [filter, priorityFilter, sideFilter, typeFilter].filter(
    (f) => f !== "all",
  ).length;

  const filteredGuests = guestList.filter(
    (g) =>
      (filter === "all" || g.status === filter) &&
      (priorityFilter === "all" || g.priority === priorityFilter) &&
      (sideFilter === "all" || (sideFilter === "none" ? !g.side : g.side === sideFilter)) &&
      (typeFilter === "all" ||
        (typeFilter === "none" ? !g.guest_type : g.guest_type === typeFilter)) &&
      g.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const groups = groupGuests(filteredGuests, sort, theme);

  const pillClass = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm transition-colors ${
      active
        ? "border-forest bg-forest text-parchment"
        : "border-hairline bg-parchment text-ink hover:border-forest"
    }`;

  return (
    <div className="flex w-full min-w-0 flex-col rounded-lg border border-hairline bg-card p-4 shadow-sm sm:p-6">
      {/* The numbers, on one strip. Headcount, the invite ladder and the meal
          counts used to be three stacked blocks above the list; on a phone
          that was most of a screen before the first guest. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-hairline pb-3">
        <p className="text-sm text-ink/70">
          <span className="font-mono-numbers text-2xl text-forest">{headcount}</span> confirmed
          <span className="hidden text-ink/45 sm:inline"> · feeds your Budget guest count</span>
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink/60">
          <span>
            <span className="font-mono-numbers text-forest">{cumulativeMustInvite}</span> must
            invite
          </span>
          <span className="text-ink/30">&rarr;</span>
          <span>
            <span className="font-mono-numbers text-brass">{cumulativeWouldLike}</span> incl. would
            like
          </span>
          <span className="text-ink/30">&rarr;</span>
          <span>
            <span className="font-mono-numbers text-ink">{cumulativeIfRoom}</span> incl. if room
          </span>
          {guests.length > 0 && (
            <span className="text-ink/45">
              · {thankedCount}/{guests.length} thanked
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 py-3">
        <SideColorKey
          theme={theme}
          sideACurrent={theme.colors.a}
          sideBCurrent={theme.colors.b}
          onPicked={(colors) => setPickedColors(colors)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setShowAddForm((v) => !v);
              setShowImportForm(false);
            }}
            className="rounded-full bg-forest px-3 py-1 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
          >
            {showAddForm ? "Close" : "+ Add guest"}
          </button>
          <button
            onClick={() => {
              setShowImportForm((v) => !v);
              setShowAddForm(false);
            }}
            className="rounded-full border border-hairline bg-parchment px-3 py-1 font-mono-numbers text-sm text-ink transition-colors hover:border-forest"
          >
            {showImportForm ? "Close" : "Import"}
          </button>
          <button
            onClick={() => downloadGuestsXlsx(guests)}
            disabled={guests.length === 0}
            className="rounded-full border border-hairline bg-parchment px-3 py-1 font-mono-numbers text-sm text-ink transition-colors hover:border-forest disabled:opacity-50"
          >
            Excel
          </button>
          <button
            onClick={() => downloadGuestsCsv(guests)}
            disabled={guests.length === 0}
            className="rounded-full border border-hairline bg-parchment px-3 py-1 font-mono-numbers text-sm text-ink transition-colors hover:border-forest disabled:opacity-50"
          >
            CSV
          </button>
        </div>
      </div>

      {spreadsheetUrl && !showImportForm && (
        <div className="mb-3 flex justify-end">
          <SpreadsheetLink url={spreadsheetUrl} />
        </div>
      )}

      {showAddForm && <AddGuestForm theme={theme} onDone={() => setShowAddForm(false)} />}
      {showImportForm && <ImportGuestsForm onDone={() => setShowImportForm(false)} />}

      {confirmedGuests.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-hairline bg-parchment px-3 py-2 text-xs text-ink/70">
          <span className="uppercase tracking-[0.15em] text-ink/40">Meals</span>
          {mealBreakdown.map(([meal, count]) => (
            <span key={meal}>
              <span className="font-mono-numbers text-forest">{count}</span>{" "}
              {meal === "Not selected" ? <span className="text-ink/50">Not selected</span> : meal}
            </span>
          ))}
        </div>
      )}

      {/* A sorting pass, offered where the gap is: 270 guests arrive with no
          side and no type, and setting them one menu at a time is the kind of
          job nobody finishes. Here the row is a strip of buttons and nothing
          else, and the filter beside it narrows to what's still unsorted. */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-md border border-hairline bg-parchment px-3 py-2">
        <span className="font-mono-numbers text-[11px] uppercase tracking-[0.15em] text-ink/40">
          Sort into groups
        </span>
        <button
          type="button"
          onClick={() => setAssigning((mode) => (mode === "side" ? null : "side"))}
          className={pillClass(assigning === "side")}
        >
          Sides{unassignedSideCount > 0 ? ` (${unassignedSideCount} left)` : ""}
        </button>
        <button
          type="button"
          onClick={() => setAssigning((mode) => (mode === "guest_type" ? null : "guest_type"))}
          className={pillClass(assigning === "guest_type")}
        >
          Family / friends{unassignedTypeCount > 0 ? ` (${unassignedTypeCount} left)` : ""}
        </button>
        {assigning && (
          <>
            <button
              type="button"
              onClick={() => {
                if (assigning === "side") setSideFilter("none");
                else setTypeFilter("none");
              }}
              className="text-xs text-brass hover:underline"
            >
              Show only the ones left
            </button>
            <button
              type="button"
              onClick={() => setAssigning(null)}
              className="ml-auto text-xs text-ink/50 hover:underline"
            >
              Done
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <SearchBox value={search} onChange={setSearch} placeholder="Search guests by name..." />
        </div>
        <label className="flex shrink-0 items-center gap-2 text-xs text-ink/60">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as GuestSort)}
            className="rounded-md border border-hairline bg-parchment px-2 py-1.5 text-sm text-ink outline-none focus:border-forest"
          >
            {(Object.keys(GUEST_SORT_LABELS) as GuestSort[]).map((option) => (
              <option key={option} value={option}>
                {GUEST_SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-2">
        <FilterDisclosure activeCount={activeFilterCount}>
          <div className="flex flex-wrap gap-2">
            {(["all", ...GUEST_SIDES, "none"] as const).map((side) => (
              <button
                key={side}
                onClick={() => setSideFilter(side)}
                className={pillClass(sideFilter === side)}
              >
                {side === "all" ? "All sides" : side === "none" ? "No side set" : theme.labels[side]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", ...GUEST_TYPES, "none"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={pillClass(typeFilter === type)}
              >
                {type === "all"
                  ? "Family & friends"
                  : type === "none"
                    ? "Not sorted yet"
                    : GUEST_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", ...PRIORITIES] as const).map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={pillClass(priorityFilter === priority)}
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
                className={pillClass(filter === status)}
              >
                {status === "all" ? "All" : STATUS_LABELS[status]} ({counts[status]})
              </button>
            ))}
          </div>
        </FilterDisclosure>
      </div>

      {filteredGuests.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">
          {guests.length === 0
            ? "No guests yet — add your first one above."
            : "No guests match this filter."}
        </p>
      ) : (
        <div className="mt-2">
          {groups.map((group) => (
            <div key={group.key}>
              {group.heading && (
                <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-hairline bg-card/95 py-1.5 backdrop-blur">
                  {group.color && (
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                  )}
                  <span className="font-mono-numbers text-[11px] uppercase tracking-[0.15em] text-ink/50">
                    {group.heading}
                  </span>
                  <span className="font-mono-numbers text-[11px] text-ink/35">
                    {group.guests.length}
                  </span>
                </div>
              )}
              {group.guests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  theme={theme}
                  assigning={assigning}
                  onAssign={handleAssign}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
