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

  return { fields: { name, capacity } } as const;
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

  const { error } = await supabase.from("seating_tables").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    ...parsed.fields,
  });

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
