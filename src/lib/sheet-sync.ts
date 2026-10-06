/**
 * Keeping a Google Sheet and a list on the site in step.
 *
 * Pure and shared: the server runs it to decide what changes, and the browser
 * runs the write half against the grid it just read from Google. Nothing here
 * knows about guests or budgets -- each page supplies an adapter that turns
 * its rows into plain strings per field (see guest-sheet.ts).
 *
 * The merge is three-way, per field. `snapshot` holds a short hash of what
 * each field held the last time sheet and site were in step, so for any field
 * that differs now we can tell which side moved:
 *
 *   - only the sheet changed it  -> the site takes the sheet's value
 *   - only the site changed it   -> the sheet gets the site's value
 *   - both changed it            -> a conflict; the site wins unless the
 *                                   couple chose otherwise, and it's reported
 *
 * Per field rather than per row, because the common case is both sides
 * touching the same guest at once: an RSVP arrives on the site while the
 * couple fixes that guest's address in the sheet. Both should survive.
 */

/** A field's value as the sheet would show it, "" for empty. */
export type SyncValues = Record<string, string>;

/** Per row id, per field: the hash of what the sheet held last sync. */
export type Snapshot = Record<string, Record<string, string>>;

export type ConflictPolicy = "site" | "sheet";

export type SheetRow = {
  /** Row number below the heading, 1-based; also its index in the table. */
  line: number;
  /** The Sync ID cell, if the row carries one. */
  id: string | null;
  name: string;
  /** Only the fields the sheet has a column for. */
  values: SyncValues;
  errors: string[];
};

export type SiteRow = { id: string; name: string; values: SyncValues };

export type SyncConflict = {
  id: string;
  name: string;
  field: string;
  site: string;
  sheet: string;
};

export type SyncPlan = {
  /** Sheet line -> site id, for every row that is (or becomes) a site row. */
  matches: { line: number; id: string }[];
  /** Changes the sheet brings to existing site rows. */
  updates: { id: string; name: string; changes: SyncValues }[];
  /** Sheet rows with no site row yet. */
  creates: { line: number; name: string; values: SyncValues }[];
  conflicts: SyncConflict[];
  /** On the site, in the sheet last time, gone from it now. */
  missingFromSheet: { id: string; name: string }[];
  /** The missing ones the couple chose to delete on the site too. */
  deleteOnSite: string[];
  /** Site rows the sheet doesn't have yet, to be added at the bottom. */
  newOnSite: string[];
  /** Sheet rows for site rows deleted since last sync. */
  deletedOnSite: { line: number; name: string }[];
  /** Sheet rows that can't be read; left exactly as they are. */
  invalid: { line: number; name: string; errors: string[] }[];
  /** How many matched rows the site has newer values for. */
  sent: number;
};

/**
 * FNV-1a, in base 36. Six or seven characters is plenty to tell "changed"
 * from "not changed" for one field of one row, and keeps a 500-guest
 * snapshot to tens of kilobytes rather than a copy of the guest list.
 */
