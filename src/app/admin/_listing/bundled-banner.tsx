"use client";

import { useState, useTransition } from "react";

// Offers the batches shipped with the app (src/lib/venue-batches.ts and
// vendor-batches.ts) that aren't in the database yet, so a new batch is one
// click, not a paste.
export function BundledBanner({
  count,
  summary,
  noun,
  livePath,
  add,
}: {
  count: number;
  /** What the batch is, most-represented first: towns, or categories. */
  summary: string[];
  noun: "venue" | "vendor";
  livePath: string;
  add: () => Promise<{ error?: string; imported?: number; remaining?: number }>;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [imported, setImported] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setError(undefined);
    startTransition(async () => {
      // Each call adds a few towns' worth (Cloudflare caps the lookups one
      // request can make), so keep calling until nothing is left.
      let total = 0;
      for (;;) {
        const result = await add();
        if (result.error) {
          setError(total > 0 ? `Added ${total}, then: ${result.error}` : result.error);
          return;
        }
        total += result.imported ?? 0;
        setProgress(total);
        if (!result.remaining) break;
        if (!result.imported) {
          setError(`Added ${total}, but the rest wouldn't go in. Reload and try again.`);
          return;
        }
      }
      setImported(total);
    });
  }

  if (imported !== null) {
    return (
      <p className="mb-4 rounded-md border border-hairline bg-parchment px-4 py-3 text-sm text-forest">
        Added {imported} {imported === 1 ? noun : `${noun}s`}. They&apos;re live on {livePath} now.
      </p>
    );
  }

  return (
    <div className="mb-4 rounded-md border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p>
            {count} new {count === 1 ? `${noun} is` : `${noun}s are`} ready to add
          </p>
          <p className="mt-0.5 text-xs text-ink/55">
            {summary.slice(0, 6).join(", ")}
            {summary.length > 6 && ` and ${summary.length - 6} more`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending}
          className="shrink-0 self-start rounded-md bg-forest px-3 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60 sm:self-auto"
        >
          {isPending ? `Adding… ${progress} of ${count}` : "Add them"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-800">{error}</p>}
    </div>
  );
}
