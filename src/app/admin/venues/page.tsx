import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Venue, VenueFaq } from "@/lib/supabase/types";
import Link from "next/link";
import { countAddedThisWeek, fetchListingPage, fetchTestWeddingIds } from "../_listing/query";
import { parseListingParams } from "../_listing/params";
import { pendingBundledVenues } from "./actions";
import { AdminVenuesManager } from "./admin-venues-manager";
import { BundledVenuesBanner } from "./bundled-venues-banner";
import { VENUE_LISTING } from "./listing-config";

export default async function AdminVenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseListingParams(await searchParams);
  const admin = createAdminSupabaseClient();

  const [{ rows: venues, total, statusCounts }, { count: pendingClaims }, addedThisWeek, testWeddingIds, bundled] =
    await Promise.all([
      fetchListingPage<Venue>(VENUE_LISTING, params),
      admin.from("venue_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      countAddedThisWeek("venues"),
      fetchTestWeddingIds(),
      pendingBundledVenues(),
    ]);

  // FAQs and inquiry counts for the rows on screen only.
  const ids = venues.map((v) => v.id);
  const [{ data: faqs }, { data: inquiries }] = ids.length
    ? await Promise.all([
        admin.from("venue_faqs").select("*").in("venue_id", ids).order("sort_order").returns<VenueFaq[]>(),
        admin
          .from("venue_inquiries")
          .select("venue_id, wedding_id")
          .in("venue_id", ids)
          .returns<{ venue_id: string; wedding_id: string }[]>(),
      ])
    : [{ data: [] as VenueFaq[] }, { data: [] as { venue_id: string; wedding_id: string }[] }];

  const faqsByVenueId: Record<string, VenueFaq[]> = {};
  for (const faq of faqs ?? []) (faqsByVenueId[faq.venue_id] ??= []).push(faq);

  // Test weddings are left out so the count reflects real couples asking.
  const inquiriesByVenueId: Record<string, number> = {};
  for (const inquiry of inquiries ?? []) {
    if (testWeddingIds.has(inquiry.wedding_id)) continue;
    inquiriesByVenueId[inquiry.venue_id] = (inquiriesByVenueId[inquiry.venue_id] ?? 0) + 1;
  }

  const heading = (
    <>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Marketplace</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Venues</h1>
      <p className="mt-1 text-sm text-ink/55">
        {statusCounts.all.toLocaleString()} venues
        {addedThisWeek > 0 && ` · ${addedThisWeek} added this week`}
      </p>
    </>
  );

  // Most-represented towns first, so the line reads as where the batch is.
  const townCounts = new Map<string, number>();
  for (const venue of bundled) if (venue.city) townCounts.set(venue.city, (townCounts.get(venue.city) ?? 0) + 1);
  const towns = [...townCounts.entries()].sort((a, b) => b[1] - a[1]).map(([town]) => town);

  const claimsNotice = (pendingClaims ?? 0) > 0 && (
    <Link
      href="/admin/venues/claims"
      className="mb-4 flex items-center justify-between rounded-md border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink hover:border-brass"
    >
      <span>
        {pendingClaims} {pendingClaims === 1 ? "venue has" : "venues have"} sent changes to review
      </span>
      <span className="text-brass">Review &rarr;</span>
    </Link>
  );

  const notice = (
    <>
      {bundled.length > 0 && <BundledVenuesBanner count={bundled.length} towns={towns} />}
      {claimsNotice}
    </>
  );

  return (
    <div>
      <AdminVenuesManager
        heading={heading}
        notice={notice}
        venues={venues}
        total={total}
        params={params}
        statusCounts={statusCounts}
        faqsByVenueId={faqsByVenueId}
        inquiriesByVenueId={inquiriesByVenueId}
      />
    </div>
  );
}
