"use server";

import { revalidatePath } from "next/cache";
import type { Guest, SheetSyncSummary } from "@/lib/supabase/types";
import { requireEditableWedding } from "@/lib/wedding-access";
import { GUEST_WITH_NOTES, withNotes } from "@/lib/guest-notes";
import { normalizeGuestName } from "@/lib/guest-match";
import {
  GUEST_BLANK_VALUES,
  guestColumnsFromValues,
  guestSiteRows,
  guestSyncValues,
  readGuestSheet,
} from "@/lib/guest-sheet";
import {
  mergedValues,
  planSync,
  snapshotEntry,
  type Snapshot,
  type SyncConflict,
  type SyncValues,
} from "@/lib/sheet-sync";
import { loadSheetLink, syncerName } from "@/lib/sheet-link-server";
import { SHEET_SHARING_ERROR, googleSheetCsvUrl, readTable } from "@/lib/spreadsheet";

const MAX_SHEET_ROWS = 2000;

export type SheetDecision = {
  conflicts: SyncConflict[];
  missing: { id: string; name: string }[];
};

export type SheetWritePlan = {
  token: string;
  matches: { line: number; id: string }[];
  appendIds: string[];
  deletedLines: number[];
  final: Record<string, SyncValues>;
};

export type GuestSyncResult = {
  error?: string;
  /** Needs the couple's call before anything is changed. */
  decision?: SheetDecision;
  summary?: SheetSyncSummary;
  /** For a two-way link: what the browser should write to the sheet. */
  write?: SheetWritePlan;
};

/**
 * One sync of the guest list with its linked sheet.
 *
 * For a two-way ("drive") link the browser has read the sheet with the
 * couple's Google token and sends the grid; for a read-only ("link") one the
 * server fetches it from the public CSV export, as the importer does. Either
 * way the plan is made here, from the database, so nothing the browser says
 * about the guest list is taken on trust.
 *
 * Asks first when a field changed on both sides or a guest has gone from the
 * sheet: those are the two cases where doing something silently could lose
 * what someone meant.
 */
