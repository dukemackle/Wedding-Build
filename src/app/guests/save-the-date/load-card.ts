import { redirect } from "next/navigation";
import { parseCardDoc } from "@/lib/save-the-date/schema";
import { newCard } from "@/lib/save-the-date/templates";
import type { CardDoc } from "@/lib/save-the-date/types";
import { createClient } from "@/lib/supabase/server";
import type { SaveTheDateRow, Venue, Wedding } from "@/lib/supabase/types";
import { canEditWedding } from "@/lib/wedding-access";

/** At most this many of the couple's photos are offered in the Photo panel. */
const MAX_LIBRARY = 24;

/**
 * What both save-the-date screens (the home and the studio) start from: the
 * couple's saved card, or the starter card built from their wedding details.
 */
export async function loadCard() {
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
  if (!wedding) return { supabase, user, wedding: null } as const;

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
  return {
    supabase,
    user,
    wedding,
    row: saved ? row : null,
    card: saved ?? starterCard(wedding, venue),
    photos,
    canEdit,
  } as const;
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
