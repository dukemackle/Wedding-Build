"use client";

import { downloadCsv, toCsv } from "@/lib/csv";

export function ExportCsvButton({
  filename,
  headers,
  rows,
  className,
}: {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(filename, toCsv(headers, rows))}
      className={
        className ??
        "rounded-md border border-hairline px-3 py-1.5 text-sm text-ink/70 transition-colors hover:border-forest"
      }
    >
      Export CSV
    </button>
  );
}
