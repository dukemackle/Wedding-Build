"use client";

import { useState, useTransition } from "react";
import { GUEST_IMPORT_TEMPLATE, parseGuestTable, type GuestImportParse } from "@/lib/guest-import";
import { DrivePickerButton } from "@/components/drive-picker";
import { readTable } from "@/lib/spreadsheet";
import { importGuestRows } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  invited: "Invited",
  confirmed: "Confirmed",
  declined: "Declined",
  pending: "Pending",
};

type NamedSheet = { name: string; table: string[][] };

function cellToText(cell: unknown): string {
  if (cell == null) return "";
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  return String(cell);
}

/**
 * Reads .xlsx in the browser rather than on the server.
 *
 * Unzipping and parsing a workbook is far more than the 10ms of CPU a
 * Cloudflare Worker gets per request. The server re-validates whatever comes
 * back, so nothing rests on the browser having been honest about it.
 *
 * Every sheet is returned, not just the first: a real wedding workbook has a
 * dozen tabs and the guest list is rarely the one in front.
 */
async function readXlsx(file: File): Promise<NamedSheet[]> {
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheets = await readXlsxFile(file);
  return sheets.map((sheet) => ({
    name: sheet.sheet,
    table: sheet.data.map((row) => row.map(cellToText)),
  }));
}

/** How many usable guests a sheet yields -- used to pick the likely tab. */
function guestScore(table: string[][]) {
  const parsed = parseGuestTable(table);
  if (parsed.error) return 0;
  return parsed.rows.filter((row) => row.errors.length === 0).length;
}

