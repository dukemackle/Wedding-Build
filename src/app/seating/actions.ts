"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { TableShape, Wedding } from "@/lib/supabase/types";

const VALID_SHAPES: TableShape[] = ["round", "square", "rectangle"];

// New tables cascade into a grid so they don't stack on top of each
// other before the couple drags them into place.
const CANVAS_COLUMNS = 3;
const COLUMN_SPACING = 280;
const ROW_SPACING = 220;
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
    .eq("user_id", user.id)
    .maybeSingle<Wedding>();

  return { supabase, user, wedding };
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

  return { fields: { name, capacity, shape } } as const;
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

  const { error } = await supabase.from("seating_tables").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    ...parsed.fields,
    position_x,
    position_y,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/seating");
  return {};
}

export async function updateTablePosition(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const tableId = formData.get("id") as string;
  const positionX = Number(formData.get("position_x"));
  const positionY = Number(formData.get("position_y"));

  if (Number.isNaN(positionX) || Number.isNaN(positionY)) {
    return { error: "Invalid position." };
  }

  const { error } = await supabase
    .from("seating_tables")
    .update({ position_x: positionX, position_y: positionY })
    .eq("id", tableId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/seating");
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

  const { error } = await supabase
    .from("seating_tables")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
    .eq("id", tableId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/seating");
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

  revalidatePath("/seating");
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

  revalidatePath("/seating");
  return {};
}
