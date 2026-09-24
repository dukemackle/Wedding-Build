import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  ItineraryEvent,
  PublicConfirmedGuest,
  PublicGuestbookEntry,
  PublicWedding,
  RegistryItem,
  WeddingAccommodation,
  WeddingFaq,
  WeddingGalleryPhoto,
} from "@/lib/supabase/types";
import { FadeInSection } from "@/components/fade-in-section";
import { ChevronDownIcon } from "@/components/icons";
import { RsvpForm } from "./rsvp-form";
import { ItineraryView } from "./itinerary-view";
import { GuestbookView } from "./guestbook-view";
import { GuestWall } from "./guest-wall";
import { GalleryView } from "./gallery-view";
import { WeddingHero } from "./wedding-hero";
import { CANVAS_WIDTH, WIDE_WIDTH } from "@/lib/layout";

const CARD = "rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Shared by the metadata and the page so the lookup runs once per request.
const getWedding = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_weddings")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle<PublicWedding>();
  return data;
});

/**
 * What a texted or posted link unfurls into. Most guests meet the site this
 * way, so it should read as the couple's invitation -- names, date, photo --
 * not as a bare "Wren" link.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wedding = await getWedding(slug);
  if (!wedding) return {};

  const names =
    [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ") ||
    "Our wedding";
  const place = [wedding.venue_city, wedding.venue_state].filter(Boolean).join(", ");
  const when = wedding.wedding_date ? formatDate(wedding.wedding_date) : null;
  const title = when ? `${names} · ${when}` : names;
  const whenWhere = [when, place].filter(Boolean).join(" in ");
  const description = `You're invited! ${whenWhere ? `${whenWhere}. ` : ""}RSVP, see the schedule and travel details here.`;
  const images = wedding.hero_photo_url ? [{ url: wedding.hero_photo_url }] : undefined;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const wedding = await getWedding(slug);

  if (!wedding) {
    notFound();
  }

  const { data: registryItems } = await supabase
    .from("registry_items")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<RegistryItem[]>();

  const { data: itineraryEvents } = await supabase
    .from("itinerary_events")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true })
    .returns<ItineraryEvent[]>();

  const [{ data: weddingFaqs }, { data: accommodations }] = await Promise.all([
    supabase
      .from("wedding_faqs")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("sort_order", { ascending: true })
      .returns<WeddingFaq[]>(),
    supabase
      .from("wedding_accommodations")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("sort_order", { ascending: true })
      .returns<WeddingAccommodation[]>(),
  ]);

  const { data: guestbookEntries } = await supabase
    .from("public_guestbook_entries")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: false })
    .returns<PublicGuestbookEntry[]>();

  const { data: galleryPhotos } = await supabase
    .from("wedding_gallery_photos")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("sort_order", { ascending: true })
    .returns<WeddingGalleryPhoto[]>();

  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
  const shareHref = `/w/${slug}/share`;

  const { data: confirmedGuests } = await supabase
    .from("public_confirmed_guests")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<PublicConfirmedGuest[]>();

  const hasSidebar = Boolean(
    (confirmedGuests && confirmedGuests.length > 0) ||
      wedding.dress_code ||
      wedding.travel_notes ||
      (accommodations && accommodations.length > 0) ||
      (weddingFaqs && weddingFaqs.length > 0) ||
      (registryItems && registryItems.length > 0),
  );

  return (
    <main className="flex flex-1 flex-col">
      <WeddingHero wedding={wedding} />

      {/* Two arrangements. On a phone, one column in reading order. From lg
          up, the things a guest acts on (RSVP, schedule, guestbook) take the
          wide left column and the reference material sits beside them, so a
          big screen holds two panels rather than one stretched stack. When
          the couple hasn't filled in any reference material yet, the right
          column would be empty, so the page centres as a single column. */}
      <div
        className={`mx-auto w-full px-4 pb-16 sm:px-6 lg:px-10 ${
          hasSidebar
            ? `${CANVAS_WIDTH} lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-8`
            : WIDE_WIDTH
        }`}
      >
        <div className="flex flex-col gap-8">
            <FadeInSection>
              <div id="rsvp" className={`${CARD} scroll-mt-6`}>
                <h2 className="font-display text-2xl font-semibold text-forest">RSVP</h2>
                <p className="mt-1 text-sm text-ink/70">
                  Let {wedding.partner_a_name ?? "the couple"} &amp;{" "}
                  {wedding.partner_b_name ?? "the couple"} know if you can make it.
                </p>
                {wedding.rsvp_deadline && (
                  <p className="mt-3 inline-block rounded-full border border-brass/40 bg-brass/10 px-3 py-1 text-sm text-brass">
                    Please RSVP by {formatDate(wedding.rsvp_deadline)}
                  </p>
                )}
                <RsvpForm
                  weddingId={wedding.id}
                  partnerAName={wedding.partner_a_name}
                  partnerBName={wedding.partner_b_name}
                  shareHref={shareHref}
                />
              </div>
            </FadeInSection>

            {galleryPhotos && galleryPhotos.length > 0 && (
              <FadeInSection>
                <div className={`${CARD} overflow-hidden`}>
                  <h2 className="font-display text-2xl font-semibold text-forest">Us, so far</h2>
                  <div className="mt-4">
                    <GalleryView photos={galleryPhotos} alt={coupleNames} />
                  </div>
                </div>
              </FadeInSection>
            )}

            {itineraryEvents && itineraryEvents.length > 0 && (
              <FadeInSection>
                <div className={CARD}>
                  <h2 className="font-display text-2xl font-semibold text-forest">
                    Weekend schedule
                  </h2>
                  <div className="mt-4">
                    <ItineraryView events={itineraryEvents} weddingDate={wedding.wedding_date} />
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* Always shown, even empty: it's where guests are invited to post. */}
            <FadeInSection>
              <div id="photo-wall" className={`${CARD} scroll-mt-6`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-forest">
                      From our guests
                    </h2>
                    <p className="mt-1 text-sm text-ink/70">
                      {guestbookEntries && guestbookEntries.length > 0
                        ? "Photos and well wishes from the people we love."
                        : "Be the first — share a photo or a few words for the two of us."}
                    </p>
                  </div>
                  <a
                    href={shareHref}
                    className="btn-motion shrink-0 rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
                  >
                    Add a photo
                  </a>
                </div>
                {guestbookEntries && guestbookEntries.length > 0 && (
                  <div className="mt-5">
                    <GuestbookView entries={guestbookEntries} />
                  </div>
                )}
              </div>
            </FadeInSection>

        </div>

        <div className={`mt-8 flex flex-col gap-8 ${hasSidebar ? "lg:mt-0" : ""}`}>
            <FadeInSection>
              <GuestWall guests={confirmedGuests ?? []} />
            </FadeInSection>

            {(wedding.dress_code || wedding.travel_notes || (accommodations && accommodations.length > 0)) && (
              <FadeInSection>
                <div className={CARD}>
                  <h2 className="font-display text-2xl font-semibold text-forest">
                    Travel &amp; what to wear
                  </h2>

                  {wedding.dress_code && (
                    <div className="mt-4">
                      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
                        Dress code
                      </p>
                      <p className="mt-1 text-ink/80">{wedding.dress_code}</p>
                    </div>
                  )}

                  {wedding.travel_notes && (
                    <div className="mt-5">
                      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
                        Getting there &amp; parking
                      </p>
                      <p className="mt-1 whitespace-pre-line text-ink/80">{wedding.travel_notes}</p>
                    </div>
                  )}

                  {accommodations && accommodations.length > 0 && (
                    <div className="mt-5">
                      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
                        Where to stay
                      </p>
                      <div className="mt-2">
                        {accommodations.map((stay) => (
                          <div key={stay.id} className="border-b border-hairline py-3 last:border-b-0">
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
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FadeInSection>
            )}

            {weddingFaqs && weddingFaqs.length > 0 && (
              <FadeInSection>
                <div className={CARD}>
                  <h2 className="font-display text-2xl font-semibold text-forest">
                    Questions &amp; answers
                  </h2>
                  <div className="mt-3">
                    {weddingFaqs.map((faq) => (
                      <details
                        key={faq.id}
                        className="group border-b border-hairline py-3 last:border-b-0"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-ink marker:hidden">
                          {faq.question}
                          <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink/40 transition-transform group-open:rotate-180" />
                        </summary>
                        <p className="mt-2 whitespace-pre-line text-ink/70">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            )}

            {registryItems && registryItems.length > 0 && (
              <FadeInSection>
                <div className={CARD}>
                  <h2 className="font-display text-2xl font-semibold text-forest">Gift registry</h2>
                  <div className="mt-4">
                    {registryItems.map((item) => (
                      <div key={item.id} className="border-b border-hairline py-4 last:border-b-0">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-ink hover:underline"
                          >
                            {item.label} ↗
                          </a>
                        ) : (
                          <span className="text-ink">{item.label}</span>
                        )}
                        {item.notes && <p className="mt-1 text-sm text-ink/70">{item.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            )}
        </div>
      </div>
    </main>
  );
}
