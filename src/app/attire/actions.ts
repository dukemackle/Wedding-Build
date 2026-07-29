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

export async function toggleAttireShortlist(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const attireItemId = formData.get("attire_item_id") as string;
  const isShortlisted = formData.get("is_shortlisted") === "true";

  if (isShortlisted) {
    const { error } = await supabase
      .from("attire_shortlist")
      .delete()
      .eq("wedding_id", wedding.id)
      .eq("attire_item_id", attireItemId);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("attire_shortlist").insert({
      wedding_id: wedding.id,
      user_id: user.id,
      attire_item_id: attireItemId,
    });

    if (error) return { error: error.message };
  }

  revalidatePath("/attire");
  return {};
}

export async function updateAttireShortlistNotes(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const attireItemId = formData.get("attire_item_id") as string;
  const notes = (formData.get("notes") as string) ?? "";

  const { error } = await supabase
    .from("attire_shortlist")
    .update({ notes: notes.trim() || null })
    .eq("wedding_id", wedding.id)
    .eq("attire_item_id", attireItemId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/attire");
  return {};
}
