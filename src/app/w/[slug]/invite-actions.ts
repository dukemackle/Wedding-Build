"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { inviteCookie } from "@/lib/invite-codes";
import { createGuestSiteClient } from "@/lib/supabase/guest-site";
import { allowGuestWrite, RATE_LIMIT_ERROR } from "@/lib/guest-rate-limit";
import { findInviteByName } from "@/lib/households";

const YEAR = 60 * 60 * 24 * 365;

/** "Not you?": forgets the household this browser opened, back to typing a name. */
export async function forgetInvite(slug: string) {
  (await cookies()).delete({ name: inviteCookie(slug), path: `/w/${slug}` });
  redirect(`/w/${encodeURIComponent(slug)}#rsvp`);
}

/**
 * "Find your invitation" by name: a match remembers the household, the same
 * as opening their personal link, and the page comes back with their form.
 * Only on a site this browser can already see, and under the same limit as
 * personal links, so it can't be used to walk the guest list.
 */
export async function findInvitation(
  slug: string,
  name: string,
): Promise<{ found: true } | { found: false; emptyList: boolean } | { error: string }> {
  const supabase = await createGuestSiteClient(slug);
  const { data: wedding } = await supabase
    .from("public_weddings")
    .select("id")
    .eq("public_slug", slug)
    .maybeSingle<{ id: string }>();
  if (!wedding) return { error: "This wedding's site isn't open. Reload the page and try again." };
  if (!(await allowGuestWrite(wedding.id, "invite"))) return { error: RATE_LIMIT_ERROR };

  const match = await findInviteByName(wedding.id, name.slice(0, 120));
  if (match.code === null) return { found: false, emptyList: match.emptyList };

  (await cookies()).set(inviteCookie(slug), match.code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/w/${slug}`,
    maxAge: YEAR,
  });
  return { found: true };
}
