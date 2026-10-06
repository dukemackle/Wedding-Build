import "server-only";
import { revalidatePath } from "next/cache";
import type { createClient } from "@/lib/supabase/server";
import type { SheetLinkKind, SheetSyncSummary, Wedding } from "@/lib/supabase/types";
import { requireEditableWedding } from "@/lib/wedding-access";
import { loadSheetLink, syncerName } from "@/lib/sheet-link-server";
import {
  mergedValues,
  planSync,
  snapshotEntry,
  type SheetLayout,
  type SheetRow,
  type SiteRow,
  type Snapshot,
  type SyncConflict,
  type SyncPlan,
  type SyncValues,
} from "@/lib/sheet-sync";
import { SHEET_SHARING_ERROR, googleSheetCsvUrl, readTable } from "@/lib/spreadsheet";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

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

export type SheetSyncResult = {
  error?: string;
  /** Needs the couple's call before anything is changed. */
  decision?: SheetDecision;
  summary?: SheetSyncSummary;
  /** For a two-way link: what the browser should write to the sheet. */
  write?: SheetWritePlan;
};

/** What a page supplies to sync its list with a sheet. */
export type SheetSyncAdapter = {
  kind: SheetLinkKind;
  /** Pages whose numbers depend on this list. */
  revalidate: string[];
  read: (grid: string[][]) => {
    error?: string;
    rows: SheetRow[];
    layout: SheetLayout;
    hasIdColumn: boolean;
    readFields: string[];
  };
  loadSiteRows: () => Promise<{ error?: string; rows: SiteRow[] }>;
  normalizeName: (name: string) => string;
  blankValues?: Record<string, string>;
  locked?: (id: string) => { fields?: string[]; undeletable?: boolean } | undefined;
  /**
   * Writes the plan to the database -- updates, additions, deletions -- in a
   * request or two each, not one per row: a Worker caps subrequests. Returns
   * the new rows' ids and values, in the order of `plan.creates`.
   */
  apply: (
    plan: SyncPlan,
    final: Map<string, SyncValues>,
  ) => Promise<{ error?: string; created: { id: string; values: SyncValues }[] }>;
};

export type SyncContext = {
  supabase: SupabaseServerClient;
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null };
  wedding: Wedding;
};

function readGridField(formData: FormData): string[][] | null {
  try {
    const raw: unknown = JSON.parse((formData.get("grid") as string) || "[]");
    if (!Array.isArray(raw)) return null;
    return raw.map((row: unknown) =>
      (Array.isArray(row) ? row : []).map((cell) => (cell == null ? "" : String(cell))),
    );
  } catch {
    return null;
  }
}

/**
 * One sync of a page's list with its linked sheet.
 *
 * For a two-way ("drive") link the browser has read the sheet with the
 * couple's Google token and sends the grid; for a read-only ("link") one the
 * server fetches it from the public CSV export, as the importers do. Either
 * way the plan is made here, from the database, so nothing the browser says
 * about the list is taken on trust.
 *
 * Asks first when a field changed on both sides or a row has gone from the
 * sheet: the two cases where doing something silently could lose what
 * someone meant.
 */
export async function runSheetSync(
  formData: FormData,
  makeAdapter: (context: SyncContext) => SheetSyncAdapter,
): Promise<SheetSyncResult> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const adapter = makeAdapter({ supabase, user, wedding });

  const link = await loadSheetLink(supabase, wedding.id, adapter.kind);
  if (!link) return { error: "No sheet is linked here." };
  const twoWay = link.mode === "drive";

  let grid: string[][];
  if (twoWay) {
    const sent = readGridField(formData);
    if (!sent) return { error: "Couldn't read your sheet — please try again." };
    grid = sent;
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

  const sheet = adapter.read(grid);
  if (sheet.error) return { error: sheet.error };

  const site = await adapter.loadSiteRows();
  if (site.error) return { error: site.error };
  const siteRows = site.rows;

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
    normalizeName: adapter.normalizeName,
    blankValues: adapter.blankValues,
    locked: adapter.locked,
  });

  const confirmed = formData.get("confirm") === "true";
  if (!confirmed && (plan.conflicts.length > 0 || plan.missingFromSheet.length > 0)) {
    return {
      decision: { conflicts: plan.conflicts.slice(0, 100), missing: plan.missingFromSheet },
    };
  }

  const final = mergedValues(plan, siteRows);
  const applied = await adapter.apply(plan, final);
  if (applied.error) return { error: applied.error };

  const createdMatches: { line: number; id: string }[] = [];
  applied.created.forEach((row, index) => {
    const source = plan.creates[index];
    if (!source) return;
    createdMatches.push({ line: source.line, id: row.id });
    final.set(row.id, row.values);
  });

  // What the sheet holds once this sync is done, as hashes.
  const next: Snapshot = {};
  const accounted = new Set([
    ...plan.matches.map((m) => m.id),
    ...plan.newOnSite,
    ...plan.deleteOnSite,
  ]);
  // A row whose sheet copy has a typo keeps its old snapshot until it reads.
  for (const row of siteRows) {
    if (!accounted.has(row.id) && snapshot[row.id]) next[row.id] = snapshot[row.id];
  }

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
    // Rows deleted on the site stay as tombstones, so their sheet rows --
    // which a read-only link can't remove -- aren't added back next time.
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

  const now = new Date().toISOString();
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

  for (const path of adapter.revalidate) revalidatePath(path);

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