export function hashValue(value: string): string {
  if (value === "") return "";
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function snapshotEntry(values: SyncValues, fields: string[]): Record<string, string> {
  const entry: Record<string, string> = {};
  for (const field of fields) entry[field] = hashValue(values[field] ?? "");
  return entry;
}

export function planSync({
  fields,
  sheetRows,
  siteRows,
  snapshot,
  policy,
  deleteOnSite,
  hasIdColumn,
  normalizeName,
  blankValues = {},
  locked,
}: {
  fields: string[];
  sheetRows: SheetRow[];
  siteRows: SiteRow[];
  snapshot: Snapshot;
  policy: ConflictPolicy;
  /** Ids from `missingFromSheet` the couple chose to delete on the site. */
  deleteOnSite: Set<string>;
  /**
   * Whether this sheet carries Sync IDs. A sheet that can't (a read-only
   * link) is matched by name alone, and a row whose name belonged to a row
   * since deleted on the site is recognised as that, rather than re-added.
   */
  hasIdColumn: boolean;
  normalizeName: (name: string) => string;
  /**
   * What an empty cell reads as, per field, where that isn't "". A blank RSVP
   * cell is read as "pending", and on a first sync that's nobody having
   * written anything, not a disagreement with the site.
   */
  blankValues?: Record<string, string>;
  /**
   * Rows the sheet can't fully change: fields it may not edit (a budget
   * category's name), and whether it may delete the row. A locked field is
   * written back from the site; an undeletable row is put back.
   */
  locked?: (id: string) => { fields?: string[]; undeletable?: boolean } | undefined;
}): SyncPlan {
  const siteById = new Map(siteRows.map((row) => [row.id, row]));
  const used = new Set<string>();
  const plan: SyncPlan = {
    matches: [],
    updates: [],
    creates: [],
    conflicts: [],
    missingFromSheet: [],
    deleteOnSite: [],
    newOnSite: [],
    deletedOnSite: [],
    invalid: [],
    sent: 0,
  };

  const matched: { row: SheetRow; site: SiteRow }[] = [];
  const unmatched: SheetRow[] = [];
  const unclaimedInvalid: SheetRow[] = [];

  // Pass 1: Sync IDs. A duplicated row (copied to start a new guest) carries
  // the same id as the original; only the first claims it.
  for (const row of sheetRows) {
    const site = row.id ? siteById.get(row.id) : undefined;
    if (row.errors.length > 0) {
      plan.invalid.push({ line: row.line, name: row.name, errors: row.errors });
      // Still claims its site row (by id here, by name below), so a typo in
      // the sheet doesn't read as the guest having left it -- or get them
      // added to it a second time.
      if (site && !used.has(site.id)) used.add(site.id);
      else if (!site) unclaimedInvalid.push(row);
      continue;
    }
    if (site && !used.has(site.id)) {
      used.add(site.id);
      matched.push({ row, site });
    } else if (row.id && !site && snapshot[row.id]) {
      plan.deletedOnSite.push({ line: row.line, name: row.name });
    } else {
      unmatched.push(row);
    }
  }

  // Pass 2: names, for rows without an id -- every row of a sheet before its
  // first sync, and new rows typed into it since.
  const byName = new Map<string, SiteRow[]>();
  for (const site of siteRows) {
    if (used.has(site.id)) continue;
    const key = normalizeName(site.name);
    byName.set(key, [...(byName.get(key) ?? []), site]);
  }
  const deletedNames = new Set<string>();
  if (!hasIdColumn) {
    for (const [id, entry] of Object.entries(snapshot)) {
      if (!siteById.has(id) && entry.name) deletedNames.add(entry.name);
    }
  }
  for (const row of unclaimedInvalid) {
    const candidates = (byName.get(normalizeName(row.name)) ?? []).filter((site) => !used.has(site.id));
    if (candidates.length === 1) used.add(candidates[0].id);
  }
  for (const row of unmatched) {
    const key = normalizeName(row.name);
    const candidates = (byName.get(key) ?? []).filter((site) => !used.has(site.id));
    // Two site rows with one name is ambiguous; pick neither.
    if (candidates.length === 1) {
      used.add(candidates[0].id);
      matched.push({ row, site: candidates[0] });
    } else if (deletedNames.has(hashValue(row.values.name ?? row.name))) {
      plan.deletedOnSite.push({ line: row.line, name: row.name });
    } else {
      plan.creates.push({ line: row.line, name: row.name, values: row.values });
    }
  }

  // Pass 3: merge each matched row, field by field.
  for (const { row, site } of matched) {
    plan.matches.push({ line: row.line, id: site.id });
    const before = snapshot[site.id] ?? {};
    const changes: SyncValues = {};
    let siteNewer = false;

    const fixed = locked?.(site.id)?.fields ?? [];
    for (const field of fields) {
      const sheet = row.values[field] ?? "";
      const ours = site.values[field] ?? "";
      if (sheet === ours) continue;
      if (fixed.includes(field)) {
        siteNewer = true;
        continue;
      }

      const base = before[field];
      let take: "sheet" | "site" | "conflict";
      if (base === undefined) {
        // Never synced: fill blanks from whichever side has something.
        const sheetBlank = sheet === "" || blankValues[field] === sheet;
        const oursBlank = ours === "" || blankValues[field] === ours;
        take = oursBlank && !sheetBlank ? "sheet" : sheetBlank ? "site" : "conflict";
      } else {
        const sheetMoved = hashValue(sheet) !== base;
        const siteMoved = hashValue(ours) !== base;
        take = sheetMoved && !siteMoved ? "sheet" : siteMoved && !sheetMoved ? "site" : "conflict";
      }

      if (take === "conflict") {
        plan.conflicts.push({ id: site.id, name: site.name, field, site: ours, sheet });
        take = policy;
      }
      if (take === "sheet") changes[field] = sheet;
      else siteNewer = true;
    }

    if (Object.keys(changes).length > 0) {
      plan.updates.push({ id: site.id, name: site.name, changes });
    }
    if (siteNewer) plan.sent++;
  }

  // Pass 4: site rows no sheet row claimed.
  for (const site of siteRows) {
    if (used.has(site.id)) continue;
    if (snapshot[site.id] && !locked?.(site.id)?.undeletable) {
      plan.missingFromSheet.push({ id: site.id, name: site.name });
      if (deleteOnSite.has(site.id)) {
        plan.deleteOnSite.push(site.id);
        continue;
      }
    }
    plan.newOnSite.push(site.id);
  }

  return plan;
}

/** Each matched site row's values once the sheet's changes are applied. */
export function mergedValues(plan: SyncPlan, siteRows: SiteRow[]): Map<string, SyncValues> {
  const result = new Map(siteRows.map((row) => [row.id, { ...row.values }]));
  for (const update of plan.updates) {
    const current = result.get(update.id);
    if (current) Object.assign(current, update.changes);
  }
  for (const id of plan.deleteOnSite) result.delete(id);
  return result;
}

/**
 * Where each field lives in the sheet, and how to write it there.
 *
 * Supplied by the page's adapter, built from the heading row. `columns` maps
 * a field to the cells it writes -- usually one, but a guest name kept as
 * First Name / Last Name writes two.
 */
export type SheetLayout = {
  /** Fields with a column, after any columns the sync adds. */
  fields: string[];
  idColumn: number;
  /** Headings to put in row 1 for columns the sync adds. */
  addedHeadings: { column: number; heading: string }[];
  /** Fields whose column was added by this sync, so every row needs it. */
  addedFields: Set<string>;
  write: (field: string, value: string) => { column: number; value: string | number }[];
};

export type CellWrite = { row: number; column: number; value: string | number };

/**
 * The cells to change in the sheet, in 0-based grid positions.
 *
 * Only cells whose meaning differs are written: a cell reading "Yes" under
 * RSVP already says "confirmed", and rewriting it as "Confirmed" would be
 * churn in someone's sheet for nothing. Columns Wren doesn't read are never
 * touched, so formulas and colour-coding the couple keep beside the list
 * stay put. Deleted rows are returned separately; they're removed last, from
 * the bottom up, so the row numbers here stay valid.
 */
export function buildSheetWrites({
  grid,
  layout,
  sheetRows,
  matches,
  finalValues,
  appendIds,
  deletedLines,
}: {
  grid: string[][];
  layout: SheetLayout;
  sheetRows: SheetRow[];
  matches: { line: number; id: string }[];
  finalValues: Map<string, SyncValues>;
  appendIds: string[];
  deletedLines: number[];
}): { cells: CellWrite[]; deleteRows: number[] } {
  const cells: CellWrite[] = [];
  const rowByLine = new Map(sheetRows.map((row) => [row.line, row]));

  for (const { column, heading } of layout.addedHeadings) {
    cells.push({ row: 0, column, value: heading });
  }

  for (const { line, id } of matches) {
    const values = finalValues.get(id);
    if (!values) continue;
    const sheet = rowByLine.get(line)?.values ?? {};
    for (const field of layout.fields) {
      const value = values[field] ?? "";
      const unchanged = layout.addedFields.has(field) ? value === "" : (sheet[field] ?? "") === value;
      if (unchanged) continue;
      for (const cell of layout.write(field, value)) cells.push({ row: line, ...cell });
    }
    if ((grid[line]?.[layout.idColumn] ?? "").trim() !== id) {
      cells.push({ row: line, column: layout.idColumn, value: id });
    }
  }

  // New rows go under the last row of the grid, not under the last guest:
  // a total or a note at the bottom of the sheet shouldn't be overwritten.
  // An empty sheet still has its heading row, written above.
  let next = Math.max(grid.length, 1);
  for (const id of appendIds) {
    const values = finalValues.get(id);
    if (!values) continue;
    for (const field of layout.fields) {
      const value = values[field] ?? "";
      if (value === "") continue;
      for (const cell of layout.write(field, value)) cells.push({ row: next, ...cell });
    }
    cells.push({ row: next, column: layout.idColumn, value: id });
    next++;
  }

  return { cells, deleteRows: [...deletedLines].sort((a, b) => b - a) };
}
