import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { STATES } from "@/lib/wedding-options";
import { MARKET_CATEGORIES, sellerBadgeFor } from "@/lib/marketplace";
import { loadMarketWedding } from "@/lib/marketplace-server";
import { ListingForm } from "../listing-form";

export const metadata: Metadata = { title: "Sell something", robots: { index: false } };

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; category?: string }>;
}) {
  const { title, category } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/marketplace/new");

  // A couple's own name and wedding town fill the form in; anyone else
  // starts blank.
  const wedding = await loadMarketWedding(supabase, user.id);
  const state = (STATES as readonly string[]).includes(wedding?.ownVenueState ?? "")
    ? (wedding?.ownVenueState ?? undefined)
    : undefined;

  return (
    <PageShell email={user.email ?? ""} width="reading">
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Marketplace</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Sell something</h1>
      <p className="mt-2 text-ink/70">
        Pass on what&apos;s left from your wedding to someone whose day is still coming.
      </p>
      <div className="mt-8">
        <ListingForm
          sellerId={user.id}
          defaults={{
            seller_name: wedding?.firstName || undefined,
            city: wedding?.ownVenueCity ?? wedding?.origin?.label ?? undefined,
            state,
            // From the dashboard's "pass it on" suggestions.
            title: title?.slice(0, 80),
            category: MARKET_CATEGORIES.some((c) => c.value === category) ? category : undefined,
          }}
          badgePreview={wedding?.weddingDate ? sellerBadgeFor(wedding.weddingDate) : null}
        />
      </div>
    </PageShell>
  );
}
