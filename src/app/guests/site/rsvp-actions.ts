"use server";

import { revalidatePath } from "next/cache";
import { MAX_MEAL_OPTIONS } from "@/lib/meal-options";
import { requireEditableWedding } from "@/lib/wedding-access";

/**
 * The RSVP form's questions: the couple's menu and whether to ask about
 * dietary needs. An empty menu (or one dish) means guests aren't asked to
 * choose. Saves straight to the site, like a section's words.
 */
export async function saveRsvpQuestions(input: {
  askMeal: boolean;
  meals: string[];
  askDietary: boolean;
}): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const seen = new Set<string>();
  const meals = (Array.isArray(input.meals) ? input.meals : [])
    .map((m) => (typeof m === "string" ? m.trim().slice(0, 80) : ""))
    .filter((m) => m && !seen.has(m.toLowerCase()) && seen.add(m.toLowerCase()))
    .slice(0, MAX_MEAL_OPTIONS);

  const { error } = await supabase
    .from("weddings")
    .update({ meal_options: input.askMeal ? meals : [], ask_dietary: Boolean(input.askDietary) })
    .eq("id", wedding.id);
  if (error) return { error: "Couldn't save that — try again." };

  revalidatePath("/guests/site");
  revalidatePath("/guests");
  if (wedding.public_slug) revalidatePath(`/w/${wedding.public_slug}`);
  return {};
}
