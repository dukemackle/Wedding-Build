import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/page-shell";
import { hasBlocked, loadInbox, markThreadRead } from "@/lib/marketplace-server";
import type { MarketListing, MarketMessage, MarketThread } from "@/lib/supabase/types";
import { InboxHeader, InboxList } from "../inbox-list";
import { Conversation } from "./conversation";

export const metadata: Metadata = { title: "Marketplace messages", robots: { index: false } };

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/marketplace/inbox/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  // Read as the person, so RLS keeps this to their own conversations.
  const { data: thread } = await supabase
    .from("market_threads")
    .select("*, listing:market_listings(id, title, price_cents, photo_urls, status, seller_name, city, state)")
    .eq("id", id)
    .maybeSingle<
      MarketThread & {
        listing: Pick<MarketListing, "id" | "title" | "price_cents" | "photo_urls" | "status" | "seller_name" | "city" | "state"> | null;
      }
    >();
  if (!thread) notFound();

  const [{ data: messages }, threads, blocked] = await Promise.all([
    supabase
      .from("market_messages")
      .select("*")
      .eq("thread_id", id)
      .order("created_at", { ascending: true })
      .limit(500)
      .returns<MarketMessage[]>(),
    loadInbox(user.id),
    hasBlocked(user.id, thread.buyer_id === user.id ? thread.seller_id : thread.buyer_id),
  ]);
  await markThreadRead(thread, user.id);

  const selling = thread.seller_id === user.id;

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <div className="hidden lg:block">
        <InboxHeader />
      </div>
      {/* Desktop: the list stays beside the conversation, like any messenger.
          A phone shows just the conversation, with a way back to the list. */}
      <div className="-mx-6 -mt-8 overflow-hidden bg-card sm:mx-0 sm:mt-4 sm:rounded-lg sm:border sm:border-hairline lg:grid lg:h-[70vh] lg:grid-cols-[22rem_1fr]">
        <div className="hidden overflow-y-auto border-r border-hairline lg:block">
          <InboxList threads={threads.map((t) => (t.id === id ? { ...t, unread: false } : t))} userId={user.id} activeId={id} />
        </div>
        <Conversation
          threadId={thread.id}
          userId={user.id}
          otherName={selling ? thread.buyer_name : (thread.listing?.seller_name ?? "Seller")}
          role={selling ? "selling" : "buying"}
          listing={thread.listing}
          messages={messages ?? []}
          blocked={blocked}
        />
      </div>
    </PageShell>
  );
}
