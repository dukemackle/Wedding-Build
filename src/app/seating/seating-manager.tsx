"use client";

import { useRef, useState, useTransition } from "react";
import type { Guest, SeatingTable, TableShape } from "@/lib/supabase/types";
import {
  addSeatingTable,
  updateSeatingTable,
  deleteSeatingTable,
  assignGuestTable,
  updateTablePosition,
} from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

const SHAPES: TableShape[] = ["round", "square", "rectangle"];
const SHAPE_LABELS: Record<TableShape, string> = {
  round: "Round",
  square: "Square",
  rectangle: "Rectangle",
};

function personCount(guest: Guest) {
  return 1 + (guest.plus_one ? 1 : 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

// The table's on-canvas footprint is derived from its shape + capacity
// (no separate size field to keep in sync) -- more seats draws a bigger
// shape, a rectangle grows mostly in width like a real banquet table.
function tableDimensions(shape: TableShape, capacity: number | null) {
  const seats = capacity ?? 8;
  if (shape === "square") {
    const side = clamp(110 + seats * 8, 110, 240);
    return { width: side, height: side };
  }
  if (shape === "rectangle") {
    return { width: clamp(160 + seats * 14, 160, 420), height: 110 };
  }
  const diameter = clamp(120 + seats * 8, 120, 260);
  return { width: diameter, height: diameter };
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
      <label className={labelClass}>
        Shape
        <select name="shape" defaultValue={table?.shape ?? "round"} className={inputClass}>
          {SHAPES.map((shape) => (
            <option key={shape} value={shape}>
              {SHAPE_LABELS[shape]}
            </option>
          ))}
        </select>
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

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 520;

function shapeClassName(shape: TableShape) {
  if (shape === "round") return "rounded-full";
  return "rounded-lg";
}

function TableNode({
  table,
  assignedGuests,
  isSelected,
  onSelect,
  onDragEnd,
  onUnassign,
}: {
  table: SeatingTable;
  assignedGuests: Guest[];
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onUnassign: (guestId: string) => void;
}) {
  const { width, height } = tableDimensions(table.shape, table.capacity);
  const [pos, setPos] = useState(() => ({ x: table.position_x, y: table.position_y }));
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );
  const movedRef = useRef(false);

  const occupied = assignedGuests.reduce((sum, g) => sum + personCount(g), 0);
  const overCapacity = table.capacity != null && occupied > table.capacity;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    movedRef.current = false;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
    setPos({
      x: clamp(dragRef.current.origX + dx, 0, CANVAS_WIDTH - width),
      y: clamp(dragRef.current.origY + dy, 0, CANVAS_HEIGHT - height),
    });
  }

  function handlePointerUp() {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (movedRef.current) {
      onDragEnd(pos.x, pos.y);
    } else {
      onSelect();
    }
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ position: "absolute", left: pos.x, top: pos.y, width, height }}
      className={`flex cursor-grab select-none flex-col items-center justify-center gap-1 border-2 bg-card p-2 text-center shadow-sm active:cursor-grabbing ${shapeClassName(table.shape)} ${isSelected ? "border-forest ring-2 ring-forest/30" : "border-hairline"}`}
    >
      <p className="font-medium text-ink">{table.name}</p>
      <p className={`text-xs ${overCapacity ? "text-red-700" : "text-ink/50"}`}>
        {occupied}
        {table.capacity != null ? ` / ${table.capacity}` : ""} seated
      </p>
      <div className="flex max-h-full flex-wrap items-center justify-center gap-1 overflow-y-auto px-1">
        {assignedGuests.map((guest) => (
          <span
            key={guest.id}
            className="flex items-center gap-1 rounded-full border border-hairline bg-parchment px-1.5 py-0.5 text-[11px] text-ink"
          >
            {guest.name}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onUnassign(guest.id);
              }}
              className="text-ink/40 hover:text-red-700"
              aria-label={`Unassign ${guest.name}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function SeatingCanvas({
  tables,
  guestsByTable,
  selectedTableId,
  onSelect,
  onDragEnd,
  onUnassign,
}: {
  tables: SeatingTable[];
  guestsByTable: Map<string, Guest[]>;
  selectedTableId: string | null;
  onSelect: (id: string | null) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onUnassign: (guestId: string) => void;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-hairline bg-parchment">
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
        style={{ position: "relative", width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        {tables.map((table) => (
          <TableNode
            key={`${table.id}-${table.position_x}-${table.position_y}`}
            table={table}
            assignedGuests={guestsByTable.get(table.id) ?? []}
            isSelected={table.id === selectedTableId}
            onSelect={() => onSelect(table.id === selectedTableId ? null : table.id)}
            onDragEnd={(x, y) => onDragEnd(table.id, x, y)}
            onUnassign={onUnassign}
          />
        ))}
      </div>
    </div>
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

function UnassignedGuestRow({
  guest,
  selectedTable,
  onAssign,
}: {
  guest: Guest;
  selectedTable: SeatingTable | null;
  onAssign: (guestId: string, tableId: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline py-3 last:border-b-0">
      <span className="text-ink">
        {guest.name}
        {guest.plus_one && <span className="ml-2 text-xs text-ink/50">+1</span>}
      </span>
      <button
        disabled={!selectedTable}
        onClick={() => selectedTable && onAssign(guest.id, selectedTable.id)}
        className="shrink-0 rounded-md border border-hairline px-3 py-1 text-sm text-ink transition-colors hover:border-forest disabled:opacity-40"
      >
        {selectedTable ? `Add to ${selectedTable.name}` : "Select a table above"}
      </button>
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
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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

  const selectedTable = tables.find((t) => t.id === selectedTableId) ?? null;

  function handleAssign(guestId: string, tableId: string) {
    const formData = new FormData();
    formData.set("guest_id", guestId);
    formData.set("table_id", tableId);
    startTransition(async () => {
      await assignGuestTable(formData);
    });
  }

  function handleUnassign(guestId: string) {
    handleAssign(guestId, "");
  }

  function handleDragEnd(tableId: string, x: number, y: number) {
    const formData = new FormData();
    formData.set("id", tableId);
    formData.set("position_x", String(Math.round(x)));
    formData.set("position_y", String(Math.round(y)));
    startTransition(async () => {
      await updateTablePosition(formData);
    });
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
            Drag a table to move it; click one, then click a guest below to seat them.
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
        <>
          <SeatingCanvas
            tables={tables}
            guestsByTable={guestsByTable}
            selectedTableId={selectedTableId}
            onSelect={setSelectedTableId}
            onDragEnd={handleDragEnd}
            onUnassign={handleUnassign}
          />

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                assignedGuests={guestsByTable.get(table.id) ?? []}
              />
            ))}
          </div>
        </>
      )}

      {unassigned.length > 0 && (
        <div className="mt-8 border-t border-hairline pt-6">
          <h3 className="font-display text-lg font-semibold text-forest">Unassigned guests</h3>
          <div className="mt-2">
            {unassigned.map((guest) => (
              <UnassignedGuestRow
                key={guest.id}
                guest={guest}
                selectedTable={selectedTable}
                onAssign={handleAssign}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
