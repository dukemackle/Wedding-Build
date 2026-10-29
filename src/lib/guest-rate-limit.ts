import { createHmac } from "node:crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { visitorIp } from "@/lib/turnstile";

/** One row per kind in allow_guest_write (0140), which holds the limits. */
export type GuestWriteKind = "rsvp" | "post" | "contact" | "claim" | "unlock" | "invite" | "rsvp_email";

export const RATE_LIMIT_ERROR = "Lots of replies are coming in right now. Please try again in a little while.";

/**
 * The visitor's IP, keyed and rotated daily so the table never holds a raw IP
 * and yesterday's rows can't be joined to today's.
 */
async function ipHash(): Promise<string | null> {
  const ip = await visitorIp();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!ip || !key) return null;
  const day = new Date().toISOString().slice(0, 10);
  return createHmac("sha256", key).update(`${day}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Records one anonymous write and says whether it's within the limits: per
 * visitor per hour (any wedding) and per wedding per day. Open when the
 * database can't answer (e.g. before migration 0140 runs), so a hiccup here
 * never stops a guest's RSVP.
 */
export async function allowGuestWrite(
  weddingId: string,
  kind: GuestWriteKind,
  { perVisitor = true }: { perVisitor?: boolean } = {},
): Promise<boolean> {
  try {
    const { data, error } = await createAdminSupabaseClient().rpc("allow_guest_write", {
      p_wedding: weddingId,
      p_kind: kind,
      p_ip_hash: perVisitor ? await ipHash() : null,
    });
    if (error) return true;
    return data !== false;
  } catch {
    return true;
  }
}
