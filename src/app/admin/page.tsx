import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { STATE_ABBR } from "@/lib/listing-pin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { selectAll } from "@/lib/supabase/fetch-all";

// The coverage floor from scripts/coverage-plan.mjs (MIN_VENUES): every state
// needs this many venues before any marketing.
const MIN_VENUES = 15;
const DAY = 864e5;

const card = "rounded-lg border border-hairline bg-card shadow-sm";
const link = "shrink-0 font-mono-numbers text-sm text-forest underline decoration-brass underline-offset-4 hover:decoration-2";

function daysAgo(iso: string | null | undefined) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

// Outside the component, like Growth's: the page is rendered per request.
const isoDaysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString();

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

function KpiCard({ href, value, label, change, definition }: { href: string; value: number; label: string; change: string; definition: string }) {
  return (
    <Link href={href} className="block rounded-lg border border-hairline bg-card p-4 transition-colors hover:border-forest/30">
      <p className="font-mono-numbers text-2xl font-semibold text-forest">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-ink/70">{label}</p>
      <p className="mt-2 font-mono-numbers text-[11px] text-ink/50">{change}</p>
      <p className="mt-2 text-[11px] leading-snug text-ink/45">{definition}</p>
    </Link>
  );
}

/**
 * Admin Home: what needs the owner first, then the handful of numbers that say
 * how the company is doing, coverage and system health. Everything is read
 * live on page load; anything not measured yet says so rather than showing 0.
 */
