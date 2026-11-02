import "server-only";
import type { createClient } from "@/lib/supabase/server";

/**
 * The phase_id a form asked for, once it's checked to belong to this wedding.
 * An empty value means "every phase" (null). A phase from another wedding
 * would pass the foreign key, so it's refused here instead.
 */
export async function phaseIdFromForm(
  supabase: Awaited<ReturnType<typeof createClient>>,
  weddingId: string,
  formData: FormData,
): Promise<{ phaseId: string | null } | { error: string }> {
  const requested = ((formData.get("phase_id") as string) || "").trim();
  if (!requested) return { phaseId: null };

  const { data } = await supabase
    .from("layout_phases")
    .select("id")
    .eq("id", requested)
    .eq("wedding_id", weddingId)
    .maybeSingle<{ id: string }>();

  return data ? { phaseId: data.id } : { error: "That event no longer exists." };
}
