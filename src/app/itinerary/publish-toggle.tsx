"use client";

import { useState, useTransition } from "react";
import type { EventAudience } from "@/lib/supabase/types";
import { AUDIENCES } from "@/lib/itinerary";
import { setItineraryPublished } from "./actions";
import { AUDIENCE_FILL } from "@/components/audience-tag";

/**
 * Publish control for the weekend schedule.
 *
 * Deliberately shows the current state as a plain sentence rather than a bare
 * switch: "is this visible to my guests right now" is the question a couple
 * actually has, and a toggle alone makes people guess which way is on.
 */
export function PublishToggle({
  published,
  counts,
  publicSlug,
}: {
  published: boolean;
  /** How many events each audience has. */
  counts: Record<EventAudience, number>;
  publicSlug: string | null;
}) {
  const total = counts.guests + counts.party + counts.private;
  const hasEvents = total > 0;
  // "5 of 9": everything is public unless some events are tagged otherwise,
  // and then it's worth saying how much stays back.
  const share =
    counts.guests === total
      ? `All ${total} ${total === 1 ? "event" : "events"}`
      : `${counts.guests} of ${total} events`;
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    if (
      published &&
      !confirm("Hide the schedule from your guests? You can publish it again anytime.")
    ) {
      return;
    }
    const formData = new FormData();
    formData.set("published", String(!published));
    setError(undefined);
    startTransition(async () => {
      const result = await setItineraryPublished(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div
      className={`mb-6 rounded-lg border p-4 sm:p-5 ${
        published ? "border-forest/25 bg-forest/5" : "border-hairline bg-parchment"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-forest">
            <span
              aria-hidden="true"
              className={`inline-block h-2 w-2 rounded-full ${
                published ? "bg-forest" : "bg-ink/25"
              }`}
            />
            {published ? "Guests can see this schedule" : "Only you can see this schedule"}
          </p>
          <p className="mt-1 max-w-xl text-sm text-ink/70">
            {!hasEvents
              ? "Plan freely — nothing here reaches your guest site until you publish it."
              : published
                ? `${share} ${counts.guests === 1 ? "is" : "are"} live on your guest site. Changes to ${counts.guests === 1 ? "it" : "them"} show up for guests right away.`
                : `Plan freely. When you publish, ${share.charAt(0).toLowerCase() + share.slice(1)} go on your guest site; the rest stay on your run sheets.`}
          </p>
          {hasEvents && counts.guests < total && (
            <div className="mt-2.5">
              <div className="flex h-1.5 max-w-xs gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
                {AUDIENCES.map((a) =>
                  counts[a.value] ? (
                    <span key={a.value} className={AUDIENCE_FILL[a.value]} style={{ flex: counts[a.value] }} />
                  ) : null,
                )}
              </div>
              <p className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-ink/60">
                {AUDIENCES.filter((a) => counts[a.value]).map((a) => (
                  <span key={a.value}>
                    {counts[a.value]} {a.value === "guests" ? "for guests" : a.label.toLowerCase()}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending || (!published && counts.guests === 0)}
          className={`shrink-0 rounded-full px-5 py-2 font-mono-numbers text-sm transition-colors disabled:opacity-40 ${
            published
              ? "border border-hairline bg-card text-forest hover:border-forest"
              : "bg-forest text-parchment hover:bg-forest/90"
          }`}
        >
          {isPending ? "Saving…" : published ? "Unpublish" : "Publish to guests"}
        </button>
      </div>

      {/* Publishing an empty schedule would put an empty section on the guest
          site, so the button stays disabled until there's something to show. */}
      {!published && counts.guests === 0 && (
        <p className="mt-3 text-sm text-ink/60">
          {hasEvents
            ? "Nothing here is for guests yet. Set at least one event to Guests before publishing."
            : "Add at least one event before publishing."}
        </p>
      )}

      {/* Publishing does nothing visible while the guest site itself is off --
          worth saying here rather than letting it look broken. */}
      {published && !publicSlug && (
        <p className="mt-3 text-sm text-ink/60">
          Your guest site isn&apos;t turned on yet, so there&apos;s nowhere for guests to see
          this. Turn it on from the Guests page.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
    </div>
  );
}
