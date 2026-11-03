import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { SaveTheDateStudio } from "@/components/save-the-date/studio";
import { parseCardDoc } from "@/lib/save-the-date/schema";
import { newCard } from "@/lib/save-the-date/templates";
import type { CardDoc } from "@/lib/save-the-date/types";
import { createClient } from "@/lib/supabase/server";
import type { SaveTheDateRow, Venue, Wedding } from "@/lib/supabase/types";
import { canEditWedding } from "@/lib/wedding-access";

export const metadata: Metadata = { title: "Save the date" };

/** At most this many of the couple's photos are offered in the Photo panel. */
const MAX_LIBRARY = 24;

/**
 * Guests › Save the date: the Save the Date Studio on the couple's own card.
 * The first visit starts from their names, date, place and banner photo;
 * every change autosaves (see /api/save-the-date). Sending comes later.
 */
export default async function SaveTheDatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <AppNav email={user.email ?? ""} />
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 text-center shadow-sm sm:p-10">
          <h1 className="font-display text-3xl font-semibold text-forest">Set up your wedding first</h1>
          <p className="mt-4 text-ink/70">Add your names and date on the Dashboard, and they&apos;ll be on your card when you start.</p>
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

  const [{ data: row }, { data: gallery }, { data: venue }, canEdit] = await Promise.all([
    supabase.from("save_the_dates").select("*").eq("wedding_id", wedding.id).maybeSingle<SaveTheDateRow>(),
    supabase
      .from("wedding_gallery_photos")
      .select("photo_url")
      .eq("wedding_id", wedding.id)
      .order("sort_order")
      .returns<{ photo_url: string }[]>(),
    wedding.venue_id
      ? supabase.from("venues").select("city, state").eq("id", wedding.venue_id).maybeSingle<Pick<Venue, "city" | "state">>()
      : Promise.resolve({ data: null }),
    canEditWedding(supabase, wedding, user.id),
  ]);

  const photos = [
    ...new Set([wedding.hero_photo_url, ...(wedding.dashboard_photo_urls ?? []), ...(gallery ?? []).map((g) => g.photo_url)]),
  ]
    .filter((u): u is string => Boolean(u))
    .slice(0, MAX_LIBRARY);

  const saved = row ? parseCardDoc(row.doc) : null;
  const initial = saved ?? starterCard(wedding, venue);

  return (
    <main className="flex flex-1 flex-col pt-16">
      <AppNav email={user.email ?? ""} />
      <div className="border-t border-hairline">
        <SaveTheDateStudio
          initial={initial}
          version={row?.updated_at ?? null}
          persist={canEdit}
          photos={photos}
          backHref="/guests"
          sendHref="/guests/save-the-date/send"
          note="View only · ask the owner for edit access to change the card"
        />
      </div>
    </main>
  );
}

/**
 * The card a couple sees first: their names, date and place on Editorial
 * with their banner photo, or on Heirloom Garden when they have none yet.
 * The photo's proportions are read in the browser (aspect 0 until then).
 */
function starterCard(wedding: Wedding, venue: Pick<Venue, "city" | "state"> | null): CardDoc {
  const city = wedding.own_venue_city ?? venue?.city ?? null;
  const state = wedding.own_venue_state ?? venue?.state ?? wedding.state ?? null;
  const content = {
    nameA: wedding.partner_a_name ?? "",
    nameB: wedding.partner_b_name ?? "",
    date: wedding.wedding_date,
    dateText: "",
    place: [city, state].filter(Boolean).join(", "),
    note: "Formal invitation to follow",
    headline: "",
  };
  const banner = wedding.hero_photo_url;
  return banner
    ? newCard("editorial", content, { url: banner, aspect: 0, fx: 50, fy: 50, zoom: 1, filter: "mono" })
    : newCard("heirloom", content);
}
