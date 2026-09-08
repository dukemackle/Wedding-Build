import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

type FeatureRow = { label: string; adopted: number };

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
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
  ] = await Promise.all([
    admin.from("weddings").select("id, created_at").returns<{ id: string; created_at: string }[]>(),
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
        <p className="text-sm font-medium text-ink">Site health</p>
        <p className="mt-2 text-sm text-ink/70">
          Request-level logs, errors, and traffic live in Cloudflare&apos;s own dashboard.
        </p>
        <a
          href="https://dash.cloudflare.com"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block font-mono-numbers text-sm text-brass hover:underline"
        >
          Open Cloudflare dashboard &rarr;
        </a>
      </div>
    </div>
  );
}
