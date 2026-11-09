import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/**
 * Every scheduled job that reports to /admin/automations, how often it is
 * expected to run, and where it runs. A job with no run inside `everyHours`
 * plus a margin is shown as overdue, which catches a job that stopped
 * running altogether (nothing is logged when it never starts).
 */
export const AUTOMATIONS = {
  batches: { label: "Batches (merge + import)", where: "GitHub Action, hourly", everyHours: 1 },
  spend_reminders: { label: "Spend reminders", where: "GitHub Action, daily", everyHours: 24 },
  planning_reminders: { label: "Planning reminders (couples)", where: "GitHub Action, daily", everyHours: 24 },
  batch_builder_west: { label: "Batch builder: West", where: "Claude routine, twice a day", everyHours: 15 },
  batch_builder_central: { label: "Batch builder: Central", where: "Claude routine, twice a day", everyHours: 15 },
  batch_builder_south: { label: "Batch builder: South", where: "Claude routine, twice a day", everyHours: 15 },
  batch_builder_northeast: { label: "Batch builder: Northeast", where: "Claude routine, twice a day", everyHours: 15 },
} as const;

export type AutomationJob = keyof typeof AUTOMATIONS;

export const isAutomationJob = (value: unknown): value is AutomationJob =>
  typeof value === "string" && Object.hasOwn(AUTOMATIONS, value);

/** Hours past the expected interval before a job counts as overdue. */
export const overdueAfterHours = (job: AutomationJob) => Math.ceil(AUTOMATIONS[job].everyHours * 1.5) + 1;

/** Records one run. Never throws: a failed log must not fail the job. */
export async function logAutomationRun(job: AutomationJob, ok: boolean, summary?: string): Promise<void> {
  try {
    const { error } = await createAdminSupabaseClient()
      .from("automation_runs")
      .insert({ job, ok, summary: summary?.slice(0, 300) ?? null });
    if (error) console.error("automation log failed:", error.message);
  } catch (failure) {
    console.error("automation log failed:", failure);
  }
}
