import Image from "next/image";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { SITE_URL } from "@/lib/public-listings";
import { MARKET_REPORT_REASONS, formatPrice, listedAgo } from "@/lib/marketplace";
import type { MarketListing, MarketMessage } from "@/lib/supabase/types";
import { dismissReport, takeDownListing } from "./actions";

type Report = {
  id: string;
  listing_id: string | null;
  thread_id: string | null;
  reason: string;
  details: string | null;
  created_at: string;
};

const card = "rounded-lg border border-hairline bg-card p-5 shadow-sm";
const button = "rounded-full border border-hairline px-3 py-1 text-xs text-ink hover:border-forest";
const reasonLabel = (value: string) => MARKET_REPORT_REASONS.find((r) => r.value === value)?.label ?? value;

/**
 * Marketplace moderation: what people reported, with the listing and (for a
 * reported conversation) its last messages beside it, and the newest
 * listings for a look before anyone has to report them.
 */
export default async function AdminMarketplacePage() {
  const admin = createAdminSupabaseClient();
  const [{ data: reports }, { data: recent }] = await Promise.all([
    admin
      .from("market_reports")
      .select("id, listing_id, thread_id, reason, details, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: true })
      .returns<Report[]>(),
    admin
      .from("market_listings")
      .select("*")
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })
      .limit(30)
      .returns<MarketListing[]>(),
  ]);

  const listingIds = [...new Set((reports ?? []).map((r) => r.listing_id).filter((id): id is string => Boolean(id)))];
  const threadIds = [...new Set((reports ?? []).map((r) => r.thread_id).filter((id): id is string => Boolean(id)))];
  const [{ data: reported }, { data: messages }] = await Promise.all([
    listingIds.length
      ? admin.from("market_listings").select("*").in("id", listingIds).returns<MarketListing[]>()
      : Promise.resolve({ data: [] as MarketListing[] }),
    threadIds.length
      ? admin
          .from("market_messages")
          .select("*")
          .in("thread_id", threadIds)
          .order("created_at", { ascending: false })
          .limit(threadIds.length * 10)
          .returns<MarketMessage[]>()
      : Promise.resolve({ data: [] as MarketMessage[] }),
  ]);
  const listingById = new Map((reported ?? []).map((l) => [l.id, l]));

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Marketplace</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/70">
        Reports from buyers and sellers, and the newest listings. Taking a listing down hides it, closes its
        conversations and emails the seller why.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className={card}>
          <h2 className="font-display text-xl font-semibold text-forest">
            Reports <span className="text-ink/50">({reports?.length ?? 0})</span>
          </h2>
          {(reports ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No open reports.</p>
          ) : (
            <ul className="mt-3 divide-y divide-hairline">
              {(reports ?? []).map((r) => {
                const listing = r.listing_id ? listingById.get(r.listing_id) : undefined;
                const thread = (messages ?? []).filter((m) => m.thread_id === r.thread_id).reverse();
                return (
                  <li key={r.id} className="py-4 text-sm">
                    <div className="flex items-start gap-3">
                      {listing?.photo_urls[0] && (
                        <Image src={listing.photo_urls[0]} alt="" width={56} height={56} className="h-14 w-14 rounded-md object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          {listing ? (
                            <a href={`${SITE_URL}/marketplace/${listing.id}`} className="font-medium text-ink hover:text-brass">
                              {listing.title} · {formatPrice(listing.price_cents)}
                            </a>
                          ) : (
                            <span className="text-ink/50">Listing deleted</span>
                          )}
                          <span className="text-xs text-ink/50">{listedAgo(r.created_at)}</span>
                        </div>
                        <p className="mt-1 text-ink/80">
                          {reasonLabel(r.reason)}
                          {r.thread_id ? " · about a conversation" : ""}
                          {listing?.status === "removed" ? " · already taken down" : ""}
                        </p>
                        {r.details && <p className="mt-1 whitespace-pre-line text-ink/70">“{r.details}”</p>}
                      </div>
                    </div>
                    {thread.length > 0 && (
                      <div className="mt-2 space-y-1 rounded-md bg-parchment p-2 text-xs">
                        {thread.map((m) => (
                          <p key={m.id}>
                            <span className="font-medium text-forest">
                              {m.sender_id === listing?.seller_id ? "Seller" : "Buyer"}:
                            </span>{" "}
                            {m.body}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {listing && listing.status !== "removed" && (
                        <form action={takeDownListing} className="flex gap-2">
                          <input type="hidden" name="listing_id" value={listing.id} />
                          <input
                            name="reason"
                            placeholder="Reason for the seller (optional)"
                            className="w-56 rounded-full border border-hairline px-3 py-1 text-xs"
                          />
                          <button type="submit" className={`${button} text-red-700 hover:border-red-700`}>
                            Take down
                          </button>
                        </form>
                      )}
                      <form action={dismissReport}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className={button}>
                          Not a problem
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="font-display text-xl font-semibold text-forest">Newest listings</h2>
          {(recent ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">Nothing listed yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-hairline">
              {(recent ?? []).map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-2 text-sm">
                  {l.photo_urls[0] && (
                    <Image src={l.photo_urls[0]} alt="" width={40} height={40} className="h-10 w-10 rounded object-cover" />
                  )}
                  <a href={`${SITE_URL}/marketplace/${l.id}`} className="min-w-0 flex-1 truncate text-ink hover:text-brass">
                    {l.title} · {formatPrice(l.price_cents)} · {l.city}, {l.state}
                  </a>
                  <span className="shrink-0 text-xs text-ink/50">{listedAgo(l.created_at)}</span>
                  <form action={takeDownListing}>
                    <input type="hidden" name="listing_id" value={l.id} />
                    <button type="submit" className={`${button} text-red-700 hover:border-red-700`}>
                      Take down
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
