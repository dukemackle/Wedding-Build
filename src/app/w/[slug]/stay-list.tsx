"use client";

import type { WeddingAccommodation } from "@/lib/supabase/types";
import { useSiteDesign } from "@/components/guest-site-theme";

/**
 * Where to stay. As cards, a plain list; in the storybook page style, a
 * dotted route with a pin at each stop, the way the rest of that style reads
 * like a keepsake rather than a form.
 */
export function StayList({ stays }: { stays: WeddingAccommodation[] }) {
  const { pageStyle } = useSiteDesign();

  if (pageStyle === "storybook") {
    return (
      <ol className="relative mt-3 flex flex-col gap-6">
        <span
          className="absolute bottom-4 left-[11px] top-4 border-l-2 border-dotted border-[var(--site-accent)]"
          aria-hidden="true"
        />
        {stays.map((stay) => (
          <li key={stay.id} className="relative flex gap-4">
            <span
              className="relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-card bg-[var(--site-accent)] shadow-sm"
              aria-hidden="true"
            />
            <Stay stay={stay} />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="mt-2">
      {stays.map((stay) => (
        <div key={stay.id} className="border-b border-hairline py-3 last:border-b-0">
          <Stay stay={stay} />
        </div>
      ))}
    </div>
  );
}

function Stay({ stay }: { stay: WeddingAccommodation }) {
  return (
    <div className="min-w-0">
      <p className="text-ink">{stay.name}</p>
      {stay.address && <p className="mt-0.5 text-sm text-ink/60">{stay.address}</p>}
      {stay.notes && <p className="mt-1 text-sm text-ink/70">{stay.notes}</p>}
      {stay.booking_url && (
        <a
          href={stay.booking_url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-sm text-brass hover:underline"
        >
          Book a room &rarr;
        </a>
      )}
    </div>
  );
}
