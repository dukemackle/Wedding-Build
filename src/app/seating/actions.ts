"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultRoom } from "@/lib/venue-rooms";
import { MAX_ITEM_SIZE, MIN_ITEM_SIZE, clamp, duplicatePosition, tableFootprint } from "@/lib/venue-layout-geometry";
import type { SeatingTable, TableShape, Wedding } from "@/lib/supabase/types";

const VALID_SHAPES: TableShape[] = ["round", "square", "rectangle"];

// New tables cascade into a grid so they don't stack on top of each
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

function tableFieldsFromForm(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) {
    return { error: "Give the table a name." } as const;
  }

  const capacityRaw = (formData.get("capacity") as string) || "";
  let capacity: number | null = null;
  if (capacityRaw.trim()) {
    const parsed = Number(capacityRaw);
    if (Number.isNaN(parsed) || parsed < 0) {
      return { error: "Capacity must be a valid number." } as const;
    }
    capacity = parsed;
  }

  const shapeRaw = (formData.get("shape") as string) || "round";
  const shape = (VALID_SHAPES.includes(shapeRaw as TableShape) ? shapeRaw : "round") as TableShape;

  const rotationRaw = (formData.get("rotation") as string) || "0";
  const rotationParsed = Number(rotationRaw);
  if (Number.isNaN(rotationParsed)) {
    return { error: "Rotation must be a valid number." } as const;
  }
  const rotation = normalizeRotation(rotationParsed);

  return { fields: { name, capacity, shape, rotation } } as const;
}

export async function addSeatingTable(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const parsed = tableFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { count } = await supabase
    .from("seating_tables")
    .select("id", { count: "exact", head: true })
    .eq("wedding_id", wedding.id);

  const index = count ?? 0;
  const position_x = GRID_ORIGIN + (index % CANVAS_COLUMNS) * COLUMN_SPACING;
  const position_y = GRID_ORIGIN + Math.floor(index / CANVAS_COLUMNS) * ROW_SPACING;

  const requestedRoomId = ((formData.get("room_id") as string) || "").trim() || null;
  const room_id = requestedRoomId ?? (await getOrCreateDefaultRoom(supabase, wedding.id, user.id));

  const { error } = await supabase.from("seating_tables").insert({
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

export async function updateTablePosition(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const tableId = formData.get("id") as string;
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

  // Absent leaves the size alone; an empty string clears it back to the
  // footprint derived from shape and seats.
  for (const key of ["width", "height"] as const) {
    const raw = formData.get(key);
    if (raw == null) continue;
    const text = String(raw).trim();
    if (text === "") {
      update[key] = null;
      continue;
    }
    const value = Number(text);
    if (!Number.isFinite(value)) {
      return { error: "Size must be a number." };
    }
    update[key] = Math.round(clamp(value, MIN_ITEM_SIZE, MAX_ITEM_SIZE));
  }

  if (Object.keys(update).length === 0) {
    return { error: "Nothing to update." };
  }

  const { error } = await supabase
    .from("seating_tables")
    .update(update)
    .eq("id", tableId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

export async function updateSeatingTable(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const tableId = formData.get("id") as string;
  const parsed = tableFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  // A size dragged out for one shape is wrong for another -- a round table
  // turned rectangle would stay a square box -- so a shape change goes back to
  // the footprint derived from the new shape.
  const previousShape = formData.get("previous_shape");
  const shapeChanged = previousShape != null && previousShape !== parsed.fields.shape;

  const { error } = await supabase
    .from("seating_tables")
    .update({
      ...parsed.fields,
      ...(shapeChanged ? { width: null, height: null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", tableId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

export async function deleteSeatingTable(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const tableId = formData.get("id") as string;

  const { error } = await supabase
    .from("seating_tables")
    .delete()
    .eq("id", tableId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

export async function assignGuestTable(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const guestId = formData.get("guest_id") as string;
  const tableId = ((formData.get("table_id") as string) || "").trim() || null;

  const { error } = await supabase
    .from("guests")
    .update({ table_id: tableId })
    .eq("id", guestId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/**
 * Seats several guests at one table in a single write -- a whole household
 * dragged onto a table, or a handful tapped on a phone. An empty table_id
 * unseats them all.
 */
export async function assignGuestsTable(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const guestIds = formData.getAll("guest_id").map(String).filter(Boolean);
  const tableId = ((formData.get("table_id") as string) || "").trim() || null;
  if (guestIds.length === 0) {
    return { error: "Pick at least one guest." };
  }

  const { error } = await supabase
    .from("guests")
    .update({ table_id: tableId })
    .in("id", guestIds)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

export async function renameSeatingTable(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const tableId = formData.get("id") as string;
  const name = ((formData.get("name") as string) || "").trim();
  if (!name) {
    return { error: "Give the table a name." };
  }

  const { error } = await supabase
    .from("seating_tables")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", tableId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/** A copy of the table just below-right of it -- without its guests. */
export async function duplicateSeatingTable(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const tableId = formData.get("id") as string;
  const { data: source } = await supabase
    .from("seating_tables")
    .select("*")
    .eq("id", tableId)
    .eq("wedding_id", wedding.id)
    .maybeSingle<SeatingTable>();

  if (!source) {
    return { error: "That table no longer exists." };
  }

  const { error } = await supabase.from("seating_tables").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    name: copyName(source.name),
    capacity: source.capacity,
    shape: source.shape,
    rotation: source.rotation,
    width: source.width,
    height: source.height,
    room_id: source.room_id,
    ...duplicatePosition(source.position_x, source.position_y, tableFootprint(source)),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/** "Table 4" copies to "Table 5"; anything not ending in a number gets " copy". */
function copyName(name: string) {
  const match = name.match(/^(.*?)(\d+)$/);
  return match ? `${match[1]}${Number(match[2]) + 1}` : `${name} copy`;
}
