"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { VenueRoom, VenueSpacePlan } from "@/lib/supabase/types";
import { requireEditableWedding } from "@/lib/wedding-access";
import { roomStyle } from "@/lib/layout-styles";

export async function addRoom(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const name = ((formData.get("name") as string) || "").trim();
  if (!name) {
    return { error: "Give the room a name." };
  }

  const { error } = await supabase.from("venue_rooms").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    name,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

export async function renameRoom(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const roomId = formData.get("id") as string;
  const name = ((formData.get("name") as string) || "").trim();
  if (!name) {
    return { error: "Give the room a name." };
  }

  const { error } = await supabase
    .from("venue_rooms")
    .update({ name })
    .eq("id", roomId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

export async function deleteRoom(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const roomId = formData.get("id") as string;

  const { error } = await supabase
    .from("venue_rooms")
    .delete()
    .eq("id", roomId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/** The floor and walls the plan is drawn in: plain, barn or ballroom. */
export async function setRoomStyle(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const { error } = await supabase
    .from("weddings")
    .update({ layout_room_style: roomStyle(formData.get("style") as string) })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venue-layout");
  return {};
}

/**
 * "Design my wedding here" on a venue listing: copies the venue's published
 * floor plans into the couple's layout as rooms -- a snapshot, so the venue
 * redrawing a plan later never moves anyone's tables -- and opens the one
 * they tapped. Spaces already copied are reused, not copied twice.
 */
export async function designAtVenue(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const venueId = formData.get("venue_id") as string;
  const spaceId = formData.get("space_id") as string;

  const [{ data: venue }, { data: plans }, { data: existing }] = await Promise.all([
    supabase.from("venues").select("id, name").eq("id", venueId).eq("active", true).maybeSingle<{ id: string; name: string }>(),
    // RLS only returns published plans of live venues.
    supabase
      .from("venue_space_plans")
      .select("*, venue_spaces(name, sort_order)")
      .eq("venue_id", venueId)
      .eq("published", true)
      .returns<(VenueSpacePlan & { venue_spaces: { name: string; sort_order: number } | null })[]>(),
    supabase
      .from("venue_rooms")
      .select("id, name, source_space_id")
      .eq("wedding_id", wedding.id)
      .returns<Pick<VenueRoom, "id" | "name" | "source_space_id">[]>(),
  ]);
  if (!venue || !plans?.length) return { error: "This venue doesn't have a floor plan to design in yet." };

  const roomBySpace = new Map((existing ?? []).filter((r) => r.source_space_id).map((r) => [r.source_space_id!, r.id]));
  const names = new Set((existing ?? []).map((r) => r.name.toLowerCase()));
  const fresh = plans
    .filter((p) => !roomBySpace.has(p.space_id))
    .sort((a, b) => (a.venue_spaces?.sort_order ?? 0) - (b.venue_spaces?.sort_order ?? 0));

  for (const plan of fresh) {
    const spaceName = plan.venue_spaces?.name ?? "Venue room";
    // Two venues can both have "The Barn"; the second gets its venue's name.
    const name = names.has(spaceName.toLowerCase()) ? `${spaceName} (${venue.name})` : spaceName;
    names.add(name.toLowerCase());
    const { data: room, error } = await supabase
      .from("venue_rooms")
      .insert({
        wedding_id: wedding.id,
        user_id: user.id,
        name,
        width_m: plan.width_m,
        length_m: plan.length_m,
        outline: plan.outline,
        source_space_id: plan.space_id,
        source_venue_id: venue.id,
      })
      .select("id")
      .single<{ id: string }>();
    if (error || !room) return { error: error?.message ?? "Couldn't add the room." };
    roomBySpace.set(plan.space_id, room.id);
  }

  const openId = roomBySpace.get(spaceId) ?? roomBySpace.get(plans[0].space_id);
  revalidatePath("/venue-layout");
  redirect(`/venue-layout?room=${openId}`);
}
