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
} from "@/lib/supabase/types";
import { FadeInSection } from "@/components/fade-in-section";
import { ChevronDownIcon } from "@/components/icons";
import { RsvpForm } from "./rsvp-form";
import { ItineraryView } from "./itinerary-view";
import { GuestbookView } from "./guestbook-view";
import { GuestWall } from "./guest-wall";
import { WeddingHero } from "./wedding-hero";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PublicWeddingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: wedding } = await supabase
    .from("public_weddings")
    .select("*")
    .eq("public_slug", slug)
    .maybeSingle<PublicWedding>();

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

  const { data: confirmedGuests } = await supabase
    .from("public_confirmed_guests")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("created_at", { ascending: true })
    .returns<PublicConfirmedGuest[]>();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-3xl">
        <WeddingHero wedding={wedding} />

        <FadeInSection>
          <GuestWall guests={confirmedGuests ?? []} />
        </FadeInSection>

        <FadeInSection>
          <div className="mt-10 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
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
            <RsvpForm weddingId={wedding.id} />
          </div>
        </FadeInSection>

        {guestbookEntries && guestbookEntries.length > 0 && (
          <FadeInSection>
            <div className="mt-8 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
              <h2 className="font-display text-2xl font-semibold text-forest">Guestbook</h2>
              <p className="mt-1 text-sm text-ink/70">Well wishes from your guests.</p>
              <div className="mt-4">
                <GuestbookView entries={guestbookEntries} />
              </div>
            </div>
          </FadeInSection>
        )}

        {itineraryEvents && itineraryEvents.length > 0 && (
          <FadeInSection>
            <div className="mt-8 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
              <h2 className="font-display text-2xl font-semibold text-forest">
                Weekend schedule
              </h2>
              <div className="mt-4">
                <ItineraryView events={itineraryEvents} weddingDate={wedding.wedding_date} />
              </div>
            </div>
          </FadeInSection>
        )}

        {(wedding.dress_code || wedding.travel_notes || (accommodations && accommodations.length > 0)) && (
          <FadeInSection>
            <div className="mt-8 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
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
            <div className="mt-8 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
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
            <div className="mt-8 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
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
    </main>
  );
}
