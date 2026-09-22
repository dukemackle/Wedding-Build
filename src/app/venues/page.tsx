import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type { Venue, VenueShortlistEntry, Wedding } from "@/lib/supabase/types";
import { VenuesManager } from "./venues-manager";

export default async function VenuesPage() {
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
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} width="full" />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 sm:p-10 text-center shadow-sm">
          <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
            Venues
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before browsing venues.
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

  const { data: venues } = await supabase
    .from("venues")
    .select("*")
    .eq("active", true)
    .order("name")
    .returns<Venue[]>();

  const { data: shortlist } = await supabase
    .from("venue_shortlist")
    .select("*")
    .eq("wedding_id", wedding.id)
    .returns<VenueShortlistEntry[]>();

  return (
    // No width cap and no visible page heading: the filter bar is the top of
    // this screen, the way it is on a listings site. The heading stays for
    // screen readers.
    <main className="flex flex-1 flex-col px-6 py-16">
      <AppNav email={user.email ?? ""} width="full" />
      <h1 className="sr-only">Browse & shortlist venues</h1>
      <VenuesManager
        venues={venues ?? []}
        shortlist={shortlist ?? []}
        bookedVenueId={wedding.venue_id}
      />
    </main>
  );
}
