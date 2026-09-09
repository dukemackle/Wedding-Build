"use client";

import { useRef, useState, useTransition } from "react";
import type { LayoutItemType, VenueLayoutItem } from "@/lib/supabase/types";
import {
  addLayoutItem,
  updateLayoutItem,
  deleteLayoutItem,
  updateLayoutItemPosition,
} from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

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
  other: "Other",
};

const ITEM_TYPE_DIMENSIONS: Record<LayoutItemType, { width: number; height: number }> = {
  chairs: { width: 220, height: 60 },
  stage: { width: 240, height: 100 },
  dance_floor: { width: 200, height: 200 },
  bar: { width: 160, height: 70 },
  dj_booth: { width: 120, height: 90 },
  buffet: { width: 200, height: 70 },
  cake_table: { width: 100, height: 80 },
  gift_table: { width: 100, height: 80 },
  entrance: { width: 90, height: 90 },
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
  other: "border-hairline bg-card",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function itemDisplayName(item: VenueLayoutItem) {
  return item.label?.trim() || ITEM_TYPE_LABELS[item.item_type];
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

function AddItemForm({ onDone }: { onDone: () => void }) {
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

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 520;

function ItemNode({
  item,
  isSelected,
  onSelect,
  onDragEnd,
}: {
  item: VenueLayoutItem;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const { width, height } = ITEM_TYPE_DIMENSIONS[item.item_type];
  const [pos, setPos] = useState(() => ({ x: item.position_x, y: item.position_y }));
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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ position: "absolute", left: pos.x, top: pos.y, width, height }}
      className={`flex cursor-grab select-none flex-col items-center justify-center rounded-lg border-2 p-2 text-center text-sm shadow-sm active:cursor-grabbing ${ITEM_TYPE_COLORS[item.item_type]} ${isSelected ? "ring-2 ring-forest/40" : ""}`}
    >
      <p className="font-medium text-ink">{itemDisplayName(item)}</p>
      {item.label && <p className="text-xs text-ink/50">{ITEM_TYPE_LABELS[item.item_type]}</p>}
    </div>
  );
}

function FloorPlanCanvas({
  items,
  selectedItemId,
  onSelect,
  onDragEnd,
}: {
  items: VenueLayoutItem[];
  selectedItemId: string | null;
  onSelect: (id: string | null) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-hairline bg-parchment">
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelect(null);
        }}
        style={{ position: "relative", width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      >
        {items.map((item) => (
          <ItemNode
            key={`${item.id}-${item.position_x}-${item.position_y}`}
            item={item}
            isSelected={item.id === selectedItemId}
            onSelect={() => onSelect(item.id === selectedItemId ? null : item.id)}
            onDragEnd={(x, y) => onDragEnd(item.id, x, y)}
          />
        ))}
      </div>
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

export function FloorPlanManager({ items }: { items: VenueLayoutItem[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDragEnd(itemId: string, x: number, y: number) {
    const formData = new FormData();
    formData.set("id", itemId);
    formData.set("position_x", String(Math.round(x)));
    formData.set("position_y", String(Math.round(y)));
    startTransition(async () => {
      await updateLayoutItemPosition(formData);
    });
  }

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Venue floor plan</h2>
          <p className="mt-1 text-sm text-ink/70">
            Lay out the ceremony/reception space — stage, chairs, bar, dance floor, and more.
            Drag an item to move it; click one to edit or delete it below.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
        >
          {showAddForm ? "Close" : "+ Add item"}
        </button>
      </div>

      {showAddForm && <AddItemForm onDone={() => setShowAddForm(false)} />}

      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink/50">
          No layout items yet — add your first one above.
        </p>
      ) : (
        <>
          <FloorPlanCanvas
            items={items}
            selectedItemId={selectedItemId}
            onSelect={setSelectedItemId}
            onDragEnd={handleDragEnd}
          />

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
