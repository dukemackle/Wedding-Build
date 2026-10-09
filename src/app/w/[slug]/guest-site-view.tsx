import type { createClient } from "@/lib/supabase/server";
import { SiteText } from "@/components/site-text";
import type {
  ItineraryEvent,
  PublicConfirmedGuest,
  PublicGuestbookEntry,
  PublicWedding,
  RegistryItem,
  WeddingAccommodation,
  WeddingFaq,
  WeddingGalleryPhoto,
  SiteBlock,
} from "@/lib/supabase/types";
import { ChevronDownIcon } from "@/components/icons";
import { RsvpForm } from "./rsvp-form";
import { ItineraryView } from "./itinerary-view";
import { GuestbookView } from "./guestbook-view";
import { GuestWall } from "./guest-wall";
import { GalleryView } from "./gallery-view";
import { StayList } from "./stay-list";
import { VenueView } from "./venue-view";
import { WeddingHero } from "./wedding-hero";
import type { ReactNode } from "react";
import { blockKey, type SectionKey } from "@/lib/site-design";
import { SiteBlockView, blockHasContent } from "./site-block";
import { SectionLayout } from "./section-layout";
import { Replayable, SiteMotion } from "@/components/site-motion";

/**
 * The guest site itself, below any theme.
 *
 * Shared by the live page at /w/[slug] and the owner's draft preview in the
 * guest site editor, so what a couple previews is the page guests get, not a
 * lookalike that drifts.
 */

const CARD = "site-card rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type GuestSiteContent = Awaited<ReturnType<typeof loadGuestSiteContent>>;

export async function loadGuestSiteContent(supabase: Supabase, wedding: PublicWedding) {
  const { data: registryItems } = await supabase
    .from("registry_items")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<RegistryItem[]>();

  // Row security already hides an unpublished schedule from guests; the check
  // here is for the owner's preview, where it wouldn't.
  const { data: itineraryEvents } = wedding.itinerary_published
    ? await supabase
    .from("itinerary_events")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true })
    .returns<ItineraryEvent[]>()
    : { data: [] as ItineraryEvent[] };

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

  const { data: confirmedGuests } = await supabase
    .from("public_confirmed_guests")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<PublicConfirmedGuest[]>();

  const { data: blocks } = await supabase
    .from("site_blocks")
    .select("*")
    .eq("wedding_id", wedding.id)
    .returns<SiteBlock[]>();

  return {
    blocks: blocks ?? [],
    registryItems: registryItems ?? [],
    // Invite-only events never reach the public schedule (0109 hides them
    // from guests; this keeps the couple's preview honest too).
    itineraryEvents: (itineraryEvents ?? []).filter((e) => !e.invite_only),
    weddingFaqs: weddingFaqs ?? [],
    accommodations: accommodations ?? [],
    guestbookEntries: guestbookEntries ?? [],
    galleryPhotos: galleryPhotos ?? [],
    confirmedGuests: confirmedGuests ?? [],
  };
}

export function GuestSiteView({
  wedding,
  content,
}: {
  wedding: PublicWedding;
  content: GuestSiteContent;
}) {
  const {
    registryItems,
    itineraryEvents,
    weddingFaqs,
    accommodations,
    guestbookEntries,
    galleryPhotos,
    confirmedGuests,
    blocks,
  } = content;
  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");
  const shareHref = `/w/${wedding.public_slug}/share`;
  const initials = [wedding.partner_a_name, wedding.partner_b_name]
    .map((name) => name?.trim()?.[0]?.toUpperCase())
    .filter(Boolean)
    .join(" & ");

  // Every section the couple can reorder or hide, or null when there's
  // nothing in it yet -- an empty section is left off whatever the design says.
  const sections: Partial<Record<SectionKey, ReactNode>> = {
    ...Object.fromEntries(blocks.filter(blockHasContent).map((b) => [blockKey(b.id), <SiteBlockView key={b.id} block={b} />])),
    rsvp: (
      <div id="rsvp" className={`${CARD} scroll-mt-6`}>
        <SiteText slot="rsvp.title" className="font-display text-2xl font-semibold text-forest">RSVP</SiteText>
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
          initialEvents={itineraryEvents
            .filter((e) => e.rsvp && !e.invite_only)
            .map(({ id, title, event_date, start_time, location, invite_only }) => ({
              id,
              title,
              event_date,
              start_time,
              location,
              invite_only,
            }))}
          weddingId={wedding.id}
          partnerAName={wedding.partner_a_name}
          partnerBName={wedding.partner_b_name}
          shareHref={shareHref}
        />
      </div>
    ),
    photos:
      galleryPhotos.length > 0 ? (
        <div className={`${CARD} overflow-hidden`}>
          <SiteText slot="photos.title" className="font-display text-2xl font-semibold text-forest">Us, so far</SiteText>
          <div className="mt-4">
            <GalleryView photos={galleryPhotos} alt={coupleNames} />
          </div>
        </div>
      ) : null,
    venue: wedding.venue_name ? <VenueView wedding={wedding} card={CARD} /> : null,
    weekend:
      itineraryEvents.length > 0 ? (
        <div className={CARD}>
          <SiteText slot="weekend.title" className="font-display text-2xl font-semibold text-forest">
            {new Set(itineraryEvents.map((e) => e.event_date)).size > 1 ? "The schedule" : "On the day"}
          </SiteText>
          <div className="mt-4">
            <ItineraryView events={itineraryEvents} weddingDate={wedding.wedding_date} />
          </div>
        </div>
      ) : null,
    wall: (
      <div id="photo-wall" className={`${CARD} scroll-mt-6`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SiteText slot="wall.title" className="font-display text-2xl font-semibold text-forest">
              From our guests
            </SiteText>
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
    ),
    guests:
      confirmedGuests.length > 0 ? (
        <GuestWall guests={confirmedGuests ?? []} />
      ) : null,
    travel:
      wedding.dress_code || wedding.travel_notes || accommodations.length > 0 ? (
        <div className={CARD}>
          <SiteText slot="travel.title" className="font-display text-2xl font-semibold text-forest">
            Travel &amp; what to wear
          </SiteText>

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
              <StayList stays={accommodations} />
            </div>
          )}
        </div>
      ) : null,
    faq:
      weddingFaqs.length > 0 ? (
        <div className={CARD}>
          <SiteText slot="faq.title" className="font-display text-2xl font-semibold text-forest">
            Questions &amp; answers
          </SiteText>
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
      ) : null,
    registry:
      registryItems.length > 0 ? (
        <div className={CARD}>
          <SiteText slot="registry.title" className="font-display text-2xl font-semibold text-forest">Gift registry</SiteText>
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
      ) : null,
  };

  return (
    <main className="flex flex-1 flex-col">
      <Replayable>
        <SiteMotion initials={initials} />
        <WeddingHero wedding={wedding} />
        <SectionLayout sections={sections} />
      </Replayable>
    </main>
  );
}
