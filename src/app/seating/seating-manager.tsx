"use client";

import { useRef, useState, useTransition } from "react";
import type { Guest, SeatingTable } from "@/lib/supabase/types";
import { addSeatingTable, updateSeatingTable, deleteSeatingTable, assignGuestTable } from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function personCount(guest: Guest) {
  return 1 + (guest.plus_one ? 1 : 0);
}

function TableFields({ table }: { table?: SeatingTable }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Table name
        <input
          name="name"
          required
          placeholder="e.g. Table 1, Sweetheart Table"
          defaultValue={table?.name ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Capacity
        <input
          type="number"
          name="capacity"
          min={0}
          placeholder="Optional — no limit"
          defaultValue={table?.capacity ?? ""}
          className={inputClass}
        />
      </label>
    </div>
  );
}

function AddTableForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addSeatingTable(formData);
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
      <TableFields />
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add table"}
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

function TableCard({
  table,
  assignedGuests,
}: {
  table: SeatingTable;
  assignedGuests: Guest[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const occupied = assignedGuests.reduce((sum, g) => sum + personCount(g), 0);
  const overCapacity = table.capacity != null && occupied > table.capacity;

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateSeatingTable(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setIsEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${table.name}"? Assigned guests will become unassigned.`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", table.id);
      const result = await deleteSeatingTable(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function handleUnassign(guestId: string) {
    const formData = new FormData();
    formData.set("guest_id", guestId);
    formData.set("table_id", "");
    startTransition(async () => {
      await assignGuestTable(formData);
    });
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border border-hairline bg-parchment p-5">
        <form action={handleSave}>
          <input type="hidden" name="id" value={table.id} />
          <TableFields table={table} />
          {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-forest px-3 py-1.5 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-hairline px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-hairline bg-parchment p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-ink">{table.name}</p>
          <p className={`mt-1 text-xs ${overCapacity ? "text-red-700" : "text-ink/50"}`}>
            {occupied} {table.capacity != null ? `/ ${table.capacity}` : ""} seated
            {overCapacity ? " — over capacity" : ""}
          </p>
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
            Delete
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
      {assignedGuests.length === 0 ? (
        <p className="mt-3 text-sm text-ink/50">No guests assigned yet.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {assignedGuests.map((guest) => (
            <span
              key={guest.id}
              className="flex items-center gap-2 rounded-full border border-hairline bg-card px-3 py-1 text-sm text-ink"
            >
              {guest.name}
              {guest.plus_one && <span className="text-xs text-ink/50">+1</span>}
              <button
                onClick={() => handleUnassign(guest.id)}
                disabled={isPending}
                className="text-xs text-ink/40 hover:text-red-700"
                aria-label={`Unassign ${guest.name}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function UnassignedGuestRow({ guest, tables }: { guest: Guest; tables: SeatingTable[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);

  function handleChange(tableId: string) {
    const formData = new FormData();
    formData.set("guest_id", guest.id);
    formData.set("table_id", tableId);
    startTransition(async () => {
      const result = await assignGuestTable(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline py-3 last:border-b-0">
      <span className="text-ink">
        {guest.name}
        {guest.plus_one && <span className="ml-2 text-xs text-ink/50">+1</span>}
      </span>
      <div className="flex items-center gap-2">
        {error && <span className="text-xs text-red-800">{error}</span>}
        <select
          defaultValue=""
          disabled={isPending || tables.length === 0}
          onChange={(e) => handleChange(e.target.value)}
          className="rounded-md border border-hairline bg-parchment px-2 py-1 text-sm text-ink outline-none focus:border-forest disabled:opacity-50"
        >
          <option value="" disabled>
            {tables.length === 0 ? "Add a table first" : "Assign to table..."}
          </option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              {table.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function SeatingManager({
  tables,
  confirmedGuests,
}: {
  tables: SeatingTable[];
  confirmedGuests: Guest[];
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  const guestsByTable = new Map<string, Guest[]>();
  const unassigned: Guest[] = [];
  for (const guest of confirmedGuests) {
    if (guest.table_id) {
      const list = guestsByTable.get(guest.table_id) ?? [];
      list.push(guest);
      guestsByTable.set(guest.table_id, list);
    } else {
      unassigned.push(guest);
    }
  }

  if (confirmedGuests.length === 0) {
    return (
      <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-forest">Seating chart</h2>
        <p className="mt-4 text-sm text-ink/50">
          No confirmed guests yet — the seating chart fills in once guests RSVP as attending.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Seating chart</h2>
          <p className="mt-1 text-sm text-ink/70">
            {unassigned.length} of {confirmedGuests.length} confirmed guests still unassigned.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
        >
          {showAddForm ? "Close" : "+ Add table"}
        </button>
      </div>

      {showAddForm && <AddTableForm onDone={() => setShowAddForm(false)} />}

      {tables.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink/50">
          No tables yet — add your first one above.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              assignedGuests={guestsByTable.get(table.id) ?? []}
            />
          ))}
        </div>
      )}

      {unassigned.length > 0 && (
        <div className="mt-8 border-t border-hairline pt-6">
          <h3 className="font-display text-lg font-semibold text-forest">Unassigned guests</h3>
          <div className="mt-2">
            {unassigned.map((guest) => (
              <UnassignedGuestRow key={guest.id} guest={guest} tables={tables} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
