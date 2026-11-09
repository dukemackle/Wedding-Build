import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/**
 * Unsubscribe links for marketing email (CAN-SPAM; docs/legal.md).
 *
 * The link carries the address and an HMAC of it, so one click works without
 * signing in and nobody can unsubscribe someone else by editing the URL.
 * Without UNSUBSCRIBE_SECRET there are no links, and sendMarketingEmail
 * refuses to send: a marketing email without a working unsubscribe is the
 * thing this exists to prevent.
 */

const encoder = new TextEncoder();

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function hmac(email: string): Promise<string | null> {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(normalizeEmail(email))));
  return btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function unsubscribeToken(email: string): Promise<string | null> {
  return hmac(email);
}

export async function isValidUnsubscribeToken(email: string, token: string): Promise<boolean> {
  const expected = await hmac(email);
  if (!expected || expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

/**
 * What an unsubscribe link stops: "marketing" (the default, no `l` param) or
 * "reminders" (planning reminders, src/lib/planning-reminders.ts). Both use
 * the same signature, which only proves the address; the list is chosen by
 * the link and only ever stops mail, the safe direction.
 */
export type UnsubscribeList = "marketing" | "reminders";

export const parseUnsubscribeList = (value: string | null | undefined): UnsubscribeList =>
  value === "reminders" ? "reminders" : "marketing";

async function linkParams(email: string, list: UnsubscribeList): Promise<URLSearchParams | null> {
  const token = await unsubscribeToken(email);
  if (!token) return null;
  const params = new URLSearchParams({ e: normalizeEmail(email), t: token });
  if (list === "reminders") params.set("l", "reminders");
  return params;
}

/** The page link for the email footer, or null when unsubscribe isn't configured. */
export async function unsubscribeUrl(email: string, list: UnsubscribeList = "marketing"): Promise<string | null> {
  const params = await linkParams(email, list);
  return params && `https://youdoido.com/unsubscribe?${params}`;
}

/** The RFC 8058 one-click endpoint mail apps POST to from their own button. */
export async function oneClickUnsubscribeUrl(email: string, list: UnsubscribeList = "marketing"): Promise<string | null> {
  const params = await linkParams(email, list);
  return params && `https://youdoido.com/api/unsubscribe?${params}`;
}

/** Stop planning reminders to this address. Marketing preferences are untouched. */
export async function recordReminderOptOut(email: string, source: "link" | "one-click" | "form" | "account") {
  const { error } = await createAdminSupabaseClient()
    .from("planning_reminder_opt_outs")
    .upsert({ email: normalizeEmail(email), source, opted_out_at: new Date().toISOString() }, { onConflict: "email" });
  return !error;
}

/**
 * Stop all marketing email to this address, for good. Writes both tables so
 * vendor outreach (which reads outreach_opt_outs) and couple email (which
 * reads marketing_consents) agree. Transactional mail is unaffected.
 */
export async function recordOptOut(email: string, source: "link" | "one-click" | "form" | "account") {
  const address = normalizeEmail(email);
  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();
  const [optOut, consent] = await Promise.all([
    admin.from("outreach_opt_outs").upsert({ email: address, source }, { onConflict: "email" }),
    admin
      .from("marketing_consents")
      .upsert(
        {
          email: address,
          opted_in: false,
          opted_out_at: now,
          source: source === "account" ? "account" : "unsubscribe",
          updated_at: now,
        },
        { onConflict: "email" },
      ),
  ]);
  return !optOut.error && !consent.error;
}
