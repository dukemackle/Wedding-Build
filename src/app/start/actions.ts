"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { STATE_TO_REGION } from "@/lib/budget-categories";
import { requireEditableWedding, VIEW_ONLY_ERROR } from "@/lib/wedding-access";
import { seedStandardPlan } from "@/lib/seed-plan";
import { SEASONS, STATES, STYLE_TIERS, VENUE_TYPES, seasonOf } from "@/lib/wedding-options";
import type { Wedding } from "@/lib/supabase/types";

const MAX_GUESTS = 2000;

/** A value from one of the fixed option lists, or null for anything else (skipped, blank, tampered). */
function oneOf<T extends string>(list: readonly T[], value: FormDataEntryValue | null): T | null {
  return typeof value === "string" && (list as readonly string[]).includes(value) ? (value as T) : null;
}

/**
 * Creates the wedding from the first-run setup (/start). Only the two names
 * are required: every other answer can be "not yet", and is stored as null so
 * the dashboard asks for it later rather than holding a guess.
 *
 * The dashboard's own form (saveWedding) stays the way to edit afterwards.
 */
export async function startWedding(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding: existing, noWedding } = await requireEditableWedding();

  if (!existing && noWedding === VIEW_ONLY_ERROR) return { error: noWedding };
  // Set up already (a second tab, or the back button after finishing).
  if (existing) redirect("/dashboard");

  const partnerA = String(formData.get("partner_a_name") ?? "").trim();
  const partnerB = String(formData.get("partner_b_name") ?? "").trim();
  if (!partnerA || !partnerB) return { error: "We need both of your names to get started." };

  const rawDate = String(formData.get("wedding_date") ?? "");
  const weddingDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;
  if (weddingDate) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (weddingDate < yesterday) return { error: "That wedding date is in the past. Check the year?" };
  }

  const state = oneOf(STATES, formData.get("state"));
  const guests = Number(formData.get("guest_count"));

  const details = {
    partner_a_name: partnerA,
    partner_b_name: partnerB,
    wedding_date: weddingDate,
    state,
    region: (state && STATE_TO_REGION[state]) ?? null,
    season: (weddingDate && seasonOf(weddingDate)) || oneOf(SEASONS, formData.get("season")),
    style_tier: oneOf(STYLE_TIERS, formData.get("style_tier")),
    venue_type: oneOf(VENUE_TYPES, formData.get("venue_type")),
    guest_count_override: Number.isInteger(guests) && guests > 0 && guests <= MAX_GUESTS ? guests : null,
    updated_at: new Date().toISOString(),
  };

  const { data: saved, error } = await supabase
    .from("weddings")
    .upsert({ user_id: user.id, ...details }, { onConflict: "user_id" })
    .select()
    .maybeSingle<Wedding>();

  if (error) {
    console.error("startWedding failed", error);
    return { error: "We couldn't save your wedding details. Please try again in a moment." };
  }

  // Same as saveWedding: the checklist counts back from the date, so it
  // arrives with one. Without a date it's built when the date is added.
  if (saved?.wedding_date && !saved.plan_seeded_at) {
    const seeded = await seedStandardPlan(supabase, saved, user.id);
    if (seeded.error) console.error("seedStandardPlan failed", seeded.error);
  }

  revalidatePath("/dashboard");
  redirect("/start/done");
}
