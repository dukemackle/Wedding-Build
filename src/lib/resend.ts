import "server-only";
import { Resend } from "resend";

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
export const INQUIRY_FROM_ADDRESS = "Wren <hello@wrenwed.com>";
