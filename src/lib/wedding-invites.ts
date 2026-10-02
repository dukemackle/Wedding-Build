import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Wedding, WeddingRole } from "@/lib/supabase/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ResolvedInvite = { token: string; role: WeddingRole; wedding: Wedding };

/**
 * Looks up an invite link's wedding. The invitee isn't on the wedding yet, so
 * the RLS-scoped client can't see either row -- this goes through the
 * service-role client, and callers do their own checks before writing.
 */
export async function resolveInvite(token: string): Promise<ResolvedInvite | null> {
  if (!UUID.test(token)) return null;

  const admin = createAdminSupabaseClient();
  const { data: invite } = await admin
    .from("wedding_invites")
    .select("token, role, weddings(*)")
    .eq("token", token)
    .maybeSingle<{ token: string; role: WeddingRole; weddings: Wedding | null }>();

  if (!invite?.weddings) return null;
  return { token: invite.token, role: invite.role, wedding: invite.weddings };
}

/**
 * Why this user can't take up the invite, or null if they can. One account
 * plans one wedding: every page finds "my wedding" by owner-or-member, so a
 * second wedding on the same account would leave them seeing neither.
 */
export async function inviteBlocker(
  wedding: Wedding,
  userId: string,
): Promise<"own" | "already" | "other" | null> {
  if (wedding.user_id === userId) return "own";
  if (wedding.member_ids.includes(userId)) return "already";

  const admin = createAdminSupabaseClient();
  const { count } = await admin
    .from("weddings")
    .select("id", { count: "exact", head: true })
    .or(`user_id.eq.${userId},member_ids.cs.{${userId}}`);

  return count ? "other" : null;
}

export const ROLE_PROMISE: Record<WeddingRole, string> = {
  edit: "Accepting lets you see and edit the guest list, budget, seating, and everything else on this wedding.",
  view: "Accepting lets you see the guest list, budget, seating, and everything else on this wedding. You won't be able to change anything.",
};
