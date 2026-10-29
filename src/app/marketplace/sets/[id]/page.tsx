import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, liveSetItems } from "@/lib/marketplace";
import { loadMarketWedding, loadSet } from "@/lib/marketplace-server";
import { setSummary } from "../../set-card";
import { SetView } from "./set-view";

const load = cache(async (id: string) => {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    set,
  ] = await Promise.all([supabase.auth.getUser(), loadSet(supabase, id)]);
  return { supabase, user, set };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { set } = await load(id);
  if (!set) return {};
  const title = `${set.title}: ${formatPrice(set.price_cents, set.listing_type)} for the set`;
  return {
    title,
    description: `${set.items.length} pieces from one wedding: ${setSummary(set.items)}. On the You Do, I Do marketplace.`,
    robots: { index: false, follow: false },
    openGraph: { title, images: set.items[0]?.photo_urls[0] ? [set.items[0].photo_urls[0]] : undefined },
  };
}

export default async function SetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, set } = await load(id);
  if (!set) notFound();

  const isSeller = user?.id === set.seller_id;
  const cover = liveSetItems(set.items)[0] ?? set.items[0];

  // Messages about a set start in its first piece's conversation.
  let threadId: string | null = null;
  let defaultName = "";
  if (user && !isSeller && cover) {
    const [{ data: thread }, wedding] = await Promise.all([
      supabase.from("market_threads").select("id").eq("listing_id", cover.id).eq("buyer_id", user.id).maybeSingle<{ id: string }>(),
      loadMarketWedding(supabase, user.id),
    ]);
    threadId = thread?.id ?? null;
    defaultName = wedding?.firstName ?? "";
  }

  return (
    <SetView
      set={set}
      viewer={user ? { id: user.id, email: user.email ?? "" } : null}
      threadId={threadId}
      defaultName={defaultName}
    />
  );
}
