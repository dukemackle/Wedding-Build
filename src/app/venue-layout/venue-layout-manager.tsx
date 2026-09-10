"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import type {
  Guest,
  LayoutItemType,
  SeatingTable,
  TableShape,
  VenueLayoutItem,
  VenueRoom,
} from "@/lib/supabase/types";
import {
  addSeatingTable,
  updateSeatingTable,
  deleteSeatingTable,
  assignGuestTable,
  updateTablePosition,
} from "@/app/seating/actions";
import { addRoom, deleteRoom } from "./room-actions";
import {
  addLayoutItem,
  updateLayoutItem,
  deleteLayoutItem,
  updateLayoutItemPosition,
} from "@/app/floor-plan/actions";

const VenueLayout3DView = dynamic(() => import("./venue-layout-3d-view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] w-full items-center justify-center rounded-lg border border-hairline bg-parchment text-sm text-ink/50">
      Loading 3D view...
    </div>
  ),
});

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

const SHAPES: TableShape[] = ["round", "square", "rectangle"];
const SHAPE_LABELS: Record<TableShape, string> = {
  round: "Round",
  square: "Square",
  rectangle: "Rectangle",
};

const ITEM_TYPES: LayoutItemType[] = [
  "chairs",
  "stage",
  "dance_floor",
  "bar",
  "dj_booth",
  "buffet",
  "cake_table",
  "gift_table",
  "entrance",
  "house",
  "parking",
  "other",
];

const ITEM_TYPE_LABELS: Record<LayoutItemType, string> = {
  chairs: "Chairs",
  stage: "Ceremony stage",
  dance_floor: "Dance floor",
  bar: "Bar",
  dj_booth: "DJ / band booth",
  buffet: "Buffet / catering",
  cake_table: "Cake table",
  gift_table: "Gift table",
  entrance: "Entrance",
  house: "House",
  parking: "Parking",
  other: "Other",
};

export const ITEM_TYPE_DIMENSIONS: Record<LayoutItemType, { width: number; height: number }> = {
  chairs: { width: 220, height: 60 },
  stage: { width: 240, height: 100 },
  dance_floor: { width: 200, height: 200 },
  bar: { width: 160, height: 70 },
  dj_booth: { width: 120, height: 90 },
  buffet: { width: 200, height: 70 },
  cake_table: { width: 100, height: 80 },
  gift_table: { width: 100, height: 80 },
  entrance: { width: 90, height: 90 },
  house: { width: 180, height: 140 },
  parking: { width: 260, height: 160 },
  other: { width: 120, height: 90 },
};

