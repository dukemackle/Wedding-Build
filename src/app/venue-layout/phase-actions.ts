"use server";

import { revalidatePath } from "next/cache";
import { requireEditableWedding } from "@/lib/wedding-access";
import { phaseIdFromForm } from "@/lib/layout-phase-access";
import type { LayoutPhase, SeatingTable, VenueLayoutItem } from "@/lib/supabase/types";

export async function addPhase(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const name = ((formData.get("name") as string) || "").trim().slice(0, 60);
  if (!name) {
    return { error: "Give the event a name." };
  }

  const { data: last } = await supabase
    .from("layout_phases")
    .select("sort_order")
    .eq("wedding_id", wedding.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();

  const { error } = await supabase.from("layout_phases").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    kind: "custom",
    name,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/** Only events the couple added can go; the three standard ones stay. */
export async function deletePhase(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const { error } = await supabase
    .from("layout_phases")
    .delete()
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id)
    .eq("kind", "custom");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/**
 * Copies one event's tables and items into another, so the reception can
 * start from the ceremony's arrangement instead of an empty room. Guests
 * aren't copied: a guest sits at one table.
 */
export async function copyPhaseLayout(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const fromId = formData.get("from_id") as string;
  const toId = formData.get("to_id") as string;
  const { data: phases } = await supabase
    .from("layout_phases")
    .select("id")
    .eq("wedding_id", wedding.id)
    .in("id", [fromId, toId])
    .returns<Pick<LayoutPhase, "id">[]>();

  if (fromId === toId || phases?.length !== 2) {
    return { error: "That event no longer exists." };
  }

  const [{ data: tables }, { data: items }] = await Promise.all([
    supabase
      .from("seating_tables")
      .select("*")
      .eq("wedding_id", wedding.id)
      .eq("phase_id", fromId)
      .returns<SeatingTable[]>(),
    supabase
      .from("venue_layout_items")
      .select("*")
      .eq("wedding_id", wedding.id)
      .eq("phase_id", fromId)
      .returns<VenueLayoutItem[]>(),
  ]);

  if (tables?.length) {
    const { error } = await supabase.from("seating_tables").insert(
      tables.map((t) => ({
        wedding_id: wedding.id,
        user_id: user.id,
        name: t.name,
        capacity: t.capacity,
        shape: t.shape,
        position_x: t.position_x,
        position_y: t.position_y,
        rotation: t.rotation,
        width: t.width,
        height: t.height,
        room_id: t.room_id,
        linen: t.linen,
        centerpiece: t.centerpiece,
        phase_id: toId,
      })),
    );
    if (error) return { error: error.message };
  }

  if (items?.length) {
    const { error } = await supabase.from("venue_layout_items").insert(
      items.map((i) => ({
        wedding_id: wedding.id,
        user_id: user.id,
        item_type: i.item_type,
        label: i.label,
        position_x: i.position_x,
        position_y: i.position_y,
        rotation: i.rotation,
        width: i.width,
        height: i.height,
        room_id: i.room_id,
        phase_id: toId,
      })),
    );
    if (error) return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/** Moves a table or item between "this event only" and "every event". */
export async function setNodePhase(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const parsed = await phaseIdFromForm(supabase, wedding.id, formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const table = formData.get("kind") === "table" ? "seating_tables" : "venue_layout_items";
  const { error } = await supabase
    .from(table)
    .update({ phase_id: parsed.phaseId })
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}