export function GuestImportFileTab({ onDone }: { onDone: () => void }) {
  const [sheets, setSheets] = useState<NamedSheet[]>([]);
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<GuestImportParse | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [imported, setImported] = useState<{ count: number; skipped: number } | null>(null);
  /** Line numbers the user has struck off. Kept out of what's sent. */
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [isReading, setIsReading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(undefined);
    setImported(null);
    setFileName(file.name);
    setIsReading(true);
    try {
      const isExcel = /\.xlsx?$/i.test(file.name);
      const found: NamedSheet[] = isExcel
        ? await readXlsx(file)
        : [{ name: file.name, table: readTable(await file.text()) }];

      // Land on the tab that actually looks like a guest list rather than
      // whichever one happens to be first.
      const best = found.reduce(
        (win, sheet) => (guestScore(sheet.table) > guestScore(win.table) ? sheet : win),
        found[0],
      );
      setSheets(found);
      setSheetName(best?.name ?? null);
      setParsed(best ? parseGuestTable(best.table) : null);
      setRemoved(new Set());
    } catch {
      setSheets([]);
      setSheetName(null);
      setParsed(null);
      setError(
        "Couldn't read that file. Wren takes .xlsx, .csv and tab-separated text — if it's an old .xls, open it and save it as .xlsx first.",
      );
    } finally {
      setIsReading(false);
    }
  }

  function chooseSheet(name: string) {
    const sheet = sheets.find((s) => s.name === name);
    if (!sheet) return;
    setSheetName(name);
    setParsed(parseGuestTable(sheet.table));
    setRemoved(new Set());
    setError(undefined);
  }

  function toggleRemoved(line: number) {
    setRemoved((current) => {
      const next = new Set(current);
      if (next.has(line)) next.delete(line);
      else next.add(line);
      return next;
    });
    setError(undefined);
  }

  function handleImport(skipInvalid = false) {
    const sheet = sheets.find((s) => s.name === sheetName);
    if (!sheet) return;
    // A row's line number is its index in the table, since the header is
    // row 0 -- so dropping them is a filter on the original grid.
    const table =
      removed.size === 0
        ? sheet.table
        : sheet.table.filter((_, index) => index === 0 || !removed.has(index));

    const formData = new FormData();
    formData.set("rows", JSON.stringify(table));
    if (skipInvalid) formData.set("skip_invalid", "true");
    setError(undefined);
    startTransition(async () => {
      const result = await importGuestRows(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setImported({ count: result.imported ?? 0, skipped: result.skipped ?? 0 });
      setSheets([]);
      setSheetName(null);
      setParsed(null);
    });
  }

  const kept = parsed?.rows.filter((row) => !removed.has(row.line)) ?? [];
  const problems = kept.filter((row) => row.errors.length > 0);
  const ready = Boolean(parsed && !parsed.error && kept.length > 0 && problems.length === 0);

  if (imported !== null) {
    return (
      <div>
        <p className="text-sm text-forest">
          Imported {imported.count} {imported.count === 1 ? "guest" : "guests"}
          {imported.skipped > 0
            ? ` — skipped ${imported.skipped} row${imported.skipped === 1 ? "" : "s"} that still needed fixing.`
            : "."}
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-4 rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-ink">
        Upload your guest list as Excel (.xlsx), CSV, or tab-separated text. The first row should
        be your headings — only a name is required.
      </p>
      <p className="mt-1 text-xs text-ink/60">
        Headings are matched loosely, so &ldquo;First Name&rdquo; and &ldquo;Last Name&rdquo; are
        joined for you, and &ldquo;Street Address&rdquo;, &ldquo;ZIP&rdquo; and &ldquo;Meal
        Choice&rdquo; all land in the right place.
      </p>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(GUEST_IMPORT_TEMPLATE)}
        className="mt-2 text-xs text-brass hover:underline"
      >
        Copy a heading row to start from
      </button>

      <input
        type="file"
        accept=".csv,.tsv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="mt-3 block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-card file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-forest"
      />

      {/* Reaches a private Sheet without it being shared publicly, unlike the
          link tab -- Google grants access to this one file only. */}
      <div className="mt-2">
        <DrivePickerButton kind="spreadsheet" onFile={(file) => handleFile(file)} />
      </div>

      {isReading && <p className="mt-3 text-sm text-ink/60">Reading {fileName}…</p>}

      {sheets.length > 1 && (
        <label className="mt-3 flex flex-col gap-1 text-sm text-ink">
          Which tab?
          <select
            value={sheetName ?? ""}
            onChange={(e) => chooseSheet(e.target.value)}
            className="rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest"
          >
            {sheets.map((sheet) => {
              const score = guestScore(sheet.table);
              return (
                <option key={sheet.name} value={sheet.name}>
                  {sheet.name}
                  {score > 0 ? ` — ${score} guest${score === 1 ? "" : "s"}` : " — no guests found"}
                </option>
              );
            })}
          </select>
        </label>
      )}

      {parsed?.error && <p className="mt-3 text-sm text-red-800">{parsed.error}</p>}

      {parsed && !parsed.error && (
        <div className="mt-4">
          <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
            {kept.length} {kept.length === 1 ? "guest" : "guests"} ready
            {parsed.blankRows > 0 &&
              ` · ${parsed.blankRows} blank row${parsed.blankRows === 1 ? "" : "s"} skipped`}
            {removed.size > 0 && ` · ${removed.size} removed`}
            {problems.length > 0 &&
              ` · ${problems.length} need${problems.length === 1 ? "s" : ""} fixing`}
          </p>

          {parsed.unknownColumns.length > 0 && (
            <p className="mt-1 text-xs text-ink/60">
              Wren has nowhere to put these yet, so they were skipped:{" "}
              {parsed.unknownColumns.join(", ")}
            </p>
          )}

          <ul className="mt-2 flex max-h-72 flex-col gap-1 overflow-y-auto">
            {parsed.rows.map((row) => {
              const v = row.values;
              const place = [v.city, v.state].filter(Boolean).join(", ");
              const isRemoved = removed.has(row.line);
              const hasProblem = row.errors.length > 0;
              return (
                <li
                  key={row.line}
                  className={`flex items-start justify-between gap-3 rounded border px-2 py-1.5 text-xs ${
                    isRemoved
                      ? "border-hairline bg-parchment opacity-60"
                      : hasProblem
                        ? "border-red-200 bg-red-50"
                        : "border-hairline bg-card"
                  }`}
                >
                  <span className={`min-w-0 ${isRemoved ? "line-through" : ""}`}>
                  <span className="font-mono-numbers text-ink/40">{row.line}.</span>{" "}
                  <span className="text-ink">{v.name || "(no name)"}</span>
                  {v.plus_one && (
                    <span className="text-ink/50">
                      {" "}
                      +1{v.plus_one_name ? ` ${v.plus_one_name}` : ""}
                    </span>
                  )}
                  <span className="text-ink/50">
                    {v.email ? ` · ${v.email}` : ""}
                    {place ? ` · ${place}` : ""}
                    {` · ${STATUS_LABELS[v.status] ?? v.status}`}
                  </span>
                  {!isRemoved &&
                    row.errors.map((message) => (
                      <span key={message} className="mt-0.5 block text-red-800">
                        {message}
                      </span>
                    ))}
                  </span>
                  {/* A row we flagged but the couple knows is junk -- let them
                      strike it off here rather than going back to the file. */}
                  <button
                    type="button"
                    onClick={() => toggleRemoved(row.line)}
                    aria-label={
                      isRemoved
                        ? `Put row ${row.line} back`
                        : `Remove row ${row.line} from this import`
                    }
                    className={`shrink-0 whitespace-nowrap text-[11px] underline-offset-2 hover:underline ${
                      isRemoved ? "text-brass" : "text-ink/45 hover:text-red-800"
                    }`}
                  >
                    {isRemoved ? "Undo" : "Remove"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => handleImport()}
          disabled={!ready || isPending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50"
        >
          {isPending
            ? "Importing…"
            : `Import${ready ? ` ${kept.length}` : ""}`}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-forest"
        >
          Close
        </button>
        {problems.length > 0 && problems.length < kept.length && (
          <button
            type="button"
            onClick={() => handleImport(true)}
            disabled={isPending}
            className="rounded-md border border-hairline px-4 py-2 font-medium text-forest transition-colors hover:border-forest disabled:opacity-50"
          >
            Import the {kept.length - problems.length} that are ready
          </button>
        )}
        {problems.length > 0 && (
          <span className="text-xs text-ink/60">
            Fix them in your sheet, remove them here, or skip them on import.
          </span>
        )}
      </div>
    </div>
  );
}
