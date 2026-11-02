import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ItineraryEvent, Wedding } from "@/lib/supabase/types";
import { PrintButton } from "@/components/print-button";
import { audienceOf } from "@/lib/itinerary";
import { PrintSheet } from "./print-sheet";

/** Which run sheet: everything, the wedding party's, or the guests'. */
const SHEETS = {
  all: { eyebrow: "Wedding weekend run sheet", shows: ["guests", "party", "private"] },
  party: { eyebrow: "Wedding party & family schedule", shows: ["guests", "party"] },
  guests: { eyebrow: "Wedding weekend schedule", shows: ["guests"] },
} as const;

export default async function ItineraryPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ for?: string }>;
}) {
  const { for: forParam } = await searchParams;
  const sheet = SHEETS[forParam === "party" || forParam === "guests" ? forParam : "all"];

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
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
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

        <PrintSheet
          coupleNames={coupleNames}
          eyebrow={sheet.eyebrow}
          showAudience={sheet === SHEETS.all}
          events={(events ?? []).filter((e) => (sheet.shows as readonly string[]).includes(audienceOf(e)))}
        />
      </div>
    </main>
  );
}
