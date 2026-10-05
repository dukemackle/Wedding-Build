import "server-only";
import { Resend } from "resend";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Who Wren's mail comes from.
 *
 * Must stay on a domain verified in Resend. The previous value,
 * `onboarding@resend.dev`, is Resend's sandbox sender: it only ever delivers
 * to the Resend account holder's own address, so every inquiry and invite to
 * an actual vendor or guest was being dropped.
 *
 * Nothing receives at this mailbox today. Guest-facing mail therefore sets a
 * replyTo of the couple, which is where a reply belongs anyway -- a guest
 * answering a wedding invitation is writing to the couple, not to Wren.
 */
export const INQUIRY_FROM_ADDRESS = "You Do, I Do <hello@youdoido.com>";

/**
 * Whether our mail to this address has hard-bounced or been marked as spam
 * (recorded by /api/resend-webhook). Resend refuses to send to such an
 * address anyway; asking first lets a couple hear why, rather than see a sent
 * inquiry that never arrives.
 */
export async function isUndeliverable(email: string): Promise<boolean> {
  const { data } = await createAdminSupabaseClient()
    .from("email_bounces")
    .select("email")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return Boolean(data);
}

export const UNDELIVERABLE_MESSAGE =
  "Email to that address has bounced before, so it wouldn't arrive. Try their website or phone instead.";
