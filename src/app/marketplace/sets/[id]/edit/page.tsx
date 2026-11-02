import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { loadSet } from "@/lib/marketplace-server";
import type { MarketListing } from "@/lib/supabase/types";
import { SetForm } from "../../set-form";

export const metadata: Metadata = { title: "Edit set", robots: { index: false } };

export default async function EditSetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/marketplace/sets/${id}/edit`);

  const set = await loadSet(supabase, id);
  if (!set || set.seller_id !== user.id) notFound();

  // Everything of theirs that's live and free, plus what's already in this set.
  const { data } = await supabase
    .from("market_listings")
    .select("*")
    .eq("seller_id", user.id)
    .in("status", ["active", "pending"])
    .or(`set_id.is.null,set_id.eq.${set.id}`)
    .order("created_at", { ascending: false })
    .returns<MarketListing[]>();
  const listings = data ?? [];

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <h1 className="font-display text-3xl font-semibold text-forest">Edit {set.title}</h1>
      <div className="mt-8">
        <SetForm listings={listings} set={{ ...set, items: set.items.filter((l) => listings.some((x) => x.id === l.id)) }} />
      </div>
    </PageShell>
  );
}
