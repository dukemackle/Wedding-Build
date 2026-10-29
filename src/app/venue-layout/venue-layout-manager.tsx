"use client";

import { createContext, useContext, useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  Guest,
  LayoutItemType,
  LayoutPhase,
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
  splitPlusOne,
  updateTablePosition,
  setTableDecor,
} from "@/app/seating/actions";
import { addRoom, deleteRoom, setRoomStyle } from "./room-actions";
import { addPhase, copyPhaseLayout, deletePhase, setNodePhase } from "./phase-actions";
import { VENUE_FIXTURE_TYPES, defaultPhaseId, inPhase, sortPhases } from "@/lib/layout-phases";
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
  ROW_PITCH,
  chairBlock,
  chairSize,
  clamp,
  planHeight,
  itemDimensions,
  tableFootprint,
} from "@/lib/venue-layout-geometry";
import { planCanvas, planSizeLabel, roomPlan, type PlanShape } from "@/lib/venue-plans";
import { PageHeader, PlusIcon } from "@/components/page-header";
import { CheckIcon } from "@/components/icons";
import { BirdCheer } from "@/components/bird-cheer";
import {
  CENTERPIECE_LABELS,
  LINENS,
  ROOM_STYLES,
  STYLE_DEFAULTS,
  chairPositions,
  initials,
  inkOn,
  roomStyle as toRoomStyle,
  tableCenterpiece,
  tableLinen,
  type RoomStyle,
} from "@/lib/layout-styles";
import { Centerpiece, RoomBackdrop, itemSurface } from "./room-art";
import { LayoutTemplatePicker, SeatTheRest } from "./layout-helpers";

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
  const label = item.label?.trim();
  if (label) return label;
  // A block of chairs says how many it seats, which follows its size.
  if (item.item_type === "chairs") return `${chairBlock(itemDimensions(item)).seats} chairs`;
  return ITEM_TYPE_LABELS[item.item_type];
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

