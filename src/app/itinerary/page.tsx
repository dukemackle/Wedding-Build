import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type { ItineraryEvent, Wedding } from "@/lib/supabase/types";
import { ItineraryManager } from "./itinerary-manager";

export default async function ItineraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Itinerary
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before building a schedule.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const { data: events } = await supabase
    .from("itinerary_events")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true })
    .returns<ItineraryEvent[]>();

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} maxWidthClassName="max-w-4xl" />
      <div className="w-full max-w-4xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Itinerary
        </p>
        <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold text-forest">
            Wedding weekend schedule
          </h1>
          <Link
            href="/itinerary/print"
            className="rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-forest transition-colors hover:border-forest"
          >
            Print run sheet
          </Link>
        </div>
        <p className="mb-6 text-sm text-ink/70">
          Click a day to see or add events. Once your guest site is turned on, guests see this
          same schedule on the public RSVP page.
        </p>

        <ItineraryManager events={events ?? []} weddingDate={wedding.wedding_date} />
      </div>
    </main>
  );
}
