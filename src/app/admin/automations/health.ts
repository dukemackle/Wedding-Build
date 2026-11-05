import { overdueAfterHours, type AutomationJob } from "@/lib/automation-log";
import type { Health } from "@/app/admin/home-parts";

export type AutomationRun = { id: string; job: string; ok: boolean; summary: string | null; ran_at: string };

/**
 * A job's state from its runs, newest first: failed if the latest run
 * failed, overdue if it hasn't reported within its window, never reported
 * if it has no runs.
 */
export function automationHealth(job: AutomationJob, runs: AutomationRun[]): { state: Health; last?: AutomationRun } {
  const last = runs[0];
  if (!last) return { state: "none" };
  if (!last.ok) return { state: "bad", last };
  const hours = (Date.now() - new Date(last.ran_at).getTime()) / 36e5;
  return { state: hours > overdueAfterHours(job) ? "warn" : "ok", last };
}
