"use server";

import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { WeddingPreferences } from "@/lib/supabase/types";
import { PLANNING_QUESTIONS, type PlanningProfile } from "@/lib/ai/planning-profile";

const MAX_ANSWER_CHARS = 500;

async function currentWedding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<{ id: string }>();
  return wedding ? { supabase, weddingId: wedding.id } : null;
}

export async function loadPlanningProfile(): Promise<PlanningProfile | null> {
  const ctx = await currentWedding();
  if (!ctx) return null;
  const { data } = await ctx.supabase
    .from("wedding_preferences")
    .select("answers, skipped")
    .eq("wedding_id", ctx.weddingId)
    .maybeSingle<Pick<WeddingPreferences, "answers" | "skipped">>();
  return { answers: data?.answers ?? {}, skipped: data?.skipped ?? [] };
}

/**
 * Records one answer (or a skip, when values is empty) and returns the
 * updated profile. Read-modify-write, so two partners answering the same
 * second could drop one answer -- acceptable for a questionnaire.
 */
export async function savePlanningAnswer(
  questionId: string,
  values: string[],
): Promise<{ profile?: PlanningProfile; error?: string }> {
  const question = PLANNING_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return { error: "Unknown question." };

  const cleaned = [...new Set(values.map((v) => v.trim().slice(0, MAX_ANSWER_CHARS)).filter(Boolean))];
  if (cleaned.length > Math.max(question.max, 1) + 1) {
    return { error: `Pick up to ${question.max}.` };
  }

  const ctx = await currentWedding();
  if (!ctx) return { error: "Set up your wedding on the Dashboard first." };

  const current = (await loadPlanningProfile()) ?? { answers: {}, skipped: [] };
  const answers = { ...current.answers };
  let skipped = current.skipped.filter((id) => id !== questionId);
  if (cleaned.length) answers[questionId] = cleaned;
  else {
    delete answers[questionId];
    skipped = [...skipped, questionId];
  }

  const { error } = await ctx.supabase.from("wedding_preferences").upsert({
    wedding_id: ctx.weddingId,
    answers,
    skipped,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Couldn't save that -- try again." };
  return { profile: { answers, skipped } };
}
