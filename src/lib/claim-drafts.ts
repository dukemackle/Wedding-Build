import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/**
 * The server copy of an unsent claim form (supabase/migrations/0142). The
 * browser keeps one too; this is the one that survives another device, a
 * cleared browser, a new link or a listing that changed since they started.
 * Callers resolve the claim token to the listing first -- nothing here checks.
 */

export type ClaimDraft = { data: unknown; savedAt: number };
type Kind = "venue" | "vendor";

// Far above a full form (every FAQ, ten spaces, notes); a guard, not a limit anyone meets.
const MAX_DRAFT_CHARS = 200_000;

export async function loadClaimDraft(kind: Kind, listingId: string): Promise<ClaimDraft | null> {
  const { data } = await createAdminSupabaseClient()
    .from("claim_drafts")
    .select("data, saved_at")
    .eq("kind", kind)
    .eq("listing_id", listingId)
    .maybeSingle<{ data: unknown; saved_at: string }>();
  return data ? { data: data.data, savedAt: new Date(data.saved_at).getTime() } : null;
}

export async function storeClaimDraft(kind: Kind, listingId: string, draft: unknown): Promise<{ error?: string }> {
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) return { error: "Nothing to save." };
  if (JSON.stringify(draft).length > MAX_DRAFT_CHARS) return { error: "Too much to save." };
  const { error } = await createAdminSupabaseClient()
    .from("claim_drafts")
    .upsert({ kind, listing_id: listingId, data: draft, saved_at: new Date().toISOString() });
  return error ? { error: "Couldn't save just now." } : {};
}

export async function deleteClaimDraft(kind: Kind, listingId: string): Promise<void> {
  await createAdminSupabaseClient().from("claim_drafts").delete().eq("kind", kind).eq("listing_id", listingId);
}
