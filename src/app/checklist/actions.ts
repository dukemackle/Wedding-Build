"use server";

import { revalidatePath } from "next/cache";
import { seedStandardPlan } from "@/lib/seed-plan";
import { requireEditableWedding } from "@/lib/wedding-access";

function checklistFieldsFromForm(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  if (!title) {
    return { error: "Give the task a name." } as const;
  }

  return {
    fields: {
      title,
      notes: ((formData.get("notes") as string) || "").trim() || null,
      due_date: ((formData.get("due_date") as string) || "").trim() || null,
    },
  } as const;
}

export async function addChecklistItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const parsed = checklistFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase.from("checklist_items").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    ...parsed.fields,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/checklist");
  revalidatePath("/dashboard");
  return {};
}

export async function updateChecklistItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const itemId = formData.get("id") as string;
  const parsed = checklistFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase
    .from("checklist_items")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/checklist");
  revalidatePath("/dashboard");
  return {};
}

export async function toggleChecklistItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const itemId = formData.get("id") as string;
  const completed = formData.get("completed") === "true";

  const { error } = await supabase
    .from("checklist_items")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/checklist");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteChecklistItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const itemId = formData.get("id") as string;

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/checklist");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Fills an empty checklist with Wren's plan.
 *
 * Deliberately refuses to run when tasks already exist. The alternative --
 * merging, or de-duplicating by title -- would either bury a couple's own
 * tasks among fifty new ones or quietly drop tasks they'd edited. An empty
 * list is the only state where this can't destroy anything.
 */
export async function buildWeddingPlan(): Promise<{ error?: string; added?: number }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  // Pressed by hand, so it runs even if the plan was added before and cleared.
  const result = await seedStandardPlan(supabase, wedding, user.id, { force: true });
  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/checklist");
  revalidatePath("/dashboard");
  return { added: result.added };
}
