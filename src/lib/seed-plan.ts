import type { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import { buildPlan } from "@/lib/checklist-template";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Adds Wren's standard checklist to a wedding, beside whatever is already there.
 *
 * It used to be added only when the checklist was empty, so a couple whose
 * first tasks came from the assistant's "Build our plan" never got it -- and
 * the assistant assumes it's there. Now it runs once, on its own, as soon as
 * the date is set (or when the couple presses "Build my plan"). Tasks with a
 * title the couple already has are skipped, and `plan_seeded_at` stops it
 * putting back tasks they've since deleted. `force` is the button: a couple who
 * cleared everything can ask for it again.
 */
export async function seedStandardPlan(
  supabase: Supabase,
  wedding: Wedding,
  userId: string,
  options: { force?: boolean } = {},
): Promise<{ error?: string; added: number }> {
  if (wedding.plan_seeded_at && !options.force) return { added: 0 };

  const { data: existing, error: readError } = await supabase
    .from("checklist_items")
    .select("title")
    .eq("wedding_id", wedding.id)
    .returns<{ title: string }[]>();
  if (readError) return { error: readError.message, added: 0 };

  const have = new Set((existing ?? []).map((item) => item.title.trim().toLowerCase()));
  const planned = buildPlan({
    weddingDate: wedding.wedding_date,
    venueBooked: Boolean(wedding.venue_id),
    budgetSet: Boolean(wedding.budget_target),
    sitePublished: Boolean(wedding.public_slug),
  }).filter((task) => !have.has(task.title.trim().toLowerCase()));

  if (planned.length > 0) {
    const { error } = await supabase.from("checklist_items").insert(
      planned.map((task) => ({
        wedding_id: wedding.id,
        user_id: userId,
        title: task.title,
        notes: task.notes,
        due_date: task.due_date,
        phase: task.phase,
      })),
    );
    if (error) return { error: error.message, added: 0 };
  }

  await supabase
    .from("weddings")
    .update({ plan_seeded_at: new Date().toISOString() })
    .eq("id", wedding.id);

  return { added: planned.length };
}
