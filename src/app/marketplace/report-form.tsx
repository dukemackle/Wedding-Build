"use client";

import { useState, useTransition } from "react";
import { LegalNotice } from "@/components/legal-notice";
import { MARKET_REPORT_REASONS } from "@/lib/marketplace";
import { reportMarket } from "./chat-actions";

/** Report a listing, or a conversation (and the listing it's about). */
export function ReportForm({
  listingId,
  threadId,
  onDone,
}: {
  listingId?: string;
  threadId?: string;
  onDone: () => void;
}) {
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className="text-sm text-ink/70">
        Thanks — we&apos;ll look at it. If you feel unsafe, block them from the ⋯ menu.
        <button type="button" onClick={onDone} className="ml-2 text-brass underline">
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        if (listingId) formData.set("listing_id", listingId);
        if (threadId) formData.set("thread_id", threadId);
        startTransition(async () => {
          const result = await reportMarket(formData);
          if (result.error) setError(result.error);
          else setSent(true);
        });
      }}
      className="space-y-2 text-sm"
    >
      <p className="font-medium text-forest">What&apos;s wrong?</p>
      <div className="grid gap-1 sm:grid-cols-2">
        {MARKET_REPORT_REASONS.map((r) => (
          <label key={r.value} className="flex items-center gap-2 text-ink/80">
            <input type="radio" name="reason" value={r.value} required />
            {r.label}
          </label>
        ))}
      </div>
      <textarea
        name="details"
        rows={2}
        maxLength={1000}
        placeholder="Anything we should know (optional)"
        className="w-full rounded-md border border-hairline bg-card px-3 py-2 outline-none focus:border-forest"
      />
      {error && <p className="text-red-700">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment disabled:opacity-60"
        >
          Send report
        </button>
        <button type="button" onClick={onDone} className="text-ink/60 hover:text-forest">
          Cancel
        </button>
      </div>
      <LegalNotice action="sending a report" />
    </form>
  );
}
