import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { STATE_ABBR } from "@/lib/listing-pin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { selectAll } from "@/lib/supabase/fetch-all";
import { AdminEyebrow } from "./admin-nav";
import { HEALTH_DOT, KpiGroup, KpiTile, Panel, QueueRow, StateTileMap, type Health, type Urgency } from "./home-parts";
import type { AdminIconName } from "./admin-icons";
import { marketStats } from "./market-stats";
import { MarketTiles } from "./market-tiles";

// The coverage floor from scripts/coverage-plan.mjs (MIN_VENUES): every state
// needs this many venues before any marketing.
const MIN_VENUES = 15;
const DAY = 864e5;

function daysAgo(iso: string | null | undefined) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}

// Outside the component, like Growth's: the page is rendered per request.
const isoDaysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString();

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

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
  const d90 = isoDaysAgo(90);
  const count = (table: string) => admin.from(table).select("id", { count: "exact", head: true });

  const [
    market,
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
    { count: olderVenues },
    { count: olderVendors },
    { count: approvedVenueClaims },
    { count: approvedVendorClaims },
    { data: lastVenue },
    { data: lastVendor },
    { data: lastAdminChange },
    { data: stateCounts, error: stateCountsError },
    { data: recentErrors, error: errorsError },
  ] = await Promise.all([
    marketStats(),
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
    count("venues").eq("active", true).gte("created_at", d90).lt("created_at", d60),
    count("vendors").eq("active", true).eq("is_sample", false).gte("created_at", d90).lt("created_at", d60),
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
  // Urgency is how soon it hurts: errors break the app for couples now,
  // claims and reports are businesses waiting on us, the rest can wait.
  type QueueItem = {
    n: number;
    label: string;
    item: (n: number) => string;
    detail?: string | null;
    href: string;
    action: string;
    icon: AdminIconName;
    urgency: Urgency;
  };
  const queue: QueueItem[] = [
    {
      n: errorsToday,
      label: "app errors",
      item: (n) => `${plural(n, "app error")} today`,
      detail: "Server errors since midnight UTC",
      href: "/admin/errors",
      action: "View errors",
      icon: "alert",
      urgency: "urgent",
    },
    { n: venueClaims ?? 0, label: "venue claims", item: (n) => `${plural(n, "venue claim")} to review`, href: "/admin/venues/claims", action: "Review", icon: "claim", urgency: "soon" },
    { n: vendorClaims ?? 0, label: "vendor claims", item: (n) => `${plural(n, "vendor claim")} to review`, href: "/admin/vendors/claims", action: "Review", icon: "claim", urgency: "soon" },
    { n: openReports ?? 0, label: "listing reports", item: (n) => plural(n, "listing report"), detail: "Couples flagged a listing as wrong or closed", href: "/admin/listing-health", action: "Fix", icon: "flag", urgency: "soon" },
    { n: marketReports ?? 0, label: "Buy & sell reports", item: (n) => plural(n, "Buy & sell report"), href: "/admin/marketplace", action: "Review", icon: "tag", urgency: "soon" },
    { n: bounces ?? 0, label: "bounced emails", item: (n) => plural(n, "bounced email"), detail: "A listing's address may be dead", href: "/admin/listing-health", action: "Check", icon: "mail", urgency: "whenever" },
    {
      n: newFeedbackCount ?? 0,
      label: "feedback",
      item: (n) => plural(n, "new feedback message"),
      detail: oldestFeedback && `Oldest came in ${oldestFeedback}`,
      href: "/admin/feedback",
      action: "Read",
      icon: "chat",
      urgency: "whenever",
    },
    { n: pendingPosts ?? 0, label: "photo-wall posts", item: (n) => `${plural(n, "photo-wall post")} awaiting couples`, href: "/admin/photo-wall", action: "Look", icon: "photo", urgency: "whenever" },
  ];
  // Until migration 0129 runs, errors are "not pulled", not "all clear".
  const tracked = queue.filter((q) => !(errorsError && q.label === "app errors"));
  const waiting = tracked.filter((q) => q.n > 0);
  const clear = tracked.filter((q) => q.n === 0);
  const noTestCouples = testIds.size === 0 && real.length > 0;
  const needsYou = waiting.length + (noTestCouples ? 1 : 0);

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

  // Running totals at the end of each of the last 12 weeks, for the trend lines.
  const weekly = (dates: string[]) =>
    Array.from({ length: 12 }, (_, i) => {
      const end = new Date(Date.now() - (11 - i) * 7 * DAY).toISOString();
      return dates.filter((d) => d <= end).length;
    });
  // Listings only have 30-day counts here: totals now, 30, 60 and 90 days ago.
  // Listings deactivated since are left out of the older points.
  const monthly = (live: number, ...windows: (number | null)[]) => {
    const pts = [live];
    for (const w of windows) pts.unshift(pts[0] - (w ?? 0));
    return pts;
  };
  const trend = (now: number, before: number) => (now > before ? "up" : now < before ? "down" : "flat");

  const couples30 = real.filter((w) => inWindow(w.created_at, d30)).length;
  const couplesBefore = real.filter((w) => inWindow(w.created_at, d60, d30)).length;
  const inquiries30 = realInquiries.filter((i) => inWindow(i.sent_at, d30)).length;
  const inquiriesBefore = realInquiries.filter((i) => inWindow(i.sent_at, d60, d30)).length;

  const listingDays = lastListing ? (Date.now() - new Date(lastListing).getTime()) / DAY : null;
  const health: { label: string; value: string; state: Health; href?: string }[] = [
    errorsError
      ? { label: "App errors", value: "not pulled · migration 0129", state: "none" }
      : {
          label: "App errors",
          value: `${errorsToday.toLocaleString()} today · ${errorsWeek.toLocaleString()} in 7 days`,
          state: errorsToday > 0 ? "bad" : errorsWeek > 0 ? "warn" : "ok",
          href: "/admin/errors",
        },
    { label: "Last listing added", value: daysAgo(lastListing) ?? "none yet", state: listingDays === null ? "none" : listingDays <= 7 ? "ok" : "warn" },
    { label: "Bounced emails", value: (bounces ?? 0).toLocaleString(), state: bounces ? "warn" : "ok" },
    { label: "Last admin change", value: daysAgo(lastAdminChange?.[0]?.created_at) ?? "none logged", state: "none" },
    { label: "Infra usage", value: "not pulled · /weekly-review", state: "none" },
  ];

  return (
    <div>
      <AdminEyebrow label="Home" />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-[32px] leading-tight font-semibold text-balance text-forest lg:text-[40px]">
          {needsYou > 0 ? (
            <>
              <span className="bg-[linear-gradient(transparent_62%,#FFF12F_62%)] px-1">{plural(needsYou, "thing")}</span>{" "}
              {needsYou === 1 ? "needs" : "need"} you
            </>
          ) : (
            "All clear. Nothing needs you."
          )}
        </h1>
        <p className="text-xs text-ink/50">Live from the database · last 30 days vs the 30 before</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Panel
            icon="inbox"
            tile="bg-[#FFF12F] text-forest"
            title="Needs you"
            aside={
              needsYou > 0 && (
                <span className="rounded-full bg-[#FFD301] px-2.5 font-mono-numbers text-xs font-medium text-forest">{needsYou}</span>
              )
            }
          >
            <ul className="divide-y divide-hairline">
              {waiting.map((q, i) => (
                <QueueRow
                  key={q.label}
                  icon={q.icon}
                  title={q.item(q.n)}
                  detail={q.detail}
                  urgency={q.urgency}
                  href={q.href}
                  action={q.action}
                  primary={i < 2 && q.urgency !== "whenever"}
                />
              ))}
              {noTestCouples && (
                <QueueRow
                  icon="heart"
                  title="No couples are marked as test"
                  detail={`${plural(real.length, "couple")} count as real. If any are yours, every number below is inflated.`}
                  urgency="soon"
                  href="/admin/couples"
                  action="Couples"
                />
              )}
              {needsYou === 0 && <li className="px-5 py-4 text-sm text-ink/70">Nothing needs you right now.</li>}
            </ul>
            {clear.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-hairline px-5 py-3 text-xs text-ink/55">
                All clear:
                {clear.map((q) => (
                  <span key={q.label} className="rounded-full bg-[#E5F5EC] px-2 py-0.5 text-[#1D7A4C]">
                    ✓ {q.label}
                  </span>
                ))}
              </div>
            )}
          </Panel>

          <KpiGroup title="Couples" dot="bg-[#00BFFE]">
            <KpiTile
              href="/admin/couples"
              value={real.length}
              label="Real couples"
              change={`${couples30} in 30d · ${couplesBefore} before`}
              trend={trend(couples30, couplesBefore)}
              points={weekly(real.map((w) => w.created_at))}
              definition="Weddings not marked test"
            />
            <KpiTile
              href="/admin/revenue"
              value={realInquiries.length}
              label="Inquiries sent"
              change={`${inquiries30} in 30d · ${inquiriesBefore} before`}
              trend={trend(inquiries30, inquiriesBefore)}
              points={weekly(realInquiries.map((i) => i.sent_at))}
              definition="Vendor + venue, from real couples"
            />
            <KpiTile
              href="/admin/growth"
              value={publishedSites ?? 0}
              label="Guest sites published"
              change={real.length ? `${Math.round(((publishedSites ?? 0) / real.length) * 100)}% of couples` : "no couples yet"}
              definition="Real couples with a published site design"
            />
          </KpiGroup>

          <KpiGroup title="Listings" dot="bg-[#FFD301]">
            <KpiTile
              href="/admin/venues"
              value={liveVenues ?? 0}
              label="Live venues"
              change={`${(newVenues ?? 0).toLocaleString()} new in 30d · ${(prevVenues ?? 0).toLocaleString()} before`}
              trend={trend(newVenues ?? 0, prevVenues ?? 0)}
              points={monthly(liveVenues ?? 0, newVenues, prevVenues, olderVenues)}
              definition="Active listings · trend is the last 90 days"
            />
            <KpiTile
              href="/admin/vendors"
              value={liveVendors ?? 0}
              label="Live vendors"
              change={`${(newVendors ?? 0).toLocaleString()} new in 30d · ${(prevVendors ?? 0).toLocaleString()} before`}
              trend={trend(newVendors ?? 0, prevVendors ?? 0)}
              points={monthly(liveVendors ?? 0, newVendors, prevVendors, olderVendors)}
              definition="Active, not sample · trend is the last 90 days"
            />
            <KpiTile
              href="/admin/venues/claims"
              value={claimed}
              label="Approved claims"
              change={`${listings ? ((claimed / listings) * 100).toFixed(1) : 0}% of listings`}
              definition="Venue + vendor claims approved"
            />
          </KpiGroup>
          <MarketTiles stats={market} />
          <p className="text-xs text-ink/50">
            No company revenue yet: Phase 0 is free. Couple-reported bookings are on{" "}
            <Link href="/admin/revenue" className="underline hover:text-forest">
              Reported bookings
            </Link>
            .
          </p>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel
            icon="map"
            tile="bg-[#FFF6BF] text-forest"
            title="Coverage"
            aside={
              <Link href="/admin/coverage" className="text-sm font-medium text-[#2243B6] hover:underline">
                All states &rarr;
              </Link>
            }
          >
            <div className="px-5 pt-4 pb-5">
              {stateCountsError ? (
                <p className="text-sm text-ink/60">Not pulled: run migration 0127 to count listings per state.</p>
              ) : (
                <>
                  <p>
                    <span className="font-mono-numbers text-[28px] font-medium text-forest">{atFloor}</span>{" "}
                    <span className="text-sm text-ink/60">
                      of {states.length} states at the {MIN_VENUES}-venue floor
                    </span>
                  </p>
                  <StateTileMap states={states} floor={MIN_VENUES} />
                  <div className="mt-4 border-t border-hairline pt-3">
                    <p className="text-xs font-semibold">Thinnest states</p>
                    <ul className="mt-1.5 space-y-1 font-mono-numbers text-xs text-ink/65">
                      {thinnest.map((s, i) => (
                        <li key={s.state} className="flex justify-between gap-3">
                          <span>{s.state}</span>
                          <span>{i === 0 ? `${s.venues} venues · ${s.vendors} vendors` : `${s.venues} · ${s.vendors}`}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </Panel>

          <Panel icon="pulse" tile="bg-[#E5F5EC] text-[#1D7A4C]" title="System health">
            <ul className="divide-y divide-hairline px-5 py-1.5">
              {health.map((h) => (
                <li key={h.label} className="flex items-center gap-2.5 py-2.5 text-sm">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${HEALTH_DOT[h.state]}`} aria-hidden />
                  {h.href ? (
                    <Link href={h.href} className="text-ink/75 underline decoration-hairline underline-offset-4 hover:text-forest">
                      {h.label}
                    </Link>
                  ) : (
                    <span className="text-ink/75">{h.label}</span>
                  )}
                  <span className="ml-auto text-right font-mono-numbers text-xs text-ink/55">{h.value}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
