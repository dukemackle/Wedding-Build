"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { designAtVenue } from "@/app/venue-layout/room-actions";

export type DesignContext = { venueId: string; signedIn: boolean; hasWedding: boolean; href: string };

/**
 * "Design my wedding here": copies the venue's floor plans into the couple's
 * layout and opens this space. Logged out, it goes through signup and back to
 * the listing; with no wedding yet, through setup.
 */
export function DesignHereButton({ spaceId, context }: { spaceId: string; context: DesignContext }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Secondary: the gold button on a listing is "Request info".
  const className = "btn-secondary w-full sm:w-auto";

  if (!context.signedIn) {
    return (
      <Link href={`/signup?next=${encodeURIComponent(context.href)}`} className={className}>
        Design my wedding here
      </Link>
    );
  }
  if (!context.hasWedding) {
    return (
      <Link href="/start" className={className}>
        Design my wedding here
      </Link>
    );
  }
  return (
    <>
      <button
        type="button"
        className={className}
        disabled={isPending}
        onClick={() => {
          const fd = new FormData();
          fd.set("venue_id", context.venueId);
          fd.set("space_id", spaceId);
          startTransition(async () => {
            // Redirects to the layout editor on success.
            const result = await designAtVenue(fd);
            if (result?.error) setError(result.error);
          });
        }}
      >
        {isPending ? "Setting up the room…" : "Design my wedding here"}
      </button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </>
  );
}
