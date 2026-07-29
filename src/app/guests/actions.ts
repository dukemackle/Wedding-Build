"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GuestStatus, Wedding } from "@/lib/supabase/types";

const VALID_STATUSES: GuestStatus[] = ["invited", "confirmed", "declined", "pending"];

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

function guestFieldsFromForm(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const status = formData.get("status") as string;

  if (!name) {
    return { error: "Name is required." } as const;
  }
  if (!VALID_STATUSES.includes(status as GuestStatus)) {
    return { error: "Invalid status." } as const;
  }

  return {
    fields: {
      name,
      household: ((formData.get("household") as string) || "").trim() || null,
      plus_one: formData.get("plus_one") === "on",
      status: status as GuestStatus,
      meal: ((formData.get("meal") as string) || "").trim() || null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
    },
  } as const;
}

export async function addGuest(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const parsed = guestFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase.from("guests").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    ...parsed.fields,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  revalidatePath("/budget");
  return {};
}

export async function updateGuest(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const guestId = formData.get("id") as string;
  const parsed = guestFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase
    .from("guests")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
    .eq("id", guestId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  revalidatePath("/budget");
  return {};
}

export async function deleteGuest(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const guestId = formData.get("id") as string;

  const { error } = await supabase
    .from("guests")
    .delete()
    .eq("id", guestId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/guests");
  revalidatePath("/budget");
  return {};
}
