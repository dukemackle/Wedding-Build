import Link from "next/link";

export type Funnels = {
  couples: {
    created: number;
    started: number;
    activated: number;
    inquired: number;
    site: number;
    rsvp: number;
    eligible_for_return: number;
    returned: number;
  };
  listings: Partial<Record<"venue" | "vendor", { viewed: number; saved: number; inquired: number; booked: number }>>;
  events: { name: string; count: number; weddings: number; last_at: string }[];
};

export const PERIODS = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
] as const;

const card = "rounded-lg border border-hairline bg-card shadow-sm";
const pct = (n: number, of: number) => (of ? `${Math.round((n / of) * 100)}%` : "–");
const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** One funnel: each step's count, its share of the first step, and what it lost from the one before. */
function Funnel({ steps }: { steps: { label: string; note: string; count: number }[] }) {
  const top = steps[0]?.count ?? 0;
  return (
    <ol className="divide-y divide-hairline">
      {steps.map((step, i) => {
        const prev = i > 0 ? steps[i - 1].count : null;
        return (
          <li key={step.label} className="px-5 py-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium text-ink">{step.label}</span>
              <span className="shrink-0 font-mono-numbers text-sm text-forest">
                {step.count.toLocaleString()}
                <span className="ml-2 text-xs text-ink/50">{i === 0 ? "" : pct(step.count, top)}</span>
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-hairline/40" aria-hidden>
              <div className="h-2 rounded-full bg-forest" style={{ width: top ? `${(step.count / top) * 100}%` : 0 }} />
            </div>
            <p className="mt-1.5 text-xs text-ink/55">
              {step.note}
              {prev !== null && prev > 0 && step.count < prev ? ` · ${pct(prev - step.count, prev)} drop from the step before` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/** /admin/analytics, given the numbers: `f` is null when they couldn't be pulled. */
export function AnalyticsView({ f, days }: { f: Funnels | null; days: number }) {
  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Funnels</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        Where couples get to and where they stop, from events the app records as things happen. Test weddings are
        left out. Nothing before the events table was switched on is counted.
      </p>

      <nav className="mt-4 flex gap-2" aria-label="Period">
        {PERIODS.map((p) => (
          <Link
            key={p.days}
            href={`/admin/analytics?days=${p.days}`}
            aria-current={p.days === days ? "page" : undefined}
            className={`rounded-full border px-3 py-1 text-xs ${
              p.days === days ? "border-forest bg-forest text-white" : "border-hairline text-ink/70 hover:border-forest"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      {!f ? (
        <p className="mt-6 text-sm text-ink/60">Not pulled: run migration 0130 to start recording events.</p>
      ) : (
        <>
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
            <section className={card}>
              <header className="border-b border-hairline px-5 py-3">
                <h2 className="font-display text-xl font-semibold text-forest">Couples</h2>
                <p className="text-xs text-ink/55">Weddings created in the last {PERIODS.find((p) => p.days === days)?.label}, followed through.</p>
              </header>
              <Funnel
                steps={[
                  { label: "Wedding created", note: "Finished the first-run setup.", count: f.couples.created },
                  { label: "Started planning", note: "Added a guest, set a budget, ticked a task or saved a listing.", count: f.couples.started },
                  { label: "Planning activated", note: "Three or more of those four.", count: f.couples.activated },
                  { label: "Contacted a business", note: "Sent a vendor or venue inquiry.", count: f.couples.inquired },
                  { label: "Guest site live", note: "Turned on their guest site link.", count: f.couples.site },
                  { label: "First RSVP", note: "A guest RSVPed on their site.", count: f.couples.rsvp },
                ]}
              />
              <p className="border-t border-hairline px-5 py-3 text-sm text-ink/70">
                <span className="font-mono-numbers text-forest">
                  {f.couples.returned.toLocaleString()} of {f.couples.eligible_for_return.toLocaleString()}
                </span>{" "}
                came back to the dashboard 30 or more days after signing up
                {f.couples.eligible_for_return ? ` (${pct(f.couples.returned, f.couples.eligible_for_return)})` : ""}. Only
                weddings at least 30 days old count.
              </p>
            </section>

            <div className="space-y-6">
              {(["venue", "vendor"] as const).map((kind) => {
                const l = f.listings[kind] ?? { viewed: 0, saved: 0, inquired: 0, booked: 0 };
                return (
                  <section key={kind} className={card}>
                    <header className="border-b border-hairline px-5 py-3">
                      <h2 className="font-display text-xl font-semibold text-forest">{kind === "venue" ? "Venues" : "Vendors"}</h2>
                      <p className="text-xs text-ink/55">One couple and one listing counts once.</p>
                    </header>
                    <Funnel
                      steps={[
                        { label: "Opened a listing", note: "Signed-in couples only.", count: l.viewed },
                        { label: "Saved it", note: kind === "venue" ? "Added to the shortlist." : "Added to favourites.", count: l.saved },
                        { label: "Sent an inquiry", note: "Through the app's inquiry form.", count: l.inquired },
                        { label: "Booked", note: "Marked booked by the couple.", count: l.booked },
                      ]}
                    />
                  </section>
                );
              })}
            </div>
          </div>

          <section className={`${card} mt-6`}>
            <header className="border-b border-hairline px-5 py-3">
              <h2 className="font-display text-xl font-semibold text-forest">Every event</h2>
              <p className="text-xs text-ink/55">Recorded in this period, including claims and signups that have no wedding yet.</p>
            </header>
            {f.events.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink/70">Nothing recorded yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink/55">
                    <th className="px-5 py-2 font-medium">Event</th>
                    <th className="px-3 py-2 text-right font-medium">Times</th>
                    <th className="px-3 py-2 text-right font-medium">Couples</th>
                    <th className="hidden px-5 py-2 text-right font-medium sm:table-cell">Last</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {f.events.map((e) => (
                    <tr key={e.name}>
                      <td className="break-all px-5 py-2 font-mono-numbers text-xs">{e.name}</td>
                      <td className="px-3 py-2 text-right font-mono-numbers">{e.count.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-mono-numbers">{e.weddings ? e.weddings.toLocaleString() : "–"}</td>
                      <td className="hidden px-5 py-2 text-right font-mono-numbers text-xs text-ink/55 sm:table-cell">
                        {shortDate(e.last_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
