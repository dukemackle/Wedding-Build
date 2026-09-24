"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultRoom } from "@/lib/venue-rooms";
import { duplicatePosition, itemDimensions } from "@/lib/venue-layout-geometry";
import type { LayoutItemType, VenueLayoutItem, Wedding } from "@/lib/supabase/types";

const VALID_ITEM_TYPES: LayoutItemType[] = [
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

// New items cascade into a grid so they don't stack on top of each
// other before the couple drags them into place.
const CANVAS_COLUMNS = 3;
const COLUMN_SPACING = 300;
const ROW_SPACING = 240;
const GRID_ORIGIN = 60;

async function requireOwnWedding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  return { supabase, user, wedding };
}

function normalizeRotation(value: number) {
  return ((Math.round(value) % 360) + 360) % 360;
}

// Kept in step with MIN_ITEM_SIZE/MAX_ITEM_SIZE in the geometry module. The
// client clamps as you drag; this is the check that actually protects the row,
// since a form post can carry anything.
const MIN_SIZE = 40;
const MAX_SIZE = 900;

/**
 * Reads an optional width/height off a form.
 *
 * Absent means "don't touch the size"; an empty string means "clear it back to
 * this item type's default", which is what null in the column means.
 */
function sizeFromForm(formData: FormData) {
  const size: { width?: number | null; height?: number | null } = {};

  for (const key of ["width", "height"] as const) {
    const raw = formData.get(key);
    if (raw == null) continue;
    const text = String(raw).trim();
    if (text === "") {
      size[key] = null;
      continue;
    }
    const value = Number(text);
    if (!Number.isFinite(value)) {
      return { error: "Size must be a number." } as const;
    }
    size[key] = Math.round(Math.max(MIN_SIZE, Math.min(MAX_SIZE, value)));
  }

  return { size } as const;
}

function itemFieldsFromForm(formData: FormData) {
  const itemTypeRaw = (formData.get("item_type") as string) || "";
  if (!VALID_ITEM_TYPES.includes(itemTypeRaw as LayoutItemType)) {
    return { error: "Choose a valid item type." } as const;
  }

  const label = ((formData.get("label") as string) || "").trim() || null;

  const rotationRaw = (formData.get("rotation") as string) || "0";
  const rotationParsed = Number(rotationRaw);
  if (Number.isNaN(rotationParsed)) {
    return { error: "Rotation must be a valid number." } as const;
  }
  const rotation = normalizeRotation(rotationParsed);

  return { fields: { item_type: itemTypeRaw as LayoutItemType, label, rotation } } as const;
}

export async function addLayoutItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const parsed = itemFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { count } = await supabase
    .from("venue_layout_items")
    .select("id", { count: "exact", head: true })
    .eq("wedding_id", wedding.id);

  const index = count ?? 0;
  const position_x = GRID_ORIGIN + (index % CANVAS_COLUMNS) * COLUMN_SPACING;
  const position_y = GRID_ORIGIN + Math.floor(index / CANVAS_COLUMNS) * ROW_SPACING;

  const requestedRoomId = ((formData.get("room_id") as string) || "").trim() || null;
  const room_id = requestedRoomId ?? (await getOrCreateDefaultRoom(supabase, wedding.id, user.id));

  const { error } = await supabase.from("venue_layout_items").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    ...parsed.fields,
    position_x,
    position_y,
    room_id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

export async function updateLayoutItemPosition(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;
  const positionXRaw = formData.get("position_x");
  const positionYRaw = formData.get("position_y");
  const rotationRaw = formData.get("rotation");

  const update: {
    position_x?: number;
    position_y?: number;
    rotation?: number;
    width?: number | null;
    height?: number | null;
  } = {};

  if (positionXRaw != null && positionYRaw != null) {
    const positionX = Number(positionXRaw);
    const positionY = Number(positionYRaw);
    if (Number.isNaN(positionX) || Number.isNaN(positionY)) {
      return { error: "Invalid position." };
    }
    update.position_x = positionX;
    update.position_y = positionY;
  }

  if (rotationRaw != null) {
    const rotation = Number(rotationRaw);
    if (Number.isNaN(rotation)) {
      return { error: "Invalid rotation." };
    }
    update.rotation = normalizeRotation(rotation);
  }

  const parsedSize = sizeFromForm(formData);
  if ("error" in parsedSize) {
    return { error: parsedSize.error };
  }
  Object.assign(update, parsedSize.size);

  if (Object.keys(update).length === 0) {
    return { error: "Nothing to update." };
  }

  const { error } = await supabase
    .from("venue_layout_items")
    .update(update)
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

export async function updateLayoutItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;
  const parsed = itemFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const parsedSize = sizeFromForm(formData);
  if ("error" in parsedSize) {
    return { error: parsedSize.error };
  }

  const { error } = await supabase
    .from("venue_layout_items")
    .update({ ...parsed.fields, ...parsedSize.size, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

export async function deleteLayoutItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;

  const { error } = await supabase
    .from("venue_layout_items")
    .delete()
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/** Sets just the label -- an empty one falls back to the type's name. */
export async function renameLayoutItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;
  const label = ((formData.get("label") as string) || "").trim() || null;

  const { error } = await supabase
    .from("venue_layout_items")
    .update({ label, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/** A copy of the item just below-right of it, same size and rotation. */
export async function duplicateLayoutItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;
  const { data: source } = await supabase
    .from("venue_layout_items")
    .select("*")
    .eq("id", itemId)
    .eq("wedding_id", wedding.id)
    .maybeSingle<VenueLayoutItem>();

  if (!source) {
    return { error: "That item no longer exists." };
  }

  const { error } = await supabase.from("venue_layout_items").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    item_type: source.item_type,
    label: source.label,
    rotation: source.rotation,
    width: source.width,
    height: source.height,
    room_id: source.room_id,
    ...duplicatePosition(source.position_x, source.position_y, itemDimensions(source)),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

