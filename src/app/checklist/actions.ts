"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildPlan } from "@/lib/checklist-template";
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
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const { count, error: countError } = await supabase
    .from("checklist_items")
    .select("id", { count: "exact", head: true })
    .eq("wedding_id", wedding.id);

  if (countError) {
    return { error: countError.message };
  }
  if ((count ?? 0) > 0) {
    return { error: "You already have tasks — clear them first if you want to start over." };
  }

  const planned = buildPlan({
    weddingDate: wedding.wedding_date,
    venueBooked: Boolean(wedding.venue_id),
    budgetSet: Boolean(wedding.budget_target),
    sitePublished: Boolean(wedding.public_slug),
  });

  const { error } = await supabase.from("checklist_items").insert(
    planned.map((task) => ({
      wedding_id: wedding.id,
      user_id: user.id,
      title: task.title,
      notes: task.notes,
      due_date: task.due_date,
      phase: task.phase,
    })),
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/checklist");
  revalidatePath("/dashboard");
  return { added: planned.length };
}
