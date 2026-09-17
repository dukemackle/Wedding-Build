"use client";

import { useState, useTransition } from "react";
import {
  BUDGET_FIELD_LABELS,
  BUDGET_HEADING_EXAMPLES,
  BUDGET_IMPORT_TEMPLATE,
  detectBudgetColumns,
  parseBudgetTable,
  type BudgetColumnMap,
  type BudgetField,
  type BudgetImportParse,
} from "@/lib/budget-import";
import { readTable } from "@/lib/spreadsheet";
import { importBudgetRows } from "./actions";

type NamedSheet = { name: string; table: string[][] };

const FIELD_ORDER: BudgetField[] = [
  "category",
  "purchased_from",
  "amount",
  "paid_amount",
  "due_date",
  "notes",
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function cellToText(cell: unknown): string {
  if (cell == null) return "";
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  return String(cell);
}

/** A, B, ... Z, AA -- so a column can be named the way the sheet names it. */
function columnLetter(index: number) {
  let out = "";
  let n = index;
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

/**
 * Reads .xlsx in the browser, same as the guest importer: unzipping a
 * workbook is far more than the 10ms of CPU a Cloudflare Worker gets, and the
 * server parses the grid again anyway before writing anything.
 */
async function readXlsx(file: File): Promise<NamedSheet[]> {
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheets = await readXlsxFile(file);
  return sheets.map((sheet) => ({
    name: sheet.sheet,
    table: sheet.data.map((row) => row.map(cellToText)),
  }));
}

/** How much of a budget a sheet yields -- used to pick the likely tab. */
function budgetScore(table: string[][]) {
  const { map } = detectBudgetColumns(table);
  const parsed = parseBudgetTable(table, map);
  if (parsed.error) return 0;
  return parsed.rows.filter((row) => row.errors.length === 0 && row.values.amount !== null).length;
}

export function BudgetImportPanel({ onDone }: { onDone: () => void }) {
  const [sheets, setSheets] = useState<NamedSheet[]>([]);
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [columns, setColumns] = useState<BudgetColumnMap>({});
  const [derivedColumns, setDerivedColumns] = useState<string[]>([]);
  const [unknownColumns, setUnknownColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [imported, setImported] = useState<{
    categories: number;
    items: number;
    skipped: number;
    unhidden: string[];
  } | null>(null);
  /** Rows the couple has struck off. Kept out of what's sent. */
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [isReading, setIsReading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sheet = sheets.find((s) => s.name === sheetName) ?? null;
  const heading = sheet?.table[0] ?? [];

  // Re-parsed on render rather than memoised: the mapping selects are the
  // only thing that changes it, and the React Compiler can't keep a manual
  // memo whose dependency is a grid held in state.
  const parsed: BudgetImportParse | null = sheet ? parseBudgetTable(sheet.table, columns) : null;

  function loadSheet(next: NamedSheet) {
    const detected = detectBudgetColumns(next.table);
    setSheetName(next.name);
    setColumns(detected.map);
    setDerivedColumns(detected.derivedColumns);
    setUnknownColumns(detected.unknownColumns);
    setRemoved(new Set());
    setError(undefined);
  }

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

      // Land on the tab that actually looks like a budget rather than
      // whichever one happens to be first -- a real wedding workbook has ten.
      const best = found.reduce(
        (win, candidate) =>
          budgetScore(candidate.table) > budgetScore(win.table) ? candidate : win,
        found[0],
      );
      setSheets(found);
      if (best) loadSheet(best);
      else {
        setSheetName(null);
        setColumns({});
      }
    } catch {
      setSheets([]);
      setSheetName(null);
      setColumns({});
      setError(
        "Couldn't read that file. Wren takes .xlsx, .csv and tab-separated text — if it's an old .xls, open it and save it as .xlsx first.",
      );
    } finally {
      setIsReading(false);
    }
  }

  function chooseSheet(name: string) {
    const next = sheets.find((s) => s.name === name);
    if (next) loadSheet(next);
  }

  function setField(field: BudgetField, value: string) {
    setColumns((current) => {
      const next = { ...current };
      if (value === "") delete next[field];
      else next[field] = Number(value);
      return next;
    });
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
    if (!sheet) return;
    // A row's line number is its index in the grid, since the header is row 0.
    const table =
      removed.size === 0
        ? sheet.table
        : sheet.table.filter((_, index) => index === 0 || !removed.has(index));

    const formData = new FormData();
    formData.set("rows", JSON.stringify(table));
    formData.set("columns", JSON.stringify(columns));
    if (skipInvalid) formData.set("skip_invalid", "true");
    setError(undefined);
    startTransition(async () => {
      const result = await importBudgetRows(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setImported({
        categories: result.categories ?? 0,
        items: result.items ?? 0,
        skipped: result.skipped ?? 0,
        unhidden: result.unhidden ?? [],
      });
      setSheets([]);
      setSheetName(null);
      setColumns({});
    });
  }

  const kept = parsed?.rows.filter((row) => !removed.has(row.line)) ?? [];
  const problems = kept.filter((row) => row.errors.length > 0);
  const categoryCount = kept.filter((row) => row.target === "category").length;
  const noPrice = kept.filter((row) => row.errors.length === 0 && row.values.amount === null).length;
  const ready = Boolean(parsed && !parsed.error && kept.length > 0 && problems.length === 0);

  if (imported !== null) {
    const parts = [
      imported.categories > 0
        ? `${imported.categories} budget line${imported.categories === 1 ? "" : "s"}`
        : null,
      imported.items > 0 ? `${imported.items} item${imported.items === 1 ? "" : "s"}` : null,
    ].filter(Boolean);
    return (
      <div className="mb-6 rounded-lg border border-hairline bg-parchment p-6">
        <p className="text-sm text-forest">
          Imported {parts.length > 0 ? parts.join(" and ") : "nothing new"}
          {imported.skipped > 0
            ? ` — skipped ${imported.skipped} row${imported.skipped === 1 ? "" : "s"} that still needed fixing.`
            : "."}
        </p>
        {imported.unhidden.length > 0 && (
          <p className="mt-1 text-xs text-ink/60">
            Turned back on so you can see them: {imported.unhidden.join(", ")}.
          </p>
        )}
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
    <div className="mb-6 rounded-lg border border-hairline bg-parchment p-6">
      <p className="text-sm text-ink">
        Upload your budget as Excel (.xlsx), CSV, or tab-separated text. The first row should be
        your headings.
      </p>
      <p className="mt-1 text-xs text-ink/60">
        Rows matching one of Wren&apos;s categories fill that line; anything else — a second
        photographer, a third set of rings — comes in as its own item. Wren reads a cost cell like
        &ldquo;$20,650 ($1,300 of which is the rancher)&rdquo; as $20,650 and keeps the rest as a
        note.
      </p>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(BUDGET_IMPORT_TEMPLATE)}
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

      {isReading && <p className="mt-3 text-sm text-ink/60">Reading {fileName}…</p>}

      {sheets.length > 1 && (
        <label className="mt-3 flex flex-col gap-1 text-sm text-ink">
          Which tab?
          <select
            value={sheetName ?? ""}
            onChange={(e) => chooseSheet(e.target.value)}
            className="rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest"
          >
            {sheets.map((candidate) => {
              const score = budgetScore(candidate.table);
              return (
                <option key={candidate.name} value={candidate.name}>
                  {candidate.name}
                  {score > 0 ? ` — ${score} priced row${score === 1 ? "" : "s"}` : " — nothing priced"}
                </option>
              );
            })}
          </select>
        </label>
      )}

      {/* Budget sheets repeat and misname their headings far more than guest
          lists do -- this file's own test sheet heads Category, Vendor and
          Cost all three "Category" -- so the guess is shown as something to
          correct rather than applied silently. */}
      {sheet && heading.length > 0 && (
        <div className="mt-4 rounded-md border border-hairline bg-card p-4">
          <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
            Which column is which
          </p>
          <p className="mt-1 text-xs text-ink/60">
            Wren guessed from your headings. Change any that look wrong.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELD_ORDER.map((field) => (
              <label key={field} className="flex flex-col gap-1 text-sm text-ink">
                {BUDGET_FIELD_LABELS[field]}
                <select
                  value={columns[field] ?? ""}
                  onChange={(e) => setField(field, e.target.value)}
                  className="rounded-md border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-forest"
                >
                  <option value="">Not in this sheet</option>
                  {heading.map((text, index) => (
                    <option key={index} value={index}>
                      {columnLetter(index)} — {text.trim() || "(no heading)"}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-ink/45">
                  e.g. {BUDGET_HEADING_EXAMPLES[field]}
                </span>
              </label>
            ))}
          </div>
          {derivedColumns.length > 0 && (
            <p className="mt-3 text-xs text-ink/60">
              Wren works these out for you, so they don&apos;t need a column:{" "}
              {derivedColumns.join(", ")}.
            </p>
          )}
          {unknownColumns.length > 0 && (
            <p className="mt-1 text-xs text-ink/60">
              Not read unless you point a field at them: {unknownColumns.join(", ")}.
            </p>
          )}
        </div>
      )}

      {parsed?.error && <p className="mt-3 text-sm text-red-800">{parsed.error}</p>}

      {parsed && !parsed.error && (
        <div className="mt-4">
          <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
            {kept.length} row{kept.length === 1 ? "" : "s"} ready
            {categoryCount > 0 && ` · ${categoryCount} fill a budget line`}
            {parsed.blankRows > 0 &&
              ` · ${parsed.blankRows} blank row${parsed.blankRows === 1 ? "" : "s"} skipped`}
            {removed.size > 0 && ` · ${removed.size} removed`}
            {problems.length > 0 &&
              ` · ${problems.length} need${problems.length === 1 ? "s" : ""} fixing`}
          </p>

          {noPrice > 0 && (
            <p className="mt-1 text-xs text-ink/60">
              {noPrice} row{noPrice === 1 ? " has" : "s have"} no cost yet — they come in at $0 so
              you can fill them later.
            </p>
          )}

          <ul className="mt-2 flex max-h-72 flex-col gap-1 overflow-y-auto">
            {parsed.rows.map((row) => {
              const v = row.values;
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
                    <span className="text-ink">{v.label || "(no name)"}</span>
                    {row.target === "category" && (
                      <span className="ml-1 rounded-full bg-forest/10 px-1.5 py-0.5 text-[10px] text-forest">
                        budget line
                      </span>
                    )}
                    <span className="font-mono-numbers text-ink/50">
                      {v.amount !== null ? ` · ${currency.format(v.amount)}` : " · no cost yet"}
                      {v.paid_amount !== null ? ` · ${currency.format(v.paid_amount)} paid` : ""}
                      {v.due_date ? ` · due ${v.due_date}` : ""}
                    </span>
                    {v.notes && <span className="block text-ink/45">{v.notes}</span>}
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
          {isPending ? "Importing…" : `Import${ready ? ` ${kept.length}` : ""}`}
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
