"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";

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
    .eq("user_id", user.id)
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

  const { error } = await supabase
    .from("itinerary_events")
    .update({ ...parsed.fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
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
