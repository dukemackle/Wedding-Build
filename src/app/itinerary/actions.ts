"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import { sendSms } from "@/lib/sms";
import { formatFullDate, formatTime } from "@/lib/itinerary";

async function requireOwnWedding() {
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

  return { supabase, user, wedding };
}

function eventFieldsFromForm(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const eventDate = (formData.get("event_date") as string)?.trim();

  if (!eventDate) {
    return { error: "Missing date." } as const;
  }
  if (!title) {
    return { error: "Give the event a title." } as const;
  }

  return {
    fields: {
      event_date: eventDate,
      title,
      start_time: ((formData.get("start_time") as string) || "").trim() || null,
      end_time: ((formData.get("end_time") as string) || "").trim() || null,
      location: ((formData.get("location") as string) || "").trim() || null,
      description: ((formData.get("description") as string) || "").trim() || null,
    },
  } as const;
}

export async function addItineraryEvent(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const parsed = eventFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase.from("itinerary_events").insert({
    wedding_id: wedding.id,
    user_id: user.id,
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
) {
  const { data: guests } = await supabase
    .from("guests")
    .select("phone")
    .eq("wedding_id", wedding.id)
    .eq("sms_opt_in", true)
    .not("phone", "is", null)
    .returns<{ phone: string | null }[]>();

  if (!guests || guests.length === 0) return;

  const timeRange = [formatTime(event.start_time), event.end_time && formatTime(event.end_time)]
    .filter(Boolean)
    .join(" - ");
  const details = [timeRange, event.location].filter(Boolean).join(" @ ");
  const coupleNames = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ");

  const body = `Schedule update for ${coupleNames || "the wedding"}: "${event.title}" is now ${formatFullDate(event.event_date)}${details ? `, ${details}` : ""}.\n\nPlanning your own wedding? Try Wren free: wrenwed.com`;

  for (const guest of guests) {
    if (!guest.phone) continue;
    try {
      await sendSms(guest.phone, body);
    } catch {
      // Best-effort -- one failed text shouldn't undo the schedule save that already succeeded.
    }
  }
}

export async function updateItineraryEvent(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const id = formData.get("id") as string;
  const parsed = eventFieldsFromForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { data: existing } = await supabase
    .from("itinerary_events")
    .select("event_date, start_time, end_time, location")
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .maybeSingle<Pick<ScheduleFields, "event_date" | "start_time" | "end_time" | "location">>();

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

  if (scheduleChanged) {
    await notifyGuestsOfScheduleChange(supabase, wedding, parsed.fields);
  }

  revalidatePath("/itinerary");
  revalidatePath("/w/[slug]", "page");
  return {};
}

export async function deleteItineraryEvent(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
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
