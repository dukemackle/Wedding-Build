"use client";

import { useState, useTransition } from "react";
import { inputClass } from "./form-parts";
import { submitListingFeedback } from "./feedback-actions";

const EASE = [1, 2, 3, 4, 5];

/**
 * What a venue or vendor sees after sending its listing: the thanks card,
 * and beside it (stacked on a phone) an optional three-question feedback
 * card. They've just been through every field, so this is when they know
 * best what didn't fit.
 */
export function ClaimDone({
  kind,
  token,
  email,
  summary,
}: {
  kind: "venue" | "vendor";
  token: string;
  email: string;
  summary: string[];
}) {
  return (
    <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:gap-8">
      <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-forest">Thanks — we&apos;ve got it</h2>
        <p className="mt-3 text-ink/70">
          We&apos;ll review your changes and email {email} once they&apos;re live. You can come back to this link any
          time to make more changes.
        </p>
        {summary.length > 0 && (
          <ul className="mt-5 hidden space-y-1 border-t border-hairline pt-5 text-sm text-ink/70 lg:block">
            {summary.map((line) => (
              <li key={line}>✓ {line}</li>
            ))}
          </ul>
        )}
      </div>
      <FeedbackCard kind={kind} token={token} />
    </div>
  );
}

function FeedbackCard({ kind, token }: { kind: "venue" | "vendor"; token: string }) {
  const [missing, setMissing] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [bookings, setBookings] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return (
      <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-xl font-semibold text-forest">Thank you</h2>
        <p className="mt-2 text-sm text-ink/70">
          That goes straight to the founder, and it&apos;s exactly how we decide what to build next.
        </p>
      </div>
    );
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitListingFeedback(kind, token, { missing, rating, bookings });
      if (result.error) setError(result.error);
      else setSent(true);
    });
  }

  const questionClass = "block text-sm font-medium text-ink";

  return (
    <form onSubmit={send} className="rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <h2 className="font-display text-xl font-semibold text-forest">Help us get this right</h2>
        <span className="shrink-0 text-xs text-ink/45">Optional · 30 seconds</span>
      </div>
      <p className="mt-1 text-sm text-ink/60">
        We&apos;re building this with {kind === "venue" ? "venues" : "businesses"} like yours. Anything you tell us goes
        straight to the founder.
      </p>

      <label className={`mt-5 ${questionClass}`}>
        Was there anything about your {kind === "venue" ? "venue" : "business"} you couldn&apos;t add?
        <textarea
          rows={3}
          value={missing}
          onChange={(e) => setMissing(e.target.value)}
          maxLength={2000}
          placeholder={
            kind === "venue"
              ? "A field we're missing, a space that didn't fit, a policy couples always ask about…"
              : "A field we're missing, a package that didn't fit, something couples always ask about…"
          }
          className={`mt-1 resize-none font-normal ${inputClass}`}
        />
      </label>

      <fieldset className="mt-4">
        <legend className={questionClass}>How easy was this to fill out?</legend>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {EASE.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={rating === n}
              onClick={() => setRating(rating === n ? null : n)}
              className={`rounded-md py-2 text-sm ${
                rating === n
                  ? "border-2 border-forest bg-[#FFD301] font-semibold text-forest"
                  : "border border-hairline text-ink hover:border-forest/40"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-ink/45">
          <span>Frustrating</span>
          <span>Easy</span>
        </div>
      </fieldset>

      <label className={`mt-4 ${questionClass}`}>
        What would make couples more likely to book you through us?
        <textarea
          rows={3}
          value={bookings}
          onChange={(e) => setBookings(e.target.value)}
          maxLength={2000}
          className={`mt-1 resize-none font-normal ${inputClass}`}
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={isPending}
          className="whitespace-nowrap rounded-md bg-forest px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Send feedback"}
        </button>
        <span className="text-sm text-ink/50">or just close this page</span>
      </div>
    </form>
  );
}
