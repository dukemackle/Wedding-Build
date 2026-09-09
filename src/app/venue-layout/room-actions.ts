"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";

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

export async function addRoom(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
