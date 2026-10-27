"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { inviteCookie } from "@/lib/invite-codes";

/** "Not you?": forgets the household this browser opened, back to typing a name. */
export async function forgetInvite(slug: string) {
  (await cookies()).delete({ name: inviteCookie(slug), path: `/w/${slug}` });
  redirect(`/w/${encodeURIComponent(slug)}#rsvp`);
}
