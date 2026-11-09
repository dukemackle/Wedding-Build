import { requireAdmin } from "@/lib/admin";
import { AUTOMATIONS, overdueAfterHours, type AutomationJob } from "@/lib/automation-log";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminEyebrow } from "@/app/admin/admin-nav";
import { HEALTH_DOT, type Health } from "@/app/admin/home-parts";
import { automationHealth, type AutomationRun } from "./health";

const card = "rounded-lg border border-hairline bg-card shadow-sm";
const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });

// Outside the component, like Home's: the page is rendered per request.
const twoWeeksAgo = () => new Date(Date.now() - 14 * 864e5).toISOString();

const STATE_LABEL: Record<Health, string> = { ok: "Running", warn: "Overdue", bad: "Failed", none: "Never reported" };

/**
 * Every scheduled job's latest runs: did it run when it should have, and did
 * it work. Jobs report through /api/automation-log (src/lib/automation-log.ts).
 * Times are UTC.
 */
export default async function AdminAutomationsPage() {
  await requireAdmin();
  const { data, error } = await createAdminSupabaseClient()
    .from("automation_runs")
    .select("id, job, ok, summary, ran_at")
    .gte("ran_at", twoWeeksAgo())
    .order("ran_at", { ascending: false })
    .limit(1000)
    .returns<AutomationRun[]>();

  const runs = data ?? [];
  const jobs = Object.keys(AUTOMATIONS) as AutomationJob[];

  return (
    <div>
      <AdminEyebrow />
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Automations</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        The scheduled jobs and whether each ran on time and worked, from the last 14 days. A job that stops running
        altogether shows as overdue. The backup, the venue-details backfill and the stuck-batch fixer aren&apos;t
        reporting here yet; their runs are on claude.ai under routines. Times are UTC.
      </p>

      {error ? (
        <p className="mt-6 text-sm text-ink/60">Not pulled: run migration 0158 to start the automations log.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {jobs.map((job) => {
            const mine = runs.filter((r) => r.job === job);
            const { state } = automationHealth(job, mine);
            return (
              <section key={job} className={card}>
                <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-hairline px-5 py-3">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${HEALTH_DOT[state]}`} aria-hidden />
                  <h2 className="font-display text-xl font-semibold text-forest">{AUTOMATIONS[job].label}</h2>
                  <span className="text-xs font-medium text-ink/70">{STATE_LABEL[state]}</span>
                  <span className="ml-auto text-xs text-ink/50">
                    {AUTOMATIONS[job].where} · overdue after {overdueAfterHours(job)}h
                  </span>
                </header>
                {mine.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-ink/60">No runs reported in the last 14 days.</p>
                ) : (
                  <ul className="divide-y divide-hairline">
                    {mine.slice(0, 8).map((r) => (
                      <li key={r.id} className="grid grid-cols-[5.5rem_1fr] gap-x-3 px-5 py-2.5 text-sm sm:grid-cols-[6.5rem_3.5rem_1fr]">
                        <span className="font-mono-numbers text-xs text-ink/55 sm:pt-0.5">{when(r.ran_at)}</span>
                        <span className={`text-xs font-medium sm:pt-0.5 ${r.ok ? "text-[#1D7A4C]" : "text-[#B4321F]"}`}>
                          {r.ok ? "OK" : "Failed"}
                        </span>
                        <span className="col-span-2 min-w-0 break-words text-ink/75 sm:col-span-1">{r.summary ?? ""}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
