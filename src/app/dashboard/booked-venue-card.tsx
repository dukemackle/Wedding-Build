import Image from "next/image";
import Link from "next/link";
import type { Venue } from "@/lib/supabase/types";

export function BookedVenueCard({ venue }: { venue: Venue }) {
  return (
    <div className="mt-8 w-full max-w-2xl overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
      {venue.image_url && (
        <Image
          src={venue.image_url}
          alt={venue.name}
          width={800}
          height={450}
          className="aspect-video w-full border-b border-hairline object-cover"
        />
      )}
      <div className="p-6 sm:p-10">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Our venue
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-forest">{venue.name}</h2>
        <p className="mt-1 text-sm text-ink/70">
          {[[venue.city, venue.state].filter(Boolean).join(", "), venue.venue_type]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <Link
          href="/venues"
          className="mt-4 inline-block text-sm text-brass hover:underline"
        >
          Change venue
        </Link>
      </div>
    </div>
  );
}
