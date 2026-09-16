"use client";

import { useMemo, useState, useTransition } from "react";
import { parseVenueTable, VENUE_IMPORT_TEMPLATE } from "@/lib/venue-import";
import { importVenues } from "./actions";

const HELP = [
  "Paste straight from a spreadsheet, or paste CSV.",
  "The first row must be headings. Only Name is required — leave out any column you don't have.",
  "Headings are matched loosely, so “Max guests”, “Email” and “Type” all land in the right place.",
];

export function VenueImportPanel({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [imported, setImported] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // The same parser the server action runs. This preview is only a
  // convenience -- the action re-parses the raw text and decides for itself.
  const parsed = useMemo(() => (text.trim() ? parseVenueTable(text) : null), [text]);
  const problems = parsed?.rows.filter((row) => row.errors.length > 0) ?? [];
  const ready = parsed && !parsed.error && parsed.rows.length > 0 && problems.length === 0;

  function handleImport() {
    const formData = new FormData();
    formData.set("table", text);
    setError(undefined);
    startTransition(async () => {
      const result = await importVenues(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setImported(result.imported ?? 0);
      setText("");
    });
  }

  if (imported !== null) {
    return (
      <div className="rounded-md border border-hairline bg-parchment p-4">
        <p className="text-sm text-forest">
          Imported {imported} {imported === 1 ? "venue" : "venues"}. They&apos;re live on /venues
          straight away — switch any of them off below if you need to.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-3 rounded-md bg-forest px-3 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-hairline bg-parchment p-4">
      <p className="text-sm font-medium text-ink">Paste a spreadsheet of venues</p>
      <ul className="mt-2 flex flex-col gap-1">
        {HELP.map((line) => (
          <li key={line} className="text-xs text-ink/60">
            {line}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(VENUE_IMPORT_TEMPLATE)}
        className="mt-2 text-xs text-brass hover:underline"
      >
        Copy a heading row to start from
      </button>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError(undefined);
        }}
        rows={8}
        spellCheck={false}
        placeholder={"Name\tCity\tState\tCapacity\nAberdeen Barn\tBend\tOregon\t180"}
        className="mt-3 w-full rounded-md border border-hairline bg-card px-3 py-2 font-mono-numbers text-xs text-ink outline-none transition-colors focus:border-forest"
      />

      {parsed?.error && <p className="mt-2 text-sm text-red-800">{parsed.error}</p>}

      {parsed && !parsed.error && (
        <div className="mt-3">
          <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
            {parsed.rows.length} {parsed.rows.length === 1 ? "venue" : "venues"} read
            {problems.length > 0 && ` · ${problems.length} need${problems.length === 1 ? "s" : ""} fixing`}
          </p>

          {parsed.unknownColumns.length > 0 && (
            <p className="mt-1 text-xs text-ink/60">
              Ignored {parsed.unknownColumns.length === 1 ? "column" : "columns"}:{" "}
              {parsed.unknownColumns.join(", ")}
            </p>
          )}

          <ul className="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto">
            {parsed.rows.map((row) => (
              <li
                key={row.line}
                className={`rounded border px-2 py-1.5 text-xs ${
                  row.errors.length > 0
                    ? "border-red-200 bg-red-50"
                    : "border-hairline bg-card"
                }`}
              >
                <span className="font-mono-numbers text-ink/40">{row.line}.</span>{" "}
                <span className="text-ink">{row.values.name || "(no name)"}</span>
                <span className="text-ink/50">
                  {[row.values.city, row.values.state].filter(Boolean).join(", ") &&
                    ` — ${[row.values.city, row.values.state].filter(Boolean).join(", ")}`}
                  {row.values.capacity ? ` · ${row.values.capacity} guests` : ""}
                </span>
                {row.errors.map((message) => (
                  <span key={message} className="mt-0.5 block text-red-800">
                    {message}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={!ready || isPending}
          className="rounded-md bg-forest px-3 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50"
        >
          {isPending
            ? "Importing…"
            : `Import${parsed && ready ? ` ${parsed.rows.length}` : ""}`}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-3 py-1.5 text-sm text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
        {problems.length > 0 && (
          <span className="text-xs text-ink/60">
            Fix the rows in red first — nothing imports until they all pass.
          </span>
        )}
      </div>
    </div>
  );
}
