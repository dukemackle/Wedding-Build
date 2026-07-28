"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import {
  BUDGET_CATEGORIES,
  computeCategoryValue,
  effectiveGuestCount,
} from "@/lib/budget-categories";

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

export async function setBudgetOverride(
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

  const overrideValueRaw = formData.get("override_value") as string;
  const overrideValue = Number(overrideValueRaw);
  if (!overrideValueRaw || Number.isNaN(overrideValue) || overrideValue < 0) {
    return { error: "Enter a valid amount." };
  }

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
    },
    { onConflict: "wedding_id,category" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  return {};
}

export async function clearBudgetOverride(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const categoryKey = formData.get("category") as string;

  const { error } = await supabase
    .from("budget_line_items")
    .delete()
    .eq("wedding_id", wedding.id)
    .eq("category", categoryKey);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budget");
  return {};
}
