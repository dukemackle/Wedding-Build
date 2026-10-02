import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Wedding, WeddingInvite, WeddingMember, WeddingRole } from "@/lib/supabase/types";

export type Planner = { userId: string; email: string; role: WeddingRole | "owner" };

export type PlannersData = {
  planners: Planner[];
  /** Only the owner can see outstanding links; empty for everyone else. */
  invites: Pick<WeddingInvite, "token" | "role">[];
  myRole: WeddingRole | "owner";
};

/**
 * Everyone on the wedding, for "Invite to plan". Membership comes through the
 * RLS-scoped client (so it's only ever the caller's own wedding); emails live
 * on auth.users, which only the service-role client can read.
 */
export async function loadPlanners(
  supabase: SupabaseClient,
  wedding: Wedding,
  userId: string,
): Promise<PlannersData> {
  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase
      .from("wedding_members")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at")
      .returns<WeddingMember[]>(),
    supabase
      .from("wedding_invites")
      .select("token, role")
      .eq("wedding_id", wedding.id)
      .order("created_at")
      .returns<Pick<WeddingInvite, "token" | "role">[]>(),
  ]);

  const admin = createAdminSupabaseClient();
  const ids = [wedding.user_id, ...(members ?? []).map((m) => m.user_id)];
  const emails = await Promise.all(
    ids.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      return data.user?.email ?? "";
    }),
  );

  const planners: Planner[] = [
    { userId: wedding.user_id, email: emails[0], role: "owner" },
    ...(members ?? []).map((m, i) => ({ userId: m.user_id, email: emails[i + 1], role: m.role })),
  ];

  const me = planners.find((p) => p.userId === userId);
  return { planners, invites: invites ?? [], myRole: me?.role ?? "view" };
}
