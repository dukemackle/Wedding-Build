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

export async function toggleShortlist(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const venueId = formData.get("venue_id") as string;
  const isShortlisted = formData.get("is_shortlisted") === "true";

  if (isShortlisted) {
    const { error } = await supabase
      .from("venue_shortlist")
      .delete()
      .eq("wedding_id", wedding.id)
      .eq("venue_id", venueId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("venue_shortlist").insert({
      wedding_id: wedding.id,
      user_id: user.id,
      venue_id: venueId,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/venues");
  return {};
}

export async function updateShortlistNotes(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const venueId = formData.get("venue_id") as string;
  const notes = (formData.get("notes") as string) ?? "";

  const { error } = await supabase
    .from("venue_shortlist")
    .update({ notes: notes.trim() || null })
    .eq("wedding_id", wedding.id)
    .eq("venue_id", venueId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/venues");
  return {};
}
