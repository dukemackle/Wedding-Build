"use server";

import { createClient } from "@/lib/supabase/server";

const MAX_FIELD = 200;
const MAX_NOTE = 500;

function clean(value: FormDataEntryValue | null, max = MAX_FIELD) {
  const trimmed = (value as string)?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/**
 * Accepts one guest's own contact details from the public collector page.
 *
 * Writes to contact_submissions, never to `guests` -- anyone with the link can
 * post here, so nothing they send may touch the real guest list until the
 * couple has looked at it. The insert policy additionally requires the wedding
 * to have a public site, so a slug that isn't public accepts nothing.
 */
export async function submitContactDetails(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const slug = (formData.get("slug") as string)?.trim();
  if (!slug) return { error: "Something went wrong — please reload and try again." };

  const name = clean(formData.get("name"));
  if (!name) return { error: "Please add your name." };

  const { data: wedding } = await supabase
    .from("public_weddings")
    .select("id")
    .eq("public_slug", slug)
    .maybeSingle<{ id: string }>();

  if (!wedding) return { error: "This link isn't active — ask the couple for a new one." };

  const { error } = await supabase.from("contact_submissions").insert({
    wedding_id: wedding.id,
    name,
    email: clean(formData.get("email")),
    phone: clean(formData.get("phone")),
    address_line1: clean(formData.get("address_line1")),
    address_line2: clean(formData.get("address_line2")),
    city: clean(formData.get("city")),
    state: clean(formData.get("state")),
    postal_code: clean(formData.get("postal_code")),
    country: clean(formData.get("country")),
    note: clean(formData.get("note"), MAX_NOTE),
  });

  if (error) {
    return { error: "Couldn't send that — please try again." };
  }

  return { success: true };
}
