import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ItineraryEvent, Wedding } from "@/lib/supabase/types";
import { PrintButton } from "./print-button";
import { PrintSheet } from "./print-sheet";

export default async function ItineraryPrintPage() {
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
    redirect("/itinerary");
  }

  const { data: events } = await supabase
    .from("itinerary_events")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true })
    .returns<ItineraryEvent[]>();

  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16 print:px-0 print:py-0">
      <div className="w-full max-w-2xl print:max-w-none">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link href="/itinerary" className="text-sm text-brass hover:underline">
            &larr; Back to Itinerary
          </Link>
          <PrintButton />
        </div>

        <PrintSheet coupleNames={coupleNames} events={events ?? []} />
      </div>
    </main>
  );
}
