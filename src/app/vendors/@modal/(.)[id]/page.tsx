import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingModal } from "@/components/listing-modal";
import { loadVendorListing, VendorListing } from "../../[id]/vendor-listing";

// /vendors/[id] opened from the vendor search: the same listing as the full
// page, in a panel over the results. A refresh or a shared link skips this and
// renders ../../[id]/page.tsx instead.
export default async function VendorModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const data = await loadVendorListing(supabase, user?.id ?? null, id);
  if (!data) notFound();

  return (
    <ListingModal title={data.vendor.name}>
      <VendorListing data={data} />
    </ListingModal>
  );
}
