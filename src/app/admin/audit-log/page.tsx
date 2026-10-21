import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AREAS, AuditLogView, PAGE_SIZE, type Area, type Entry } from "./audit-log-view";

/**
 * Every change made through the admin panel, newest first: who, when and
 * what. Written by logAdminAction() after each change succeeds; nothing here
 * can edit or remove an entry.
 */
export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const area: Area = params.area && params.area in AREAS ? (params.area as Area) : "all";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  let query = createAdminSupabaseClient()
    .from("admin_audit_log")
    .select("id, created_at, actor_email, action, target_type, target_ids, summary", { count: "exact" });
  const prefixes: readonly string[] = AREAS[area].prefixes;
  if (prefixes.length > 0) query = query.or(prefixes.map((p) => `action.like.${p}%`).join(","));
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + PAGE_SIZE - 1)
    .returns<Entry[]>();

  return <AuditLogView entries={data ?? []} total={count ?? 0} area={area} page={page} error={error?.message} />;
}
