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
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
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

function text(formData: FormData, key: string): string | null {
  const raw = (formData.get(key) as string | null)?.trim();
  return raw || null;
}

export async function addPartyMember(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const name = text(formData, "name");
  if (!name) return { error: "Add a name." };

  const { count } = await supabase
    .from("attire_party_members")
    .select("id", { count: "exact", head: true })
    .eq("wedding_id", wedding.id);

  const { error } = await supabase.from("attire_party_members").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    name,
    role: text(formData, "role"),
    attire_item_id: text(formData, "attire_item_id"),
    sort_order: count ?? 0,
  });
  if (error) return { error: error.message };

  revalidatePath("/attire");
  return {};
}

/** Saves whichever of the member's fields the form carries. */
export async function updatePartyMember(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const id = formData.get("id") as string;
  const patch: Record<string, string | null> = {};
  for (const key of ["name", "role", "attire_item_id", "color", "size", "status", "notes"]) {
    if (formData.has(key)) patch[key] = text(formData, key);
  }
  if ("name" in patch && !patch.name) return { error: "Add a name." };
  if ("status" in patch && !patch.status) patch.status = "To order";

  const { error } = await supabase
    .from("attire_party_members")
    .update(patch)
    .eq("id", id)
    .eq("wedding_id", wedding.id);
  if (error) return { error: error.message };

  revalidatePath("/attire");
  return {};
}

export async function removePartyMember(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const { error } = await supabase
    .from("attire_party_members")
    .delete()
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);
  if (error) return { error: error.message };

  revalidatePath("/attire");
  return {};
}

/**
 * Turns the party link on (a fresh token), or off. Turning it back on makes
 * a new link, so an old one that was forwarded too widely stops working.
 */
export async function setPartySharing(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const enable = formData.get("enable") === "true";
  const { error } = await supabase
    .from("weddings")
    .update({ party_share_token: enable ? crypto.randomUUID() : null })
    .eq("id", wedding.id);
  if (error) return { error: error.message };

  revalidatePath("/attire");
  return {};
}
