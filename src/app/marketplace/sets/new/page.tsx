import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { MIN_SET_ITEMS } from "@/lib/marketplace";
import { loadMarketWedding } from "@/lib/marketplace-server";
import type { MarketListing } from "@/lib/supabase/types";
import { SetForm } from "../set-form";

export const metadata: Metadata = { title: "Make a set", robots: { index: false } };

export default async function NewSetPage({ searchParams }: { searchParams: Promise<{ with?: string }> }) {
  const { with: start } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/marketplace/sets/new");

  const [{ data }, wedding] = await Promise.all([
    supabase
      .from("market_listings")
      .select("*")
      .eq("seller_id", user.id)
      .in("status", ["active", "pending"])
      .is("set_id", null)
      .order("created_at", { ascending: false })
      .returns<MarketListing[]>(),
    loadMarketWedding(supabase, user.id),
  ]);
  const listings = data ?? [];

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a6b00]">Whole-wedding set</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Bundle things that go together</h1>
      <p className="mt-2 max-w-2xl text-ink/70">
        The arch, the vases, the signs: a couple going for the same look can take the lot for one price.
      </p>
      <div className="mt-8">
        {listings.length < MIN_SET_ITEMS ? (
          <div className="rounded-2xl border-[1.5px] border-dashed border-[#d8cdb3] bg-[#fbf8f1] p-6">
            <p className="font-display text-xl font-semibold text-forest">
              {listings.length === 0 ? "List a couple of things first" : "List one more thing first"}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              A set is made from your listings, so each piece has its own photos. List them, then bundle them here.
            </p>
            <Link href="/marketplace/new" className="mt-3 inline-block rounded-full border border-forest px-3.5 py-1.5 text-sm font-medium text-forest hover:bg-forest hover:text-parchment">
              Sell something
            </Link>
          </div>
        ) : (
          <SetForm
            listings={listings}
            preselected={start && listings.some((l) => l.id === start) ? [start] : []}
            defaultTitle={wedding?.firstName ? `${wedding.firstName}’s wedding set` : ""}
          />
        )}
      </div>
    </PageShell>
  );
}
