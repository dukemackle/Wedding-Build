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

/** The page link for the email footer, or null when unsubscribe isn't configured. */
export async function unsubscribeUrl(email: string): Promise<string | null> {
  const token = await unsubscribeToken(email);
  if (!token) return null;
  const params = new URLSearchParams({ e: normalizeEmail(email), t: token });
  return `https://youdoido.com/unsubscribe?${params}`;
}

/** The RFC 8058 one-click endpoint mail apps POST to from their own button. */
export async function oneClickUnsubscribeUrl(email: string): Promise<string | null> {
  const token = await unsubscribeToken(email);
  if (!token) return null;
  const params = new URLSearchParams({ e: normalizeEmail(email), t: token });
  return `https://youdoido.com/api/unsubscribe?${params}`;
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
