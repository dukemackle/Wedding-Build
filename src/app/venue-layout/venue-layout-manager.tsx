"use client";

import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
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
  assignGuestsTable,
  duplicateSeatingTable,
  renameSeatingTable,
  updateTablePosition,
} from "@/app/seating/actions";
import { addRoom, deleteRoom } from "./room-actions";
import {
  addLayoutItem,
  updateLayoutItem,
  deleteLayoutItem,
  updateLayoutItemPosition,
  duplicateLayoutItem,
  renameLayoutItem,
} from "@/app/floor-plan/actions";
import { groupGuests, guestSideColor, sideTheme, type SideTheme } from "@/lib/guest-groups";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  ITEM_TYPE_DIMENSIONS,
  MAX_ITEM_SIZE,
  MIN_ITEM_SIZE,
  clamp,
  itemDimensions,
  tableFootprint,
} from "@/lib/venue-layout-geometry";

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

function personCount(guest: Guest) {
  return 1 + (guest.plus_one ? 1 : 0);
}

// Seating includes anyone not explicitly declined (some guests show up
// without RSVPing), so a not-yet-confirmed guest gets a small status hint
// wherever their name appears -- confirmed guests show cleanly as-is.
function guestStatusHint(guest: Guest) {
  return guest.status === "confirmed" ? "" : ` (${guest.status})`;
}

// The table's on-canvas footprint is derived from its shape + capacity
// (no separate size field to keep in sync) -- more seats draws a bigger
// shape, a rectangle grows mostly in width like a real banquet table.
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

function normalizeRotation(value: number) {
  return ((Math.round(value) % 360) + 360) % 360;
}

/**
 * Text inside a shape turned past a quarter-turn would read upside down --
 * a bar rotated 180 degrees came out as "ɹɐq" -- so the label flips back.
 */
function uprightLabelStyle(rotation: number): React.CSSProperties | undefined {
  const r = normalizeRotation(rotation);
  return r > 90 && r <= 270 ? { transform: "rotate(180deg)" } : undefined;
}

// Drag this handle around the shape's center to rotate it -- hold Shift
// to snap to 15-degree steps. Rendered as a child of the rotated shape so
// it turns along with it. It sits on the opposite edge from the toolbar so
// the two never overlap.
function RotateHandle({
  containerRef,
  edge,
  scale,
  onRotate,
  onRotateEnd,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  edge: "top" | "bottom";
  scale: number;
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
    // Angle of the pointer measured from whichever edge the handle sits on,
    // so grabbing it doesn't make the shape jump half a turn.
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI + (edge === "bottom" ? 180 : 0);
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
      // Scaled by the inverse of the canvas scale, like the toolbar, so it is
      // the same size on screen however far the plan has been shrunk to fit.
      style={{
        position: "absolute",
        [edge]: -(36 + 10 / scale),
        left: "50%",
        transform: `translateX(-50%) scale(${1 / scale})`,
        transformOrigin: `center ${edge === "top" ? "bottom" : "top"}`,
        touchAction: "none",
      }}
      aria-label="Drag to rotate"
      title="Drag to rotate (hold Shift to snap)"
      className="flex h-9 w-9 cursor-grab items-center justify-center rounded-full border-2 border-forest bg-parchment text-forest shadow-sm active:cursor-grabbing"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 3v6h-6" />
      </svg>
    </div>
  );
}

/**
 * Drag the bottom-right corner to resize. Deltas are divided by the canvas
 * scale so a pixel of finger travel is a pixel of plan, whatever the canvas
 * has been scaled to fit, and turned into the shape's own axes so a rotated
 * shape grows the way the handle is dragged rather than sideways.
 *
 * `lockAspect` keeps round and square tables round and square.
 */
function ResizeHandle({
  width,
  height,
  scale,
  rotation,
  lockAspect = false,
  onResize,
  onResizeEnd,
}: {
  width: number;
  height: number;
  scale: number;
  rotation: number;
  lockAspect?: boolean;
  onResize: (width: number, height: number) => void;
  onResizeEnd: (width: number, height: number) => void;
}) {
  const startRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const latestRef = useRef({ width, height });

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, w: width, h: height };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!startRef.current) return;
    e.stopPropagation();
    const dx = (e.clientX - startRef.current.x) / scale;
    const dy = (e.clientY - startRef.current.y) / scale;
    const radians = (rotation * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    let localX = dx * cos + dy * sin;
    let localY = -dx * sin + dy * cos;
    if (lockAspect) {
      localX = localY = (localX + localY) / 2;
    }
    const next = {
      width: clamp(Math.round(startRef.current.w + localX), MIN_ITEM_SIZE, MAX_ITEM_SIZE),
      height: clamp(Math.round(startRef.current.h + localY), MIN_ITEM_SIZE, MAX_ITEM_SIZE),
    };
    latestRef.current = next;
    onResize(next.width, next.height);
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!startRef.current) return;
    e.stopPropagation();
    startRef.current = null;
    onResizeEnd(latestRef.current.width, latestRef.current.height);
  }

  return (
    <span
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="button"
      aria-label="Resize"
      title="Drag to resize"
      style={{
        position: "absolute",
        right: -12,
        bottom: -12,
        transform: `scale(${1 / scale})`,
        transformOrigin: "center",
        touchAction: "none",
      }}
      className="z-10 h-6 w-6 cursor-nwse-resize rounded-sm border-2 border-forest bg-card shadow-sm"
    />
  );
}

const toolbarButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-forest/10 hover:text-forest";

function ToolbarIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/**
 * The actions for whatever is selected, floating just above it.
 *
 * It lives outside the rotated shape so it always reads upright, and is
 * scaled by the inverse of the canvas scale so the buttons stay finger-sized
 * however small the plan has been shrunk to fit the screen.
 */
function NodeToolbar({
  name,
  placeholder,
  scale,
  below,
  align,
  onRename,
  onDuplicate,
  onRotate90,
  onDelete,
}: {
  name: string;
  placeholder: string;
  scale: number;
  below: boolean;
  /** Which edge of the shape the toolbar lines up with, so it stays on screen. */
  align: "left" | "center" | "right";
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onRotate90: () => void;
  onDelete: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(name);

  function commit() {
    setRenaming(false);
    if (draft.trim() !== name) onRename(draft.trim());
  }

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        ...(align === "left" ? { left: 0 } : align === "right" ? { right: 0 } : { left: "50%" }),
        [below ? "top" : "bottom"]: `calc(100% + ${14 / scale}px)`,
        transform: `${align === "center" ? "translateX(-50%) " : ""}scale(${1 / scale})`,
        transformOrigin: `${below ? "top" : "bottom"} ${align}`,
        zIndex: 20,
      }}
      className="flex items-center gap-0.5 whitespace-nowrap rounded-full border border-hairline bg-card p-1 shadow-md"
    >
      {renaming ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commit();
          }}
          className="flex items-center gap-1 pl-2"
        >
          <input
            autoFocus
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setDraft(name);
                setRenaming(false);
              }
            }}
            className="w-40 rounded-md border border-hairline bg-parchment px-2 py-1 text-sm text-ink outline-none focus:border-forest"
          />
          <button
            type="submit"
            className="rounded-full bg-forest px-3 py-1.5 text-sm text-parchment hover:bg-forest/90"
          >
            Save
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              setDraft(name);
              setRenaming(true);
            }}
            className={toolbarButtonClass}
            aria-label="Rename"
            title="Rename"
          >
            <ToolbarIcon>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </ToolbarIcon>
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className={toolbarButtonClass}
            aria-label="Duplicate"
            title="Duplicate"
          >
            <ToolbarIcon>
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
            </ToolbarIcon>
          </button>
          <button
            type="button"
            onClick={onRotate90}
            className={toolbarButtonClass}
            aria-label="Rotate 90 degrees"
            title="Rotate 90°"
          >
            <ToolbarIcon>
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 3v6h-6" />
            </ToolbarIcon>
          </button>
          <span className="mx-0.5 h-5 w-px bg-hairline" />
          <button
            type="button"
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-full text-red-700 transition-colors hover:bg-red-50"
            aria-label="Delete"
            title="Delete"
          >
            <ToolbarIcon>
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </ToolbarIcon>
          </button>
        </>
      )}
    </div>
  );
}

// Guests dragged out of the side panel carry their ids under this type, so a
// table only lights up for a guest drag and not for, say, a dragged image.
const GUEST_DRAG_TYPE = "application/x-wren-guests";

/**
 * Moving, clicking and the selected-state chrome, shared by tables and items.
 *
 * The outer box is positioned but never rotated -- the toolbar hangs off it
 * and should read upright. The shape itself is the rotated child.
 */
function useDraggable({
  x,
  y,
  width,
  height,
  scale,
  onTap,
  onDragEnd,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  onTap: () => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const [pos, setPos] = useState({ x, y });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );
  const movedRef = useRef(false);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    movedRef.current = false;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    // Screen pixels into plan units -- the canvas is scaled to fit its width.
    const dx = (e.clientX - dragRef.current.startX) / scale;
    const dy = (e.clientY - dragRef.current.startY) / scale;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
    setPos({
      x: clamp(dragRef.current.origX + dx, 0, CANVAS_WIDTH - width),
      y: clamp(dragRef.current.origY + dy, 0, CANVAS_HEIGHT - height),
    });
  }

  function onPointerUp() {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (movedRef.current) {
      onDragEnd(pos.x, pos.y);
    } else {
      onTap();
    }
  }

  return { pos, handlers: { onPointerDown, onPointerMove, onPointerUp } };
}

// Roughly the toolbar's on-screen width; near an edge of the visible plan it
// lines up with that side of the shape instead of hanging off the screen.
const TOOLBAR_HALF_WIDTH = 100;

function toolbarAlign(x: number, width: number, scale: number, viewportWidth: number) {
  const center = (x + width / 2) * scale;
  if (center < TOOLBAR_HALF_WIDTH) return "left";
  if (center > viewportWidth - TOOLBAR_HALF_WIDTH) return "right";
  return "center";
}

type NodeActions = {
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onRotateEnd: (rotation: number) => void;
  onDelete: () => void;
};

