import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { STATES } from "@/lib/wedding-options";
import { STATE_ABBR } from "@/lib/listing-pin";
import type { MarketListing } from "@/lib/supabase/types";
import { ListingForm } from "../../listing-form";

export const metadata: Metadata = { title: "Edit listing", robots: { index: false } };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/marketplace/${id}/edit`);

  const { data: listing } = await supabase
    .from("market_listings")
    .select("*")
    .eq("id", id)
    .eq("seller_id", user.id)
    .neq("status", "removed")
    .maybeSingle<MarketListing>();
  if (!listing) notFound();

  const stateName = STATES.find((name) => STATE_ABBR[name] === listing.state);

  return (
    <PageShell email={user.email ?? ""} width="reading">
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Marketplace</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Edit listing</h1>
      <div className="mt-8">
        <ListingForm sellerId={user.id} listing={listing} defaults={{ state: stateName }} />
      </div>
    </PageShell>
  );
}
