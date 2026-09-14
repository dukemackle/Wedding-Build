"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import { getResendClient, INQUIRY_FROM_ADDRESS } from "@/lib/resend";
import {
  BUDGET_CATEGORIES,
  computeCategoryValue,
  effectiveGuestCount,
} from "@/lib/budget-categories";

function parseOptionalAmount(raw: FormDataEntryValue | null): number | null | "invalid" {
  const trimmed = (raw as string)?.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (Number.isNaN(value) || value < 0) return "invalid";
  return value;
}

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

export async function setBudgetTarget(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const raw = (formData.get("budget_target") as string)?.trim();
  const budgetTarget = raw ? Number(raw) : null;
  if (raw && (Number.isNaN(budgetTarget) || (budgetTarget as number) < 0)) {
    return { error: "Enter a valid amount." };
  }

  const { error } = await supabase
    .from("weddings")
    .update({ budget_target: budgetTarget })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return {};
}

// Handles the Actual and Paid quick-entry inputs (either can be set
// independently -- a couple might know what they've paid before they've
// settled on a final actual total) as well as the fuller purchased-from/
// paid-by/due-date/notes fields from the notes-icon form. All fields are
// optional except category so any single one can be saved on its own.
export async function updateBudgetLineItem(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const categoryKey = formData.get("category") as string;
  const category = BUDGET_CATEGORIES.find((c) => c.key === categoryKey);
  if (!category) {
    return { error: "Unknown budget category." };
  }

  const overrideValue = parseOptionalAmount(formData.get("override_value"));
  if (overrideValue === "invalid") {
    return { error: "Enter a valid actual cost." };
  }
  const paidAmount = parseOptionalAmount(formData.get("paid_amount"));
  if (paidAmount === "invalid") {
    return { error: "Enter a valid paid amount." };
  }

  const purchasedFrom = ((formData.get("purchased_from") as string) || "").trim() || null;
  const paidBy = ((formData.get("paid_by") as string) || "").trim() || null;
  const dueDate = ((formData.get("due_date") as string) || "").trim() || null;
  const notes = ((formData.get("notes") as string) || "").trim() || null;

  const { data: guests } = await supabase
    .from("guests")
    .select("status, plus_one")
    .eq("wedding_id", wedding.id);

  const guestCount = effectiveGuestCount(wedding, guests ?? []);
  const computed = computeCategoryValue(
    category,
    guestCount,
    wedding.region,
    wedding.season,
    wedding.style_tier,
  );

  const { error } = await supabase.from("budget_line_items").upsert(
    {
      wedding_id: wedding.id,
      user_id: user.id,
      category: category.key,
      label: category.label,
      base_value: computed,
      override_value: overrideValue,
      paid_amount: paidAmount,
      purchased_from: purchasedFrom,
      paid_by: paidBy,
      due_date: dueDate,
      notes,
    },
    { onConflict: "wedding_id,category" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  return {};
}

export async function hideBudgetCategory(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const categoryKey = formData.get("category") as string;
  const hidden = Array.from(new Set([...wedding.hidden_budget_categories, categoryKey]));

  const { error } = await supabase
    .from("weddings")
    .update({ hidden_budget_categories: hidden })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  return {};
}

export async function unhideBudgetCategory(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const categoryKey = formData.get("category") as string;
  const hidden = wedding.hidden_budget_categories.filter((key) => key !== categoryKey);

  const { error } = await supabase
    .from("weddings")
    .update({ hidden_budget_categories: hidden })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  return {};
}

export async function sendBudgetReminder(formData: FormData): Promise<{ error?: string }> {
  const { user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }
  if (!user.email) {
    return { error: "No email on your account to send a reminder to." };
  }
  if (!process.env.RESEND_API_KEY) {
    return { error: "Email sending isn't configured (missing RESEND_API_KEY)." };
  }

  const label = (formData.get("label") as string) || "this item";
  const amountText = (formData.get("amount_text") as string) || "";
  const dueDate = (formData.get("due_date") as string) || "";

  const dueText = dueDate
    ? ` It's due ${new Date(`${dueDate}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
    : "";

  try {
    const resend = getResendClient();
    const { error: sendError } = await resend.emails.send({
      from: INQUIRY_FROM_ADDRESS,
      to: user.email,
      subject: `Payment reminder: ${label}`,
      text: `Just a reminder from Wren: ${label}${amountText ? ` (${amountText})` : ""} is still on your budget to pay.${dueText}`,
    });

    if (sendError) {
      return { error: sendError.message };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to send the reminder." };
  }

  return {};
}

function customItemFieldsFromForm(formData: FormData) {
  const label = (formData.get("label") as string)?.trim();
  if (!label) {
    return { error: "Give the item a name." } as const;
  }

  const amountRaw = formData.get("amount") as string;
  const amount = Number(amountRaw);
  if (!amountRaw || Number.isNaN(amount) || amount < 0) {
    return { error: "Enter a valid amount." } as const;
  }

  const paidAmount = parseOptionalAmount(formData.get("paid_amount"));
  if (paidAmount === "invalid") {
    return { error: "Enter a valid paid amount." } as const;
  }

  return {
    fields: {
      label,
      amount,
      paid_amount: paidAmount,
      purchased_from: ((formData.get("purchased_from") as string) || "").trim() || null,
      paid_by: ((formData.get("paid_by") as string) || "").trim() || null,
      due_date: ((formData.get("due_date") as string) || "").trim() || null,
      notes: ((formData.get("notes") as string) || "").trim() || null,
    },
  } as const;
}

export async function addBudgetCustomItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const parsed = customItemFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase.from("budget_custom_items").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    ...parsed.fields,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return {};
}

export async function updateBudgetCustomItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;
  const parsed = customItemFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase
    .from("budget_custom_items")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteBudgetCustomItem(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const itemId = formData.get("id") as string;

  const { error } = await supabase
    .from("budget_custom_items")
    .delete()
    .eq("id", itemId)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  revalidatePath("/dashboard");
  return {};
}