function TableNode({
  table,
  assignedGuests,
  isSelected,
  seatingArmed,
  scale,
  viewportWidth,
  onTap,
  onDragEnd,
  onUnassign,
  onDropGuests,
  onResizeEnd,
  actions,
}: {
  table: SeatingTable;
  assignedGuests: Guest[];
  isSelected: boolean;
  /** Guests are picked in the side panel, so a tap seats them here. */
  seatingArmed: boolean;
  scale: number;
  viewportWidth: number;
  onTap: () => void;
  onDragEnd: (x: number, y: number) => void;
  onUnassign: (guestId: string) => void;
  onDropGuests: (guestIds: string[]) => void;
  onResizeEnd: (width: number, height: number) => void;
  actions: NodeActions;
}) {
  const [size, setSize] = useState(() => tableFootprint(table));
  const { width, height } = size;
  const [rotation, setRotation] = useState(table.rotation);
  const [dropHover, setDropHover] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pos, handlers } = useDraggable({
    x: table.position_x,
    y: table.position_y,
    width,
    height,
    scale,
    onTap,
    onDragEnd,
  });

  const occupied = assignedGuests.reduce((sum, g) => sum + personCount(g), 0);
  const overCapacity = table.capacity != null && occupied > table.capacity;
  const full = table.capacity != null && occupied === table.capacity;
  const toolbarBelow = pos.y * scale < 60;

  const ringClass = dropHover
    ? "border-forest bg-forest/10 ring-4 ring-forest/30"
    : isSelected
      ? "border-forest ring-2 ring-forest/30"
      : seatingArmed
        ? "border-forest/60 border-dashed"
        : overCapacity
          ? "border-red-700/60"
          : full
            ? "border-forest/50"
            : "border-hairline";

  return (
    <div
      ref={containerRef}
      {...handlers}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes(GUEST_DRAG_TYPE)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDropHover(true);
      }}
      onDragLeave={() => setDropHover(false)}
      onDrop={(e) => {
        setDropHover(false);
        const raw = e.dataTransfer.getData(GUEST_DRAG_TYPE);
        if (!raw) return;
        e.preventDefault();
        try {
          const ids = JSON.parse(raw) as string[];
          if (ids.length) onDropGuests(ids);
        } catch {
          // Not ours -- ignore.
        }
      }}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width,
        height,
        touchAction: "none",
        zIndex: isSelected ? 10 : undefined,
      }}
      className={seatingArmed ? "cursor-copy" : "cursor-grab active:cursor-grabbing"}
    >
      <div
        style={{ transform: `rotate(${rotation}deg)` }}
        className={`relative flex h-full w-full select-none flex-col items-center justify-center gap-1 border-2 bg-card p-2 text-center shadow-sm ${shapeClassName(table.shape)} ${ringClass}`}
      >
        {isSelected && (
          <>
            <RotateHandle
              containerRef={containerRef}
              edge={toolbarBelow ? "top" : "bottom"}
              scale={scale}
              onRotate={setRotation}
              onRotateEnd={actions.onRotateEnd}
            />
            <ResizeHandle
              width={width}
              height={height}
              scale={scale}
              rotation={rotation}
              lockAspect={table.shape !== "rectangle"}
              onResize={(w, h) => setSize({ width: w, height: h })}
              onResizeEnd={onResizeEnd}
            />
          </>
        )}
        <div
          style={uprightLabelStyle(rotation)}
          className="flex max-h-full w-full flex-col items-center justify-center gap-1 overflow-hidden"
        >
        <p className="font-medium text-ink">{table.name}</p>
        <p
          className={`text-xs ${overCapacity ? "text-red-700" : full ? "text-forest" : "text-ink/50"}`}
        >
          {occupied}
          {table.capacity != null ? ` / ${table.capacity}` : ""} {full ? "· full" : "seated"}
        </p>
        <div className="flex max-h-full flex-wrap items-center justify-center gap-1 overflow-y-auto px-1">
          {assignedGuests.map((guest) => (
            <span
              key={guest.id}
              className="flex items-center gap-1 rounded-full border border-hairline bg-parchment px-1.5 py-0.5 text-[11px] text-ink"
            >
              {guest.name}
              {guest.plus_one && <span className="text-ink/40">+1</span>}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onUnassign(guest.id);
                }}
                className="text-ink/40 hover:text-red-700"
                aria-label={`Unseat ${guest.name}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        </div>
      </div>
      {isSelected && (
        <NodeToolbar
          name={table.name}
          placeholder="Table name"
          scale={scale}
          below={toolbarBelow}
          align={toolbarAlign(pos.x, width, scale, viewportWidth)}
          onRename={(name) => name && actions.onRename(name)}
          onDuplicate={actions.onDuplicate}
          onRotate90={() => {
            const next = normalizeRotation(rotation + 90);
            setRotation(next);
            actions.onRotateEnd(next);
          }}
          onDelete={actions.onDelete}
        />
      )}
    </div>
  );
}

function ItemNode({
  item,
  isSelected,
  scale,
  viewportWidth,
  onTap,
  onDragEnd,
  onResizeEnd,
  actions,
}: {
  item: VenueLayoutItem;
  isSelected: boolean;
  scale: number;
  viewportWidth: number;
  onTap: () => void;
  onDragEnd: (x: number, y: number) => void;
  onResizeEnd: (width: number, height: number) => void;
  actions: NodeActions;
}) {
  const [size, setSize] = useState(() => itemDimensions(item));
  const [rotation, setRotation] = useState(item.rotation);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pos, handlers } = useDraggable({
    x: item.position_x,
    y: item.position_y,
    width: size.width,
    height: size.height,
    scale,
    onTap,
    onDragEnd,
  });
  const toolbarBelow = pos.y * scale < 60;

  return (
    <div
      ref={containerRef}
      {...handlers}
      style={{
        position: "absolute",
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        touchAction: "none",
        zIndex: isSelected ? 10 : undefined,
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      {/* The handles hang outside the shape, so it must not clip -- only the
          label inside does. Clipping the whole box is what used to hide the
          rotate/delete/resize handles on chairs and every other item. */}
      <div
        style={{ transform: `rotate(${rotation}deg)` }}
        className={`relative h-full w-full select-none rounded-lg border-2 text-sm shadow-sm ${ITEM_TYPE_COLORS[item.item_type]} ${isSelected ? "ring-2 ring-forest/40" : ""}`}
      >
        <div
          style={uprightLabelStyle(rotation)}
          className="flex h-full w-full flex-col items-center justify-center overflow-hidden p-2 text-center"
        >
          <p className="font-medium text-ink">{itemDisplayName(item)}</p>
          {item.label && (
            <p className="text-xs text-ink/50">{ITEM_TYPE_LABELS[item.item_type]}</p>
          )}
        </div>
        {isSelected && (
          <>
            <RotateHandle
              containerRef={containerRef}
              edge={toolbarBelow ? "top" : "bottom"}
              scale={scale}
              onRotate={setRotation}
              onRotateEnd={actions.onRotateEnd}
            />
            <ResizeHandle
              width={size.width}
              height={size.height}
              scale={scale}
              rotation={rotation}
              onResize={(width, height) => setSize({ width, height })}
              onResizeEnd={onResizeEnd}
            />
          </>
        )}
      </div>
      {isSelected && (
        <NodeToolbar
          name={item.label ?? ""}
          placeholder={ITEM_TYPE_LABELS[item.item_type]}
          scale={scale}
          below={toolbarBelow}
          align={toolbarAlign(pos.x, size.width, scale, viewportWidth)}
          onRename={actions.onRename}
          onDuplicate={actions.onDuplicate}
          onRotate90={() => {
            const next = normalizeRotation(rotation + 90);
            setRotation(next);
            actions.onRotateEnd(next);
          }}
          onDelete={actions.onDelete}
        />
      )}
    </div>
  );
}

/**
 * The plan, scaled to fit whatever width it is given.
 *
 * The coordinate space is a fixed CANVAS_WIDTH x CANVAS_HEIGHT field, and the
 * whole thing is scaled so that field fills the available width. A wide screen
 * therefore shows the entire venue at once with no scrollbars.
 *
 * A CSS transform doesn't change an element's layout size, so the scaled plan
 * sits inside a box sized to its scaled footprint. Without that box the frame
 * still measured the plan at its full 1600x900 and scrolled both ways -- a
 * scrollbar under a plan that already fit, and a scroll-wheel that moved the
 * plan instead of the page.
 *
 * On a phone the plan stops shrinking at a legible floor and the frame pans
 * sideways instead. Wider than that, nothing scrolls, and the frame lets
 * handles and toolbars hang past its edge rather than clipping them -- a
 * rotate handle on something against the top wall used to be unreachable.
 */
// Below this the plan is too small to grab things on, so a phone pans instead.
const MIN_CANVAS_SCALE = 0.34;

function VenueCanvas({
  tables,
  items,
  guestsByTable,
  selectedTableId,
  selectedItemId,
  seatingArmed,
  onTapTable,
  onTapItem,
  onClearSelection,
  onTableDragEnd,
  onItemDragEnd,
  onItemResizeEnd,
  onTableResizeEnd,
  onUnassign,
  onDropGuests,
  tableActions,
  itemActions,
}: {
  tables: SeatingTable[];
  items: VenueLayoutItem[];
  guestsByTable: Map<string, Guest[]>;
  selectedTableId: string | null;
  selectedItemId: string | null;
  seatingArmed: boolean;
  onTapTable: (id: string) => void;
  onTapItem: (id: string) => void;
  onClearSelection: () => void;
  onTableDragEnd: (id: string, x: number, y: number) => void;
  onItemDragEnd: (id: string, x: number, y: number) => void;
  onItemResizeEnd: (id: string, width: number, height: number) => void;
  onTableResizeEnd: (id: string, width: number, height: number) => void;
  onUnassign: (guestId: string) => void;
  onDropGuests: (tableId: string, guestIds: string[]) => void;
  tableActions: (table: SeatingTable) => NodeActions;
  itemActions: (item: VenueLayoutItem) => NodeActions;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(CANVAS_WIDTH);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    function measure() {
      const width = frame?.clientWidth ?? 0;
      if (!width) return;
      setViewportWidth(width);
      // Floored so a phone still gets something legible rather than a
      // postage stamp; below the floor the frame pans instead.
      setScale(clamp(width / CANVAS_WIDTH, MIN_CANVAS_SCALE, 1.2));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const pans = viewportWidth < CANVAS_WIDTH * MIN_CANVAS_SCALE;

  return (
    <div
      ref={frameRef}
      className={`w-full rounded-lg border border-hairline bg-parchment ${pans ? "overflow-x-auto" : ""}`}
    >
      <div
        style={{
          position: "relative",
          width: Math.floor(CANVAS_WIDTH * scale),
          height: Math.floor(CANVAS_HEIGHT * scale),
        }}
      >
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClearSelection();
        }}
        style={{
          position: "relative",
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {items.map((item) => (
          <ItemNode
            key={`${item.id}-${item.position_x}-${item.position_y}-${item.rotation}-${item.width}-${item.height}`}
            item={item}
            isSelected={item.id === selectedItemId}
            scale={scale}
            viewportWidth={viewportWidth}
            onTap={() => onTapItem(item.id)}
            onDragEnd={(x, y) => onItemDragEnd(item.id, x, y)}
            onResizeEnd={(width, height) => onItemResizeEnd(item.id, width, height)}
            actions={itemActions(item)}
          />
        ))}
        {tables.map((table) => (
          <TableNode
            key={`${table.id}-${table.position_x}-${table.position_y}-${table.rotation}-${table.width}-${table.height}-${table.shape}-${table.capacity}`}
            table={table}
            assignedGuests={guestsByTable.get(table.id) ?? []}
            isSelected={table.id === selectedTableId}
            seatingArmed={seatingArmed}
            scale={scale}
            viewportWidth={viewportWidth}
            onTap={() => onTapTable(table.id)}
            onDragEnd={(x, y) => onTableDragEnd(table.id, x, y)}
            onUnassign={onUnassign}
            onDropGuests={(ids) => onDropGuests(table.id, ids)}
            onResizeEnd={(width, height) => onTableResizeEnd(table.id, width, height)}
            actions={tableActions(table)}
          />
        ))}
      </div>
      </div>
    </div>
  );
}

/**
 * Everything you can change about whatever is selected on the plan.
 *
 * This replaces the two lists of cards that used to sit under the canvas --
 * one per table and one per layout item. Those got long, and editing a thing
 * meant finding its card rather than clicking the thing itself.
 */
function SelectionPanel({
  table,
  item,
  assignedGuests,
  onUnassign,
  onDeleteTable,
  onDeleteItem,
  onResetTableSize,
}: {
  table: SeatingTable | null;
  item: VenueLayoutItem | null;
  assignedGuests: Guest[];
  onUnassign: (guestId: string) => void;
  onDeleteTable: (table: SeatingTable) => void;
  onDeleteItem: (item: VenueLayoutItem) => void;
  onResetTableSize: (table: SeatingTable) => void;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  if (!table && !item) {
    return (
      <div className="rounded-lg border border-dashed border-hairline bg-parchment p-5 text-sm text-ink/50">
        <p className="font-medium text-ink/70">Nothing selected</p>
        <p className="mt-2">
          Click a table or an item on the plan for its toolbar: rename, duplicate, rotate or
          delete. Drag the round handle to rotate freely, the corner square to resize.
          <span className="hidden sm:inline">
            {" "}
            Shortcuts: Delete, Ctrl/⌘+D to duplicate, Esc to deselect.
          </span>
        </p>
      </div>
    );
  }

  function handleSave(formData: FormData) {
    startTransition(async () => {
      const result = table
        ? await updateSeatingTable(formData)
        : await updateLayoutItem(formData);
      setError(result?.error);
    });
  }

  const size = item ? itemDimensions(item) : null;
  const defaults = item ? ITEM_TYPE_DIMENSIONS[item.item_type] : null;

  return (
    <div className="rounded-lg border border-hairline bg-parchment p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-forest">
          {table ? table.name : item ? itemDisplayName(item) : ""}
        </h3>
        <button
          type="button"
          onClick={() => (table ? onDeleteTable(table) : item && onDeleteItem(item))}
          className="shrink-0 text-sm text-red-800 hover:underline"
        >
          Delete
        </button>
      </div>

      <form action={handleSave} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={table?.id ?? item?.id ?? ""} />
        {table ? (
          <>
            <TableFields table={table} />
            {/* Lets the server tell a shape change apart, which resets a
                dragged-out size that only made sense for the old shape. */}
            <input type="hidden" name="previous_shape" value={table.shape} />
            {/* The server reads rotation off this same form and falls back to
                0 when it is missing, so a saved edit would quietly straighten
                a table you had rotated. */}
            <input type="hidden" name="rotation" value={table.rotation} />
          </>
        ) : (
          item && (
            <>
              <ItemFields item={item} />
              <input type="hidden" name="rotation" value={item.rotation} />
              <div className="grid grid-cols-2 gap-3">
                <label className={labelClass}>
                  Width
                  <input
                    type="number"
                    name="width"
                    min={MIN_ITEM_SIZE}
                    max={MAX_ITEM_SIZE}
                    defaultValue={size?.width}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Height
                  <input
                    type="number"
                    name="height"
                    min={MIN_ITEM_SIZE}
                    max={MAX_ITEM_SIZE}
                    defaultValue={size?.height}
                    className={inputClass}
                  />
                </label>
              </div>
              {defaults && (
                <p className="-mt-1 text-xs text-ink/50">
                  Default for this type is {defaults.width} x {defaults.height}. Dragging the
                  corner handle on the plan changes these too.
                </p>
              )}
            </>
          )
        )}

        {table && table.width != null && (
          <p className="-mt-1 text-xs text-ink/50">
            Resized to {table.width} x {table.height} on the plan.{" "}
            <button
              type="button"
              onClick={() => onResetTableSize(table)}
              className="text-brass hover:underline"
            >
              Fit to seats again
            </button>
          </p>
        )}

        {error && <p className="text-sm text-red-800">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </form>

      {table && (
        <div className="mt-5 border-t border-hairline pt-4">
          <p className="text-sm text-ink/70">
            {assignedGuests.reduce((sum, g) => sum + personCount(g), 0)} / {table.capacity ?? "?"}{" "}
            seated
          </p>
          {assignedGuests.length === 0 ? (
            <p className="mt-2 text-sm text-ink/50">
              No guests yet. Drag names here from the guest list, or tick a few and tap this table.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {assignedGuests.map((guest) => (
                <span
                  key={guest.id}
                  className="flex items-center gap-1.5 rounded-full border border-hairline bg-card px-3 py-1 text-sm text-ink"
                >
                  {guest.name}
                  {guest.plus_one && <span className="text-xs text-ink/50">+1</span>}
                  <button
                    type="button"
                    onClick={() => onUnassign(guest.id)}
                    aria-label={`Unseat ${guest.name}`}
                    className="text-ink/40 transition-colors hover:text-red-800"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type PanelGrouping = "household" | "side" | "type" | "name";

const PANEL_GROUPINGS: { id: PanelGrouping; label: string }[] = [
  { id: "household", label: "Household" },
  { id: "side", label: "Side" },
  { id: "type", label: "Family / friends" },
  { id: "name", label: "A–Z" },
];

type GuestBlock = {
  key: string;
  /** A household name, a side or a type -- null for a guest listed on their own. */
  heading: string | null;
  color?: string;
  guests: Guest[];
};

/**
 * Households are the unit people actually get seated in, so that grouping
 * gives each one a heading you can grab as a whole. A guest with no household
 * is listed on their own rather than lumped under "No household".
 */
function guestBlocks(guests: Guest[], grouping: PanelGrouping, theme: SideTheme): GuestBlock[] {
  if (grouping !== "household") {
    return groupGuests(guests, grouping, theme).map((group) => ({
      key: group.key,
      heading: group.heading,
      color: group.color,
      guests: group.guests,
    }));
  }

  const households = new Map<string, Guest[]>();
  const blocks: GuestBlock[] = [];
  for (const guest of guests) {
    const household = guest.household?.trim();
    if (!household) {
      blocks.push({ key: guest.id, heading: null, guests: [guest] });
      continue;
    }
    const list = households.get(household.toLowerCase());
    if (list) {
      list.push(guest);
    } else {
      const fresh = [guest];
      households.set(household.toLowerCase(), fresh);
      blocks.push({ key: `h:${household.toLowerCase()}`, heading: household, guests: fresh });
    }
  }
  const sortKey = (block: GuestBlock) => block.heading ?? block.guests[0].name;
  return blocks.sort((a, b) =>
    sortKey(a).localeCompare(sortKey(b), undefined, { sensitivity: "base" }),
  );
}

function peopleLabel(count: number) {
  return `${count} ${count === 1 ? "person" : "people"}`;
}

/**
 * Who still needs a seat, grouped so a whole household can be seated at once.
 *
 * Two ways in: drag a guest (or a household heading) onto a table, or tap to
 * pick several and then tap a table. Dragging is the desktop path; tapping is
 * the phone path, where dragging out of a list onto a scaled-down plan is
 * fiddly -- but both work everywhere.
 */
function GuestPanel({
  unassigned,
  totalGuests,
  theme,
  selectedIds,
  onToggle,
}: {
  unassigned: Guest[];
  totalGuests: number;
  theme: SideTheme;
  selectedIds: Set<string>;
  onToggle: (ids: string[], on: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [grouping, setGrouping] = useState<PanelGrouping>("household");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return unassigned;
    return unassigned.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.household ?? "").toLowerCase().includes(q) ||
        (g.plus_one_name ?? "").toLowerCase().includes(q),
    );
  }, [unassigned, query]);

  const blocks = useMemo(() => guestBlocks(filtered, grouping, theme), [filtered, grouping, theme]);
  const unseatedPeople = unassigned.reduce((sum, g) => sum + personCount(g), 0);

  function dragStart(e: React.DragEvent, ids: string[]) {
    e.dataTransfer.setData(GUEST_DRAG_TYPE, JSON.stringify(ids));
    e.dataTransfer.effectAllowed = "move";
  }

  // Dragging a guest who is part of the current pick drags the whole pick;
  // dragging anyone else drags just them.
  function idsForDrag(guest: Guest) {
    return selectedIds.has(guest.id) ? [...selectedIds] : [guest.id];
  }

  return (
    <div className="rounded-lg border border-hairline bg-parchment">
      <div className="border-b border-hairline p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-forest">Guests to seat</h3>
          <span className="font-mono-numbers text-xs text-ink/50">
            {unassigned.length} of {totalGuests} left
          </span>
        </div>
        <p className="mt-1 text-xs text-ink/50">
          Drag a name or a household onto a table — or tap to pick several, then tap a table.
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guests"
          className="mt-3 w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink outline-none focus:border-forest"
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {PANEL_GROUPINGS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGrouping(g.id)}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                grouping === g.id
                  ? "bg-forest text-parchment"
                  : "border border-hairline text-ink/60 hover:border-forest hover:text-forest"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Its own scroll beside the plan on a wide screen; on a phone the page
          is the scroll, and a box-in-a-box would trap the thumb. */}
      <div className="xl:max-h-[60vh] xl:overflow-y-auto">
        {unassigned.length === 0 ? (
          <p className="p-4 text-sm text-ink/60">
            Everyone has a seat{totalGuests > 0 ? " 🎉" : ""}.
          </p>
        ) : blocks.length === 0 ? (
          <p className="p-4 text-sm text-ink/50">No one matches “{query}”.</p>
        ) : (
          blocks.map((block) => {
            const ids = block.guests.map((g) => g.id);
            const allPicked = ids.every((id) => selectedIds.has(id));
            const people = block.guests.reduce((sum, g) => sum + personCount(g), 0);
            return (
              <div key={block.key} className="border-b border-hairline last:border-b-0">
                {block.heading && (
                  <div
                    draggable
                    onDragStart={(e) => dragStart(e, ids)}
                    className="flex cursor-grab items-center justify-between gap-2 bg-card/60 px-4 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => onToggle(ids, !allPicked)}
                      className="flex min-w-0 items-center gap-2 text-left"
                    >
                      <Checkbox checked={allPicked} />
                      {block.color && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: block.color }}
                        />
                      )}
                      <span className="truncate text-sm font-medium text-ink">
                        {block.heading}
                      </span>
                    </button>
                    <span className="shrink-0 font-mono-numbers text-xs text-ink/50">
                      {peopleLabel(people)}
                    </span>
                  </div>
                )}
                {block.guests.map((guest) => {
                  const picked = selectedIds.has(guest.id);
                  return (
                    <div
                      key={guest.id}
                      draggable
                      onDragStart={(e) => dragStart(e, idsForDrag(guest))}
                      className={`flex cursor-grab items-center gap-2 py-2 pr-4 transition-colors ${
                        block.heading ? "pl-8" : "pl-4"
                      } ${picked ? "bg-forest/10" : "hover:bg-card"}`}
                    >
                      <button
                        type="button"
                        onClick={() => onToggle([guest.id], !picked)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <Checkbox checked={picked} />
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: guestSideColor(guest, theme) }}
                        />
                        <span className="truncate text-sm text-ink">{guest.name}</span>
                        {guest.plus_one && <span className="text-xs text-ink/50">+1</span>}
                        {guestStatusHint(guest) && (
                          <span className="truncate text-xs text-ink/40">
                            {guestStatusHint(guest)}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
      {unassigned.length > 0 && (
        <p className="border-t border-hairline px-4 py-2 font-mono-numbers text-xs text-ink/50">
          {peopleLabel(unseatedPeople)} still need a seat
        </p>
      )}
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
        checked ? "border-forest bg-forest text-parchment" : "border-ink/30 bg-card"
      }`}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </span>
  );
}

