"use server";

import { revalidatePath } from "next/cache";
import { requireEditableWedding } from "@/lib/wedding-access";

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
