"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { MarketListingStatus } from "@/lib/supabase/types";
import { LegalNotice } from "@/components/legal-notice";
import { OPENING_MESSAGE, QUICK_QUESTIONS } from "@/lib/marketplace";
import { deleteListing, setListingStatus, toggleSave } from "../actions";
import { startThread } from "../chat-actions";
import { ReportForm } from "../report-form";

const secondary =
  "rounded-md border border-hairline bg-card px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:border-forest disabled:opacity-60";

export function BuyerActions({
  id,
  signedIn,
  saved: initiallySaved,
  available,
  threadId,
  defaultName,
  opening = OPENING_MESSAGE,
  saveable = true,
}: {
  id: string;
  signedIn: boolean;
  saved: boolean;
  available: boolean;
  /** This person's conversation about the listing, if they've started one. */
  threadId: string | null;
  /** The first name to offer, from their wedding. */
  defaultName: string;
  /** The message to start with: a set asks about the whole set. */
  opening?: string;
  /** Off for a set, whose page messages about it through one of its items. */
  saveable?: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [panel, setPanel] = useState<"none" | "message" | "report">("none");
  const [body, setBody] = useState(opening);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Link
        href={`/signup?next=/marketplace/${id}`}
        className="block rounded-md bg-forest px-4 py-3 text-center font-medium text-parchment hover:bg-forest/90"
      >
        Sign up free to message the seller
      </Link>
    );
  }

  const primary = "flex-1 rounded-md bg-forest px-4 py-3 text-center font-medium text-parchment hover:bg-forest/90 disabled:opacity-60";

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {threadId ? (
          <Link href={`/marketplace/inbox/${threadId}`} className={primary}>
            View conversation
          </Link>
        ) : (
          <button
            type="button"
            disabled={!available}
            onClick={() => setPanel((p) => (p === "message" ? "none" : "message"))}
            className={primary}
          >
            {available ? "Message seller" : "No longer available"}
          </button>
        )}
        {saveable && (
          <button
            type="button"
            disabled={isPending}
            aria-pressed={saved}
            onClick={() => {
              const next = !saved;
              setSaved(next);
              startTransition(async () => {
                const result = await toggleSave(id, next);
                if (result.error) setSaved(!next);
              });
            }}
            className={`${secondary} ${saved ? "text-brass" : ""}`}
          >
            {saved ? "♥ Saved" : "♡ Save"}
          </button>
        )}
      </div>

      {panel === "message" && (
        <form
          action={(formData) => {
            formData.set("listing_id", id);
            startTransition(async () => {
              const result = await startThread(formData);
              if (result?.error) setError(result.error);
            });
          }}
          className="space-y-2 rounded-lg border border-hairline bg-card p-3"
        >
          <div className="flex flex-wrap gap-1.5">
            {[...(opening === OPENING_MESSAGE ? [] : [opening]), ...QUICK_QUESTIONS].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setBody(q)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  body === q ? "bg-forest text-parchment" : "bg-forest/5 text-forest hover:bg-forest/10"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
          <textarea
            name="body"
            required
            rows={3}
            maxLength={2000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-label="Message to the seller"
            className="w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm outline-none focus:border-forest"
          />
          <div className="flex items-center gap-2">
            <input
              name="buyer_name"
              required
              maxLength={40}
              defaultValue={defaultName}
              placeholder="Your first name"
              aria-label="Your first name"
              className="min-w-0 flex-1 rounded-md border border-hairline bg-card px-3 py-2 text-sm outline-none focus:border-forest"
            />
            <button type="submit" disabled={isPending} className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment disabled:opacity-60">
              {isPending ? "Sending…" : "Send"}
            </button>
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <p className="text-xs text-ink/60">Don&apos;t share your email, phone number or bank details until you&apos;ve agreed a sale.</p>
          <LegalNotice action="sending a message" />
        </form>
      )}

      {panel === "report" ? (
        <div className="rounded-lg border border-hairline bg-card p-3">
          <ReportForm listingId={id} onDone={() => setPanel("none")} />
        </div>
      ) : (
        <button type="button" onClick={() => setPanel("report")} className="text-xs text-ink/50 hover:text-forest hover:underline">
          Report this listing
        </button>
      )}
    </div>
  );
}

export function SellerControls({ id, status }: { id: string; status: MarketListingStatus }) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  if (status === "removed") {
    return (
      <p className="rounded-md border border-hairline bg-card p-3 text-sm text-ink/70">
        This listing was taken down after a report and is hidden from the marketplace. Reply to the email we sent if
        you think that was a mistake.
      </p>
    );
  }

  function run(action: () => Promise<{ error?: string } | void>) {
    startTransition(async () => {
      const result = await action();
      setError(result?.error);
    });
  }

  const statuses: { value: Exclude<MarketListingStatus, "removed">; label: string }[] = [
    { value: "active", label: "Available" },
    { value: "pending", label: "Pending" },
    { value: "sold", label: "Sold" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex rounded-md border border-hairline bg-card p-1" role="radiogroup" aria-label="Listing status">
        {statuses.map((s) => (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={status === s.value}
            disabled={isPending}
            onClick={() => run(() => setListingStatus(id, s.value))}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
              status === s.value ? "bg-forest text-parchment" : "text-forest hover:bg-forest/5"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Link href={`/marketplace/${id}/edit`} className={`${secondary} flex-1 text-center`}>
          Edit listing
        </Link>
        <Link href="/marketplace/inbox" className={`${secondary} flex-1 text-center`}>
          Messages
        </Link>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (confirm("Delete this listing? This can't be undone.")) run(() => deleteListing(id));
          }}
          className={`${secondary} text-red-700 hover:border-red-700`}
        >
          Delete
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
