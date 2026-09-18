"use client";

import { useState, useTransition } from "react";
import {
  BUDGET_FIELD_LABELS,
  BUDGET_HEADING_EXAMPLES,
  BUDGET_IMPORT_TEMPLATE,
  detectBudgetColumns,
  isUnpricedExtra,
  parseBudgetTable,
  type BudgetColumnMap,
  type BudgetImportParse,
  type BudgetSingleField,
} from "@/lib/budget-import";
import { readTable } from "@/lib/spreadsheet";
import { fetchBudgetSheet, importBudgetRows } from "./actions";

type NamedSheet = { name: string; table: string[][] };

/** Notes is left out: it takes any number of columns, so it gets its own row. */
const FIELD_ORDER: BudgetSingleField[] = [
  "category",
  "purchased_from",
  "amount",
  "paid_amount",
  "deposit_amount",
  "paid_by",
  "due_date",
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
  const [source, setSource] = useState<"file" | "sheet">("file");
  const [sheetUrl, setSheetUrl] = useState("");
  /** Set once a Sheets link has been read, and sent along on import. */
  const [importedFrom, setImportedFrom] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [imported, setImported] = useState<{
    categories: number;
    items: number;
    skipped: number;
    unhidden: string[];
  } | null>(null);
  /** Rows the couple has struck off. Kept out of what's sent. */
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  /** Off by default -- see isUnpricedExtra. */
  const [includeUnpriced, setIncludeUnpriced] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sheet = sheets.find((s) => s.name === sheetName) ?? null;
  const heading = sheet?.table[0] ?? [];

  // Re-parsed on render rather than memoised: the mapping selects are the
  // only thing that changes it, and the React Compiler can't keep a manual
  // memo whose dependency is a grid held in state.
  const parsed: BudgetImportParse | null = sheet ? parseBudgetTable(sheet.table, columns) : null;

  const unpriced = parsed?.rows.filter(isUnpricedExtra) ?? [];
  // Struck-off rows, plus the $0 extras unless they were asked for.
  const skippedLines = new Set(removed);
  if (!includeUnpriced) for (const row of unpriced) skippedLines.add(row.line);

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
    // An upload isn't a link, so don't credit it to whatever was read before.
    setImportedFrom(null);
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

  /**
   * A Google Sheet arrives as one tab's CSV rather than a whole workbook --
   * the gid in the URL says which tab -- so there's nothing to pick between.
   */
  function handleSheetUrl() {
    const url = sheetUrl.trim();
    if (!url) return;
    setError(undefined);
    setImported(null);
    setIsReading(true);
    const formData = new FormData();
    formData.set("sheet_url", url);
    startTransition(async () => {
      const result = await fetchBudgetSheet(formData);
      setIsReading(false);
      if (result.error || !result.table) {
        setSheets([]);
        setSheetName(null);
        setColumns({});
        setImportedFrom(null);
        setError(result.error ?? "Couldn't read that sheet.");
        return;
      }
      const found: NamedSheet[] = [{ name: "Your sheet", table: result.table }];
      setSheets(found);
      setImportedFrom(result.url ?? url);
      loadSheet(found[0]);
    });
  }

  function setField(field: BudgetSingleField, value: string) {
    setColumns((current) => {
      const next = { ...current };
      if (value === "") delete next[field];
      else next[field] = Number(value);
      return next;
    });
    setError(undefined);
  }

  function toggleNoteColumn(index: number) {
    setColumns((current) => {
      const chosen = current.notes ?? [];
      const notes = chosen.includes(index)
        ? chosen.filter((at) => at !== index)
        : [...chosen, index].sort((a, b) => a - b);
      return { ...current, notes };
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
    // A row's line number is its index in the grid, since the header is row 0,
    // so leaving one out is a filter on the original grid.
    const table =
      skippedLines.size === 0
        ? sheet.table
        : sheet.table.filter((_, index) => index === 0 || !skippedLines.has(index));

    const formData = new FormData();
    formData.set("rows", JSON.stringify(table));
    formData.set("columns", JSON.stringify(columns));
    if (importedFrom) formData.set("sheet_url", importedFrom);
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

  const kept = parsed?.rows.filter((row) => !skippedLines.has(row.line)) ?? [];
  const problems = kept.filter((row) => row.errors.length > 0);
  const categoryCount = kept.filter((row) => row.target === "category").length;
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
        Bring your budget in from Excel (.xlsx), CSV, tab-separated text, or a Google Sheet link.
        The first row should be your headings.
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

      <div className="mt-3 flex gap-2">
        {(["file", "sheet"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setSource(option);
              setError(undefined);
            }}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              source === option
                ? "border-forest bg-forest text-parchment"
                : "border-hairline bg-card text-ink hover:border-forest"
            }`}
          >
            {option === "file" ? "Upload file" : "Google Sheet link"}
          </button>
        ))}
      </div>

      {source === "file" ? (
        <input
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="mt-3 block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-card file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-forest"
        />
      ) : (
        <div className="mt-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1 rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink outline-none focus:border-forest"
            />
            <button
              type="button"
              onClick={handleSheetUrl}
              disabled={isReading || isPending || !sheetUrl.trim()}
              className="rounded-md border border-hairline px-4 py-2 text-sm font-medium text-forest transition-colors hover:border-forest disabled:opacity-50"
            >
              Read sheet
            </button>
          </div>
          <p className="mt-1 text-xs text-ink/60">
            Copy the URL from the tab you want — the address bar carries which tab you&apos;re on.
            Wren keeps the link so you can reopen the sheet from this page.
          </p>
          {/* Worth saying plainly: link-importing a budget means costs and
              vendor names are readable by anyone who has the URL. */}
          <p className="mt-1 text-xs text-ink/60">
            Reading a sheet this way needs its sharing set to &ldquo;Anyone with the link,&rdquo;
            which makes your costs and vendors visible to anyone who has it. You can set it back to
            private afterwards, or upload the file instead, which never leaves it shared.
          </p>
        </div>
      )}

      {isReading && (
        <p className="mt-3 text-sm text-ink/60">
          Reading {source === "file" ? fileName : "your sheet"}…
        </p>
      )}

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

          {/* Notes takes as many columns as it likes: a budget sheet keeps its
              prose spread across a Discount/Deal, a Deposits and a payment-terms
              column, and all of it belongs on the line. */}
          <div className="mt-3 border-t border-hairline pt-3">
            <p className="text-sm text-ink">Keep as notes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {heading.map((text, index) => {
                const checked = (columns.notes ?? []).includes(index);
                return (
                  <label
                    key={index}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                      checked
                        ? "border-forest bg-forest/5 text-forest"
                        : "border-hairline text-ink/60 hover:border-forest"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleNoteColumn(index)}
                      className="h-3 w-3 accent-[var(--color-forest)]"
                    />
                    {columnLetter(index)} — {text.trim() || "(no heading)"}
                  </label>
                );
              })}
            </div>
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
            {!includeUnpriced &&
              unpriced.length > 0 &&
              ` · ${unpriced.length} with no cost set aside`}
            {problems.length > 0 &&
              ` · ${problems.length} need${problems.length === 1 ? "s" : ""} fixing`}
          </p>

          {/* A budget full of $0 lines looks like the spreadsheet they were
              trying to leave, so these wait to be asked for. */}
          {unpriced.length > 0 && (
            <label className="mt-2 flex cursor-pointer items-start gap-2 text-xs text-ink/70">
              <input
                type="checkbox"
                checked={includeUnpriced}
                onChange={(e) => setIncludeUnpriced(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 accent-[var(--color-forest)]"
              />
              <span>
                Also bring in {unpriced.length} row{unpriced.length === 1 ? "" : "s"} with no cost
                yet — {unpriced.length === 1 ? "it" : "they"} would come in at $0 for you to fill in
                later.
              </span>
            </label>
          )}

          <ul className="mt-2 flex max-h-72 flex-col gap-1 overflow-y-auto">
            {parsed.rows.map((row) => {
              const v = row.values;
              const isRemoved = removed.has(row.line);
              // Held back by the no-cost rule rather than by the couple.
              const isSetAside = !isRemoved && skippedLines.has(row.line);
              const skipped = isRemoved || isSetAside;
              const hasProblem = row.errors.length > 0;
              return (
                <li
                  key={row.line}
                  className={`flex items-start justify-between gap-3 rounded border px-2 py-1.5 text-xs ${
                    skipped
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
                    {!skipped &&
                      row.errors.map((message) => (
                        <span key={message} className="mt-0.5 block text-red-800">
                          {message}
                        </span>
                      ))}
                  </span>
                  {isSetAside ? (
                    <span className="shrink-0 whitespace-nowrap text-[11px] text-ink/40">
                      not importing
                    </span>
                  ) : (
                    /* A row we flagged but the couple knows is junk -- let them
                       strike it off here rather than going back to the file. */
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
                  )}
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
