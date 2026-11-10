import { redirect } from "next/navigation";
import { parseCardDoc } from "@/lib/save-the-date/schema";
import { newCard } from "@/lib/save-the-date/templates";
import type { CardDoc } from "@/lib/save-the-date/types";
import { createClient } from "@/lib/supabase/server";
import type { SaveTheDateRow, Venue, Wedding } from "@/lib/supabase/types";
import { canEditWedding } from "@/lib/wedding-access";
import { suiteForCard } from "@/lib/suites";

/** At most this many of the couple's photos are offered in the Photo panel. */
const MAX_LIBRARY = 24;

export type Card = { id: string; name: string; chosen: boolean; updatedAt: string; imageVersion: string | null; doc: CardDoc };

type Db = Awaited<ReturnType<typeof createClient>>;

/**
 * What the save-the-date screens start from: the signed-in couple's wedding
 * and every card they've made, newest first.
 */
export async function loadCards() {
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

  const [{ data: rows }, canEdit] = await Promise.all([
    supabase
      .from("save_the_dates")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("updated_at", { ascending: false })
      .returns<SaveTheDateRow[]>(),
    canEditWedding(supabase, wedding, user.id),
  ]);
  const cards: Card[] = (rows ?? []).flatMap((r) => {
    const doc = parseCardDoc(r.doc);
    return doc ? [{ id: r.id, name: r.name, chosen: r.chosen, updatedAt: r.updated_at, imageVersion: r.image_version, doc }] : [];
  });
  return { supabase, user, wedding, cards, canEdit } as const;
}

/**
 * The save the date the other pieces of their suite match: the one they
 * marked as theirs, else the latest they touched. Null when they haven't
 * made one, or it isn't part of a suite (src/lib/suites.ts).
 */
export async function suiteCard(supabase: Db, weddingId: string): Promise<{ id: string; doc: CardDoc } | null> {
  const { data: rows } = await supabase
    .from("save_the_dates")
    .select("id, doc, chosen")
    .eq("wedding_id", weddingId)
    .order("chosen", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .returns<Pick<SaveTheDateRow, "id" | "doc" | "chosen">[]>();
  const row = rows?.[0];
  const doc = row ? parseCardDoc(row.doc) : null;
  return row && doc && suiteForCard(doc.template) ? { id: row.id, doc } : null;
}

/** The couple's photos, offered in the studio's Photo panel. */
export async function photoLibrary(supabase: Db, wedding: Wedding) {
  const { data: gallery } = await supabase
    .from("wedding_gallery_photos")
    .select("photo_url")
    .eq("wedding_id", wedding.id)
    .order("sort_order")
    .returns<{ photo_url: string }[]>();
  return [
    ...new Set([wedding.hero_photo_url, ...(wedding.dashboard_photo_urls ?? []), ...(gallery ?? []).map((g) => g.photo_url)]),
  ]
    .filter((u): u is string => Boolean(u))
    .slice(0, MAX_LIBRARY);
}

/**
 * A couple's first card: their names, date and place on Editorial with their
 * banner photo, or on Heirloom Garden when they have none yet. The photo's
 * proportions are read in the browser (aspect 0 until then).
 */
export async function starterCard(supabase: Db, wedding: Wedding): Promise<CardDoc> {
  const { data: venue } = wedding.venue_id
    ? await supabase.from("venues").select("city, state").eq("id", wedding.venue_id).maybeSingle<Pick<Venue, "city" | "state">>()
    : { data: null };
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
