import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import type { Guest, SeatingTable, VenueLayoutItem, Wedding } from "@/lib/supabase/types";
import { VenueLayoutManager } from "./venue-layout-manager";

export default async function VenueLayoutPage() {
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
            Venue layout
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-forest">
            Set up your wedding first
          </h1>
          <p className="mt-4 text-ink/70">
            Add your wedding details on the Dashboard before planning your layout.
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

  const [{ data: tables }, { data: guests }, { data: items }] = await Promise.all([
    supabase
      .from("seating_tables")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: true })
      .returns<SeatingTable[]>(),
    supabase
      .from("guests")
      .select("*")
      .eq("wedding_id", wedding.id)
      .eq("status", "confirmed")
      .order("name", { ascending: true })
      .returns<Guest[]>(),
    supabase
      .from("venue_layout_items")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("created_at", { ascending: true })
      .returns<VenueLayoutItem[]>(),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <AppNav email={user.email ?? ""} maxWidthClassName="max-w-5xl" />
      <div className="w-full max-w-5xl">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          Venue layout
        </p>
        <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">
          Seating & floor plan
        </h1>

        <VenueLayoutManager
          tables={tables ?? []}
          confirmedGuests={guests ?? []}
          items={items ?? []}
        />
      </div>
    </main>
  );
}