function AddTableForm({
  onDone,
  roomId,
  phaseId,
}: {
  onDone: () => void;
  roomId?: string;
  phaseId?: string;
}) {
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
      {phaseId && <input type="hidden" name="phase_id" value={phaseId} />}
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

function AddItemForm({
  onDone,
  roomId,
  phase,
}: {
  onDone: () => void;
  roomId?: string;
  phase?: LayoutPhase;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  // The house or the parking is there whatever the event, so those start
  // ticked; a bar or a dance floor starts as this event's only.
  const [everyPhase, setEveryPhase] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    if (everyPhase) formData.delete("phase_id");
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
      onChange={(e) => {
        const target = e.target as unknown as HTMLSelectElement;
        if (target.name === "item_type") {
          setEveryPhase(VENUE_FIXTURE_TYPES.includes(target.value as LayoutItemType));
        }
      }}
      className="mb-6 rounded-lg border border-hairline bg-parchment p-6"
    >
      <p className="mb-3 font-medium text-ink">Add a furniture / layout item</p>
      {roomId && <input type="hidden" name="room_id" value={roomId} />}
      {phase && <input type="hidden" name="phase_id" value={phase.id} />}
      <ItemFields />
      {phase && (
        <label className="mt-3 flex items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={everyPhase}
            onChange={(e) => setEveryPhase(e.target.checked)}
            className="mt-0.5 accent-forest"
          />
          <span>
            Part of the venue
            <span className="block text-xs text-ink/60">
              Shows in every event. Leave unticked to add it to the {phase.name.toLowerCase()} only.
            </span>
          </span>
        </label>
      )}
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
/**
 * Which edge of the shape the rotate handle sits on. It is a child of the
 * rotated shape, so on something turned past a quarter-turn its "bottom" ends
 * up on top -- right under the toolbar, where a grab for the handle hit
 * Duplicate instead. Flipping it keeps it on the far side from the toolbar.
 *
 * Read from the saved rotation, not the live one, so the handle doesn't jump
 * to the other edge halfway through a drag.
 */
function rotateHandleEdge(toolbarBelow: boolean, savedRotation: number): "top" | "bottom" {
  const r = normalizeRotation(savedRotation);
  const flipped = r > 90 && r <= 270;
  return toolbarBelow !== flipped ? "top" : "bottom";
}

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

// The plan's current size, for clamping drags. Drags may go a little past
// the bottom, which makes the room longer -- how a couple adds floor. A room
// copied from a venue's floor plan has real walls, so it doesn't grow.
const PlanSizeContext = createContext({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, grows: true });
const GROW_ROOM = 150;

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
  const room = useContext(PlanSizeContext);
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
      x: clamp(dragRef.current.origX + dx, 0, room.width - width),
      y: clamp(dragRef.current.origY + dy, 0, room.height + (room.grows ? GROW_ROOM : 0) - height),
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

/** One chair's worth of a table: a guest, their +1, or an empty seat. */
type Seat = { key: string; name: string; color: string; settle: boolean } | null;

function tableSeats(
  guests: Guest[],
  capacity: number | null,
  theme: SideTheme,
  justSeated: Set<string>,
): Seat[] {
  const people: Seat[] = guests.flatMap((g) => {
    const color = guestSideColor(g, theme);
    const settle = justSeated.has(g.id);
    const seat = { key: g.id, name: g.name, color, settle };
    return g.plus_one
      ? [seat, { key: `${g.id}+1`, name: g.plus_one_name || `${g.name}'s +1`, color, settle }]
      : [seat];
  });
  const empty = Math.max(0, (capacity ?? 0) - people.length);
  return [...people, ...Array.from({ length: empty }, () => null)];
}

// The plan is drawn at ~0.6x on a laptop, so chairs and their initials are
// sized to still read there (CHAIR, 30); a shrunk table's are smaller.

/**
 * The chairs round a table. Each sits in the table's own (rotating) box, with
 * the guest's initials kept upright on top so they read at any angle.
 */
function TableChairs({
  shape,
  width,
  height,
  seats,
  rotation,
  chairColor,
  chair,
}: {
  shape: TableShape;
  width: number;
  height: number;
  seats: Seat[];
  rotation: number;
  chairColor: string;
  chair: number;
}) {
  const spots = chairPositions(shape, width, height, seats.length, chair / 2 + 4);
  return (
    <>
      {spots.map((spot, i) => {
        const seat = seats[i];
        return (
          <div
            key={seat?.key ?? `empty-${i}`}
            className="pointer-events-none absolute"
            style={{ left: spot.x - chair / 2, top: spot.y - chair / 2, width: chair, height: chair }}
          >
            <div
              className="absolute inset-0 rounded-[6px] shadow-sm"
              style={{
                transform: `rotate(${spot.angle}deg)`,
                background: chairColor,
                boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.18)",
              }}
            />
            {seat ? (
              <span
                title={seat.name}
                className={`absolute -inset-0.5 grid place-items-center rounded-full border-2 border-white font-semibold leading-none ${seat.settle ? "wren-settle" : ""}`}
                style={{
                  fontSize: Math.round(chair * 0.4),
                  background: seat.color,
                  color: inkOn(seat.color),
                  transform: `rotate(${-rotation}deg)`,
                }}
              >
                {initials(seat.name)}
              </span>
            ) : (
              <span className="absolute inset-[3px] rounded-full border-[1.5px] border-dashed border-white/80" />
            )}
          </div>
        );
      })}
    </>
  );
}

/** How far below its centre a rotated box reaches. */
function rotatedHalfHeight(width: number, height: number, rotation: number) {
  const a = (rotation * Math.PI) / 180;
  return Math.abs((width / 2) * Math.sin(a)) + Math.abs((height / 2) * Math.cos(a));
}

function TableNode({
  table,
  assignedGuests,
  justSeated,
  isSelected,
  seatingArmed,
  scale,
  viewportWidth,
  roomStyle,
  theme,
  onTap,
  onDragEnd,
  onDropGuests,
  onResizeEnd,
  actions,
}: {
  table: SeatingTable;
  assignedGuests: Guest[];
  roomStyle: RoomStyle;
  theme: SideTheme;
  /** Guests seated a moment ago, who bounce into place. */
  justSeated: Set<string>;
  isSelected: boolean;
  /** Guests are picked in the side panel, so a tap seats them here. */
  seatingArmed: boolean;
  scale: number;
  viewportWidth: number;
  onTap: () => void;
  onDragEnd: (x: number, y: number) => void;
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

  const linen = tableLinen(roomStyle, table.linen);
  const seats = tableSeats(assignedGuests, table.capacity, theme, justSeated);
  const chair = chairSize(table);
  const labelTop = height / 2 + rotatedHalfHeight(width, height, rotation) + chair + 10;

  // Selection and drop states take over the cloth's own edge colour.
  const ringClass = dropHover
    ? "border-forest ring-4 ring-forest/30"
    : isSelected
      ? "border-forest ring-4 ring-brass/60"
      : seatingArmed
        ? "border-forest/60 border-dashed"
        : overCapacity
          ? "border-red-700/60"
          : "border-transparent";

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
        className={`relative flex h-full w-full select-none items-center justify-center border-2 shadow-md ${shapeClassName(table.shape)} ${ringClass}`}
      >
        {/* A cloth is drawn as the fill plus a slightly darker hem. */}
        <div
          aria-hidden
          className={`absolute inset-0 ${shapeClassName(table.shape)}`}
          style={{
            background: linen.color,
            boxShadow: `inset 0 0 0 4px ${linen.edge}33`,
            outline: ringClass === "border-transparent" ? `2px solid ${linen.edge}` : undefined,
            outlineOffset: -2,
          }}
        />
        <TableChairs
          shape={table.shape}
          width={width}
          height={height}
          seats={seats}
          rotation={rotation}
          chairColor={STYLE_DEFAULTS[roomStyle].chair}
          chair={chair}
        />
        {/* A long table gets a run of centrepieces down its length. */}
        <div className="pointer-events-none relative flex items-center justify-center">
          {Array.from(
            { length: Math.max(1, Math.min(5, Math.floor(Math.max(width, height) / Math.min(width, height)))) },
            (_, i) => (
              <Centerpiece
                key={i}
                kind={tableCenterpiece(roomStyle, table.centerpiece)}
                size={Math.round(Math.min(width, height) * (width === height ? 0.5 : 0.75))}
              />
            ),
          )}
        </div>
        {isSelected && (
          <>
            <RotateHandle
              containerRef={containerRef}
              edge={rotateHandleEdge(toolbarBelow, table.rotation)}
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
      </div>
      {/* The place card hangs below the chairs and stays upright. */}
      <div
        className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center whitespace-nowrap rounded-full bg-white px-4 py-1 text-center shadow-md"
        style={{ top: labelTop }}
      >
        <span className="max-w-[260px] truncate font-display text-[21px] font-semibold leading-tight text-forest">
          {table.name}
        </span>
        <span
          className={`font-mono-numbers text-[13px] leading-tight ${overCapacity ? "text-red-700" : full ? "text-[#9a6b00]" : "text-ink/50"}`}
        >
          {occupied}
          {table.capacity != null ? `/${table.capacity}` : ""} {full ? "· full" : "seated"}
        </span>
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
  roomStyle,
  onTap,
  onDragEnd,
  onResizeEnd,
  actions,
}: {
  item: VenueLayoutItem;
  isSelected: boolean;
  scale: number;
  viewportWidth: number;
  roomStyle: RoomStyle;
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
  const surface = itemSurface(roomStyle, item.item_type);
  // Chairs draw on their own layer, cut into rows, so the label over them
  // isn't cut up too.
  const chairArt = surface && item.item_type === "chairs" ? surface : null;
  const chairRows = chairArt ? chairBlock(size).rows : 0;

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
        style={{
          transform: `rotate(${rotation}deg)`,
          ...(surface ? { ...(chairArt ? {} : surface.style), borderColor: surface.border } : {}),
        }}
        className={`relative h-full w-full select-none rounded-lg border-2 text-sm ${surface ? "shadow-md" : `shadow-sm ${ITEM_TYPE_COLORS[item.item_type]}`} ${isSelected ? "ring-4 ring-brass/60" : ""}`}
      >
        {chairArt && (
          <div
            aria-hidden
            className="absolute inset-0 rounded-md"
            style={{
              ...chairArt.style,
              ...(chairRows > 1
                ? { maskImage: `repeating-linear-gradient(180deg, #000 0 ${ROW_PITCH - 14}px, transparent ${ROW_PITCH - 14}px ${ROW_PITCH}px)` }
                : {}),
            }}
          />
        )}
        <div
          style={uprightLabelStyle(rotation)}
          className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-2 text-center"
        >
          {surface ? (
            <p
              className={`font-mono-numbers text-sm uppercase tracking-[0.2em] ${chairArt ? "rounded-full bg-forest/85 px-2.5 py-0.5 text-parchment" : ""}`}
              style={chairArt ? undefined : { color: surface.ink }}
            >
              {itemDisplayName(item)}
            </p>
          ) : (
            <>
              <p className="font-medium text-ink">{itemDisplayName(item)}</p>
              {item.label && (
                <p className="text-xs text-ink/50">{ITEM_TYPE_LABELS[item.item_type]}</p>
              )}
            </>
          )}
        </div>
        {isSelected && (
          <>
            <RotateHandle
              containerRef={containerRef}
              edge={rotateHandleEdge(toolbarBelow, item.rotation)}
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
 * The coordinate space is CANVAS_WIDTH wide and planHeight() long (900, more
 * for a big wedding) -- or, for a room copied from a venue's floor plan, the
 * room's real size at WORLD_SCALE a metre -- and the
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
  justSeated,
  selectedTableId,
  selectedItemId,
  seatingArmed,
  roomStyle,
  theme,
  plan,
  onTapTable,
  onTapItem,
  onClearSelection,
  onTableDragEnd,
  onItemDragEnd,
  onItemResizeEnd,
  onTableResizeEnd,
  onDropGuests,
  tableActions,
  itemActions,
}: {
  roomStyle: RoomStyle;
  theme: SideTheme;
  /** The room's floor plan, when it was copied from a venue. */
  plan: PlanShape | null;
  tables: SeatingTable[];
  items: VenueLayoutItem[];
  guestsByTable: Map<string, Guest[]>;
  justSeated: Set<string>;
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
  onDropGuests: (tableId: string, guestIds: string[]) => void;
  tableActions: (table: SeatingTable) => NodeActions;
  itemActions: (item: VenueLayoutItem) => NodeActions;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(CANVAS_WIDTH);
  const floor = useMemo(() => (plan ? planCanvas(plan) : null), [plan]);
  const planWidth = floor?.width ?? CANVAS_WIDTH;
  const hasFloor = floor != null;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    function measure() {
      const width = frame?.clientWidth ?? 0;
      if (!width) return;
      setViewportWidth(width);
      // Floored so a phone still gets something legible rather than a
      // postage stamp; below the floor the frame pans instead.
      // A small venue room may grow past life size to fill the width.
      setScale(clamp(width / planWidth, MIN_CANVAS_SCALE, hasFloor ? 1.6 : 1.2));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [planWidth, hasFloor]);

  const pans = viewportWidth < planWidth * MIN_CANVAS_SCALE;
  const height = planHeight(tables, items, floor?.height);

  return (
    <PlanSizeContext.Provider value={{ width: planWidth, height, grows: !floor }}>
    <div
      ref={frameRef}
      className={`w-full rounded-lg border border-hairline bg-parchment ${pans ? "overflow-x-auto" : ""}`}
    >
      <div
        style={{
          position: "relative",
          width: Math.floor(planWidth * scale),
          height: Math.floor(height * scale),
        }}
      >
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClearSelection();
        }}
        style={{
          position: "relative",
          width: planWidth,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <RoomBackdrop style={roomStyle} width={planWidth} height={height} outline={floor?.corners ?? null} />
        {items.map((item) => (
          <ItemNode
            key={`${item.id}-${item.position_x}-${item.position_y}-${item.rotation}-${item.width}-${item.height}`}
            item={item}
            isSelected={item.id === selectedItemId}
            scale={scale}
            viewportWidth={viewportWidth}
            roomStyle={roomStyle}
            onTap={() => onTapItem(item.id)}
            onDragEnd={(x, y) => onItemDragEnd(item.id, x, y)}
            onResizeEnd={(width, height) => onItemResizeEnd(item.id, width, height)}
            actions={itemActions(item)}
          />
        ))}
        {tables.map((table) => (
          <TableNode
            key={`${table.id}-${table.position_x}-${table.position_y}-${table.rotation}-${table.width}-${table.height}-${table.shape}-${table.capacity}`}
            roomStyle={roomStyle}
            theme={theme}
            table={table}
            assignedGuests={guestsByTable.get(table.id) ?? []}
            justSeated={justSeated}
            isSelected={table.id === selectedTableId}
            seatingArmed={seatingArmed}
            scale={scale}
            viewportWidth={viewportWidth}
            onTap={() => onTapTable(table.id)}
            onDragEnd={(x, y) => onTableDragEnd(table.id, x, y)}
            onDropGuests={(ids) => onDropGuests(table.id, ids)}
            onResizeEnd={(width, height) => onTableResizeEnd(table.id, width, height)}
            actions={tableActions(table)}
          />
        ))}
      </div>
      </div>
    </div>
    </PlanSizeContext.Provider>
  );
}

/**
 * Everything you can change about whatever is selected on the plan.
 *
 * This replaces the two lists of cards that used to sit under the canvas --
 * one per table and one per layout item. Those got long, and editing a thing
 * meant finding its card rather than clicking the thing itself.
 */
/** Cloth colour and centrepiece for the selected table; each tap saves. */
function TableDecor({
  table,
  roomStyle,
  onChange,
}: {
  table: SeatingTable;
  roomStyle: RoomStyle;
  onChange: (field: "linen" | "centerpiece", value: string) => void;
}) {
  const linen = tableLinen(roomStyle, table.linen);
  const piece = tableCenterpiece(roomStyle, table.centerpiece);
  const offered = STYLE_DEFAULTS[roomStyle].centerpieces;
  const pieces = offered.includes(piece) ? offered : [piece, ...offered];
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-hairline pb-5">
      <div>
        <p className="mb-2 text-xs text-ink/60">Table look</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tablecloth">
          {LINENS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onChange("linen", l.id)}
              aria-pressed={l.id === linen.id}
              aria-label={l.label}
              title={l.label}
              className={`h-7 w-7 rounded-full border transition-transform hover:scale-110 ${
                l.id === linen.id ? "ring-2 ring-forest ring-offset-2" : ""
              }`}
              style={{ background: l.color, borderColor: l.edge }}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs text-ink/60">Centrepiece</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Centrepiece">
          {pieces.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange("centerpiece", id)}
              aria-pressed={id === piece}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                id === piece
                  ? "border-forest bg-forest text-parchment"
                  : "border-hairline bg-card text-ink hover:border-forest"
              }`}
            >
              {CENTERPIECE_LABELS[id]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SelectionPanel({
  table,
  item,
  roomStyle,
  onDecor,
  assignedGuests,
  onUnassign,
  onSplitPlusOne,
  onDeleteTable,
  onDeleteItem,
  onResetTableSize,
  phaseControl,
}: {
  phaseControl?: React.ReactNode;
  table: SeatingTable | null;
  item: VenueLayoutItem | null;
  roomStyle: RoomStyle;
  onDecor: (table: SeatingTable, field: "linen" | "centerpiece", value: string) => void;
  assignedGuests: Guest[];
  onUnassign: (guestId: string) => void;
  onSplitPlusOne: (guestId: string) => void;
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

      {phaseControl}

      {table && (
        <TableDecor
          table={table}
          roomStyle={roomStyle}
          onChange={(field, value) => onDecor(table, field, value)}
        />
      )}

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
            // One row per guest rather than chips, so each guest's notes
            // ("keep away from Tom's table") sit right where seating
            // decisions are made, and a +1 can be split off to sit elsewhere.
            <ul className="mt-2 divide-y divide-hairline rounded-md border border-hairline bg-card">
              {assignedGuests.map((guest) => (
                <li key={guest.id} className="flex items-start gap-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      {guest.name}
                      {guest.plus_one && (
                        <span className="text-xs text-ink/50">
                          {" "}
                          +1{guest.plus_one_name ? ` ${guest.plus_one_name}` : ""}
                        </span>
                      )}
                    </p>
                    <GuestNote guest={guest} />
                    {guest.plus_one && (
                      <button
                        type="button"
                        onClick={() => onSplitPlusOne(guest.id)}
                        className="mt-0.5 text-xs text-brass hover:underline"
                      >
                        Seat {guest.plus_one_name || "their +1"} separately
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onUnassign(guest.id)}
                    aria-label={`Unseat ${guest.name}`}
                    className="text-ink/40 transition-colors hover:text-red-800"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
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
  // Wren cheers when the last guest gets a seat -- only on that drop, not
  // every time a fully seated plan is opened.
  const leftBefore = useRef(unassigned.length);
  const [seatedCheer, setSeatedCheer] = useState(0);
  useEffect(() => {
    if (leftBefore.current > 0 && unassigned.length === 0 && totalGuests > 0) setSeatedCheer((n) => n + 1);
    leftBefore.current = unassigned.length;
  }, [unassigned.length, totalGuests]);

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
          <p className="flex items-center gap-2 p-4 text-sm font-medium text-forest">
            {totalGuests > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffd301]">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
            )}
            Everyone has a seat.
            {seatedCheer > 0 && <BirdCheer key={seatedCheer} message="Everyone has a seat!" />}
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
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm text-ink">{guest.name}</span>
                            {guest.plus_one && <span className="text-xs text-ink/50">+1</span>}
                            {guestStatusHint(guest) && (
                              <span className="truncate text-xs text-ink/40">
                                {guestStatusHint(guest)}
                              </span>
                            )}
                          </span>
                          <GuestNote guest={guest} />
                        </span>
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

/**
 * A guest's private notes from the Guests page, shown wherever they're being
 * seated -- that's where "mom and dad's new wife can't share a table" has to
 * be remembered. The seating editor is couple-only, so this never reaches a
 * guest; the printed cards and the guest site leave notes out.
 */
function GuestNote({ guest }: { guest: Guest }) {
  const note = guest.notes?.trim();
  if (!note) return null;
  return (
    <span className="mt-0.5 block line-clamp-2 text-xs italic text-ink/60" title={note}>
      {note}
    </span>
  );
}

/** Guests who declined after they'd been seated, so their seats are free again. */
function DeclinedNotice({
  guests,
  tables,
  onClear,
}: {
  guests: Pick<Guest, "id" | "name" | "table_id">[];
  tables: SeatingTable[];
  onClear: () => void;
}) {
  const tableName = new Map(tables.map((t) => [t.id, t.name]));
  return (
    <div className="mb-4 flex flex-col gap-2 rounded-lg border border-brass/40 bg-parchment px-4 py-3 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
      <p>
        <span className="font-medium">
          {guests.length === 1 ? "1 seated guest has" : `${guests.length} seated guests have`}{" "}
          since declined:
        </span>{" "}
        {guests
          .map((g) => {
            const table = g.table_id ? tableName.get(g.table_id) : undefined;
            return table ? `${g.name} (${table})` : g.name;
          })
          .join(", ")}
        . Their seats are free again.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="shrink-0 self-start rounded-full border border-hairline bg-card px-3 py-1 text-sm text-forest transition-colors hover:border-forest sm:self-auto"
      >
        Got it, clear them
      </button>
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

// The events of the day, in order: each is its own arrangement of the same
// venue. Pills rather than the room tabs' style so the two rows don't read as
// the same control.
function PhaseTabs({
  phases,
  activeId,
  onSelect,
}: {
  phases: LayoutPhase[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      const result = await addPhase(formData);
      setError(result?.error);
      if (!result?.error) setAdding(false);
    });
  }

  function handleDelete(phase: LayoutPhase) {
    if (!confirm(`Delete "${phase.name}"? Its tables and items go with it.`)) return;
    const formData = new FormData();
    formData.set("id", phase.id);
    startTransition(async () => {
      await deletePhase(formData);
    });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Event">
      <span className="mr-1 font-mono-numbers text-xs uppercase tracking-[0.2em] text-ink/50">
        Event
      </span>
      {phases.map((phase) => {
        const active = phase.id === activeId;
        return (
          <div
            key={phase.id}
            className={`flex items-center rounded-full border text-sm transition-colors ${
              active
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-card text-ink hover:border-forest"
            }`}
          >
            <button
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(phase.id)}
              className={`py-1.5 ${phase.kind === "custom" ? "pl-3.5 pr-1.5" : "px-3.5"}`}
            >
              {phase.name}
            </button>
            {phase.kind === "custom" && (
              <button
                onClick={() => handleDelete(phase)}
                disabled={isPending}
                aria-label={`Delete ${phase.name}`}
                className={`pr-2.5 text-xs ${active ? "text-parchment/70 hover:text-parchment" : "text-ink/40 hover:text-red-700"}`}
              >
                &times;
              </button>
            )}
          </div>
        );
      })}
      {adding ? (
        <form action={handleAdd} className="flex items-center gap-2">
          <input
            name="name"
            autoFocus
            maxLength={60}
            placeholder="e.g. Rehearsal dinner"
            className="rounded-full border border-hairline bg-parchment px-3 py-1.5 text-sm text-ink outline-none focus:border-forest"
          />
          <button type="submit" disabled={isPending} className="text-sm font-medium text-forest hover:underline">
            Add
          </button>
          <button type="button" onClick={() => setAdding(false)} className="text-sm text-ink/50 hover:underline">
            Cancel
          </button>
          {error && <span className="text-sm text-red-800">{error}</span>}
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-full border border-dashed border-hairline px-3 py-1.5 text-sm text-ink/60 transition-colors hover:border-forest hover:text-forest"
        >
          + Add event
        </button>
      )}
    </div>
  );
}

// Offered when an event is still empty: start it from another event's
// arrangement rather than placing every table again.
function CopyPhaseOffer({
  target,
  sources,
}: {
  target: LayoutPhase;
  sources: LayoutPhase[];
}) {
  const [isPending, startTransition] = useTransition();

  function copy(source: LayoutPhase) {
    const formData = new FormData();
    formData.set("from_id", source.id);
    formData.set("to_id", target.id);
    startTransition(async () => {
      const result = await copyPhaseLayout(formData);
      if (result?.error) window.alert(`That didn't copy. ${result.error}`);
    });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-hairline bg-parchment px-4 py-3 text-sm text-ink/80">
      <span>Nothing set up for the {target.name.toLowerCase()} yet.</span>
      {sources.map((source) => (
        <button
          key={source.id}
          onClick={() => copy(source)}
          disabled={isPending}
          className="font-medium text-forest hover:underline disabled:opacity-50"
        >
          {isPending ? "Copying..." : `Start from the ${source.name.toLowerCase()}`}
        </button>
      ))}
    </div>
  );
}

// Says which events a selected table or item belongs to, and moves it
// between "this event only" and "part of the venue".
function PhaseScope({
  node,
  kind,
  phase,
  onChange,
}: {
  node: { id: string; phase_id: string | null };
  kind: "table" | "item";
  phase: LayoutPhase;
  onChange: (phaseId: string | null) => void;
}) {
  const everywhere = node.phase_id == null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-card px-3 py-2 text-xs text-ink/70">
      <span>{everywhere ? "In every event (part of the venue)" : `In the ${phase.name.toLowerCase()} only`}</span>
      <button
        type="button"
        onClick={() => onChange(everywhere ? phase.id : null)}
        className="font-medium text-brass hover:underline"
      >
        {everywhere ? `Make it ${phase.name.toLowerCase()} only` : "Show in every event"}
      </button>
      {kind === "table" && everywhere && (
        <span className="basis-full text-ink/50">Guests seated here sit at it in every event.</span>
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

const VIEWS = [
  { id: "plan", label: "Plan" },
  { id: "3d", label: "3D" },
] as const;

// A pill of options with the current one filled in navy -- used for both the
// mode (Seating / Whole Venue / Rooms) and the Plan / 3D view.
function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full border border-hairline bg-parchment p-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={`rounded-full px-3 py-1 font-mono-numbers text-sm transition-colors ${
            value === o.id ? "bg-forest text-parchment" : "text-ink/60 hover:text-forest"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Plain, barn or ballroom: the room the whole plan is drawn in. */
function RoomStylePicker({
  value,
  onChange,
}: {
  value: RoomStyle;
  onChange: (style: RoomStyle) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Room style"
      className="inline-flex items-center gap-1 rounded-full border border-hairline bg-parchment p-1"
    >
      {ROOM_STYLES.map((r) => (
        <button
          key={r.id}
          onClick={() => onChange(r.id)}
          aria-pressed={value === r.id}
          className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-sm transition-colors ${
            value === r.id ? "bg-forest text-parchment" : "text-ink/70 hover:text-forest"
          }`}
        >
          <span
            aria-hidden
            className="h-5 w-5 rounded-full border border-hairline"
            style={{ background: r.swatch }}
          />
          {r.label}
        </button>
      ))}
    </div>
  );
}

/** A gold ring that fills as guests get seats. */
function SeatedRing({ seated, total }: { seated: number; total: number }) {
  const r = 15;
  const length = 2 * Math.PI * r;
  const done = total > 0 ? seated / total : 0;
  return (
    <div className="flex items-center gap-2 text-sm text-ink/70">
      <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" stroke="#eee8d8" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="#FFD301"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${done * length} ${length}`}
          transform="rotate(-90 18 18)"
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <span>
        <span className="font-mono-numbers text-ink">
          {seated} of {total}
        </span>{" "}
        seated
      </span>
    </div>
  );
}

export function VenueLayoutManager({
  tables: storedTables,
  confirmedGuests,
  items,
  rooms,
  phases: storedPhases,
  sides,
  declinedSeated,
  roomStyle: storedRoomStyle,
  initialRoomId = null,
}: {
  roomStyle: string;
  /** Opens on this room in Rooms mode ("Design my wedding here" lands here). */
  initialRoomId?: string | null;
  phases: LayoutPhase[];
  tables: SeatingTable[];
  confirmedGuests: Guest[];
  items: VenueLayoutItem[];
  rooms: VenueRoom[];
  sides: Parameters<typeof sideTheme>[0];
  declinedSeated: Pick<Guest, "id" | "name" | "table_id">[];
}) {
  const openRoom = rooms.find((r) => r.id === initialRoomId) ?? null;
  const [mode, setMode] = useState<Mode>(openRoom ? "rooms" : "whole-venue");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(openRoom?.id ?? rooms[0]?.id ?? null);
  const phases = useMemo(() => sortPhases(storedPhases), [storedPhases]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(() => defaultPhaseId(storedPhases));
  const [addFormType, setAddFormType] = useState<"table" | "item" | "layouts" | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [pickedGuestIds, setPickedGuestIds] = useState<Set<string>>(() => new Set());
  const [justSeated, setJustSeated] = useState<Set<string>>(() => new Set());
  const [view3D, setView3D] = useState(false);
  const [roomStyle, setRoomStyleState] = useState<RoomStyle>(() => toRoomStyle(storedRoomStyle));
  // Cloth and centrepiece picks show at once; the save follows behind.
  const [decor, setDecor] = useState<
    Record<string, Partial<Pick<SeatingTable, "linen" | "centerpiece">>>
  >({});
  const [, startTransition] = useTransition();
  const router = useRouter();
  const tables = storedTables.map((t) => (decor[t.id] ? { ...t, ...decor[t.id] } : t));

  // Seating shows at once rather than after the server round trip, so
  // clearing a household into a table feels like moving cards, not saving a form.
  const [guests, applySeating] = useOptimistic(
    confirmedGuests,
    (state, change: { ids: string[]; tableId: string | null }) =>
      state.map((g) => (change.ids.includes(g.id) ? { ...g, table_id: change.tableId } : g)),
  );

  const theme = useMemo(() => sideTheme(sides), [sides]);
  const activeRoomId = selectedRoomId ?? rooms[0]?.id ?? null;
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;
  // Only Rooms mode draws a venue's real walls; the other views lay every
  // room's furniture on one shared floor.
  const activePlan = useMemo(() => (mode === "rooms" ? roomPlan(activeRoom) : null), [mode, activeRoom]);
  // A deleted event falls back to the default one. With no events at all
  // (a view-only planner on a wedding that predates them) nothing filters.
  const activePhase =
    phases.find((p) => p.id === selectedPhaseId) ??
    phases.find((p) => p.id === defaultPhaseId(phases)) ??
    null;
  const activePhaseId = activePhase?.id ?? null;
  const phaseTables = tables.filter((t) => inPhase(t, activePhaseId));
  const phaseItems = items.filter((i) => inPhase(i, activePhaseId));

  const visibleTables =
    mode === "rooms" ? phaseTables.filter((t) => t.room_id === activeRoomId) : phaseTables;
  const visibleItems =
    mode === "seating"
      ? []
      : mode === "rooms"
        ? phaseItems.filter((i) => i.room_id === activeRoomId)
        : phaseItems;

  // Events with their own furniture, offered as a starting point when the
  // one on screen has none yet.
  const activePhaseEmpty =
    activePhase != null &&
    !tables.some((t) => t.phase_id === activePhase.id) &&
    !items.some((i) => i.phase_id === activePhase.id);
  const copySources = activePhaseEmpty
    ? phases.filter(
        (p) =>
          p.id !== activePhase.id &&
          (tables.some((t) => t.phase_id === p.id) || items.some((i) => i.phase_id === p.id)),
      )
    : [];

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

  const selectedTable = phaseTables.find((t) => t.id === selectedTableId) ?? null;
  const selectedItem = phaseItems.find((i) => i.id === selectedItemId) ?? null;
  const pickedGuests = unassigned.filter((g) => pickedGuestIds.has(g.id));
  const seatingArmed = pickedGuests.length > 0;

  function seat(guestIds: string[], tableId: string | null) {
    const formData = new FormData();
    for (const id of guestIds) formData.append("guest_id", id);
    formData.set("table_id", tableId ?? "");
    startTransition(async () => {
      applySeating({ ids: guestIds, tableId });
      const result = await assignGuestsTable(formData);
      // The optimistic move snaps back on its own; say why, or it looks
      // like the tap didn't register.
      if (result?.error) window.alert(`That seat didn't save. ${result.error}`);
    });
    setPickedGuestIds(new Set());
    if (tableId) {
      setJustSeated(new Set(guestIds));
      setTimeout(() => setJustSeated(new Set()), 600);
    }
  }

  function handleRoomStyle(style: RoomStyle) {
    setRoomStyleState(style);
    send(setRoomStyle, { style });
  }

  function handleDecor(table: SeatingTable, field: "linen" | "centerpiece", value: string) {
    setDecor((current) => ({ ...current, [table.id]: { ...current[table.id], [field]: value } }));
    send(setTableDecor, { id: table.id, [field]: value });
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
      const result = (await action(formData)) as { error?: string } | undefined;
      // The canvas already shows the change, so a failed save has to say so
      // and put the layout back to what's actually stored.
      if (result?.error) {
        window.alert(`That change didn't save. ${result.error}`);
        router.refresh();
      }
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
  const showGuests = guests.length > 0 && phaseTables.length > 0;
  // Replacing an event's layout unseats only the guests at that event's own tables.
  const phaseOwnTableIds = new Set(
    phaseTables.filter((t) => t.phase_id != null).map((t) => t.id),
  );
  const seatedInPhase = guests.reduce(
    (sum, g) => sum + (g.table_id && phaseOwnTableIds.has(g.table_id) ? personCount(g) : 0),
    0,
  );
  const totalPeople = guests.reduce((sum, g) => sum + personCount(g), 0);
  const seatedPeople = guests.reduce((sum, g) => sum + (g.table_id ? personCount(g) : 0), 0);

  return (
    <>
      {/* One header for the page: name, where the seating stands, and the
          tools, in one card -- not a page header followed by a second titled
          card repeating "Venue layout". Most-used tool first. */}
      <PageHeader
        eyebrow="Venue layout"
        title="Set the"
        accent="room"
        photo="layout"
        actions={
          <>
            {totalPeople > 0 && tables.length > 0 && (
              <SeatedRing seated={seatedPeople} total={totalPeople} />
            )}
            <Link href="/venue-layout/print" className="btn-secondary">
              Print seating chart
            </Link>
          </>
        }
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAddFormType((v) => (v === "table" ? null : "table"))}
              disabled={!canAdd}
              className={addFormType === "table" ? "btn-secondary" : "btn-primary"}
            >
              {addFormType === "table" ? "Close" : <><PlusIcon /> Add table</>}
            </button>
            {mode !== "seating" && (
              <button
                onClick={() => setAddFormType((v) => (v === "item" ? null : "item"))}
                disabled={!canAdd}
                className="btn-secondary disabled:opacity-40"
              >
                {addFormType === "item" ? "Close" : <><PlusIcon /> Add item</>}
              </button>
            )}
            {hasContent && mode !== "seating" && (
              <button
                onClick={() => setAddFormType((v) => (v === "layouts" ? null : "layouts"))}
                disabled={!canAdd}
                className="btn-secondary disabled:opacity-40"
              >
                {addFormType === "layouts" ? "Close" : "Layouts"}
              </button>
            )}
            <span aria-hidden className="hidden h-6 w-px bg-hairline sm:block" />
            <Segmented options={MODES} value={mode} onChange={setMode} label="Layout mode" />
            {hasContent && (
              <Segmented
                options={VIEWS}
                value={view3D ? "3d" : "plan"}
                onChange={(v) => setView3D(v === "3d")}
                label="View"
              />
            )}
            {!view3D && <RoomStylePicker value={roomStyle} onChange={handleRoomStyle} />}
          </div>
        }
      >
        {mode === "seating"
          ? guests.length === 0
            ? "No guests yet — add guests on the Guests page, then come back to seat them."
            : unassigned.length === 0
              ? "Every guest has a seat."
              : `${unassigned.length} of ${guests.length} guests still need a seat.`
          : mode === "rooms"
            ? "Plan each space separately — switch rooms below."
            : "Everything in one shared space."}
      </PageHeader>

      <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
        {phases.length > 0 && (
          <PhaseTabs
            phases={phases}
            activeId={activePhaseId}
            onSelect={(id) => {
              setSelectedPhaseId(id);
              setSelectedTableId(null);
              setSelectedItemId(null);
            }}
          />
        )}

        {mode === "rooms" && (
          <RoomTabs rooms={rooms} selectedRoomId={activeRoomId} onSelect={setSelectedRoomId} />
        )}
        {activePlan && activeRoom && (
          <p className="-mt-2 mb-4 text-sm text-ink/70">
            <span className="font-mono-numbers text-ink">{planSizeLabel(activePlan)}</span>
            {" · "}
            {activeRoom.source_venue_id ? "The venue's real floor plan, walls and all." : "This room's real size."}
          </p>
        )}

        {declinedSeated.length > 0 && (
          <DeclinedNotice
            guests={declinedSeated}
            tables={tables}
            onClear={() => {
              const formData = new FormData();
              for (const g of declinedSeated) formData.append("guest_id", g.id);
              formData.set("table_id", "");
              startTransition(async () => {
                await assignGuestsTable(formData);
              });
            }}
          />
        )}

        {addFormType === "table" && (
          <AddTableForm
            onDone={() => setAddFormType(null)}
            roomId={formRoomId}
            phaseId={activePhaseId ?? undefined}
          />
        )}
        {addFormType === "item" && (
          <AddItemForm
            onDone={() => setAddFormType(null)}
            roomId={formRoomId}
            phase={activePhase ?? undefined}
          />
        )}

        {activePhase && copySources.length > 0 && (
          <CopyPhaseOffer key={activePhase.id} target={activePhase} sources={copySources} />
        )}
        {addFormType === "layouts" && hasContent && (
          <LayoutTemplatePicker
            guestSeats={totalPeople}
            roomId={formRoomId}
            phaseId={activePhaseId ?? undefined}
            ceremony={activePhase?.kind === "ceremony"}
            plan={activePlan}
            hasContent
            seatedPeople={activePhaseId ? seatedInPhase : seatedPeople}
            onDone={() => setAddFormType(null)}
          />
        )}

        {mode === "rooms" && !activeRoomId ? (
          <p className="py-4 text-center text-sm text-ink/50">
            Create a room above to start adding tables and furniture to it.
          </p>
        ) : !hasContent ? (
          // An empty plan opens on the ready-made layouts: one click sets the
          // whole room, where placing tables one by one took dozens of drags.
          <LayoutTemplatePicker
            guestSeats={totalPeople}
            roomId={formRoomId}
            phaseId={activePhaseId ?? undefined}
            ceremony={activePhase?.kind === "ceremony"}
            plan={activePlan}
            hasContent={false}
            seatedPeople={0}
          />
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
                justSeated={justSeated}
                selectedTableId={selectedTableId}
                selectedItemId={selectedItemId}
                seatingArmed={seatingArmed}
                roomStyle={roomStyle}
                theme={theme}
                plan={activePlan}
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
                onDropGuests={(tableId, ids) => seat(ids, tableId)}
                tableActions={tableActions}
                itemActions={itemActions}
              />
              {tables.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/60">
                  {(["a", "b", "both"] as const).map((side) => (
                    <span key={side} className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: theme.colors[side] }}
                      />
                      {theme.labels[side]}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-dashed border-ink/40" />
                    Empty seat
                  </span>
                </div>
              )}
            </div>
            <div className="flex w-full shrink-0 flex-col gap-4 xl:w-80">
              <SelectionPanel
                key={selectedTable?.id ?? selectedItem?.id ?? "none"}
                table={selectedTable}
                item={selectedItem}
                roomStyle={roomStyle}
                onDecor={handleDecor}
                assignedGuests={selectedTable ? (guestsByTable.get(selectedTable.id) ?? []) : []}
                onUnassign={handleUnassign}
                onSplitPlusOne={(guestId) => send(splitPlusOne, { guest_id: guestId })}
                onDeleteTable={handleDeleteTable}
                onDeleteItem={handleDeleteItem}
                onResetTableSize={(table) =>
                  send(updateTablePosition, { id: table.id, width: "", height: "" })
                }
                phaseControl={
                  activePhase && (selectedTable || selectedItem) ? (
                    <PhaseScope
                      node={(selectedTable ?? selectedItem)!}
                      kind={selectedTable ? "table" : "item"}
                      phase={activePhase}
                      onChange={(phaseId) =>
                        send(setNodePhase, {
                          kind: selectedTable ? "table" : "item",
                          id: (selectedTable ?? selectedItem)!.id,
                          phase_id: phaseId ?? "",
                        })
                      }
                    />
                  ) : undefined
                }
              />
              {showGuests && <SeatTheRest guests={guests} tables={phaseTables} phaseId={activePhaseId} />}
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
    </>
  );
}
