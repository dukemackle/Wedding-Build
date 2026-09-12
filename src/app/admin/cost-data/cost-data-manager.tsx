"use client";

import { useMemo, useState, useTransition } from "react";
import type { RegionalCostData } from "@/lib/supabase/types";
import { downloadCsv, toCsv } from "@/lib/csv";
import { importRegionalCostData } from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CostDataBrowser({
  categoryOptions,
  rows,
}: {
  categoryOptions: { key: string; label: string }[];
  rows: RegionalCostData[];
}) {
  const [categoryKey, setCategoryKey] = useState(categoryOptions[0]?.key ?? "");

  const filteredRows = useMemo(
    () =>
      rows
        .filter((row) => row.category_key === categoryKey)
        .sort((a, b) => a.state.localeCompare(b.state)),
    [rows, categoryKey],
  );

  function handleExport() {
    const label = categoryOptions.find((c) => c.key === categoryKey)?.label ?? categoryKey;
    const csv = toCsv(
      ["State", "Simple", "Classic", "Luxury", "Per guest", "Source", "Last updated", "Notes"],
      filteredRows.map((row) => [
        row.state,
        row.simple_amount ?? "",
        row.classic_amount ?? "",
        row.luxury_amount ?? "",
        row.per_guest ? "yes" : "no",
        row.source ?? "",
        formatDate(row.updated_at),
        row.notes ?? "",
      ]),
    );
    downloadCsv(`${label.toLowerCase().replace(/\s+/g, "-")}-cost-data.csv`, csv);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={categoryKey}
          onChange={(e) => setCategoryKey(e.target.value)}
          className={inputClass}
        >
          {categoryOptions.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-ink/60">{filteredRows.length} states</p>
        <button
          type="button"
          onClick={handleExport}
          disabled={filteredRows.length === 0}
          className="rounded-md border border-hairline px-3 py-1.5 text-sm text-ink/70 transition-colors hover:border-forest disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-sm text-ink/50">No data imported for this category yet.</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-2 font-medium">State</th>
                <th className="px-4 py-2 font-medium">Simple</th>
                <th className="px-4 py-2 font-medium">Classic</th>
                <th className="px-4 py-2 font-medium">Luxury</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-4 py-2 text-ink">{row.state}</td>
                  <td className="px-4 py-2 font-mono-numbers text-ink/70">
                    {row.simple_amount ?? "—"}
                  </td>
                  <td className="px-4 py-2 font-mono-numbers text-ink/70">
                    {row.classic_amount ?? "—"}
                  </td>
                  <td className="px-4 py-2 font-mono-numbers text-ink/70">
                    {row.luxury_amount ?? "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-2 text-xs text-ink/50" title={row.source ?? ""}>
                    {row.source ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-ink/50">{formatDate(row.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ImportForm({
  categoryOptions,
}: {
  categoryOptions: { key: string; label: string }[];
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<{ imported: number; skipped: number } | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await importRegionalCostData(formData);
      if (res.error) {
        setError(res.error);
        setResult(undefined);
      } else {
        setError(undefined);
        setResult({ imported: res.imported ?? 0, skipped: res.skipped ?? 0 });
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-ink">
        Category
        <select name="category_key" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Which category tab is this CSV from?
          </option>
          {categoryOptions.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        CSV file
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className={inputClass}
        />
        <span className="text-xs text-ink/50">
          Export one tab of the cost-data workbook as CSV and upload it here -- the title row
          above the headers is handled automatically.
        </span>
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      {result && (
        <p className="text-sm text-forest">
          Imported {result.imported} state{result.imported === 1 ? "" : "s"}
          {result.skipped > 0 &&
            ` -- ${result.skipped} row${result.skipped === 1 ? "" : "s"} skipped (no state match or no data filled in).`}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Importing..." : "Import"}
        </button>
      </div>
    </form>
  );
}
