"use server";

import type { Guest } from "@/lib/supabase/types";
import { GUEST_WITH_NOTES, withNotes } from "@/lib/guest-notes";
import { normalizeGuestName } from "@/lib/guest-match";
import {
  GUEST_BLANK_VALUES,
  guestColumnsFromValues,
  guestSiteRows,
  guestSyncValues,
  readGuestSheet,
} from "@/lib/guest-sheet";
import { runSheetSync, type SheetSyncResult } from "@/lib/sheet-sync-server";

/** One sync of the guest list with its linked sheet. See runSheetSync. */
export async function syncGuestSheet(formData: FormData): Promise<SheetSyncResult> {
  return runSheetSync(formData, ({ supabase, user, wedding }) => {
    let userById = new Map<string, string>();

    return {
      kind: "guests",
      revalidate: ["/guests", "/budget"],
      read: (grid) => readGuestSheet(grid, { a: wedding.partner_a_name, b: wedding.partner_b_name }),
      normalizeName: normalizeGuestName,
      blankValues: GUEST_BLANK_VALUES,

      async loadSiteRows() {
        const { data, error } = await supabase
          .from("guests")
          .select(GUEST_WITH_NOTES)
          .eq("wedding_id", wedding.id)
          .returns<Guest[]>();
        if (error) return { error: error.message, rows: [] };
        const guests = (data ?? []).map(withNotes) as Guest[];
        userById = new Map(guests.map((g) => [g.id, g.user_id]));
        return { rows: guestSiteRows(guests) };
      },

      async apply(plan, final) {
        const now = new Date().toISOString();

        // Every sync field for each changed guest, so the upsert's columns are
        // the same on every row -- PostgREST nulls a column a row leaves out.
        if (plan.updates.length > 0) {
          const rows = plan.updates.map(({ id }) => ({
            id,
            wedding_id: wedding.id,
            user_id: userById.get(id) ?? user.id,
            ...guestColumnsFromValues(final.get(id)!),
            updated_at: now,
          }));
          const { error } = await supabase.from("guests").upsert(rows, { onConflict: "id" });
          if (error) return { error: error.message, created: [] };
        }

        const created: { id: string; values: Record<string, string> }[] = [];
        if (plan.creates.length > 0) {
          const inserts = plan.creates.map(({ values }) => ({
            wedding_id: wedding.id,
            user_id: user.id,
            ...guestColumnsFromValues(values),
          }));
          const { data, error } = await supabase
            .from("guests")
            .insert(inserts)
            .select("id")
            .returns<{ id: string }[]>();
          if (error) return { error: error.message, created: [] };
          (data ?? []).forEach((row, index) => {
            created.push({ id: row.id, values: guestSyncValues(inserts[index]) });
          });
        }

        if (plan.deleteOnSite.length > 0) {
          const { error } = await supabase
            .from("guests")
            .delete()
            .eq("wedding_id", wedding.id)
            .in("id", plan.deleteOnSite);
          if (error) return { error: error.message, created };
        }

        return { created };
      },
    };
  });
}
