import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { createClient } from "@/lib/supabase/server";

/** Most target ids kept per row: a 300-row bulk delete still says how many in its summary. */
const MAX_TARGET_IDS = 200;

/**
 * Records one admin change in admin_audit_log, after it has succeeded.
 *
 * Call it from every admin server action that changes data, once the change
 * is saved. Never throws: a log that can't be written is reported to the
 * Worker logs, but it doesn't undo or block the change the admin made.
 *
 * Summaries say what happened in plain words. Listing and business names are
 * fine; couples' and guests' names, emails and message text are not -- they
 * go in as ids.
 */
export async function logAdminAction(
  action: string,
  target: { type: string; ids?: (string | null | undefined)[] },
  summary: string,
): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await createAdminSupabaseClient()
      .from("admin_audit_log")
      .insert({
        actor_email: user?.email ?? "unknown",
        action,
        target_type: target.type,
        target_ids: (target.ids ?? []).filter((id): id is string => !!id).slice(0, MAX_TARGET_IDS),
        summary: summary.slice(0, 500),
      });
    if (error) console.error("admin_audit_log insert failed:", error.message);
  } catch (error) {
    console.error("admin_audit_log insert failed:", error);
  }
}

/** "1 vendor" / "3 vendors". */
export function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
