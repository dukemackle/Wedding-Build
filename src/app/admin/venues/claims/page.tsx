import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { SITE_URL, venueHref } from "@/lib/public-listings";
import { foundUsLines } from "@/lib/attribution";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { RecentlyApproved, type ApprovedClaim } from "../../_listing/recently-approved";
import type { Venue, VenueSubmission } from "@/lib/supabase/types";
import { SubmissionReview } from "./submission-review";
import { AdminEyebrow } from "@/app/admin/admin-nav";

export default async function AdminVenueClaimsPage() {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const { data: submissions } = await admin
    .from("venue_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at")
    .returns<VenueSubmission[]>();
  const { data: approved } = await admin
    .from("venue_submissions")
    .select("id, venue_id, submitter_name, submitter_email, submitter_role, reviewed_at, heard_from, arrived_via, first_touch")
    .eq("status", "approved")
    .order("reviewed_at", { ascending: false })
    .returns<Pick<VenueSubmission, "id" | "venue_id" | "submitter_name" | "submitter_email" | "submitter_role" | "reviewed_at" | "heard_from" | "arrived_via" | "first_touch">[]>();

  const venueIds = [...new Set([...(submissions ?? []), ...(approved ?? [])].map((s) => s.venue_id))];
  const { data: venues } = venueIds.length
    ? await admin.from("venues").select("*").in("id", venueIds).returns<Venue[]>()
    : { data: [] as Venue[] };
  const venueById = new Map((venues ?? []).map((v) => [v.id, v]));
  const recent: ApprovedClaim[] = (approved ?? []).flatMap((s) => {
    const v = venueById.get(s.venue_id);
    if (!v) return [];
    return [{
      id: s.id,
      name: v.name,
      listingUrl: `${SITE_URL}${venueHref(v)}`,
      where: [v.city, v.state].filter(Boolean).join(", "),
      submitterName: s.submitter_name,
      submitterRole: s.submitter_role,
      submitterEmail: s.submitter_email,
      reviewedAt: s.reviewed_at,
      foundUs: foundUsLines(s),
    }];
  });

  return (
    <div>
      <AdminEyebrow />
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Venue changes to review</h1>
      <p className="mt-2 mb-6 text-sm text-ink/60">
        Sent by venues through their claim links. Nothing here is live until you approve it.{" "}
        <Link href="/admin/venues" className="text-brass hover:underline">
          Back to venues
        </Link>
      </p>
      {(submissions ?? []).length === 0 ? (
        <div className="rounded-lg border border-hairline bg-card p-6 text-sm text-ink/60 shadow-sm">
          Nothing waiting. Send venues their claim links from the Venues page.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {(submissions ?? []).map((s) => {
            const venue = venueById.get(s.venue_id);
            return venue ? <SubmissionReview key={s.id} submission={s} venue={venue} /> : null;
          })}
        </div>
      )}
      <RecentlyApproved claims={recent} />
    </div>
  );
}
