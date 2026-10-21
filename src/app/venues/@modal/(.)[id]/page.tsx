import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingModal } from "@/components/listing-modal";
import { loadVenueListing, VenueListing } from "../../[id]/venue-listing";
import { trackEvent } from "@/lib/events";

// /venues/[id] opened from the search results: the same listing as the full
// page, in a panel over the results. A refresh or a shared link skips this and
// renders ../../[id]/page.tsx instead.
export default async function VenueModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const data = await loadVenueListing(supabase, user?.id ?? null, id);
  if (!data) notFound();
  // A couple opening a listing: the top of the listing funnel. Logged-out
  // visitors and bots aren't counted.
  if (data.wedding) trackEvent("listing_viewed", { weddingId: data.wedding.id, listing: { kind: "venue", id: data.venue.id } });

  return (
    <ListingModal title={data.venue.name}>
      <VenueListing data={data} />
    </ListingModal>
  );
}
