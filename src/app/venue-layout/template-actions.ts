"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateDefaultRoom } from "@/lib/venue-rooms";
import { requireEditableWedding } from "@/lib/wedding-access";
import { phaseIdFromForm } from "@/lib/layout-phase-access";
import { LAYOUT_TEMPLATES, buildTemplate, type LayoutTemplateId } from "@/lib/layout-templates";
import { planSeating, type SeatGuest, type SeatTable } from "@/lib/auto-seat";

/**
 * Lays down a ready-made layout sized to the guest list. With replace set,
 * clears the room first (the whole venue, or just the room being viewed);
 * guests sitting at removed tables become unseated, which the picker warns
 * about before calling this.
 */
export async function applyLayoutTemplate(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const id = formData.get("template") as LayoutTemplateId;
  if (!LAYOUT_TEMPLATES.some((t) => t.id === id)) return { error: "Pick a layout." };
  const replace = formData.get("replace") === "1";
  const phase = await phaseIdFromForm(supabase, wedding.id, formData);
  if ("error" in phase) return { error: phase.error };
  const requestedRoomId = ((formData.get("room_id") as string) || "").trim() || null;
  const room_id = requestedRoomId ?? (await getOrCreateDefaultRoom(supabase, wedding.id, user.id));

  // Sized to everyone not declined, plus-ones counted -- the same people the
  // seating panel lists.
  const { data: guests } = await supabase
    .from("guests")
    .select("plus_one")
    .eq("wedding_id", wedding.id)
    .neq("status", "declined")
    .returns<{ plus_one: boolean }[]>();
  const seats = (guests ?? []).reduce((s, g) => s + 1 + (g.plus_one ? 1 : 0), 0);
  const layout = buildTemplate(id, seats);

  if (replace) {
    for (const table of ["seating_tables", "venue_layout_items"] as const) {
      let query = supabase.from(table).delete().eq("wedding_id", wedding.id);
      if (requestedRoomId) query = query.eq("room_id", requestedRoomId);
      // Only the event on screen is replaced: the other events' layouts and
      // anything that's part of the venue stay put.
      if (phase.phaseId) query = query.eq("phase_id", phase.phaseId);
      const { error } = await query;
      if (error) return { error: error.message };
    }
  }

  const owner = { wedding_id: wedding.id, user_id: user.id, room_id, phase_id: phase.phaseId };
  const { error: tableError } = await supabase.from("seating_tables").insert(
    layout.tables.map((t) => ({
      ...owner,
      name: t.name,
      shape: t.shape,
      capacity: t.capacity,
      position_x: t.x,
      position_y: t.y,
      width: t.width,
      height: t.height,
      rotation: 0,
    })),
  );
  if (tableError) return { error: tableError.message };

  const { error: itemError } = await supabase.from("venue_layout_items").insert(
    layout.items.map((i) => ({
      ...owner,
      item_type: i.type,
      label: i.label,
      position_x: i.x,
      position_y: i.y,
      width: i.width,
      height: i.height,
      rotation: 0,
    })),
  );
  if (itemError) return { error: itemError.message };

  revalidatePath("/venue-layout");
  return {};
}

/**
 * Seats everyone still unseated, by the rules in src/lib/auto-seat.ts. Runs
 * the plan again on fresh data rather than trusting the preview, so two open
 * tabs can't over-fill a table. Returns the ids it seated, for Undo.
 */
export async function seatTheRest(
  phaseId?: string | null,
): Promise<{ error?: string; seatedIds?: string[] }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const [{ data: guests }, { data: tables }] = await Promise.all([
    supabase
      .from("guests")
      .select("id, name, household, side, guest_type, plus_one, table_id")
      .eq("wedding_id", wedding.id)
      .neq("status", "declined")
      .order("name", { ascending: true })
      .returns<SeatGuest[]>(),
    // Only the tables in the event on screen (and any in every event), so a
    // ceremony table never fills up with the reception's guests.
    (phaseId
      ? supabase
          .from("seating_tables")
          .select("id, name, capacity")
          .eq("wedding_id", wedding.id)
          .or(`phase_id.eq.${phaseId},phase_id.is.null`)
      : supabase.from("seating_tables").select("id, name, capacity").eq("wedding_id", wedding.id)
    )
      .order("created_at", { ascending: true })
      .returns<SeatTable[]>(),
  ]);

  const plan = planSeating(guests ?? [], tables ?? []);
  const seatedIds: string[] = [];
  for (const { tableId, guestIds } of plan.assignments) {
    const { error } = await supabase
      .from("guests")
      .update({ table_id: tableId })
      .in("id", guestIds)
      .eq("wedding_id", wedding.id)
      .is("table_id", null);
    if (error) return { error: error.message, seatedIds };
    seatedIds.push(...guestIds);
  }

  revalidatePath("/venue-layout");
  return { seatedIds };
}
