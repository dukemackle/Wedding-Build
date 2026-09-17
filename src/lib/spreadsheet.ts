/**
 * Reading pasted or uploaded spreadsheets.
 *
 * Shared by the venue and guest importers so they agree on what a table is:
 * both take a 2D array of cells, whatever produced it -- pasted text, an
 * uploaded .csv, or a parsed .xlsx.
 */

/**
 * Pulls the document id and tab id out of a Google Sheets URL.
 *
 * The gid is the tab, and a URL copied from the address bar carries the tab
 * the couple was looking at -- which is the one they mean, in a workbook with
 * ten of them.
 */
export function parseGoogleSheetUrl(url: string): { id: string; gid: string } | null {
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;
  // `?` matters as much as `#` and `&`: Google's Copy link now hands out
  // ".../edit?gid=123" with no fragment at all, and reading that as gid 0
  // quietly imports the first tab instead of the one they were looking at.
  const gidMatch = url.match(/[#?&]gid=(\d+)/);
  return { id: idMatch[1], gid: gidMatch?.[1] ?? "0" };
}

/** What Google serves that tab as CSV. */
export function googleSheetCsvUrl(sheet: { id: string; gid: string }) {
  return `https://docs.google.com/spreadsheets/d/${sheet.id}/export?format=csv&gid=${sheet.gid}`;
}

export const SHEET_SHARING_ERROR =
  'Couldn’t read that sheet. Its sharing has to be set to "Anyone with the link" for this to work — or download it and upload the file instead, which keeps it private.';

/** Strips a heading down to letters, so "Max guests" and "max_guests" match. */
export function normaliseHeading(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * A character-level reader rather than a line split, because a cell copied
 * out of a spreadsheet can legitimately contain newlines inside quotes --
 * addresses and descriptions routinely do.
 */
export function parseDelimitedTable(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Tabs mean it came straight out of a spreadsheet; otherwise assume CSV. */
export function readTable(text: string): string[][] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const firstLine = trimmed.split(/\r?\n/, 1)[0] ?? "";
  return parseDelimitedTable(trimmed, firstLine.includes("\t") ? "\t" : ",");
}

/**
 * Maps each column to a field, given a heading row and an alias table.
 * Headings that match nothing are returned so the importer can say which
 * columns it ignored rather than dropping them silently.
 */
export function mapColumns<F extends string>(
  headingRow: string[],
  aliases: Record<string, F>,
): { columnField: (F | null)[]; unknownColumns: string[] } {
  const unknownColumns: string[] = [];
  const columnField = headingRow.map((raw, i) => {
    const key = normaliseHeading(raw);
    if (!key) return null;
    const field = aliases[key] ?? null;
    if (!field) unknownColumns.push(headingRow[i].trim());
    return field;
  });
  return { columnField, unknownColumns };
}