const ITEM_TYPE_COLORS: Record<LayoutItemType, string> = {
  chairs: "border-brass/60 bg-brass/10",
  stage: "border-forest/60 bg-forest/10",
  dance_floor: "border-ink/30 bg-ink/5",
  bar: "border-brass/60 bg-brass/10",
  dj_booth: "border-forest/60 bg-forest/10",
  buffet: "border-brass/60 bg-brass/10",
  cake_table: "border-forest/60 bg-forest/10",
  gift_table: "border-forest/60 bg-forest/10",
  entrance: "border-ink/30 bg-ink/5",
  house: "border-brass/60 bg-brass/10",
  parking: "border-ink/30 bg-ink/5",
  other: "border-hairline bg-card",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function personCount(guest: Guest) {
  return 1 + (guest.plus_one ? 1 : 0);
}

// The table's on-canvas footprint is derived from its shape + capacity
// (no separate size field to keep in sync) -- more seats draws a bigger
// shape, a rectangle grows mostly in width like a real banquet table.
export function tableDimensions(shape: TableShape, capacity: number | null) {
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

function itemDisplayName(item: VenueLayoutItem) {
  return item.label?.trim() || ITEM_TYPE_LABELS[item.item_type];
}

function shapeClassName(shape: TableShape) {
  if (shape === "round") return "rounded-full";
  return "rounded-lg";
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

function AddTableForm({ onDone, roomId }: { onDone: () => void; roomId?: string }) {
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
      <p className="mb-3 font-medium text-ink">Add a table</p>
      {roomId && <input type="hidden" name="room_id" value={roomId} />}
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

function ItemFields({ item }: { item?: VenueLayoutItem }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={labelClass}>
        Type
        <select name="item_type" defaultValue={item?.item_type ?? "chairs"} className={inputClass}>
          {ITEM_TYPES.map((type) => (
            <option key={type} value={type}>
              {ITEM_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Label (optional)
        <input
          name="label"
          placeholder="e.g. Bar #2"
          defaultValue={item?.label ?? ""}
          className={inputClass}
        />
      </label>
    </div>
  );
}

function AddItemForm({ onDone, roomId }: { onDone: () => void; roomId?: string }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addLayoutItem(formData);
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
      <p className="mb-3 font-medium text-ink">Add a furniture / layout item</p>
      {roomId && <input type="hidden" name="room_id" value={roomId} />}
      <ItemFields />
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add item"}
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

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 520;

function normalizeRotation(value: number) {
  return ((Math.round(value) % 360) + 360) % 360;
}

// Drag this handle around the shape's center to rotate it -- hold Shift
// to snap to 15-degree steps. Rendered as a child of the rotated node so
// it turns along with the shape, always sitting just above it.
function RotateHandle({
  containerRef,
  onRotate,
  onRotateEnd,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onRotate: (degrees: number) => void;
  onRotateEnd: (degrees: number) => void;
}) {
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const rotatingRef = useRef(false);
  const lastRotationRef = useRef(0);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    rotatingRef.current = true;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!rotatingRef.current || !centerRef.current) return;
    const dx = e.clientX - centerRef.current.x;
    const dy = e.clientY - centerRef.current.y;
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    angle = ((angle % 360) + 360) % 360;
    if (e.shiftKey) angle = Math.round(angle / 15) * 15;
    lastRotationRef.current = angle;
    onRotate(angle);
  }

  function handlePointerUp() {
    if (!rotatingRef.current) return;
    rotatingRef.current = false;
    onRotateEnd(normalizeRotation(lastRotationRef.current));
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "absolute",
        top: -40,
        left: "50%",
        transform: "translateX(-50%)",
        touchAction: "none",
      }}
      aria-label="Rotate"
      className="flex h-10 w-10 cursor-grab items-center justify-center rounded-full border-2 border-forest bg-parchment text-forest shadow-sm active:cursor-grabbing"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 3v6h-6" />
      </svg>
    </div>
  );
}

function TableNode({
  table,
  assignedGuests,
  isSelected,
  onSelect,
  onDragEnd,
  onRotateEnd,
  onUnassign,
}: {
  table: SeatingTable;
  assignedGuests: Guest[];
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onRotateEnd: (rotation: number) => void;
  onUnassign: (guestId: string) => void;
}) {
  const { width, height } = tableDimensions(table.shape, table.capacity);
  const [pos, setPos] = useState(() => ({ x: table.position_x, y: table.position_y }));
  const [rotation, setRotation] = useState(table.rotation);
  const containerRef = useRef<HTMLDivElement>(null);
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
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        touchAction: "none",
      }}
      className={`flex cursor-grab select-none flex-col items-center justify-center gap-1 border-2 bg-card p-2 text-center shadow-sm active:cursor-grabbing ${shapeClassName(table.shape)} ${isSelected ? "border-forest ring-2 ring-forest/30" : "border-hairline"}`}
    >
      {isSelected && (
        <RotateHandle
          containerRef={containerRef}
          onRotate={setRotation}
          onRotateEnd={onRotateEnd}
        />
      )}
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

function ItemNode({
  item,
  isSelected,
  onSelect,
  onDragEnd,
  onRotateEnd,
}: {
  item: VenueLayoutItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onRotateEnd: (rotation: number) => void;
}) {
  const { width, height } = ITEM_TYPE_DIMENSIONS[item.item_type];
  const [pos, setPos] = useState(() => ({ x: item.position_x, y: item.position_y }));
  const [rotation, setRotation] = useState(item.rotation);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );
  const movedRef = useRef(false);

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
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width,
        height,
        transform: `rotate(${rotation}deg)`,
        touchAction: "none",
      }}
      className={`flex cursor-grab select-none flex-col items-center justify-center rounded-lg border-2 p-2 text-center text-sm shadow-sm active:cursor-grabbing ${ITEM_TYPE_COLORS[item.item_type]} ${isSelected ? "ring-2 ring-forest/40" : ""}`}
    >
      {isSelected && (
        <RotateHandle
          containerRef={containerRef}
          onRotate={setRotation}
          onRotateEnd={onRotateEnd}
        />
      )}
      <p className="font-medium text-ink">{itemDisplayName(item)}</p>
      {item.label && <p className="text-xs text-ink/50">{ITEM_TYPE_LABELS[item.item_type]}</p>}
    </div>
  );
}

