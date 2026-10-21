import { requireAdmin } from "@/lib/admin";
import { ERROR_AREA_LABEL, type ErrorArea } from "@/lib/error-log";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

type AppError = {
  id: string;
  day: string;
  area: ErrorArea;
  source: string;
  message: string;
  count: number;
  last_at: string;
};

const DAYS = 14;
const card = "rounded-lg border border-hairline bg-card shadow-sm";
const dayLabel = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });

// Outside the component, like Home's: the page is rendered per request.
const sinceDay = () => new Date(Date.now() - (DAYS - 1) * 864e5).toISOString().slice(0, 10);

/**
 * Server errors from the last two weeks, a day at a time, the busiest first.
 * Written by the onRequestError hook (src/instrumentation.ts) and the failure
 * points that catch their own errors (RSVPs, inquiry emails, Wren); repeats
 * of the same error on the same day are one row with a count.
 */
export default async function AdminErrorsPage() {
  await requireAdmin();
  const { data, error } = await createAdminSupabaseClient()
    .from("app_errors")
    .select("id, day, area, source, message, count, last_at")
    .gte("day", sinceDay())
    .order("day", { ascending: false })
    .order("count", { ascending: false })
    .limit(500)
    .returns<AppError[]>();

  const days = new Map<string, AppError[]>();
  for (const row of data ?? []) days.set(row.day, [...(days.get(row.day) ?? []), row]);

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Errors</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        Server errors from the last {DAYS} days: pages that crashed, RSVPs and photo-wall posts that didn&apos;t
        save, inquiry emails that didn&apos;t send, Wren replies that failed. Emails and phone numbers are removed
        from the text. Times are UTC.
      </p>

      {error ? (
        <p className="mt-6 text-sm text-ink/60">Not pulled: run migration 0128 to start logging errors.</p>
      ) : days.size === 0 ? (
        <p className={`${card} mt-6 px-5 py-4 text-sm text-ink/70`}>No errors in the last {DAYS} days.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {[...days].map(([day, rows]) => (
            <section key={day} className={card}>
              <header className="flex items-baseline justify-between border-b border-hairline px-5 py-3">
                <h2 className="font-display text-xl font-semibold text-forest">{dayLabel(day)}</h2>
                <span className="font-mono-numbers text-xs text-ink/50">
                  {rows.reduce((n, r) => n + r.count, 0).toLocaleString()} total
                </span>
              </header>
              <ul className="divide-y divide-hairline">
                {rows.map((r) => (
                  <li key={r.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-5 py-3 sm:grid-cols-[7rem_1fr_4rem_5rem]">
                    <span className="text-xs font-medium text-ink/70 sm:pt-0.5">{ERROR_AREA_LABEL[r.area] ?? r.area}</span>
                    <span className="order-last col-span-2 min-w-0 sm:order-none sm:col-span-1">
                      <span className="block break-words text-sm">{r.message}</span>
                      <span className="block break-all font-mono-numbers text-[11px] text-ink/45">{r.source}</span>
                    </span>
                    <span className="text-right font-mono-numbers text-sm text-forest">×{r.count.toLocaleString()}</span>
                    <span className="hidden text-right font-mono-numbers text-xs text-ink/50 sm:block sm:pt-0.5">
                      {time(r.last_at)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
