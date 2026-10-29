"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ItineraryEvent, Wedding } from "@/lib/supabase/types";
import { sendSms } from "@/lib/sms";
import {
  audienceOf,
  eventsToShift,
  formatFullDate,
  formatLength,
  formatTime,
  fromMinutes,
  guessAudience,
  isAudience,
  spanOf,
} from "@/lib/itinerary";
import { requireEditableWedding } from "@/lib/wedding-access";

function eventFieldsFromForm(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const eventDate = (formData.get("event_date") as string)?.trim();

  if (!eventDate) {
    return { error: "Missing date." } as const;
  }
  if (!title) {
    return { error: "Give the event a title." } as const;
  }

  // Only the schedule's own form names an audience; an event saved from
  // anywhere else (Wren) gets a guess from its title when it's new, and keeps
  // its audience when it's being edited.
  const audienceValue = formData.get("audience");
  const audience = isAudience(audienceValue) ? audienceValue : undefined;
  // Guests can only RSVP to what they can see (0143's check).
  const guestFacing = (audience ?? "guests") === "guests";

  return {
    fields: {
      event_date: eventDate,
      title,
      start_time: ((formData.get("start_time") as string) || "").trim() || null,
      end_time: ((formData.get("end_time") as string) || "").trim() || null,
      location: ((formData.get("location") as string) || "").trim() || null,
      description: ((formData.get("description") as string) || "").trim() || null,
      // Only the schedule's own form carries the RSVP switches; anything else
      // that saves an event leaves them as they were.
      ...(formData.has("rsvp_fields")
        ? {
            rsvp: guestFacing && formData.get("rsvp") === "on",
            invite_only: guestFacing && formData.get("rsvp") === "on" && formData.get("invite_only") === "on",
          }
        : {}),
      ...(audience ? { audience } : {}),
      // Like the RSVP switches: only the schedule's own form names people.
      ...(formData.has("people_fields")
        ? {
            people: [
              ...new Set(
                formData
                  .getAll("people")
                  .map((p) => String(p).trim().slice(0, 80))
                  .filter(Boolean),
              ),
            ].slice(0, 20),
          }
        : {}),
    },
  } as const;
}

export async function addItineraryEvent(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const parsed = eventFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase.from("itinerary_events").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    audience: guessAudience(parsed.fields.title),
    ...parsed.fields,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/itinerary");
  revalidatePath("/w/[slug]", "page");
  return {};
}

type ScheduleFields = {
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
};

async function notifyGuestsOfScheduleChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  wedding: Wedding,
  event: ScheduleFields,
  /** Appended when one change moved several guest events at once. */
  more = "",
) {
  const { data: guests } = await supabase
    .from("guests")
    .select("id, phone")
    .eq("wedding_id", wedding.id)
    .eq("sms_opt_in", true)
    .not("phone", "is", null)
    .returns<{ id: string; phone: string | null }[]>();

  if (!guests || guests.length === 0) return;

  const timeRange = [formatTime(event.start_time), event.end_time && formatTime(event.end_time)]
    .filter(Boolean)
    .join(" - ");
  const details = [timeRange, event.location].filter(Boolean).join(" @ ");
  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");

  // Schedule news only, never an ad: a text that promotes anything is
  // marketing under the TCPA and needs consent guests haven't given
  // (docs/legal-audit.md R2). Says who it's from and how to stop.
  const body = `You Do, I Do: schedule update for ${coupleNames || "the wedding"}. "${event.title}" is now ${formatFullDate(event.event_date)}${details ? `, ${details}` : ""}${more}.\n\nReply STOP to stop these texts.`;

  for (const guest of guests) {
    if (!guest.phone) continue;
    try {
      const { error } = await sendSms(guest.phone, body);
      // 21610: the guest replied STOP, and Twilio now refuses to text them.
      // Record it so the guest list shows they've opted out.
      if (error?.includes("21610")) {
        await supabase.from("guests").update({ sms_opt_in: false }).eq("id", guest.id);
      }
    } catch {
      // Best-effort -- one failed text shouldn't undo the schedule save that already succeeded.
    }
  }
}

export async function updateItineraryEvent(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const id = formData.get("id") as string;
  const parsed = eventFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { data: existing } = await supabase
    .from("itinerary_events")
    .select("event_date, start_time, end_time, location, audience")
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .maybeSingle<
      Pick<ScheduleFields, "event_date" | "start_time" | "end_time" | "location"> & Pick<ItineraryEvent, "audience">
    >();

  const { error } = await supabase
    .from("itinerary_events")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  const scheduleChanged =
    existing &&
    (existing.event_date !== parsed.fields.event_date ||
      existing.start_time !== parsed.fields.start_time ||
      existing.end_time !== parsed.fields.end_time ||
      existing.location !== parsed.fields.location);

  // Don't text guests about a schedule they can't see. While the itinerary is
  // unpublished it's still working notes -- times move, events get added and
  // dropped -- and a "Schedule update" text pointing at a page that shows
  // nothing is worse than no text at all.
  // Nor about events that aren't theirs: hair and makeup moving is the
  // wedding party's news, not every guest's.
  const guestEvent =
    existing && audienceOf(existing) === "guests" && (parsed.fields.audience ?? "guests") === "guests";
  if (scheduleChanged && guestEvent && wedding.itinerary_published) {
    await notifyGuestsOfScheduleChange(supabase, wedding, parsed.fields);
  }

  revalidatePath("/itinerary");
  revalidatePath("/w/[slug]", "page");
  return {};
}

