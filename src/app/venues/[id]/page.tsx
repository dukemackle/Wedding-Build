import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { FadeInSection } from "@/components/fade-in-section";
import type { Venue, VenueShortlistEntry, Wedding } from "@/lib/supabase/types";
import { VenueDetailClient, VenueMapEmbed } from "./venue-detail-client";

const VENUE_TYPE_IMAGES: Record<string, string> = {
  "Barn / Rustic": "/venue-types/barn-rustic.svg",
  "Ballroom / Hotel": "/venue-types/ballroom-hotel.svg",
  "Garden / Outdoor": "/venue-types/garden-outdoor.svg",
  "Beach / Waterfront": "/venue-types/beach-waterfront.svg",
  "Historic / Estate": "/venue-types/historic-estate.svg",
  "Restaurant / Vineyard": "/venue-types/restaurant-vineyard.svg",
};
const DEFAULT_VENUE_IMAGE = "/venue-types/historic-estate.svg";

function directionsHref(venue: Venue): string {
  if (venue.latitude != null && venue.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
  }
  const query = [venue.name, venue.city, venue.state].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: venue } = await supabase
    .from("venues")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .maybeSingle<Venue>();

  if (!venue) {
    notFound();
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Wedding>();

  const { data: shortlistEntry } = wedding
    ? await supabase
        .from("venue_shortlist")
        .select("*")
        .eq("wedding_id", wedding.id)
        .eq("venue_id", venue.id)
        .maybeSingle<VenueShortlistEntry>()
    : { data: null };

  const similarityFilters = [
    venue.venue_type ? `venue_type.eq.${venue.venue_type}` : null,
    venue.region ? `region.eq.${venue.region}` : null,
  ].filter((f): f is string => Boolean(f));

  const { data: similarVenues } = similarityFilters.length
    ? await supabase
        .from("venues")
        .select("*")
        .eq("active", true)
        .neq("id", venue.id)
        .or(similarityFilters.join(","))
        .limit(3)
        .returns<Venue[]>()
    : { data: [] as Venue[] };

  const image =
    venue.image_url || (venue.venue_type && VENUE_TYPE_IMAGES[venue.venue_type]) || DEFAULT_VENUE_IMAGE;

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} maxWidthClassName="max-w-4xl" />
      <div className="w-full max-w-4xl">
        <Link href="/venues" className="text-sm text-brass hover:underline">
          &larr; Back to venues
        </Link>

        <FadeInSection>
          <div className="mt-4 overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
            <Image
              src={image}
              alt={venue.venue_type ? `${venue.venue_type} illustration` : "Venue illustration"}
              width={900}
              height={500}
              className="aspect-[16/9] w-full border-b border-hairline object-cover"
            />
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h1 className="font-display text-3xl font-semibold text-forest">{venue.name}</h1>
                {venue.price_tier && (
                  <span className="shrink-0 rounded-full border border-hairline px-3 py-1 text-sm text-brass">
                    {venue.price_tier}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm uppercase tracking-wide text-ink/50">
                {[
                  [venue.city, venue.state].filter(Boolean).join(", "),
                  venue.region,
                  venue.venue_type,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {venue.capacity && (
                <p className="mt-2 font-mono-numbers text-sm text-ink/70">
                  Up to {venue.capacity} guests
                </p>
              )}
              {venue.description && <p className="mt-4 text-ink/80">{venue.description}</p>}
              <a
                href={directionsHref(venue)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm text-brass hover:underline"
              >
                Get directions &rarr;
              </a>
            </div>
          </div>
        </FadeInSection>

        {wedding && (
          <FadeInSection delayMs={40}>
            <div className="mt-6">
              <VenueDetailClient
                venue={venue}
                isShortlisted={Boolean(shortlistEntry)}
                isBooked={wedding.venue_id === venue.id}
                shortlistEntry={shortlistEntry ?? null}
              />
            </div>
          </FadeInSection>
        )}

        {venue.latitude != null && venue.longitude != null && (
          <FadeInSection delayMs={80}>
            <div className="mt-6">
              <VenueMapEmbed
                venue={venue as Venue & { latitude: number; longitude: number }}
                isShortlisted={Boolean(shortlistEntry)}
              />
            </div>
          </FadeInSection>
        )}

        {similarVenues && similarVenues.length > 0 && (
          <FadeInSection delayMs={120}>
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold text-forest">
                More venues like this
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {similarVenues.map((v) => {
                  const vImage =
                    v.image_url ||
                    (v.venue_type && VENUE_TYPE_IMAGES[v.venue_type]) ||
                    DEFAULT_VENUE_IMAGE;
                  return (
                    <Link
                      key={v.id}
                      href={`/venues/${v.id}`}
                      className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-parchment transition-colors hover:border-forest"
                    >
                      <Image
                        src={vImage}
                        alt={v.name}
                        width={300}
                        height={225}
                        className="aspect-[4/3] w-full border-b border-hairline object-cover"
                      />
                      <div className="p-3">
                        <p className="font-display text-sm font-semibold text-forest">{v.name}</p>
                        <p className="mt-0.5 text-xs text-ink/50">
                          {[v.city, v.state].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeInSection>
        )}
      </div>
    </main>
  );
}
