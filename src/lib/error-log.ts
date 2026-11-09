import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

/** Where an error happened, for grouping on /admin/errors. */
export type ErrorArea = "guest_site" | "rsvp" | "inquiry" | "wren" | "planning" | "admin" | "api" | "app";

export const ERROR_AREA_LABEL: Record<ErrorArea, string> = {
  guest_site: "Guest site",
  rsvp: "RSVP",
  inquiry: "Inquiry email",
  wren: "Wren",
  planning: "Planning",
  admin: "Admin",
  api: "API",
  app: "App",
};

/**
 * Error text with anything personal taken out. Errors can quote what was
 * being saved -- a guest's email, a phone number -- and this table is read in
 * the admin and by the weekly review, so those never go in.
 */
export function scrubErrorMessage(message: string) {
  return message
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[email]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, "[number]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

/**
 * Records a server error in app_errors (migration 0129). Never throws: if the
 * log can't be written, it goes to the Worker logs instead, and whatever the
 * caller was doing carries on.
 *
 * `source` is a route pattern or function name ("/w/[slug]", "submitRsvp"),
 * never a URL, which can carry tokens or names.
 */
export async function logError(area: ErrorArea, source: string, error: unknown, digest?: string): Promise<void> {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
  try {
    const message = scrubErrorMessage(raw) || "(no message)";
    const { data: isNew, error: rpcError } = await createAdminSupabaseClient().rpc("log_app_error", {
      p_area: area,
      p_source: source,
      p_message: message,
      p_digest: digest ?? null,
    });
    if (rpcError) console.error("app_errors insert failed:", rpcError.message);
    // true only once 0163 is run, and only the first time today.
    else if (isNew === true) await alertAdmins(area, source, message);
  } catch (logFailure) {
    console.error("app_errors insert failed:", logFailure);
  }
}

/** Alerts per day at most, so a bad deploy can't flood the inbox. */
const DAILY_ALERT_CAP = 10;

/**
 * Emails the admins (ADMIN_EMAIL) the first time a distinct error shows up
 * each day. The message is already scrubbed of emails and numbers, and the
 * source is a route pattern, so nothing personal goes out. Never throws.
 */
async function alertAdmins(area: ErrorArea, source: string, message: string): Promise<void> {
  const to = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!to.length || !process.env.RESEND_API_KEY) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { count } = await createAdminSupabaseClient()
      .from("app_errors")
      .select("id", { count: "exact", head: true })
      .eq("day", today);
    if ((count ?? 0) > DAILY_ALERT_CAP) return;
    const capped = (count ?? 0) === DAILY_ALERT_CAP;
    const { getResendClient, INQUIRY_FROM_ADDRESS } = await import("@/lib/resend");
    await getResendClient().emails.send({
      from: INQUIRY_FROM_ADDRESS,
      to,
      subject: `Site error: ${ERROR_AREA_LABEL[area]} · ${source}`.slice(0, 150),
      text: [
        `A new error came up on youdoido.com (${ERROR_AREA_LABEL[area]}).`,
        "",
        `Where: ${source}`,
        `Error: ${message}`,
        "",
        "You get one email per distinct error per day; repeats are counted, not emailed.",
        ...(capped ? ["That's today's limit: no more error emails until tomorrow (UTC). The rest are on the page below."] : []),
        "",
        "All errors: https://admin.youdoido.com/admin/errors",
      ].join("\n"),
    });
  } catch (alertFailure) {
    console.error("error alert email failed:", alertFailure);
  }
}