export async function deleteItineraryEvent(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("itinerary_events")
    .delete()
    .eq("id", id)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/itinerary");
  revalidatePath("/w/[slug]", "page");
  return {};
}

/**
 * "Move this and everything after by N minutes". Which events move is
 * eventsToShift's call (it stops short of the ceremony when the move starts
 * before it). Guests get one text for the lot, not one per event.
 */
export async function shiftItineraryEvents(eventId: string, minutes: number): Promise<{ error?: string; moved?: number }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  if (!Number.isInteger(minutes) || minutes === 0 || Math.abs(minutes) > 12 * 60) {
    return { error: "Pick how far to move them." };
  }

  const { data: from } = await supabase
    .from("itinerary_events")
    .select("*")
    .eq("id", eventId)
    .eq("wedding_id", wedding.id)
    .maybeSingle<ItineraryEvent>();
  if (!from) return { error: "That event no longer exists." };
  if (!from.start_time) return { error: "Give this event a start time first." };

  const { data: day } = await supabase
    .from("itinerary_events")
    .select("*")
    .eq("wedding_id", wedding.id)
    .eq("event_date", from.event_date)
    .returns<ItineraryEvent[]>();
  const moving = eventsToShift(day ?? [], from);

  const moved = moving.map((e) => {
    const span = spanOf(e)!;
    return {
      e,
      start_time: fromMinutes(span.start + minutes),
      // An end past midnight wraps, as it was saved before the move.
      end_time: e.end_time ? fromMinutes((span.end + minutes) % (24 * 60)) : null,
      startsOnDay: span.start + minutes >= 0 && span.start + minutes < 24 * 60,
    };
  });
  // Keep every event on its own day: a start moved across midnight would
  // quietly belong to the wrong date.
  if (moved.some((m) => !m.startsOnDay)) {
    return { error: "That would push something past midnight. Try a smaller move." };
  }

  const now = new Date().toISOString();
  const results = await Promise.all(
    moved.map((m) =>
      supabase
        .from("itinerary_events")
        .update({ start_time: m.start_time, end_time: m.end_time, updated_at: now })
        .eq("id", m.e.id)
        .eq("wedding_id", wedding.id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  const forGuests = moved.filter((m) => audienceOf(m.e) === "guests");
  if (forGuests.length && wedding.itinerary_published) {
    const firstMoved = forGuests[0];
    const others = forGuests.length - 1;
    await notifyGuestsOfScheduleChange(
      supabase,
      wedding,
      { ...firstMoved.e, start_time: firstMoved.start_time, end_time: firstMoved.end_time },
      others ? `, and ${others} later ${others === 1 ? "event moves" : "events move"} ${formatLength(Math.abs(minutes))} ${minutes > 0 ? "later" : "earlier"} too` : "",
    );
  }

  revalidatePath("/itinerary");
  revalidatePath("/w/[slug]", "page");
  return { moved: moved.length };
}

/** Names a day of the schedule ("Rehearsal"); an empty name goes back to the default. */
export async function setItineraryDayName(date: string, name: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Missing date." };

  const names = { ...(wedding.itinerary_day_names ?? {}) };
  const trimmed = name.trim().slice(0, 40);
  if (trimmed) names[date] = trimmed;
  else delete names[date];

  const { error } = await supabase.from("weddings").update({ itinerary_day_names: names }).eq("id", wedding.id);
  if (error) return { error: error.message };

  revalidatePath("/itinerary");
  return {};
}

/**
 * Publishes or unpublishes the whole weekend schedule.
 *
 * The flag is what the itinerary_events RLS policy checks, so this genuinely
 * controls whether guests can read the events -- not just whether the guest
 * page chooses to render them. Unpublishing takes them away again immediately.
 */
export async function setItineraryPublished(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const published = formData.get("published") === "true";

  const { error } = await supabase
    .from("weddings")
    .update({ itinerary_published: published })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/itinerary");
  revalidatePath("/w/[slug]", "page");
  return {};
}

/**
 * Who is invited to an invite-only event: replaces the whole list. Guests
 * not on this wedding are dropped by the policy rather than trusted.
 */
export async function setEventInvites(eventId: string, guestIds: string[]): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { data: event } = await supabase
    .from("itinerary_events")
    .select("id")
    .eq("id", eventId)
    .eq("wedding_id", wedding.id)
    .maybeSingle();
  if (!event) return { error: "That event no longer exists." };

  const { data: ours } = await supabase
    .from("guests")
    .select("id")
    .eq("wedding_id", wedding.id)
    .in("id", guestIds.length ? guestIds : ["00000000-0000-0000-0000-000000000000"]);
  const keep = (ours ?? []).map((g) => g.id as string);

  const { error: clearError } = await supabase
    .from("guest_event_invites")
    .delete()
    .eq("event_id", eventId)
    .eq("wedding_id", wedding.id);
  if (clearError) return { error: clearError.message };

  if (keep.length) {
    const { error } = await supabase
      .from("guest_event_invites")
      .insert(keep.map((guest_id) => ({ guest_id, event_id: eventId, wedding_id: wedding.id })));
    if (error) return { error: error.message };
  }

  revalidatePath("/itinerary");
  revalidatePath("/guests");
  return {};
}
