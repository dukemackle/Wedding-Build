import { requireAdmin } from "@/lib/admin";
import { stateTargets } from "@/lib/coverage-targets";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { CoverageView, rank, type StateCounts } from "./coverage-view";

const DAYS = 90;

/**
 * Live listings per state against the coverage plan, ranked by what's still
 * needed with couple demand counting extra. Counts come from
 * admin_coverage() (migration 0131); targets from scripts/coverage-plan.mjs.
 */
export default async function AdminCoveragePage() {
  await requireAdmin();
  const { data, error } = await createAdminSupabaseClient().rpc("admin_coverage", { p_days: DAYS });
  const rows = error || !data ? null : rank(data as StateCounts[], stateTargets());
  return <CoverageView rows={rows} days={DAYS} />;
}
