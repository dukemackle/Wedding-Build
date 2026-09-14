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
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  return { supabase, user, wedding };
}

function str(formData: FormData, key: string): string | null {
  const raw = (formData.get(key) as string)?.trim();
  return raw || null;
}

// Both sections render on the public guest site, so revalidate it too --
// otherwise the couple saves a change and their guests keep seeing the
// cached old page.
function revalidateGuestSite(slug: string | null) {
  revalidatePath("/guests");
  if (slug) revalidatePath(`/w/${slug}`);
}

export async function updateGuestSiteDetails(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const { error } = await supabase
    .from("weddings")
    .update({
      dress_code: str(formData, "dress_code"),
      travel_notes: str(formData, "travel_notes"),
    })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function addWeddingFaq(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const question = str(formData, "question");
  const answer = str(formData, "answer");
  if (!question || !answer) {
    return { error: "A question and an answer are both required." };
  }

  const { error } = await supabase.from("wedding_faqs").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    question,
    answer,
    sort_order: Number(formData.get("sort_order")) || 0,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function deleteWeddingFaq(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const { error } = await supabase
    .from("wedding_faqs")
    .delete()
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function addAccommodation(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const name = str(formData, "name");
  if (!name) {
    return { error: "Give the hotel or stay a name." };
  }

  const { error } = await supabase.from("wedding_accommodations").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    name,
    address: str(formData, "address"),
    booking_url: str(formData, "booking_url"),
    notes: str(formData, "notes"),
    sort_order: Number(formData.get("sort_order")) || 0,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function deleteAccommodation(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();

  if (!wedding) {
    return { error: "Set up your wedding on the Dashboard first." };
  }

  const { error } = await supabase
    .from("wedding_accommodations")
    .delete()
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}
