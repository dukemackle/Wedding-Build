import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Venue, VenueSubmission } from "@/lib/supabase/types";
import { SubmissionReview } from "./submission-review";

export default async function AdminVenueClaimsPage() {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const { data: submissions } = await admin
    .from("venue_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at")
    .returns<VenueSubmission[]>();

  const venueIds = [...new Set((submissions ?? []).map((s) => s.venue_id))];
  const { data: venues } = venueIds.length
    ? await admin.from("venues").select("*").in("id", venueIds).returns<Venue[]>()
    : { data: [] as Venue[] };
  const venueById = new Map((venues ?? []).map((v) => [v.id, v]));

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
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
    </div>
  );
}
