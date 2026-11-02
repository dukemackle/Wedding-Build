"use client";

import { useState, useTransition } from "react";
import { formatWeddingDate } from "@/lib/marketplace";
import type { MarketRentalBooking } from "@/lib/supabase/types";
import { addRentalBooking, removeRentalBooking } from "../actions";

/**
 * The seller's booked dates on a rental, so couples planning that day see it
 * isn't free. Dates only: who it's lent to stays in messages.
 */
export function RentalBookings({ listingId, bookings }: { listingId: string; bookings: MarketRentalBooking[] }) {
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string }>, after?: () => void) {
    startTransition(async () => {
      const result = await action();
      setError(result.error);
      if (!result.error) after?.();
    });
  }

  const input = "w-full rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink focus:border-forest focus:outline-none";

  return (
    <section className="mt-4 rounded-xl border border-hairline bg-card p-4">
      <h2 className="text-sm font-semibold text-forest">Booked dates</h2>
      <p className="mt-0.5 text-xs text-ink/55">Mark when it&apos;s out, so couples marrying then know it isn&apos;t free.</p>
      {bookings.length > 0 && (
        <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
          {bookings.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-ink">
                {formatWeddingDate(b.starts_on)}
                {b.ends_on !== b.starts_on && <> – {formatWeddingDate(b.ends_on)}</>}
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => removeRentalBooking(listingId, b.id))}
                className="text-xs text-[#2243B6] hover:underline disabled:opacity-60"
              >
                Free up
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => addRentalBooking(listingId, startsOn, endsOn || startsOn),
            () => {
              setStartsOn("");
              setEndsOn("");
            },
          );
        }}
      >
        <label className="text-xs text-ink/60">
          Out from
          <input type="date" required value={startsOn} onChange={(e) => setStartsOn(e.target.value)} className={`mt-1 ${input}`} />
        </label>
        <label className="text-xs text-ink/60">
          Back by
          <input type="date" value={endsOn} min={startsOn || undefined} onChange={(e) => setEndsOn(e.target.value)} className={`mt-1 ${input}`} />
        </label>
        <button
          type="submit"
          disabled={isPending || !startsOn}
          className="col-span-2 rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment hover:bg-forest/90 disabled:opacity-60 sm:col-span-1"
        >
          Mark booked
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </section>
  );
}