/**
 * Pinned to the bottom of the screen while guests are picked, so on a phone
 * you can scroll up to the plan and still see what a tap on a table will do.
 */
function SeatingBar({
  guests,
  onClear,
}: {
  guests: Guest[];
  onClear: () => void;
}) {
  if (guests.length === 0) return null;
  const people = guests.reduce((sum, g) => sum + personCount(g), 0);
  const names =
    guests.length <= 2
      ? guests.map((g) => g.name).join(" & ")
      : `${guests.length} guests`;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full bg-forest py-2 pl-5 pr-2 text-sm text-parchment shadow-lg">
        <span className="truncate">
          <span className="font-medium">{names}</span>
          <span className="text-parchment/70"> · {peopleLabel(people)} — tap a table</span>
        </span>
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-full bg-parchment/15 px-3 py-1 text-parchment hover:bg-parchment/25"
        >
          Cancel
        </button>
      </div>
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
  sides,
}: {
  tables: SeatingTable[];
  confirmedGuests: Guest[];
  items: VenueLayoutItem[];
  rooms: VenueRoom[];
  sides: Parameters<typeof sideTheme>[0];
}) {
  const [mode, setMode] = useState<Mode>("whole-venue");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(rooms[0]?.id ?? null);
  const [addFormType, setAddFormType] = useState<"table" | "item" | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pickedGuestIds, setPickedGuestIds] = useState<Set<string>>(() => new Set());
  const [view3D, setView3D] = useState(false);
  const [, startTransition] = useTransition();

  // Seating shows at once rather than after the server round trip, so
  // clearing a household into a table feels like moving cards, not saving a form.
  const [guests, applySeating] = useOptimistic(
    confirmedGuests,
    (state, change: { ids: string[]; tableId: string | null }) =>
      state.map((g) => (change.ids.includes(g.id) ? { ...g, table_id: change.tableId } : g)),
  );

  const theme = useMemo(() => sideTheme(sides), [sides]);
  const activeRoomId = selectedRoomId ?? rooms[0]?.id ?? null;

  const visibleTables =
    mode === "rooms" ? tables.filter((t) => t.room_id === activeRoomId) : tables;
  const visibleItems =
    mode === "seating" ? [] : mode === "rooms" ? items.filter((i) => i.room_id === activeRoomId) : items;

  const guestsByTable = new Map<string, Guest[]>();
  const unassigned: Guest[] = [];
  for (const guest of guests) {
    if (guest.table_id) {
      const list = guestsByTable.get(guest.table_id) ?? [];
      list.push(guest);
      guestsByTable.set(guest.table_id, list);
    } else {
      unassigned.push(guest);
    }
  }

  const selectedTable = tables.find((t) => t.id === selectedTableId) ?? null;
  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null;
  const pickedGuests = unassigned.filter((g) => pickedGuestIds.has(g.id));
  const seatingArmed = pickedGuests.length > 0;

  function seat(guestIds: string[], tableId: string | null) {
    const formData = new FormData();
    for (const id of guestIds) formData.append("guest_id", id);
    formData.set("table_id", tableId ?? "");
    startTransition(async () => {
      applySeating({ ids: guestIds, tableId });
      await assignGuestsTable(formData);
    });
    setPickedGuestIds(new Set());
  }

  function handleUnassign(guestId: string) {
    seat([guestId], null);
  }

  function togglePicked(ids: string[], on: boolean) {
    setPickedGuestIds((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function handleTapTable(tableId: string) {
    if (seatingArmed) {
      seat(
        pickedGuests.map((g) => g.id),
        tableId,
      );
      return;
    }
    setSelectedTableId((current) => (current === tableId ? null : tableId));
    setSelectedItemId(null);
  }

  function handleTapItem(itemId: string) {
    setSelectedItemId((current) => (current === itemId ? null : itemId));
    setSelectedTableId(null);
  }

  function send(action: (formData: FormData) => Promise<unknown>, fields: Record<string, string>) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) formData.set(key, value);
    startTransition(async () => {
      await action(formData);
    });
  }

  function handleTableDragEnd(tableId: string, x: number, y: number) {
    send(updateTablePosition, {
      id: tableId,
      position_x: String(Math.round(x)),
      position_y: String(Math.round(y)),
    });
  }

  function handleItemDragEnd(itemId: string, x: number, y: number) {
    send(updateLayoutItemPosition, {
      id: itemId,
      position_x: String(Math.round(x)),
      position_y: String(Math.round(y)),
    });
  }

  function handleItemResizeEnd(itemId: string, width: number, height: number) {
    send(updateLayoutItemPosition, {
      id: itemId,
      width: String(Math.round(width)),
      height: String(Math.round(height)),
    });
  }

  function handleTableResizeEnd(tableId: string, width: number, height: number) {
    send(updateTablePosition, {
      id: tableId,
      width: String(Math.round(width)),
      height: String(Math.round(height)),
    });
  }

  function handleDeleteTable(table: SeatingTable) {
    if (!confirm(`Delete "${table.name}"? Assigned guests will become unassigned.`)) return;
    if (selectedTableId === table.id) setSelectedTableId(null);
    send(deleteSeatingTable, { id: table.id });
  }

  function handleDeleteItem(item: VenueLayoutItem) {
    if (!confirm(`Delete "${itemDisplayName(item)}"?`)) return;
    if (selectedItemId === item.id) setSelectedItemId(null);
    send(deleteLayoutItem, { id: item.id });
  }

  function tableActions(table: SeatingTable): NodeActions {
    return {
      onRename: (name) => send(renameSeatingTable, { id: table.id, name }),
      onDuplicate: () => send(duplicateSeatingTable, { id: table.id }),
      onRotateEnd: (rotation) =>
        send(updateTablePosition, { id: table.id, rotation: String(rotation) }),
      onDelete: () => handleDeleteTable(table),
    };
  }

  function itemActions(item: VenueLayoutItem): NodeActions {
    return {
      onRename: (label) => send(renameLayoutItem, { id: item.id, label }),
      onDuplicate: () => send(duplicateLayoutItem, { id: item.id }),
      onRotateEnd: (rotation) =>
        send(updateLayoutItemPosition, { id: item.id, rotation: String(rotation) }),
      onDelete: () => handleDeleteItem(item),
    };
  }

  // Keyboard shortcuts for whatever is selected: Delete removes it, Ctrl/Cmd+D
  // copies it, Escape lets go of it (and of any picked guests). Ignored while
  // typing, so renaming a table called "Dad" doesn't delete it.
  const shortcutsRef = useRef({ selectedTable, selectedItem, tableActions, itemActions });
  useEffect(() => {
    shortcutsRef.current = { selectedTable, selectedItem, tableActions, itemActions };
  });
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const { selectedTable, selectedItem, tableActions, itemActions } = shortcutsRef.current;
      const actions = selectedTable
        ? tableActions(selectedTable)
        : selectedItem
          ? itemActions(selectedItem)
          : null;

      if (e.key === "Escape") {
        setSelectedTableId(null);
        setSelectedItemId(null);
        setPickedGuestIds(new Set());
        return;
      }
      if (!actions) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        actions.onDelete();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        actions.onDuplicate();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const hasContent = visibleTables.length > 0 || visibleItems.length > 0;
  const canAdd = mode !== "rooms" || activeRoomId != null;
  const formRoomId = mode === "rooms" ? (activeRoomId ?? undefined) : undefined;
  const showGuests = guests.length > 0 && tables.length > 0;

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Venue layout</h2>
          <p className="mt-1 text-sm text-ink/70">
            {mode === "seating"
              ? guests.length === 0
                ? "No guests yet — add guests on the Guests page, then come back to seat them."
                : `${unassigned.length} of ${guests.length} guests still unassigned.`
              : mode === "rooms"
                ? "Plan each space separately — switch rooms below."
                : "Everything in one shared space."}{" "}
            Drag anything to move it; click it to rename, duplicate, rotate or delete.
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
      ) : view3D ? (
        <VenueLayout3DView tables={visibleTables} items={visibleItems} />
      ) : (
        // Wide screen: the plan, with a side column holding what's selected
        // above the guests still to seat, so dragging a guest onto a table is
        // a short sideways move. Phone: plan, then selection, then guests,
        // one column -- with the pinned bar standing in for the drag.
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1 xl:sticky xl:top-4">
            <VenueCanvas
              tables={visibleTables}
              items={visibleItems}
              guestsByTable={guestsByTable}
              selectedTableId={selectedTableId}
              selectedItemId={selectedItemId}
              seatingArmed={seatingArmed}
              onTapTable={handleTapTable}
              onTapItem={handleTapItem}
              onClearSelection={() => {
                setSelectedTableId(null);
                setSelectedItemId(null);
              }}
              onTableDragEnd={handleTableDragEnd}
              onItemDragEnd={handleItemDragEnd}
              onItemResizeEnd={handleItemResizeEnd}
              onTableResizeEnd={handleTableResizeEnd}
              onUnassign={handleUnassign}
              onDropGuests={(tableId, ids) => seat(ids, tableId)}
              tableActions={tableActions}
              itemActions={itemActions}
            />
          </div>
          <div className="flex w-full shrink-0 flex-col gap-4 xl:w-80">
            <SelectionPanel
              key={selectedTable?.id ?? selectedItem?.id ?? "none"}
              table={selectedTable}
              item={selectedItem}
              assignedGuests={selectedTable ? (guestsByTable.get(selectedTable.id) ?? []) : []}
              onUnassign={handleUnassign}
              onDeleteTable={handleDeleteTable}
              onDeleteItem={handleDeleteItem}
              onResetTableSize={(table) =>
                send(updateTablePosition, { id: table.id, width: "", height: "" })
              }
            />
            {showGuests && (
              <GuestPanel
                  unassigned={unassigned}
                  totalGuests={guests.length}
                  theme={theme}
                  selectedIds={pickedGuestIds}
                onToggle={togglePicked}
              />
            )}
          </div>
        </div>
      )}

      {!view3D && (
        <SeatingBar guests={pickedGuests} onClear={() => setPickedGuestIds(new Set())} />
      )}
    </div>
  );
}
