import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingModal } from "@/components/listing-modal";
import { loadVenueListing, VenueListing } from "../../[id]/venue-listing";

// /venues/[id] opened from the search results: the same listing as the full
// page, in a panel over the results. A refresh or a shared link skips this and
// renders ../../[id]/page.tsx instead.
export default async function VenueModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await loadVenueListing(supabase, user.id, id);
  if (!data) notFound();

  return (
    <ListingModal title={data.venue.name}>
      <VenueListing data={data} />
    </ListingModal>
  );
}
