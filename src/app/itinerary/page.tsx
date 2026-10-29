import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import type { GuestEventInvite, ItineraryEvent, Wedding } from "@/lib/supabase/types";
import { ItineraryManager, type InviteGuest } from "./itinerary-manager";
import { PublishToggle } from "./publish-toggle";
import { audienceOf } from "@/lib/itinerary";
import { RunSheetMenu } from "./run-sheet-menu";
import { BUDGET_CATEGORIES, VENDOR_CATEGORY_TO_BUDGET_KEY } from "@/lib/budget-categories";

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
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
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

  // For invite-only events: the guest list to choose from, and who's chosen.
  // Before migration 0109 the invites table is missing; that reads as none.
  // Who's-involved suggestions: whoever the couple has booked, from the budget
  // ("purchased from") or a vendor inquiry marked booked.
  const [{ data: guests }, { data: inviteRows }, { data: bookedLines }, { data: bookedInquiries }] = await Promise.all([
    supabase
      .from("guests")
      .select("id, name, household")
      .eq("wedding_id", wedding.id)
      .order("household", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })
      .returns<InviteGuest[]>(),
    supabase
      .from("guest_event_invites")
      .select("guest_id, event_id")
      .eq("wedding_id", wedding.id)
      .returns<Pick<GuestEventInvite, "guest_id" | "event_id">[]>(),
    supabase
      .from("budget_line_items")
      .select("category, purchased_from")
      .eq("wedding_id", wedding.id)
      .not("purchased_from", "is", null)
      .returns<{ category: string; purchased_from: string | null }[]>(),
    supabase
      .from("vendor_inquiries")
      .select("vendor_name, category")
      .eq("wedding_id", wedding.id)
      .eq("status", "booked")
      .returns<{ vendor_name: string; category: string | null }[]>(),
  ]);
  const roleOf = (key: string | null | undefined) => BUDGET_CATEGORIES.find((c) => c.key === key)?.label ?? null;
  const booked = new Map<string, string | null>();
  for (const line of bookedLines ?? []) {
    const name = line.purchased_from?.trim();
    if (name) booked.set(name, roleOf(line.category));
  }
  for (const inquiry of bookedInquiries ?? []) {
    const name = inquiry.vendor_name.trim();
    if (name && !booked.has(name)) {
      booked.set(name, roleOf(inquiry.category && VENDOR_CATEGORY_TO_BUDGET_KEY[inquiry.category]) ?? inquiry.category);
    }
  }
  const bookedVendors = [...booked].map(([name, role]) => ({ name, role }));
  const invites: Record<string, string[]> = {};
  for (const row of inviteRows ?? []) invites[row.event_id] = [...(invites[row.event_id] ?? []), row.guest_id];

  const counts = { guests: 0, party: 0, private: 0 };
  for (const event of events ?? []) counts[audienceOf(event)] += 1;

  return (
    <PageShell email={user.email ?? ""} width="canvas">
        <PageHeader
          eyebrow="Itinerary"
          title="The day,"
          accent="hour by hour"
          photo="itinerary"
          actions={<RunSheetMenu />}
          toolbar={
            <PublishToggle
              published={wedding.itinerary_published}
              counts={counts}
              publicSlug={wedding.public_slug}
              bare
            />
          }
        >
          Who needs to be where, and when. One schedule for everyone; each event says who sees it.
        </PageHeader>

        <ItineraryManager
          events={events ?? []}
          weddingDate={wedding.wedding_date}
          dayNames={wedding.itinerary_day_names ?? {}}
          bookedVendors={bookedVendors}
          guests={guests ?? []}
          invites={invites}
        />
    </PageShell>
  );
}
