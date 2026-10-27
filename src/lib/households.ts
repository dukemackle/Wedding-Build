import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { normalizeGuestName } from "@/lib/guest-match";
import type { EventAnswers, Guest, GuestStatus, RsvpEvent } from "@/lib/supabase/types";
import { normalizeInviteCode } from "@/lib/invite-codes";

/**
 * Personal RSVP links (0141). A guest's code opens their household: everyone
 * on the list sharing their `household` text, or just them when it's blank.
 * Read with the service role, server-side only -- guests never see the guest
 * list, only the members of the household their own code opens.
 */

export type HouseholdMember = Pick<
  Guest,
  "id" | "name" | "status" | "plus_one" | "plus_one_allowed" | "plus_one_name" | "meal" | "event_rsvps"
> & {
  /** The RSVP events this person answers: the open ones plus any invite-only ones they're on. */
  eventIds: string[];
};

export type Household = {
  weddingId: string;
  code: string;
  /** "The Alvarez household", or the guest's own name when there's no household. */
  label: string;
  members: HouseholdMember[];
  /** Every event any member answers, in date order. */
  events: RsvpEvent[];
};

const MEMBER_COLUMNS =
  "id, name, household, status, plus_one, plus_one_allowed, plus_one_name, meal, event_rsvps, invite_code";

type MemberRow = Omit<HouseholdMember, "eventIds"> & { household: string | null; invite_code: string };

/** "Alvarez" reads as "The Alvarez household"; "The Alvarez Family" stays as typed. */
function householdLabel(household: string | null): string | null {
  const h = household?.trim();
  if (!h) return null;
  return /\s/.test(h) ? h : `The ${h} household`;
}

function sameHousehold(a: string | null, b: string | null) {
  return !!a?.trim() && !!b?.trim() && normalizeGuestName(a) === normalizeGuestName(b);
}

/** The household a code opens on this wedding, or null for a code that isn't one. */
export async function findHousehold(weddingId: string, rawCode: string | null | undefined): Promise<Household | null> {
  const code = normalizeInviteCode(rawCode);
  if (!code) return null;
  const admin = createAdminSupabaseClient();

  const { data: guest } = await admin
    .from("guests")
    .select(MEMBER_COLUMNS)
    .eq("wedding_id", weddingId)
    .eq("invite_code", code)
    .maybeSingle<MemberRow>();
  if (!guest) return null;

  let rows: MemberRow[] = [guest];
  if (guest.household?.trim()) {
    const { data: everyone } = await admin
      .from("guests")
      .select(MEMBER_COLUMNS)
      .eq("wedding_id", weddingId)
      .order("created_at", { ascending: true })
      .returns<MemberRow[]>();
    rows = (everyone ?? []).filter((row) => sameHousehold(row.household, guest.household));
    if (!rows.some((row) => row.id === guest.id)) rows = [guest, ...rows];
  }

  const ids = rows.map((row) => row.id);
  const [{ data: events }, { data: invites }] = await Promise.all([
    admin
      .from("itinerary_events")
      .select("id, title, event_date, start_time, location, invite_only")
      .eq("wedding_id", weddingId)
      .eq("rsvp", true)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: true })
      .returns<RsvpEvent[]>(),
    admin
      .from("guest_event_invites")
      .select("guest_id, event_id")
      .in("guest_id", ids)
      .returns<{ guest_id: string; event_id: string }[]>(),
  ]);

  const allEvents = events ?? [];
  const members: HouseholdMember[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    plus_one: row.plus_one,
    plus_one_allowed: row.plus_one_allowed,
    plus_one_name: row.plus_one_name,
    meal: row.meal,
    event_rsvps: row.event_rsvps,
    eventIds: allEvents
      .filter((e) => !e.invite_only || (invites ?? []).some((i) => i.guest_id === row.id && i.event_id === e.id))
      .map((e) => e.id),
  }));
  const asked = new Set(members.flatMap((m) => m.eventIds));

  return {
    weddingId,
    code,
    label: householdLabel(guest.household) ?? guest.name,
    members,
    events: allEvents.filter((e) => asked.has(e.id)),
  };
}

export type MemberAnswer = {
  id: string;
  status: Extract<GuestStatus, "confirmed" | "declined">;
  meal: string | null;
  plusOneName: string | null;
  bringingPlusOne: boolean;
  events: EventAnswers | null;
};

/**
 * Writes a household's answers straight onto the guest list. Only the members
 * the code opened are touched, a plus-one only where one is allowed, and an
 * event answer only for an event that person is asked about.
 */
export async function applyHouseholdAnswers(household: Household, answers: MemberAnswer[]): Promise<{ error?: string }> {
  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();
  for (const answer of answers) {
    const member = household.members.find((m) => m.id === answer.id);
    if (!member) continue;
    const coming = answer.status === "confirmed";
    const plusOne = coming && member.plus_one_allowed && answer.bringingPlusOne;
    const events: EventAnswers = {};
    for (const id of member.eventIds) events[id] = coming && answer.events?.[id] !== false;

    const { error } = await admin
      .from("guests")
      .update({
        status: answer.status,
        meal: coming ? answer.meal : member.meal,
        plus_one: plusOne,
        plus_one_name: plusOne ? answer.plusOneName : member.plus_one_name,
        ...(member.eventIds.length > 0 ? { event_rsvps: events } : {}),
        rsvp_changed_at: now,
      })
      .eq("id", member.id)
      .eq("wedding_id", household.weddingId);
    if (error) return { error: error.message };
  }
  return {};
}
