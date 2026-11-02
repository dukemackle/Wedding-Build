"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { MarketListingStatus } from "@/lib/supabase/types";
import { deleteSet, setSetStatus } from "../../set-actions";

const button =
  "rounded-md border border-hairline bg-card px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:border-forest disabled:opacity-60";

/** The seller's own set: edit it, mark it pending or sold, or take it down. */
export function SetControls({ id, status }: { id: string; status: MarketListingStatus }) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string }>) {
    setError(undefined);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Link href={`/marketplace/sets/${id}/edit`} className="rounded-md bg-forest px-4 py-2.5 text-sm font-medium text-parchment hover:bg-forest/90">
          Edit set
        </Link>
        {status === "active" && (
          <button type="button" disabled={isPending} onClick={() => run(() => setSetStatus(id, "pending"))} className={button}>
            Mark pending
          </button>
        )}
        {status === "pending" && (
          <button type="button" disabled={isPending} onClick={() => run(() => setSetStatus(id, "active"))} className={button}>
            Available again
          </button>
        )}
        {status !== "sold" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm("Mark the whole set sold? Every piece in it is marked sold too.")) run(() => setSetStatus(id, "sold"));
            }}
            className={button}
          >
            Sold as a set
          </button>
        )}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Take the set down? The pieces stay listed on their own.")) run(() => deleteSet(id));
        }}
        className="text-xs text-ink/50 hover:text-forest hover:underline"
      >
        Take the set down
      </button>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}
