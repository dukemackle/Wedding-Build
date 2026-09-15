"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ContactSubmission, Wedding } from "@/lib/supabase/types";

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

const ADDRESS_FIELDS = [
  "email",
  "phone",
  "address_line1",
  "address_line2",
  "city",
  "state",
  "postal_code",
  "country",
] as const;

/**
 * Only copies fields the submission actually filled in.
 *
 * A guest who leaves the phone blank shouldn't wipe a number the couple
 * already had -- a blank in a submission means "didn't say", not "clear it".
 */
function filledFields(submission: ContactSubmission) {
  const patch: Record<string, string> = {};
  for (const field of ADDRESS_FIELDS) {
    const value = submission[field];
    if (value) patch[field] = value;
  }
  return patch;
}

/**
 * Merges a submission into the guest list.
 *
 * `guestId` attaches it to an existing guest; omitting it creates a new one.
 * The caller decides which, because automatic name matching gets it wrong in
 * exactly the situation a wedding guest list is full of -- two Sarah Millers,
 * or a "Rob" on the list who submits as "Robert".
 */
export async function applyContactSubmission(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, user, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding first." };

  const id = (formData.get("id") as string)?.trim();
  const guestId = (formData.get("guest_id") as string)?.trim() || null;
  if (!id) return { error: "Missing submission." };

  const { data: submission } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .maybeSingle<ContactSubmission>();

  if (!submission) return { error: "That submission is no longer there." };

  const patch = filledFields(submission);

  if (guestId) {
    const { error } = await supabase
      .from("guests")
      .update(patch)
      .eq("id", guestId)
      .eq("wedding_id", wedding.id);
    if (error) return { error: "Couldn't update that guest — please try again." };
  } else {
    const { error } = await supabase.from("guests").insert({
      wedding_id: wedding.id,
      user_id: user.id,
      name: submission.name,
      ...patch,
    });
    if (error) return { error: "Couldn't add that guest — please try again." };
  }

  // Marked rather than deleted: the couple can still see who has replied, and
  // a mis-merge is recoverable because the original text is still here.
  await supabase
    .from("contact_submissions")
    .update({ status: "applied" })
    .eq("id", id)
    .eq("wedding_id", wedding.id);

  revalidatePath("/guests");
  return {};
}

export async function dismissContactSubmission(
  formData: FormData,
): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding first." };

  const id = (formData.get("id") as string)?.trim();
  if (!id) return { error: "Missing submission." };

  const { error } = await supabase
    .from("contact_submissions")
    .update({ status: "dismissed" })
    .eq("id", id)
    .eq("wedding_id", wedding.id);

  if (error) return { error: "Couldn't dismiss that — please try again." };

  revalidatePath("/guests");
  return {};
}
