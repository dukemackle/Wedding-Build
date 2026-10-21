import type { UsageEvent } from "@/lib/usage-events";

export type CohortCouple = {
  id: string;
  names: string;
  signedUpAt: string;
};

export type CohortEventRow = { day: string; name: UsageEvent; wedding_id: string | null };

// The first-value moments, in roughly the order a couple reaches them.
const MILESTONES: { label: string; events: UsageEvent[] }[] = [
  { label: "Guests", events: ["guest_added"] },
  { label: "Budget", events: ["budget_edited"] },
  { label: "Checklist", events: ["checklist_done"] },
  { label: "Saved a listing", events: ["listing_saved"] },
  { label: "Contacted", events: ["vendor_inquiry_sent", "venue_inquiry_sent"] },
  { label: "Site live", events: ["site_published"] },
  { label: "Invites", events: ["rsvp_invites_sent"] },
  { label: "Wren", events: ["wren_asked"] },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function dayNumber(signedUpAt: string, day: string) {
  const start = Date.UTC(
    new Date(signedUpAt).getUTCFullYear(),
    new Date(signedUpAt).getUTCMonth(),
    new Date(signedUpAt).getUTCDate(),
  );
  return Math.max(0, Math.round((Date.parse(`${day}T00:00:00Z`) - start) / DAY_MS));
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * The first cohort, one row per real couple: how many separate days they've
 * used the app, and the day (counted from signup) each milestone first
 * happened. At ten couples a row each says more than a funnel percentage.
 */
export function FirstCohort({
  couples,
  events,
}: {
  couples: CohortCouple[];
  events: CohortEventRow[] | null;
}) {
  const byWedding = new Map<string, CohortEventRow[]>();
  for (const row of events ?? []) {
    if (!row.wedding_id) continue;
    const list = byWedding.get(row.wedding_id) ?? [];
    list.push(row);
    byWedding.set(row.wedding_id, list);
  }

  const rows = couples.map((couple) => {
    const own = byWedding.get(couple.id) ?? [];
    const days = [...new Set(own.map((r) => r.day))].sort();
    const firstDay = (names: UsageEvent[]) => {
      const hit = own.filter((r) => names.includes(r.name)).map((r) => r.day).sort()[0];
      return hit ? dayNumber(couple.signedUpAt, hit) : null;
    };
    return {
      ...couple,
      daysActive: days.length,
      lastSeen: days[days.length - 1] ?? null,
      cameBack: days.some((d) => dayNumber(couple.signedUpAt, d) >= 1),
      milestones: MILESTONES.map((m) => firstDay(m.events)),
    };
  });
  const cameBack = rows.filter((r) => r.cameBack).length;

  return (
    <div className="w-full min-w-0 rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-ink">
        First cohort <span className="text-ink/50">({couples.length} real couples)</span>
      </p>
      {events === null ? (
        <p className="mt-3 text-sm text-ink/50">
          Not tracking yet: run migration 0130 (usage events) in Supabase.
        </p>
      ) : couples.length === 0 ? (
        <p className="mt-3 text-sm text-ink/50">No real couples yet.</p>
      ) : (
        <>
          <p className="mt-1 text-xs text-ink/50">
            Came back on a later day: <span className="font-mono-numbers text-ink/80">{cameBack} of {couples.length}</span>.
            Milestones show the day it first happened, counted from signup (day 0). Tracking
            started when migration 0130 ran, so earlier activity isn&apos;t here.
          </p>
          {/* Phone: one card per couple, milestones reached first. */}
          <ul className="mt-3 divide-y divide-hairline md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="py-3">
                <p className="text-sm text-ink">{row.names}</p>
                <p className="mt-0.5 text-xs text-ink/60">
                  Signed up {shortDate(row.signedUpAt)} · {row.daysActive} day
                  {row.daysActive === 1 ? "" : "s"} active
                  {row.lastSeen ? ` · last seen ${shortDate(`${row.lastSeen}T12:00:00Z`)}` : ""}
                </p>
                <p className="mt-1.5 font-mono-numbers text-xs text-forest">
                  {MILESTONES.map((m, i) => ({ label: m.label, day: row.milestones[i] }))
                    .filter((m) => m.day !== null)
                    .sort((a, b) => (a.day ?? 0) - (b.day ?? 0))
                    .map((m) => `${m.label} day ${m.day}`)
                    .join(" · ") || "No milestones yet"}
                </p>
                {row.milestones.some((day) => day === null) && (
                  <p className="mt-0.5 text-xs text-ink/40">
                    Not yet: {MILESTONES.filter((_, i) => row.milestones[i] === null).map((m) => m.label).join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 hidden w-full overflow-x-auto md:block">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
                  <th className="py-2 pr-4 font-medium">Couple</th>
                  <th className="py-2 pr-4 font-medium">Signed up</th>
                  <th className="py-2 pr-4 font-medium">Days active</th>
                  <th className="py-2 pr-4 font-medium">Last seen</th>
                  {MILESTONES.map((m) => (
                    <th key={m.label} className="py-2 pr-3 font-medium">
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-2 pr-4 text-ink">{row.names}</td>
                    <td className="py-2 pr-4 text-ink/70">{shortDate(row.signedUpAt)}</td>
                    <td className="py-2 pr-4 font-mono-numbers text-ink">{row.daysActive}</td>
                    <td className="py-2 pr-4 text-ink/70">
                      {row.lastSeen ? shortDate(`${row.lastSeen}T12:00:00Z`) : "—"}
                    </td>
                    {row.milestones.map((day, i) => (
                      <td key={MILESTONES[i].label} className="py-2 pr-3 font-mono-numbers text-xs">
                        {day === null ? (
                          <span className="text-ink/30">—</span>
                        ) : (
                          <span className="text-forest">day {day}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
