"use client";

import { useState, useTransition } from "react";
import { importRegionalCostData } from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";

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
