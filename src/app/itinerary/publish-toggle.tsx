"use client";

import { useState, useTransition } from "react";
import type { EventAudience } from "@/lib/supabase/types";
import { setItineraryPublished } from "./actions";

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
      className={`mb-5 rounded-[14px] border px-4 py-2.5 ${
        published ? "border-forest/25 bg-forest/5" : "border-hairline bg-card"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="flex min-w-0 items-start gap-2 text-sm text-ink/70">
          <span
            aria-hidden="true"
            className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${published ? "bg-forest" : "bg-ink/25"}`}
          />
          <span>
            <span className="font-semibold text-forest">
              {published ? "Guests can see this schedule." : "Only you can see this schedule."}
            </span>{" "}
            {!hasEvents
              ? "Nothing reaches your guest site until you publish."
              : published
                ? `${share} ${counts.guests === 1 ? "is" : "are"} live; changes show up for guests right away.`
                : `When you publish, ${share.charAt(0).toLowerCase() + share.slice(1)} go on your guest site; the rest stay on your run sheets.`}
          </span>
        </p>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending || (!published && counts.guests === 0)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${
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
        <p className="mt-1.5 pl-4 text-xs text-ink/60">
          {hasEvents
            ? "Nothing here is for guests yet. Set at least one event to Guests before publishing."
            : "Add at least one event before publishing."}
        </p>
      )}

      {/* Publishing does nothing visible while the guest site itself is off --
          worth saying here rather than letting it look broken. */}
      {published && !publicSlug && (
        <p className="mt-1.5 pl-4 text-xs text-ink/60">
          Your guest site isn&apos;t turned on yet, so there&apos;s nowhere for guests to see
          this. Turn it on from the Guests page.
        </p>
      )}

      {error && <p className="mt-1.5 pl-4 text-sm text-red-800">{error}</p>}
    </div>
  );
}
