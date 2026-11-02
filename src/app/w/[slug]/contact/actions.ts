"use server";

import { createGuestSiteClient } from "@/lib/supabase/guest-site";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { allowGuestWrite, RATE_LIMIT_ERROR } from "@/lib/guest-rate-limit";
import { isHuman, NOT_HUMAN_ERROR } from "@/lib/turnstile";

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
  const slug = (formData.get("slug") as string)?.trim();
  if (!slug) return { error: "Something went wrong — please reload and try again." };
  const supabase = await createGuestSiteClient(slug);

  const name = clean(formData.get("name"));
  if (!name) return { error: "Please add your name." };

  // Checked here as well as in the browser: `required` is a courtesy to the
  // person filling the form, not a guarantee -- anything can post to this
  // endpoint, and a blank email defeats the point of collecting at all.
  const email = clean(formData.get("email"));
  if (!email) return { error: "Please add your email." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email doesn't look right — please check it." };
  }

  const phone = clean(formData.get("phone"));
  if (!phone) return { error: "Please add your phone number." };
  // Deliberately loose: guests write numbers every imaginable way, and
  // rejecting a real number over its punctuation loses the guest entirely.
  if ((phone.match(/\d/g) ?? []).length < 7) {
    return { error: "That phone number looks too short — please check it." };
  }

  // By slug alone, like the page: the insert policy checks the same (0121).
  const { data: covers } = await supabase.rpc("guest_site_cover", { site_slug: slug });
  const wedding = (Array.isArray(covers) ? covers[0] : covers) as { id: string } | undefined;

  if (!wedding) return { error: "This link isn't active — ask the couple for a new one." };
  if (!(await isHuman(formData))) return { error: NOT_HUMAN_ERROR };
  if (!(await allowGuestWrite(wedding.id, "contact"))) return { error: RATE_LIMIT_ERROR };

  // Written by the app, not the browser: the limits above are the only way in (0140).
  const { error } = await createAdminSupabaseClient().from("contact_submissions").insert({
    wedding_id: wedding.id,
    name,
    email,
    phone,
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