function VenueCanvas({
  tables,
  items,
  guestsByTable,
  selectedTableId,
  selectedItemId,
  onSelectTable,
  onSelectItem,
  onTableDragEnd,
  onItemDragEnd,
  onTableRotateEnd,
  onItemRotateEnd,
  onUnassign,
}: {
  tables: SeatingTable[];
  items: VenueLayoutItem[];
  guestsByTable: Map<string, Guest[]>;
  selectedTableId: string | null;
  selectedItemId: string | null;
  onSelectTable: (id: string | null) => void;
  onSelectItem: (id: string | null) => void;
  onTableDragEnd: (id: string, x: number, y: number) => void;
  onItemDragEnd: (id: string, x: number, y: number) => void;
  onTableRotateEnd: (id: string, rotation: number) => void;
  onItemRotateEnd: (id: string, rotation: number) => void;
  onUnassign: (guestId: string) => void;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-hairline bg-parchment">
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelectTable(null);
            onSelectItem(null);
          }
        }}
        style={{ position: "relative", width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        {items.map((item) => (
          <ItemNode
            key={`${item.id}-${item.position_x}-${item.position_y}-${item.rotation}`}
            item={item}
            isSelected={item.id === selectedItemId}
            onSelect={() => onSelectItem(item.id === selectedItemId ? null : item.id)}
            onDragEnd={(x, y) => onItemDragEnd(item.id, x, y)}
            onRotateEnd={(rotation) => onItemRotateEnd(item.id, rotation)}
          />
        ))}
        {tables.map((table) => (
          <TableNode
            key={`${table.id}-${table.position_x}-${table.position_y}-${table.rotation}`}
            table={table}
            assignedGuests={guestsByTable.get(table.id) ?? []}
            isSelected={table.id === selectedTableId}
            onSelect={() => onSelectTable(table.id === selectedTableId ? null : table.id)}
            onDragEnd={(x, y) => onTableDragEnd(table.id, x, y)}
            onRotateEnd={(rotation) => onTableRotateEnd(table.id, rotation)}
            onUnassign={onUnassign}
          />
        ))}
      </div>
    </div>
  );
}

