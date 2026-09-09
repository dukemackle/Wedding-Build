"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultRoom } from "@/lib/venue-rooms";
import type { LayoutItemType, Wedding } from "@/lib/supabase/types";

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
  "other",
];

// New items cascade into a grid so they don't stack on top of each
// other before the couple drags them into place.
const CANVAS_COLUMNS = 3;
const COLUMN_SPACING = 260;
const ROW_SPACING = 180;
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

function itemFieldsFromForm(formData: FormData) {
  const itemTypeRaw = (formData.get("item_type") as string) || "";
  if (!VALID_ITEM_TYPES.includes(itemTypeRaw as LayoutItemType)) {
    return { error: "Choose a valid item type." } as const;
  }

  const label = ((formData.get("label") as string) || "").trim() || null;

  return { fields: { item_type: itemTypeRaw as LayoutItemType, label } } as const;
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
  const positionX = Number(formData.get("position_x"));
  const positionY = Number(formData.get("position_y"));

  if (Number.isNaN(positionX) || Number.isNaN(positionY)) {
    return { error: "Invalid position." };
  }

  const { error } = await supabase
    .from("venue_layout_items")
    .update({ position_x: positionX, position_y: positionY })
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

  const { error } = await supabase
    .from("venue_layout_items")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
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
