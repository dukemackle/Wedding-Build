import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  ItineraryEvent,
  PublicConfirmedGuest,
  PublicGuestbookEntry,
  PublicWedding,
  RegistryItem,
} from "@/lib/supabase/types";
import { RsvpForm } from "./rsvp-form";
import { ItineraryView } from "./itinerary-view";
import { GuestbookView } from "./guestbook-view";
import { GuestWall } from "./guest-wall";

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
        <p className="text-center font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          You&apos;re invited
        </p>
        <h1 className="mt-2 text-center font-display text-4xl font-semibold text-forest">
          {wedding.partner_a_name} &amp; {wedding.partner_b_name}
        </h1>
        {wedding.wedding_date && (
          <p className="mt-2 text-center text-ink/70">{formatDate(wedding.wedding_date)}</p>
        )}

        <GuestWall guests={confirmedGuests ?? []} />

        <div className="mt-10 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-forest">RSVP</h2>
          <p className="mt-1 text-sm text-ink/70">
            Let {wedding.partner_a_name ?? "the couple"} &amp;{" "}
            {wedding.partner_b_name ?? "the couple"} know if you can make it.
          </p>
          <RsvpForm weddingId={wedding.id} />
        </div>

        {guestbookEntries && guestbookEntries.length > 0 && (
          <div className="mt-8 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-forest">Guestbook</h2>
            <p className="mt-1 text-sm text-ink/70">Well wishes from your guests.</p>
            <div className="mt-4">
              <GuestbookView entries={guestbookEntries} />
            </div>
          </div>
        )}

        {itineraryEvents && itineraryEvents.length > 0 && (
          <div className="mt-8 rounded-lg border border-hairline bg-card p-6 sm:p-10 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-forest">
              Weekend schedule
            </h2>
            <div className="mt-4">
              <ItineraryView events={itineraryEvents} weddingDate={wedding.wedding_date} />
            </div>
          </div>
        )}

        {registryItems && registryItems.length > 0 && (
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
        )}
      </div>
    </main>
  );
}
