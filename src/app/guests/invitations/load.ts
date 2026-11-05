import { redirect } from "next/navigation";
import { INVITATION_WORDING, invitationTime, replyLine } from "@/lib/save-the-date/invitations";
import { parseCardDoc } from "@/lib/save-the-date/schema";
import { INVITATIONS, newCard } from "@/lib/save-the-date/templates";
import type { CardContent, CardDoc } from "@/lib/save-the-date/types";
import { createClient } from "@/lib/supabase/server";
import type { ItineraryEvent, Venue, Wedding } from "@/lib/supabase/types";
import { canEditWedding } from "@/lib/wedding-access";

export type InvitationRow = { id: string; wedding_id: string; name: string; chosen: boolean; doc: unknown; created_at: string; updated_at: string };
export type Invitation = { id: string; name: string; chosen: boolean; updatedAt: string; doc: CardDoc };

type Db = Awaited<ReturnType<typeof createClient>>;

/** The signed-in couple's wedding and their invitation designs, newest first. */
export async function loadInvitations() {
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
      .from("invitations")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("updated_at", { ascending: false })
      .returns<InvitationRow[]>(),
    canEditWedding(supabase, wedding, user.id),
  ]);
  const invitations: Invitation[] = (rows ?? []).flatMap((r) => {
    const doc = parseCardDoc(r.doc);
    return doc ? [{ id: r.id, name: r.name, chosen: r.chosen, updatedAt: r.updated_at, doc }] : [];
  });
  return { supabase, user, wedding, invitations, canEdit } as const;
}

/**
 * A first invitation's words, from what the couple has already told us: names,
 * date, venue and town, the ceremony's start time from their schedule, and
 * the RSVP deadline for the reply card.
 */
export async function invitationContent(supabase: Db, wedding: Wedding): Promise<CardContent> {
  const [{ data: venue }, { data: events }] = await Promise.all([
    wedding.venue_id
      ? supabase.from("venues").select("name, city, state").eq("id", wedding.venue_id).maybeSingle<Pick<Venue, "name" | "city" | "state">>()
      : Promise.resolve({ data: null }),
    wedding.wedding_date
      ? supabase
          .from("itinerary_events")
          .select("title, start_time, event_date")
          .eq("wedding_id", wedding.id)
          .eq("event_date", wedding.wedding_date)
          .order("start_time")
          .returns<Pick<ItineraryEvent, "title" | "start_time" | "event_date">[]>()
      : Promise.resolve({ data: [] as Pick<ItineraryEvent, "title" | "start_time" | "event_date">[] }),
  ]);
  const timed = (events ?? []).filter((e) => e.start_time);
  const ceremony = timed.find((e) => /ceremony|vows|wedding/i.test(e.title)) ?? timed[0];
  const city = wedding.own_venue_city ?? venue?.city ?? null;
  const state = wedding.own_venue_state ?? venue?.state ?? wedding.state ?? null;
  return {
    nameA: wedding.partner_a_name ?? "",
    nameB: wedding.partner_b_name ?? "",
    date: wedding.wedding_date,
    dateText: "",
    place: [city, state].filter(Boolean).join(", "),
    ...INVITATION_WORDING,
    venue: venue?.name ?? wedding.own_venue_name ?? "",
    time: invitationTime(ceremony?.start_time),
    reply: replyLine(wedding.rsvp_deadline),
  };
}

/** A new invitation on a design: the RSVP card on its back. */
export function newInvitation(templateId: string, content: CardContent): CardDoc {
  const id = INVITATIONS.some((t) => t.id === templateId) ? templateId : INVITATIONS[0].id;
  return { ...newCard(id, content, null, false), back: { on: true, travel: "", rsvp: true } };
}