function TableCard({ table, assignedGuests }: { table: SeatingTable; assignedGuests: Guest[] }) {
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

function ItemCard({ item }: { item: VenueLayoutItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = await updateLayoutItem(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setIsEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${itemDisplayName(item)}"?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", item.id);
      const result = await deleteLayoutItem(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border border-hairline bg-parchment p-5">
        <form action={handleSave}>
          <input type="hidden" name="id" value={item.id} />
          <ItemFields item={item} />
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
    <div className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-parchment p-4">
      <div>
        <p className="text-ink">{itemDisplayName(item)}</p>
        <p className="mt-0.5 text-xs text-ink/50">{ITEM_TYPE_LABELS[item.item_type]}</p>
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
      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
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

function AddRoomForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addRoom(formData);
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
    <form ref={formRef} action={handleSubmit} className="flex items-center gap-2">
      <input
        name="name"
        required
        placeholder="e.g. Reception Tent"
        className="rounded-md border border-hairline bg-parchment px-3 py-1.5 text-sm text-ink outline-none focus:border-forest"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-forest px-3 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
      >
        {isPending ? "Adding..." : "Add"}
      </button>
      {error && <p className="text-sm text-red-800">{error}</p>}
    </form>
  );
}

function RoomTabs({
  rooms,
  selectedRoomId,
  onSelect,
}: {
  rooms: VenueRoom[];
  selectedRoomId: string | null;
  onSelect: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(room: VenueRoom) {
    if (!confirm(`Delete "${room.name}"? Its tables and items won't show under any room.`)) return;
    const formData = new FormData();
    formData.set("id", room.id);
    startTransition(async () => {
      await deleteRoom(formData);
    });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {rooms.map((room) => (
        <div key={room.id} className="flex items-center">
          <button
            onClick={() => onSelect(room.id)}
            className={`rounded-l-full border px-3 py-1.5 text-sm transition-colors ${
              room.id === selectedRoomId
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-parchment text-ink hover:border-forest"
            }`}
          >
            {room.name}
          </button>
          <button
            onClick={() => handleDelete(room)}
            disabled={isPending}
            aria-label={`Delete ${room.name}`}
            className={`rounded-r-full border border-l-0 px-2 py-1.5 text-xs transition-colors ${
              room.id === selectedRoomId
                ? "border-forest bg-forest text-parchment/70 hover:text-parchment"
                : "border-hairline bg-parchment text-ink/40 hover:text-red-700"
            }`}
          >
            &times;
          </button>
        </div>
      ))}
      {adding ? (
        <AddRoomForm onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-hairline px-3 py-1.5 text-sm text-ink/60 transition-colors hover:border-forest hover:text-forest"
        >
          + New room
        </button>
      )}
    </div>
  );
}

const MODES = [
  { id: "seating", label: "Seating" },
  { id: "whole-venue", label: "Whole Venue" },
  { id: "rooms", label: "Rooms" },
] as const;

type Mode = (typeof MODES)[number]["id"];

function ModeSwitcher({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return (
    <div className="inline-flex rounded-full border border-hairline bg-parchment p-1">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`rounded-full px-3 py-1 font-mono-numbers text-sm transition-colors ${
            mode === m.id ? "bg-forest text-parchment" : "text-ink/60 hover:text-forest"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export function VenueLayoutManager({
  tables,
  confirmedGuests,
  items,
  rooms,
}: {
  tables: SeatingTable[];
  confirmedGuests: Guest[];
  items: VenueLayoutItem[];
  rooms: VenueRoom[];
}) {
  const [mode, setMode] = useState<Mode>("whole-venue");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(rooms[0]?.id ?? null);
  const [addFormType, setAddFormType] = useState<"table" | "item" | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [view3D, setView3D] = useState(false);
  const [, startTransition] = useTransition();

  const activeRoomId = selectedRoomId ?? rooms[0]?.id ?? null;

  const visibleTables =
    mode === "rooms" ? tables.filter((t) => t.room_id === activeRoomId) : tables;
  const visibleItems =
    mode === "seating" ? [] : mode === "rooms" ? items.filter((i) => i.room_id === activeRoomId) : items;

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

  function handleTableDragEnd(tableId: string, x: number, y: number) {
    const formData = new FormData();
    formData.set("id", tableId);
    formData.set("position_x", String(Math.round(x)));
    formData.set("position_y", String(Math.round(y)));
    startTransition(async () => {
      await updateTablePosition(formData);
    });
  }

  function handleItemDragEnd(itemId: string, x: number, y: number) {
    const formData = new FormData();
    formData.set("id", itemId);
    formData.set("position_x", String(Math.round(x)));
    formData.set("position_y", String(Math.round(y)));
    startTransition(async () => {
      await updateLayoutItemPosition(formData);
    });
  }

  function handleTableRotateEnd(tableId: string, rotation: number) {
    const formData = new FormData();
    formData.set("id", tableId);
    formData.set("rotation", String(rotation));
    startTransition(async () => {
      await updateTablePosition(formData);
    });
  }

  function handleItemRotateEnd(itemId: string, rotation: number) {
    const formData = new FormData();
    formData.set("id", itemId);
    formData.set("rotation", String(rotation));
    startTransition(async () => {
      await updateLayoutItemPosition(formData);
    });
  }

  const hasContent = visibleTables.length > 0 || visibleItems.length > 0;
  const canAdd = mode !== "rooms" || activeRoomId != null;
  const formRoomId = mode === "rooms" ? (activeRoomId ?? undefined) : undefined;

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Venue layout</h2>
          <p className="mt-1 text-sm text-ink/70">
            {mode === "seating"
              ? confirmedGuests.length === 0
                ? "No confirmed guests yet — set up tables now, assign guests once they RSVP."
                : `${unassigned.length} of ${confirmedGuests.length} confirmed guests still unassigned.`
              : mode === "rooms"
                ? "Plan each space separately — switch rooms below."
                : "Everything in one shared space."}{" "}
            Drag anything to move it; click a table, then click a guest below to seat them.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ModeSwitcher mode={mode} onChange={setMode} />
          {hasContent && (
            <button
              onClick={() => setView3D((v) => !v)}
              className="rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-forest transition-colors hover:border-forest"
            >
              {view3D ? "Back to editor" : "View in 3D"}
            </button>
          )}
          <button
            onClick={() => setAddFormType((v) => (v === "table" ? null : "table"))}
            disabled={!canAdd}
            className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-40"
          >
            {addFormType === "table" ? "Close" : "+ Add table"}
          </button>
          {mode !== "seating" && (
            <button
              onClick={() => setAddFormType((v) => (v === "item" ? null : "item"))}
              disabled={!canAdd}
              className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-40"
            >
              {addFormType === "item" ? "Close" : "+ Add item"}
            </button>
          )}
        </div>
      </div>

      {mode === "rooms" && (
        <RoomTabs rooms={rooms} selectedRoomId={activeRoomId} onSelect={setSelectedRoomId} />
      )}

      {addFormType === "table" && (
        <AddTableForm onDone={() => setAddFormType(null)} roomId={formRoomId} />
      )}
      {addFormType === "item" && (
        <AddItemForm onDone={() => setAddFormType(null)} roomId={formRoomId} />
      )}

      {mode === "rooms" && !activeRoomId ? (
        <p className="py-4 text-center text-sm text-ink/50">
          Create a room above to start adding tables and furniture to it.
        </p>
      ) : !hasContent ? (
        <p className="py-4 text-center text-sm text-ink/50">
          Nothing here yet — add a table{mode !== "seating" ? " or a layout item" : ""} above.
        </p>
      ) : (
        <>
          {view3D ? (
            <VenueLayout3DView tables={visibleTables} items={visibleItems} />
          ) : (
            <VenueCanvas
              tables={visibleTables}
              items={visibleItems}
              guestsByTable={guestsByTable}
              selectedTableId={selectedTableId}
              selectedItemId={selectedItemId}
              onSelectTable={setSelectedTableId}
              onSelectItem={setSelectedItemId}
              onTableDragEnd={handleTableDragEnd}
              onItemDragEnd={handleItemDragEnd}
              onTableRotateEnd={handleTableRotateEnd}
              onItemRotateEnd={handleItemRotateEnd}
              onUnassign={handleUnassign}
            />
          )}

          {visibleTables.length > 0 && (
            <div className="mt-6">
              <h3 className="font-display text-lg font-semibold text-forest">Tables</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {visibleTables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    assignedGuests={guestsByTable.get(table.id) ?? []}
                  />
                ))}
              </div>
            </div>
          )}

          {visibleItems.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-lg font-semibold text-forest">Layout items</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {visibleItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
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
