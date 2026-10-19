"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { formatPrice } from "@/lib/marketplace";
import type { MarketListing, MarketMessage } from "@/lib/supabase/types";
import { blockPerson, sendMessage, unblockPerson } from "../../chat-actions";
import { ReportForm } from "../../report-form";

/** How often an open conversation checks for new messages. */
const POLL_MS = 8000;

const QUICK_REPLIES = {
  selling: ["Yes, it's still available!", "Sorry, it's sold.", "When could you pick it up?"],
  buying: ["Is the price flexible?", "When could I pick it up?", "Could you send another photo?"],
};

export function Conversation({
  threadId,
  userId,
  otherName,
  role,
  listing,
  messages,
  blocked,
}: {
  threadId: string;
  userId: string;
  otherName: string;
  role: "buying" | "selling";
  listing: Pick<MarketListing, "id" | "title" | "price_cents" | "photo_urls" | "status" | "city" | "state"> | null;
  messages: MarketMessage[];
  /** Whether this person has blocked the other. */
  blocked: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<MarketMessage[]>([]);
  const [error, setError] = useState<string>();
  const [menu, setMenu] = useState<"closed" | "open" | "report">("closed");
  const [isPending, startTransition] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  // Messages sent here show at once, until the refreshed list carries them.
  const [seenCount, setSeenCount] = useState(messages.length);
  if (messages.length !== seenCount) {
    setSeenCount(messages.length);
    setSent([]);
  }
  const shown = [...messages, ...sent];

  // No realtime socket on Workers; a light poll while the tab is in view is
  // plenty for a buy-and-sell chat.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [shown.length]);

  function send(body: string) {
    const text = body.trim();
    if (!text) return;
    setError(undefined);
    setDraft("");
    const optimistic = {
      id: `local-${crypto.randomUUID()}`,
      thread_id: threadId,
      sender_id: userId,
      body: text,
      created_at: "",
      kind: "text" as const,
    };
    setSent((s) => [...s, optimistic]);
    startTransition(async () => {
      const result = await sendMessage(threadId, text);
      if (result.error) {
        setError(result.error);
        setDraft(text);
        setSent((s) => s.filter((m) => m !== optimistic));
        return;
      }
      router.refresh();
    });
  }

  const closed = listing?.status === "removed";

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col lg:h-full lg:min-h-0">
      {/* Who and what this is about. */}
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
        <Link href="/marketplace/inbox" className="text-xl text-brass lg:hidden" aria-label="All messages">
          ‹
        </Link>
        {listing ? (
          <Link href={`/marketplace/${listing.id}`} className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-hairline bg-parchment">
              {listing.photo_urls[0] && <Image src={listing.photo_urls[0]} alt="" fill sizes="44px" className="object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-forest">{otherName}</p>
              <p className="truncate text-xs text-ink/60">
                {listing.title} · {formatPrice(listing.price_cents)} · {listing.city}, {listing.state}
              </p>
            </div>
          </Link>
        ) : (
          <p className="flex-1 font-medium text-forest">{otherName}</p>
        )}
        {listing && (
          <Link
            href={`/marketplace/${listing.id}`}
            className="hidden shrink-0 rounded-md border border-hairline px-3 py-1.5 text-sm text-forest hover:border-forest sm:block"
          >
            See details
          </Link>
        )}
        <div className="relative">
          <button
            type="button"
            aria-label="Conversation options"
            aria-expanded={menu !== "closed"}
            onClick={() => setMenu((m) => (m === "closed" ? "open" : "closed"))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-ink/60 hover:bg-ink/5"
          >
            ⋯
          </button>
          {menu === "open" && (
            <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-md border border-hairline bg-card text-sm shadow-lg">
              <button type="button" onClick={() => setMenu("report")} className="block w-full px-4 py-2.5 text-left hover:bg-forest/5">
                Report
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenu("closed");
                  if (blocked || confirm(`Block ${otherName}? They won't be able to message you.`)) {
                    startTransition(async () => {
                      await (blocked ? unblockPerson(threadId) : blockPerson(threadId));
                      router.refresh();
                    });
                  }
                }}
                className="block w-full px-4 py-2.5 text-left text-red-700 hover:bg-red-50"
              >
                {blocked ? `Unblock ${otherName}` : `Block ${otherName}`}
              </button>
            </div>
          )}
        </div>
      </div>

      {menu === "report" && (
        <div className="border-b border-hairline bg-parchment px-4 py-3">
          <ReportForm listingId={listing?.id} threadId={threadId} onDone={() => setMenu("closed")} />
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        <p className="mx-auto max-w-sm rounded-md bg-[#5AE4FF]/15 px-3 py-2 text-center text-xs text-ink/70">
          Meet somewhere public and see the item before you pay. Never pay ahead for shipping or share bank
          details. You Do, I Do doesn&apos;t handle payments.
        </p>
        {shown.map((m) => {
          if (m.kind === "event") {
            return (
              <p key={m.id} className="py-1 text-center text-xs text-ink/50">
                {m.sender_id === userId ? "You: " : ""}
                {m.body}
              </p>
            );
          }
          const mine = m.sender_id === userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <p
                title={m.created_at ? new Date(m.created_at).toLocaleString() : undefined}
                className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? "rounded-br-sm bg-[#2243B6] text-white" : "rounded-bl-sm bg-parchment text-ink"
                } ${m.id.startsWith("local-") ? "opacity-70" : ""}`}
              >
                {m.body}
              </p>
            </div>
          );
        })}
        <div ref={end} />
      </div>

      {blocked || closed ? (
        <p className="border-t border-hairline px-4 py-4 text-center text-sm text-ink/60">
          {blocked ? `You've blocked ${otherName}.` : "This listing was taken down, so the conversation is closed."}
        </p>
      ) : (
        <div className="sticky bottom-0 border-t border-hairline bg-card px-3 py-3">
          {shown.length <= 2 && (
            <div className="mb-2 flex gap-2 overflow-x-auto [scrollbar-width:none]">
              {QUICK_REPLIES[role].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={isPending}
                  className="shrink-0 rounded-full border border-hairline px-3 py-1.5 text-xs text-forest hover:border-forest"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Message…"
              aria-label="Message"
              className="max-h-32 min-h-[2.5rem] flex-1 resize-none rounded-2xl border border-hairline bg-card px-4 py-2 text-sm outline-none focus:border-forest"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-parchment disabled:opacity-40"
            >
              Send
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
