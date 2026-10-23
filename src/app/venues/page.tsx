import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { AppNav } from "@/components/app-nav";
import { PublicNav } from "@/components/public-nav";
import { VENUE_LIST_COLUMNS, type VenueListing } from "@/lib/public-listings";
import type { RegionalCostData, VenueShortlistEntry, Wedding } from "@/lib/supabase/types";
import { effectiveGuestCount } from "@/lib/budget-categories";
import { weddingCategoryEstimates } from "@/lib/estimator";
import { VENUE_BUDGET_KEYS } from "@/lib/venue-budget";
import { VenuesManager } from "./venues-manager";

export const metadata: Metadata = {
  title: "Wedding venues",
  description:
    "Browse wedding venues by state, city, capacity, setting and budget, on a map. Details checked and dated, so you know what's current.",
  alternates: { canonical: "/venues" },
};

// Only the browse fields (see VENUE_LIST_COLUMNS), five pages at a time.
function loadVenues(supabase: Awaited<ReturnType<typeof createClient>>, signedIn: boolean) {
  return fetchAll<VenueListing>((from, to) =>
    supabase
      .from("venues")
      .select(signedIn ? `${VENUE_LIST_COLUMNS}, contact_email` : VENUE_LIST_COLUMNS)
      .eq("active", true)
      .order("name")
      .order("id")
      .range(from, to)
      .returns<VenueListing[]>(),
    5,
  );
}

/**
 * The Budget filter's starting numbers: the couple's guest count and their
 * Venue, Catering and Bar lines, as the budget page shows them (their own
 * figure where they've set one, Wren's estimate otherwise). Null without a
 * guest count, since a per-person price means nothing without one.
 */
async function loadBudgetDefaults(supabase: Awaited<ReturnType<typeof createClient>>, wedding: Wedding) {
  const [{ data: guests }, { data: lines }, { data: regionalData }] = await Promise.all([
    supabase.from("guests").select("status, plus_one").eq("wedding_id", wedding.id),
    supabase
      .from("budget_line_items")
      .select("category, override_value")
      .eq("wedding_id", wedding.id)
      .in("category", [...VENUE_BUDGET_KEYS]),
    supabase.from("regional_cost_data").select("*").eq("state", wedding.state ?? "").returns<RegionalCostData[]>(),
  ]);
  const guestCount = effectiveGuestCount(wedding, guests ?? []);
  if (guestCount <= 0) return null;
  const actuals = new Map<string, number>();
  for (const line of lines ?? []) {
    if (line.override_value != null) actuals.set(line.category, line.override_value);
  }
  const estimates = weddingCategoryEstimates(regionalData ?? [], wedding, guestCount, {
    hidden: wedding.hidden_budget_categories,
    actuals,
  });
  const budget = VENUE_BUDGET_KEYS.reduce((sum, key) => sum + (actuals.get(key) ?? estimates.get(key) ?? 0), 0);
  return budget > 0 ? { guests: guestCount, budget } : null;
}

export default async function VenuesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged out: the same browse screen, public columns only, and the save /
  // contact buttons turn into signup links.
  if (!user) {
    const venues = await loadVenues(supabase, false);
    return (
      <main className="flex flex-1 flex-col px-6 py-16">
        <PublicNav next="/venues" />
        <h1 className="sr-only">Wedding venues</h1>
        <VenuesManager venues={venues} shortlist={[]} bookedVenueId={null} signedIn={false} />
      </main>
    );
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Venues
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before browsing venues.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const [venues, { data: shortlist }, budgetDefaults, { count: vendorSavedCount }] = await Promise.all([
    loadVenues(supabase, true),
    supabase
      .from("venue_shortlist")
      .select("*")
      .eq("wedding_id", wedding.id)
      .returns<VenueShortlistEntry[]>(),
    loadBudgetDefaults(supabase, wedding),
    supabase.from("vendor_favorites").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id),
  ]);

  return (
    // No width cap and no visible page heading: the filter bar is the top of
    // this screen, the way it is on a listings site. The heading stays for
    // screen readers.
    <main className="flex flex-1 flex-col px-6 py-16">
      <AppNav email={user.email ?? ""} />
      <h1 className="sr-only">Browse & shortlist venues</h1>
      <VenuesManager
        venues={venues}
        shortlist={shortlist ?? []}
        bookedVenueId={wedding.venue_id}
        budgetDefaults={budgetDefaults}
        vendorSavedCount={vendorSavedCount ?? 0}
      />
    </main>
  );
}
