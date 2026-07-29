import "server-only";
import { Resend } from "resend";

export function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

export const INQUIRY_FROM_ADDRESS = "The Wedding Ledger <onboarding@resend.dev>";
