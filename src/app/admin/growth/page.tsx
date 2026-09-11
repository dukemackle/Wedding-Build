import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

type FeatureRow = { label: string; adopted: number };

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function riskCutoffTimestamp(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function last12MonthKeys() {
  const now = new Date();
  const keys: { key: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: monthLabel(d.getFullYear(), d.getMonth()),
    });
  }
  return keys;
}

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const widthPct = max === 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-36 shrink-0 text-xs text-ink/60">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-hairline/40">
        <div
          className="h-2 rounded-full bg-forest"
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right font-mono-numbers text-xs text-ink/70">
        {count}
      </span>
    </div>
  );
}

const AT_RISK_DAYS = 7;

export default async function AdminGrowthPage() {
  const admin = createAdminSupabaseClient();

  const [
    { data: weddings },
    { data: guests },
    { data: budgetLineItems },
    { data: seatingTables },
    { data: itineraryEvents },
    { data: vendorInquiries },
    { data: venueShortlist },
    { data: checklistItems },
    { data: usersPage },
  ] = await Promise.all([
    admin
      .from("weddings")
      .select("id, user_id, partner_a_name, partner_b_name, created_at")
      .returns<
        {
          id: string;
          user_id: string;
          partner_a_name: string | null;
          partner_b_name: string | null;
          created_at: string;
        }[]
      >(),
    admin
      .from("guests")
      .select("wedding_id, invite_sent_at")
      .returns<{ wedding_id: string; invite_sent_at: string | null }[]>(),
    admin.from("budget_line_items").select("wedding_id").returns<{ wedding_id: string }[]>(),
    admin.from("seating_tables").select("wedding_id").returns<{ wedding_id: string }[]>(),
    admin.from("itinerary_events").select("wedding_id").returns<{ wedding_id: string }[]>(),
    admin.from("vendor_inquiries").select("wedding_id").returns<{ wedding_id: string }[]>(),
    admin.from("venue_shortlist").select("wedding_id").returns<{ wedding_id: string }[]>(),
    admin.from("checklist_items").select("wedding_id").returns<{ wedding_id: string }[]>(),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const totalWeddings = weddings?.length ?? 0;

  const months = last12MonthKeys();
  const countsByMonth = new Map(months.map((m) => [m.key, 0]));
  for (const wedding of weddings ?? []) {
    const d = new Date(wedding.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (countsByMonth.has(key)) {
      countsByMonth.set(key, (countsByMonth.get(key) ?? 0) + 1);
    }
  }
  const maxMonthCount = Math.max(1, ...Array.from(countsByMonth.values()));

  function distinctWeddingCount(rows: { wedding_id: string }[]) {
    return new Set(rows.map((r) => r.wedding_id)).size;
  }

  const features: FeatureRow[] = [
    { label: "Added guests", adopted: distinctWeddingCount(guests ?? []) },
    {
      label: "Sent RSVP invites",
      adopted: distinctWeddingCount(
        (guests ?? []).filter((g) => g.invite_sent_at != null),
      ),
    },
    { label: "Customized budget", adopted: distinctWeddingCount(budgetLineItems ?? []) },
    { label: "Built a seating chart", adopted: distinctWeddingCount(seatingTables ?? []) },
    { label: "Added itinerary events", adopted: distinctWeddingCount(itineraryEvents ?? []) },
    { label: "Contacted vendors", adopted: distinctWeddingCount(vendorInquiries ?? []) },
    { label: "Shortlisted a venue", adopted: distinctWeddingCount(venueShortlist ?? []) },
    { label: "Built a checklist", adopted: distinctWeddingCount(checklistItems ?? []) },
  ];

  // A couple who's touched none of the core planning tools some days after
  // signing up is worth a nudge -- most likely to actually come back to a
  // personal check-in rather than a generic re-engagement blast.
  const activeWeddingIds = new Set([
    ...(guests ?? []).map((r) => r.wedding_id),
    ...(budgetLineItems ?? []).map((r) => r.wedding_id),
    ...(seatingTables ?? []).map((r) => r.wedding_id),
    ...(itineraryEvents ?? []).map((r) => r.wedding_id),
    ...(vendorInquiries ?? []).map((r) => r.wedding_id),
    ...(venueShortlist ?? []).map((r) => r.wedding_id),
    ...(checklistItems ?? []).map((r) => r.wedding_id),
  ]);
  const emailByUserId = new Map<string, string>();
  for (const user of usersPage?.users ?? []) {
    if (user.email) emailByUserId.set(user.id, user.email);
  }
  // Approximate, not exact: counts invite + follow-up sends but not every
  // resend/reminder path individually -- good enough for "are we anywhere
  // near the free tier," not for a real audit.
  const approxEmailsSent =
    (guests ?? []).filter((g) => g.invite_sent_at != null).length +
    (vendorInquiries ?? []).length;

  const riskCutoff = riskCutoffTimestamp(AT_RISK_DAYS);
  const atRiskCouples = (weddings ?? [])
    .filter(
      (w) => !activeWeddingIds.has(w.id) && new Date(w.created_at).getTime() < riskCutoff,
    )
    .map((w) => ({
      id: w.id,
      names: [w.partner_a_name, w.partner_b_name].filter(Boolean).join(" & ") || "—",
      email: emailByUserId.get(w.user_id) ?? null,
      createdAt: w.created_at,
    }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Growth</h1>

      <div className="w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-ink">Signups by month</p>
        <div className="mt-3">
          {months.map((m) => (
            <Bar
              key={m.key}
              label={m.label}
              count={countsByMonth.get(m.key) ?? 0}
              max={maxMonthCount}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-ink">
          Feature adoption <span className="text-ink/50">({totalWeddings} couples total)</span>
        </p>
        <div className="mt-3">
          {features.map((feature) => (
            <Bar
              key={feature.label}
              label={feature.label}
              count={feature.adopted}
              max={Math.max(1, totalWeddings)}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-ink">
          At risk{" "}
          <span className="text-ink/50">
            (signed up {AT_RISK_DAYS}+ days ago, no activity yet)
          </span>
        </p>
        {atRiskCouples.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">Nobody fits that right now.</p>
        ) : (
          <div className="mt-3 w-full overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
                  <th className="py-2 pr-4 font-medium">Couple</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 font-medium">Signed up</th>
                </tr>
              </thead>
              <tbody>
                {atRiskCouples.map((couple) => (
                  <tr key={couple.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-2 pr-4 text-ink">{couple.names}</td>
                    <td className="py-2 pr-4 text-ink/70">
                      {couple.email ? (
                        <a
                          href={`mailto:${couple.email}`}
                          className="text-brass hover:underline"
                        >
                          {couple.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 text-ink/70">
                      {new Date(couple.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-ink">Site health &amp; free-tier awareness</p>
        <p className="mt-1 text-xs text-ink/50">
          Rough in-app proxies only — each provider&apos;s own dashboard is the real source of
          truth for usage and billing.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-hairline p-4">
            <p className="text-sm font-medium text-ink">Cloudflare Workers</p>
            <p className="mt-1 text-xs text-ink/60">Free tier: 100k requests/day</p>
            <a
              href="https://dash.cloudflare.com"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-mono-numbers text-xs text-brass hover:underline"
            >
              Open dashboard &rarr;
            </a>
          </div>
          <div className="rounded-md border border-hairline p-4">
            <p className="text-sm font-medium text-ink">Supabase</p>
            <p className="mt-1 text-xs text-ink/60">
              Free tier: 500MB DB, 50k monthly active users
            </p>
            <p className="mt-1 font-mono-numbers text-xs text-ink/70">
              {totalWeddings} couple{totalWeddings === 1 ? "" : "s"} in the DB
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-mono-numbers text-xs text-brass hover:underline"
            >
              Open dashboard &rarr;
            </a>
          </div>
          <div className="rounded-md border border-hairline p-4">
            <p className="text-sm font-medium text-ink">Resend</p>
            <p className="mt-1 text-xs text-ink/60">Free tier: 100/day, 3,000/month</p>
            <p className="mt-1 font-mono-numbers text-xs text-ink/70">
              ~{approxEmailsSent} sent (invites + vendor inquiries, lifetime)
            </p>
            <a
              href="https://resend.com/emails"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-mono-numbers text-xs text-brass hover:underline"
            >
              Open dashboard &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
