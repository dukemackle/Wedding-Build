import type { LayoutItemType, SeatingTable, TableShape, VenueLayoutItem } from "@/lib/supabase/types";

/**
 * One source of truth for how big everything on the venue plan is.
 *
 * The 2D editor and the 3D view both read from here. They used to each carry
 * their own idea of an item's footprint, and several 3D meshes ignored the
 * footprint entirely and drew at a fixed size -- so a DJ booth that was 100x75
 * in the editor came out a different size and shape in 3D, and nothing lined
 * up between the two views.
 *
 * Units are canvas pixels. The 3D view divides them by SCALE to get metres.
 */

/** Canvas pixels per world metre in the 3D view. */
export const WORLD_SCALE = 45;

/**
 * The plan's coordinate space. Bigger than a screen on purpose: the canvas is
 * scaled to fit whatever width it is given, so this is how much floor there is
 * to arrange things on, not how many pixels it occupies.
 */
export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 900;

/** Smallest and largest an item can be dragged or typed to. */
export const MIN_ITEM_SIZE = 40;
export const MAX_ITEM_SIZE = 900;

export type Footprint = { width: number; height: number };

/** The starting footprint for each item type, used until one is set. */
export const ITEM_TYPE_DIMENSIONS: Record<LayoutItemType, Footprint> = {
  chairs: { width: 160, height: 50 },
  stage: { width: 170, height: 80 },
  dance_floor: { width: 150, height: 150 },
  bar: { width: 130, height: 60 },
  dj_booth: { width: 100, height: 75 },
  buffet: { width: 150, height: 60 },
  cake_table: { width: 85, height: 70 },
  gift_table: { width: 85, height: 70 },
  entrance: { width: 75, height: 75 },
  house: { width: 140, height: 110 },
  parking: { width: 200, height: 130 },
  other: { width: 100, height: 75 },
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** A table's footprint is still derived from its shape and how many it seats. */
export function tableDimensions(shape: TableShape, capacity: number | null): Footprint {
  const seats = capacity ?? 8;

  if (shape === "square") {
    const side = clamp(90 + seats * 7, 90, 220);
    return { width: side, height: side };
  }

  if (shape === "rectangle") {
    return { width: clamp(130 + seats * 11, 130, 340), height: 90 };
  }

  const diameter = clamp(90 + seats * 8, 90, 240);
  return { width: diameter, height: diameter };
}

/** An item's footprint: its own size when it has one, else its type's default. */
export function itemDimensions(item: Pick<VenueLayoutItem, "item_type" | "width" | "height">): Footprint {
  const fallback = ITEM_TYPE_DIMENSIONS[item.item_type];
  return {
    width: item.width ?? fallback.width,
    height: item.height ?? fallback.height,
  };
}

/** Footprint of anything on the plan, for code that handles both. */
export function nodeDimensions(node: SeatingTable | VenueLayoutItem): Footprint {
  return "item_type" in node
    ? itemDimensions(node)
    : tableDimensions(node.shape, node.capacity);
}
