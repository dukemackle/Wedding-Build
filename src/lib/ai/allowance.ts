import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/**
 * Per-wedding daily ceilings on the couple-facing AI calls that had none.
 * Generous for real use -- a couple uploads a handful of contracts and writes
 * thank-yous in sittings -- but finite, so a loop or a misbehaving client
 * can't spend without limit. Guest-site calls have their own cap in
 * site-wren.ts.
 */
export const AI_DAILY_CAPS = {
  contract: 10,
  thank_you: 40,
} as const;

export type AiPurpose = keyof typeof AI_DAILY_CAPS;

/**
 * Counts the call before it runs: a failed call is still a paid one. Fails
 * closed -- if the count or the insert errors, the call doesn't happen.
 */
export async function takeAiAllowance(weddingId: string, purpose: AiPurpose): Promise<boolean> {
  const admin = createAdminSupabaseClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await admin
    .from("ai_uses")
    .select("id", { count: "exact", head: true })
    .eq("wedding_id", weddingId)
    .eq("purpose", purpose)
    .gte("created_at", since);
  if (countError || (count ?? 0) >= AI_DAILY_CAPS[purpose]) return false;
  const { error } = await admin.from("ai_uses").insert({ wedding_id: weddingId, purpose });
  return !error;
}
