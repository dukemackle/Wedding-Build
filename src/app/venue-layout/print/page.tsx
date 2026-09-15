import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/print-button";
import type { Guest, SeatingTable, VenueRoom, Wedding } from "@/lib/supabase/types";
import { SeatingPrintSheet } from "./print-sheet";

export const metadata = { title: "Seating chart" };

export default async function SeatingPrintPage() {
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
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  if (!wedding) {
    redirect("/venue-layout");
  }

  const [{ data: tables }, { data: guests }, { data: rooms }] = await Promise.all([
    supabase
      .from("seating_tables")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("name", { ascending: true })
      .returns<SeatingTable[]>(),
    // Same rule as the layout editor: anyone who hasn't declined still
    // needs a seat, because plenty of guests never RSVP at all.
    supabase
      .from("guests")
      .select("*")
      .eq("wedding_id", wedding.id)
      .neq("status", "declined")
      .order("name", { ascending: true })
      .returns<Guest[]>(),
    supabase
      .from("venue_rooms")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: true })
      .returns<VenueRoom[]>(),
  ]);

  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16 print:px-0 print:py-0">
      <div className="w-full max-w-3xl print:max-w-none">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link href="/venue-layout" className="text-sm text-brass hover:underline">
            &larr; Back to Venue Layout
          </Link>
          <PrintButton />
        </div>

        <SeatingPrintSheet
          coupleNames={coupleNames}
          weddingDate={wedding.wedding_date}
          tables={tables ?? []}
          rooms={rooms ?? []}
          guests={guests ?? []}
        />
      </div>
    </main>
  );
}