export async function syncGuestSheet(formData: FormData): Promise<GuestSyncResult> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const link = await loadSheetLink(supabase, wedding.id, "guests");
  if (!link) return { error: "No sheet is linked to your guest list." };
  const twoWay = link.mode === "drive";

  let grid: string[][];
  if (twoWay) {
    try {
      const raw: unknown = JSON.parse((formData.get("grid") as string) || "[]");
      if (!Array.isArray(raw)) throw new Error("not a grid");
      grid = raw.map((row: unknown) =>
        (Array.isArray(row) ? row : []).map((cell) => (cell == null ? "" : String(cell))),
      );
    } catch {
      return { error: "Couldn't read your sheet — please try again." };
    }
  } else {
    try {
      const response = await fetch(googleSheetCsvUrl({ id: link.file_id, gid: link.sheet_gid }));
      if (!response.ok) return { error: SHEET_SHARING_ERROR };
      grid = readTable(await response.text());
    } catch {
      return { error: "Couldn't reach your Google Sheet. Please try again." };
    }
  }
  if (grid.length > MAX_SHEET_ROWS) {
    return { error: `Your sheet has ${grid.length} rows — sync works with up to ${MAX_SHEET_ROWS}.` };
  }

  const partners = { a: wedding.partner_a_name, b: wedding.partner_b_name };
  const sheet = readGuestSheet(grid, partners);
  if (sheet.error) return { error: sheet.error };

  const { data: guestRows, error: loadError } = await supabase
    .from("guests")
    .select(GUEST_WITH_NOTES)
    .eq("wedding_id", wedding.id)
    .returns<Guest[]>();
  if (loadError) return { error: loadError.message };
  const guests = (guestRows ?? []).map(withNotes) as Guest[];
  const siteRows = guestSiteRows(guests);

  let deleteIds: Set<string>;
  try {
    const raw: unknown = JSON.parse((formData.get("delete_ids") as string) || "[]");
    deleteIds = new Set(Array.isArray(raw) ? raw.filter((v) => typeof v === "string") : []);
  } catch {
    deleteIds = new Set();
  }
  const snapshot: Snapshot = link.snapshot ?? {};
  const plan = planSync({
    fields: sheet.readFields,
    sheetRows: sheet.rows,
    siteRows,
    snapshot,
    policy: formData.get("policy") === "sheet" ? "sheet" : "site",
    deleteOnSite: deleteIds,
    hasIdColumn: sheet.hasIdColumn,
    normalizeName: normalizeGuestName,
    blankValues: GUEST_BLANK_VALUES,
  });

  const confirmed = formData.get("confirm") === "true";
  if (!confirmed && (plan.conflicts.length > 0 || plan.missingFromSheet.length > 0)) {
    return {
      decision: {
        conflicts: plan.conflicts.slice(0, 100),
        missing: plan.missingFromSheet,
      },
    };
  }

  // Apply to the site: one request each for updates, additions and
  // deletions, not one per guest -- a Worker has a cap on subrequests.
  const userById = new Map(guests.map((g) => [g.id, g.user_id]));
  const final = mergedValues(plan, siteRows);
  const now = new Date().toISOString();

  if (plan.updates.length > 0) {
    const rows = plan.updates.map(({ id }) => ({
      id,
      wedding_id: wedding.id,
      user_id: userById.get(id) ?? user.id,
      ...guestColumnsFromValues(final.get(id)!),
      updated_at: now,
    }));
    const { error } = await supabase.from("guests").upsert(rows, { onConflict: "id" });
    if (error) return { error: error.message };
  }

  const createdMatches: { line: number; id: string }[] = [];
  if (plan.creates.length > 0) {
    const inserts = plan.creates.map(({ values }) => ({
      wedding_id: wedding.id,
      user_id: user.id,
      ...guestColumnsFromValues(values),
    }));
    const { data: created, error } = await supabase
      .from("guests")
      .insert(inserts)
      .select("id")
      .returns<{ id: string }[]>();
    if (error) return { error: error.message };
    (created ?? []).forEach((row, index) => {
      const source = plan.creates[index];
      if (!source) return;
      createdMatches.push({ line: source.line, id: row.id });
      final.set(row.id, guestSyncValues(guestColumnsFromValues(source.values)));
    });
  }

  if (plan.deleteOnSite.length > 0) {
    const { error } = await supabase
      .from("guests")
      .delete()
      .eq("wedding_id", wedding.id)
      .in("id", plan.deleteOnSite);
    if (error) return { error: error.message };
  }

  // What the sheet holds once this sync is done, as hashes.
  const next: Snapshot = {};
  const accounted = new Set([
    ...plan.matches.map((m) => m.id),
    ...plan.newOnSite,
    ...plan.deleteOnSite,
  ]);
  const invalidIds = siteRows.map((row) => row.id).filter((id) => !accounted.has(id));
  // A guest whose sheet row has a typo keeps its old snapshot until it reads.
  for (const id of invalidIds) if (snapshot[id]) next[id] = snapshot[id];

  const matches = [...plan.matches, ...createdMatches];
  if (twoWay) {
    for (const { id } of matches) next[id] = snapshotEntry(final.get(id)!, sheet.layout.fields);
    for (const id of plan.newOnSite) next[id] = snapshotEntry(final.get(id)!, sheet.layout.fields);
  } else {
    // Read-only: nothing is written, so the snapshot is what the sheet says.
    const rowByLine = new Map(sheet.rows.map((row) => [row.line, row]));
    for (const { line, id } of matches) {
      next[id] = snapshotEntry(rowByLine.get(line)?.values ?? {}, sheet.readFields);
    }
    // Guests deleted on the site stay as tombstones, so their rows -- which
    // a read-only link can't remove -- aren't added back next time.
    const onSite = new Set(siteRows.map((row) => row.id));
    for (const [id, entry] of Object.entries(snapshot)) if (!onSite.has(id)) next[id] = entry;
    for (const id of plan.deleteOnSite) if (snapshot[id]) next[id] = snapshot[id];
  }

  const changedNames = [...plan.creates.map((c) => c.name), ...plan.updates.map((u) => u.name)];
  const summary: SheetSyncSummary = {
    added: plan.creates.length,
    updated: plan.updates.length,
    sent: twoWay ? plan.sent + plan.newOnSite.length : 0,
    removedFromSheet: twoWay ? plan.deletedOnSite.length : 0,
    deletedOnSite: plan.deleteOnSite.length,
    conflicts: plan.conflicts.length,
    names: changedNames.slice(0, 3),
    skippedRows: plan.invalid.length,
  };

  const token = crypto.randomUUID();
  const { error: linkError } = await supabase
    .from("sheet_links")
    .update({
      ...(twoWay
        ? { pending_snapshot: next, pending_token: token }
        : { snapshot: next, pending_snapshot: null, pending_token: null }),
      last_synced_at: now,
      last_synced_by: user.id,
      last_synced_by_name: syncerName(user),
      last_summary: summary,
    })
    .eq("id", link.id);
  if (linkError) return { error: linkError.message };

  revalidatePath("/guests");
  revalidatePath("/budget");

  if (!twoWay) return { summary };

  const finalOut: Record<string, SyncValues> = {};
  for (const { id } of matches) finalOut[id] = final.get(id)!;
  for (const id of plan.newOnSite) finalOut[id] = final.get(id)!;
  return {
    summary,
    write: {
      token,
      matches,
      appendIds: plan.newOnSite,
      deletedLines: plan.deletedOnSite.map((row) => row.line),
      final: finalOut,
    },
  };
}
