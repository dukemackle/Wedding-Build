import Image from "next/image";
import Link from "next/link";
import type { Venue } from "@/lib/supabase/types";

/**
 * The booked venue, as a line inside the snapshot.
 *
 * It was a full card with a hero image, which gave the one thing that never
 * changes again more room than anything that does. Booking the venue is the
 * biggest decision of the whole process and precisely for that reason it stops
 * needing attention the moment it's made -- a line confirming it's handled is
 * what the couple actually wants to see.
 */
export function BookedVenueCard({ venue }: { venue: Venue }) {
  const detail = [[venue.city, venue.state].filter(Boolean).join(", "), venue.venue_type]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mt-4 flex items-center gap-3 rounded-md border border-hairline bg-parchment p-3">
      {venue.image_url ? (
        <Image
          src={venue.image_url}
          alt=""
          width={120}
          height={120}
          className="h-11 w-11 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brass/10 text-brass">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">Booked — {venue.name}</p>
        {detail && <p className="truncate text-xs text-ink/55">{detail}</p>}
      </div>
      <Link href="/venues" className="shrink-0 text-xs text-brass hover:underline">
        Change
      </Link>
    </div>
  );
}
