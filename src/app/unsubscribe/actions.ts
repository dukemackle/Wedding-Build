"use server";

import { redirect } from "next/navigation";
import { isValidUnsubscribeToken, recordOptOut } from "@/lib/unsubscribe";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Both ways in: the signed link from an email footer (e + t), or someone
 * typing their address. Typing anyone's address only ever stops mail to it,
 * which is the safe direction, and the reply is the same either way, so the
 * form can't be used to learn who is on a list.
 */
export async function unsubscribe(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("t") ?? "");
  if (!EMAIL.test(email)) redirect("/unsubscribe?error=1");

  const signed = token ? await isValidUnsubscribeToken(email, token) : false;
  const ok = await recordOptOut(email, signed ? "link" : "form");
  redirect(ok ? "/unsubscribe?done=1" : "/unsubscribe?error=2");
}
