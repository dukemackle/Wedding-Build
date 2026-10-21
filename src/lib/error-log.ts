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
 * Records a server error in app_errors (migration 0128). Never throws: if the
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
    const { error: rpcError } = await createAdminSupabaseClient().rpc("log_app_error", {
      p_area: area,
      p_source: source,
      p_message: scrubErrorMessage(raw) || "(no message)",
      p_digest: digest ?? null,
    });
    if (rpcError) console.error("app_errors insert failed:", rpcError.message);
  } catch (logFailure) {
    console.error("app_errors insert failed:", logFailure);
  }
}
