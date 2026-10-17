"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { MarketListingStatus } from "@/lib/supabase/types";
import { deleteListing, setListingStatus, toggleSave } from "../actions";

const secondary =
  "rounded-md border border-hairline bg-card px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:border-forest disabled:opacity-60";

export function BuyerActions({
  id,
  signedIn,
  saved: initiallySaved,
  available,
}: {
  id: string;
  signedIn: boolean;
  saved: boolean;
  available: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <Link
        href={`/signup?next=/marketplace/${id}`}
        className="block rounded-md bg-forest px-4 py-3 text-center font-medium text-parchment hover:bg-forest/90"
      >
        Sign up free to message the seller
      </Link>
    );
  }

  return (
    <div className="flex gap-2">
      {/* Messaging lands in the next update; until then the button says so
          rather than going nowhere. */}
      <button
        type="button"
        disabled
        title="Messaging is coming in the next update"
        className="flex-1 rounded-md bg-forest px-4 py-3 font-medium text-parchment opacity-60"
      >
        {available ? "Message seller" : "No longer available"}
      </button>
      <button
        type="button"
        disabled={isPending}
        aria-pressed={saved}
        onClick={() => {
          const next = !saved;
          setSaved(next);
          startTransition(async () => {
            const result = await toggleSave(id, next);
            if (result.error) setSaved(!next);
          });
        }}
        className={`${secondary} ${saved ? "text-brass" : ""}`}
      >
        {saved ? "♥ Saved" : "♡ Save"}
      </button>
    </div>
  );
}

export function SellerControls({ id, status }: { id: string; status: MarketListingStatus }) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  if (status === "removed") {
    return (
      <p className="rounded-md border border-hairline bg-card p-3 text-sm text-ink/70">
        This listing was taken down after a report and is hidden from the marketplace. Reply to the email we sent if
        you think that was a mistake.
      </p>
    );
  }

  function run(action: () => Promise<{ error?: string } | void>) {
    startTransition(async () => {
      const result = await action();
      setError(result?.error);
    });
  }

  const statuses: { value: Exclude<MarketListingStatus, "removed">; label: string }[] = [
    { value: "active", label: "Available" },
    { value: "pending", label: "Pending" },
    { value: "sold", label: "Sold" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex rounded-md border border-hairline bg-card p-1" role="radiogroup" aria-label="Listing status">
        {statuses.map((s) => (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={status === s.value}
            disabled={isPending}
            onClick={() => run(() => setListingStatus(id, s.value))}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors ${
              status === s.value ? "bg-forest text-parchment" : "text-forest hover:bg-forest/5"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Link href={`/marketplace/${id}/edit`} className={`${secondary} flex-1 text-center`}>
          Edit listing
        </Link>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (confirm("Delete this listing? This can't be undone.")) run(() => deleteListing(id));
          }}
          className={`${secondary} text-red-700 hover:border-red-700`}
        >
          Delete
        </button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
