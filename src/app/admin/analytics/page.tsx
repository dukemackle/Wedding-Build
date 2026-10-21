import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AnalyticsView, PERIODS, type Funnels } from "./analytics-view";

// Outside the component, like the Errors page's: the page is rendered per request.
const sinceIso = (days: number) => new Date(Date.now() - days * 864e5).toISOString();

/**
 * Where couples drop off, from the server-side events in `events`
 * (migration 0130, written by trackEvent in src/lib/events.ts). Test
 * weddings are left out; counting started when the migration ran.
 */
export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireAdmin();
  const { days: rawDays } = await searchParams;
  const days = PERIODS.find((p) => String(p.days) === rawDays)?.days ?? 90;
  const since = sinceIso(days);

  const { data, error } = await createAdminSupabaseClient().rpc("admin_event_funnels", { p_since: since });
  const f = data as Funnels | null;

  return <AnalyticsView f={error ? null : f} days={days} />;
}