export default async function AdminHomePage() {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const d30 = isoDaysAgo(30);
  const d60 = isoDaysAgo(60);
  const count = (table: string) => admin.from(table).select("id", { count: "exact", head: true });

  const [
    { data: weddings },
    { data: inquiries },
    { data: venueInquiries },
    { count: venueClaims },
    { count: vendorClaims },
    { count: openReports },
    { count: marketReports },
    { count: pendingPosts },
    { count: bounces },
    { data: newFeedback, count: newFeedbackCount },
    { count: publishedSites },
    { count: liveVenues },
    { count: newVenues },
    { count: prevVenues },
    { count: liveVendors },
    { count: newVendors },
    { count: prevVendors },
    { count: approvedVenueClaims },
    { count: approvedVendorClaims },
    { data: lastVenue },
    { data: lastVendor },
    { data: lastAdminChange },
    { data: stateCounts, error: stateCountsError },
    { data: recentErrors, error: errorsError },
  ] = await Promise.all([
    selectAll<{ id: string; is_test: boolean; created_at: string }>(admin, "weddings", "id, is_test, created_at"),
    selectAll<{ id: string; wedding_id: string; sent_at: string }>(admin, "vendor_inquiries", "id, wedding_id, sent_at"),
    selectAll<{ id: string; wedding_id: string; sent_at: string }>(admin, "venue_inquiries", "id, wedding_id, sent_at"),
    count("venue_submissions").eq("status", "pending"),
    count("vendor_submissions").eq("status", "pending"),
    count("listing_reports").eq("status", "open"),
    count("market_reports").eq("status", "open"),
    count("guest_posts").eq("status", "pending"),
    admin.from("email_bounces").select("email", { count: "exact", head: true }),
    admin
      .from("feedback_submissions")
      .select("created_at", { count: "exact" })
      .eq("status", "new")
      .order("created_at", { ascending: true })
      .limit(1)
      .returns<{ created_at: string }[]>(),
    count("weddings").eq("is_test", false).not("site_design", "is", null),
    count("venues").eq("active", true),
    count("venues").eq("active", true).gte("created_at", d30),
    count("venues").eq("active", true).gte("created_at", d60).lt("created_at", d30),
    count("vendors").eq("active", true).eq("is_sample", false),
    count("vendors").eq("active", true).eq("is_sample", false).gte("created_at", d30),
    count("vendors").eq("active", true).eq("is_sample", false).gte("created_at", d60).lt("created_at", d30),
    count("venue_submissions").eq("status", "approved"),
    count("vendor_submissions").eq("status", "approved"),
    admin.from("venues").select("created_at").order("created_at", { ascending: false }).limit(1).returns<{ created_at: string }[]>(),
    admin.from("vendors").select("created_at").order("created_at", { ascending: false }).limit(1).returns<{ created_at: string }[]>(),
    admin.from("admin_audit_log").select("created_at").order("created_at", { ascending: false }).limit(1).returns<{ created_at: string }[]>(),
    admin.rpc("admin_listing_state_counts"),
    admin.from("app_errors").select("day, count").gte("day", isoDaysAgo(6).slice(0, 10)).returns<{ day: string; count: number }[]>(),
  ]);

  // Test weddings (marked on the Couples page) are left out of every couple
  // and inquiry number, as on Growth and Reported bookings.
  const testIds = new Set(weddings.filter((w) => w.is_test).map((w) => w.id));
  const real = weddings.filter((w) => !w.is_test);
  const inWindow = (iso: string, from: string, to?: string) => iso >= from && (!to || iso < to);
  const realInquiries = [...inquiries, ...venueInquiries].filter((i) => !testIds.has(i.wedding_id));

  const listings = (liveVenues ?? 0) + (liveVendors ?? 0);
  const claimed = (approvedVenueClaims ?? 0) + (approvedVendorClaims ?? 0);
  const lastListing = [lastVenue?.[0]?.created_at, lastVendor?.[0]?.created_at].filter(Boolean).sort().at(-1);
  const oldestFeedback = daysAgo(newFeedback?.[0]?.created_at);

  // app_errors rows are one per error per UTC day, with a repeat count.
  const today = new Date().toISOString().slice(0, 10);
  const errorsToday = (recentErrors ?? []).filter((e) => e.day === today).reduce((n, e) => n + e.count, 0);
  const errorsWeek = (recentErrors ?? []).reduce((n, e) => n + e.count, 0);

  // Anything with a count goes in the queue; the rest are listed as clear.
  const queue = [
    { n: venueClaims ?? 0, label: "venue claims", item: (n: number) => plural(n, "venue claim"), href: "/admin/venues/claims", action: "Review" },
    { n: vendorClaims ?? 0, label: "vendor claims", item: (n: number) => plural(n, "vendor claim"), href: "/admin/vendors/claims", action: "Review" },
    { n: openReports ?? 0, label: "listing reports", item: (n: number) => plural(n, "listing report"), href: "/admin/listing-health", action: "Fix" },
    { n: bounces ?? 0, label: "bounced emails", item: (n: number) => plural(n, "bounced email"), href: "/admin/listing-health", action: "Check" },
    { n: marketReports ?? 0, label: "Buy & sell reports", item: (n: number) => plural(n, "Buy & sell report"), href: "/admin/marketplace", action: "Review" },
    {
      n: newFeedbackCount ?? 0,
      label: "feedback",
      item: (n: number) => plural(n, "new feedback message"),
      detail: oldestFeedback && `Oldest came in ${oldestFeedback}`,
      href: "/admin/feedback",
      action: "Read",
    },
    {
      n: errorsToday,
      label: "app errors",
      item: (n: number) => `${plural(n, "app error")} today`,
      detail: "Server errors since midnight UTC",
      href: "/admin/errors",
      action: "View",
    },
    { n: pendingPosts ?? 0, label: "photo-wall posts", item: (n: number) => `${plural(n, "photo-wall post")} awaiting couples`, href: "/admin/photo-wall", action: "Look" },
  ];
  // Until migration 0128 runs, errors are "not pulled", not "all clear".
  const tracked = queue.filter((q) => !(errorsError && q.label === "app errors"));
  const waiting = tracked.filter((q) => q.n > 0);
  const clear = tracked.filter((q) => q.n === 0);
  const noTestCouples = testIds.size === 0 && real.length > 0;

  const byState = new Map(
    ((stateCounts ?? []) as { state: string; venues: number; vendors: number }[]).map((s) => [s.state, s]),
  );
  const states = Object.keys(STATE_ABBR).map((state) => ({
    state,
    venues: Number(byState.get(state)?.venues ?? 0),
    vendors: Number(byState.get(state)?.vendors ?? 0),
  }));
  const atFloor = states.filter((s) => s.venues >= MIN_VENUES).length;
  const thinnest = [...states].sort((a, b) => a.venues - b.venues || a.vendors - b.vendors).slice(0, 3);

  const health: { label: string; value: string; muted?: boolean; href?: string }[] = [
    { label: "Last listing added", value: daysAgo(lastListing) ?? "none yet" },
    { label: "Bounced emails", value: (bounces ?? 0).toLocaleString() },
    { label: "Last admin change", value: daysAgo(lastAdminChange?.[0]?.created_at) ?? "none logged" },
    { label: "Infra usage", value: "not pulled · /weekly-review", muted: true },
    errorsError
      ? { label: "App errors", value: "not pulled · migration 0128", muted: true }
      : { label: "App errors", value: `${errorsToday.toLocaleString()} today · ${errorsWeek.toLocaleString()} in 7 days`, href: "/admin/errors" },
  ];

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-semibold text-forest">Home</h1>
        <p className="text-xs text-ink/50">Live from the database · last 30 days vs the 30 before</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={card}>
            <header className="flex items-center justify-between border-b border-hairline px-5 py-3">
              <h2 className="font-display text-xl font-semibold text-forest">Needs you</h2>
              {waiting.length + (noTestCouples ? 1 : 0) > 0 && (
                <span className="rounded-full bg-brass px-2 font-mono-numbers text-xs text-ink">
                  {waiting.length + (noTestCouples ? 1 : 0)}
                </span>
              )}
            </header>
            <ul className="divide-y divide-hairline">
              {waiting.map((q) => (
                <li key={q.label} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">{q.item(q.n)}</p>
                    {q.detail && <p className="text-xs text-ink/55">{q.detail}</p>}
                  </div>
                  <Link href={q.href} className={link}>
                    {q.action} &rarr;
                  </Link>
                </li>
              ))}
              {noTestCouples && (
                <li className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">No couples are marked as test</p>
                    <p className="text-xs text-ink/55">
                      {plural(real.length, "couple")} count as real. If any are yours, every number below is inflated.
                    </p>
                  </div>
                  <Link href="/admin/couples" className={link}>
                    Couples &rarr;
                  </Link>
                </li>
              )}
              {waiting.length === 0 && !noTestCouples && (
                <li className="px-5 py-4 text-sm text-ink/70">Nothing needs you right now.</li>
              )}
            </ul>
            {clear.length > 0 && (
              <p className="border-t border-hairline px-5 py-3 text-xs text-ink/50">
                All clear: {clear.map((q) => q.label).join(" · ")}
              </p>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-mono-numbers text-[11px] uppercase tracking-[0.14em] text-ink/50">The numbers</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <KpiCard
                href="/admin/couples"
                value={real.length}
                label="Real couples"
                change={`+${real.filter((w) => inWindow(w.created_at, d30)).length} in 30d · ${real.filter((w) => inWindow(w.created_at, d60, d30)).length} before`}
                definition="Weddings not marked test"
              />
              <KpiCard
                href="/admin/revenue"
                value={realInquiries.length}
                label="Inquiries sent"
                change={`${realInquiries.filter((i) => inWindow(i.sent_at, d30)).length} in 30d · ${realInquiries.filter((i) => inWindow(i.sent_at, d60, d30)).length} before`}
                definition="Vendor + venue, from real couples"
              />
              <KpiCard
                href="/admin/growth"
                value={publishedSites ?? 0}
                label="Guest sites published"
                change={`of ${plural(real.length, "couple")}`}
                definition="Real couples with a published site design"
              />
              <KpiCard
                href="/admin/venues"
                value={liveVenues ?? 0}
                label="Live venues"
                change={`+${(newVenues ?? 0).toLocaleString()} in 30d · ${(prevVenues ?? 0).toLocaleString()} before`}
                definition="Active listings"
              />
              <KpiCard
                href="/admin/vendors"
                value={liveVendors ?? 0}
                label="Live vendors"
                change={`+${(newVendors ?? 0).toLocaleString()} in 30d · ${(prevVendors ?? 0).toLocaleString()} before`}
                definition="Active, not sample"
              />
              <KpiCard
                href="/admin/venues/claims"
                value={claimed}
                label="Approved claims"
                change={`${listings ? ((claimed / listings) * 100).toFixed(1) : 0}% of ${listings.toLocaleString()} listings`}
                definition="Venue + vendor claims approved"
              />
            </div>
            <p className="mt-3 text-xs text-ink/50">
              No company revenue yet: Phase 0 is free. Couple-reported bookings are on{" "}
              <Link href="/admin/revenue" className="underline hover:text-forest">
                Reported bookings
              </Link>
              .
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className={`${card} p-5`}>
            <h2 className="font-display text-xl font-semibold text-forest">Coverage</h2>
            {stateCountsError ? (
              <p className="mt-3 text-sm text-ink/60">Not pulled: run migration 0127 to count listings per state.</p>
            ) : (
              <>
                <p className="mt-3 font-mono-numbers text-sm">
                  <span className="text-2xl font-semibold text-forest">{atFloor}</span>{" "}
                  <span className="text-ink/50">
                    / {states.length} states at the {MIN_VENUES}-venue floor
                  </span>
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-hairline" aria-hidden>
                  <div className="h-full rounded-full bg-forest" style={{ width: `${(atFloor / states.length) * 100}%` }} />
                </div>
                <p className="mt-4 text-xs font-medium text-ink/70">Thinnest states</p>
                <ul className="mt-1 space-y-1 font-mono-numbers text-xs text-ink/70">
                  {thinnest.map((s, i) => (
                    <li key={s.state} className="flex justify-between gap-3">
                      <span>{s.state}</span>
                      <span>{i === 0 ? `${s.venues} venues · ${s.vendors} vendors` : `${s.venues} · ${s.vendors}`}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-3 text-[11px] text-ink/45">
              From live listings. Metro-level targets: <code>npm run coverage</code>.
            </p>
          </section>

          <section className={`${card} p-5`}>
            <h2 className="font-display text-xl font-semibold text-forest">System health</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {health.map((h) => (
                <li key={h.label} className="flex justify-between gap-3">
                  {h.href ? (
                    <Link href={h.href} className="text-ink/70 underline decoration-hairline underline-offset-4 hover:text-forest">
                      {h.label}
                    </Link>
                  ) : (
                    <span className="text-ink/70">{h.label}</span>
                  )}
                  <span className={`text-right font-mono-numbers text-xs ${h.muted ? "text-ink/45" : ""}`}>{h.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
