import Image from "next/image";
import Link from "next/link";
import { BirdEmptyState } from "@/components/wren-moments";
import { formatPrice, listedAgo } from "@/lib/marketplace";
import type { InboxThread } from "@/lib/marketplace-server";

/**
 * The conversations, newest first: a column beside the open conversation on
 * desktop, the whole page on a phone (where a conversation opens on its own
 * page instead).
 */
export function InboxList({
  threads,
  userId,
  activeId,
}: {
  threads: InboxThread[];
  userId: string;
  activeId?: string;
}) {
  if (threads.length === 0) {
    return (
      <BirdEmptyState className="py-12">
        <p className="text-sm text-ink/60">
          No messages yet. Message a seller from any listing, and buyers&apos; messages about yours land here too.
        </p>
      </BirdEmptyState>
    );
  }

  return (
    <ul className="divide-y divide-hairline">
      {threads.map((t) => {
        const selling = t.seller_id === userId;
        const other = selling ? t.buyer_name : (t.listing?.seller_name ?? "Seller");
        const preview = t.lastMessage
          ? `${t.lastMessage.sender_id === userId ? "You: " : ""}${t.lastMessage.body}`
          : "";
        return (
          <li key={t.id}>
            <Link
              href={`/marketplace/inbox/${t.id}`}
              aria-current={t.id === activeId ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-3 transition-colors hover:bg-forest/5 ${
                t.id === activeId ? "bg-forest/10" : ""
              }`}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-hairline bg-parchment">
                {t.listing?.photo_urls[0] && (
                  <Image src={t.listing.photo_urls[0]} alt="" fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`truncate text-sm ${t.unread ? "font-semibold text-forest" : "text-ink"}`}>
                    {other} · {t.listing?.title ?? "Listing removed"}
                  </p>
                  <span className="shrink-0 text-xs text-ink/40">{listedAgo(t.last_message_at)}</span>
                </div>
                <p className={`truncate text-sm ${t.unread ? "text-ink" : "text-ink/55"}`}>{preview}</p>
                <p className="text-xs text-ink/40">
                  {selling ? "Selling" : "Buying"}
                  {t.listing ? ` · ${formatPrice(t.listing.price_cents)}` : ""}
                  {t.listing && t.listing.status !== "active" ? ` · ${t.listing.status === "removed" ? "taken down" : t.listing.status}` : ""}
                </p>
              </div>
              {t.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2243B6]" aria-label="Unread" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function InboxHeader() {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h1 className="font-display text-3xl font-semibold text-forest">Messages</h1>
      <Link href="/marketplace" className="text-sm text-brass hover:underline">
        Back to the marketplace
      </Link>
    </div>
  );
}
