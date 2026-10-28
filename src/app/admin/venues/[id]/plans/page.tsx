import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Venue, VenueSpace, VenueSpacePlan } from "@/lib/supabase/types";
import { AddSpaceForm, SpacePlanEditor } from "./plan-editor";

/**
 * The floor plans for one venue: each event space ("The Barn", "Oak Lawn")
 * gets its real size and outline. Published plans show on the listing with
 * "Design my wedding here", which copies them into the couple's layout.
 */
export default async function AdminVenuePlansPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const admin = createAdminSupabaseClient();
  const { data: venue } = await admin.from("venues").select("*").eq("id", id).maybeSingle<Venue>();
  if (!venue) notFound();

  const [{ data: spaces }, { data: plans }] = await Promise.all([
    admin.from("venue_spaces").select("*").eq("venue_id", id).order("sort_order").returns<VenueSpace[]>(),
    admin.from("venue_space_plans").select("*").eq("venue_id", id).returns<VenueSpacePlan[]>(),
  ]);
  const planBySpace = new Map((plans ?? []).map((p) => [p.space_id, p]));

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Floor plans</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">{venue.name}</h1>
      <p className="mt-2 mb-6 max-w-2xl text-sm text-ink/60">
        One plan per space, at its real size. Drag the corners to match the room&apos;s shape; tap a + on a wall to add a
        corner. Couples see a plan once it&apos;s published.{" "}
        <Link href="/admin/venues" className="text-brass hover:underline">
          Back to venues
        </Link>
      </p>

      <div className="flex flex-col gap-6">
        {(spaces ?? []).map((space) => (
          <SpacePlanEditor key={space.id} venueId={venue.id} space={space} plan={planBySpace.get(space.id) ?? null} />
        ))}
        {(spaces ?? []).length === 0 && (
          <div className="rounded-lg border border-hairline bg-card p-6 text-sm text-ink/60 shadow-sm">
            No spaces yet. Add the first one below (the ballroom, the lawn, the barn).
          </div>
        )}
        <AddSpaceForm venueId={venue.id} />
      </div>
    </div>
  );
}
