"use client";

import { useState, useTransition } from "react";
import { reportListing } from "@/lib/listing-report-actions";
import { REPORT_REASONS } from "@/lib/listing-report-reasons";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";

/** A quiet "Something wrong?" under a listing's header that opens a short report form. */
export function ReportListing({ listingType, listingId }: { listingType: "venue" | "vendor"; listingId: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return <p className="mt-1 text-xs text-forest/80">Thanks. We&apos;ll check it and fix the listing.</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="mt-1 text-xs text-ink/50 underline-offset-2 hover:text-ink hover:underline">
        Something wrong with this listing?
      </button>
    );
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await reportListing(formData);
      if (result.error) setError(result.error);
      else setSent(true);
    });
  }

  return (
    <form action={handleSubmit} className="relative mt-3 flex max-w-md flex-col gap-3 rounded-lg border border-hairline bg-card p-4">
      <input type="hidden" name="listing_type" value={listingType} />
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-px w-px opacity-0" />
      <label className="flex flex-col gap-1 text-sm text-ink">
        What&apos;s wrong?
        <select name="reason" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose one
          </option>
          {REPORT_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Details <span className="text-ink/50">(optional)</span>
        <textarea name="details" rows={2} maxLength={1000} className={inputClass} placeholder="What did you find?" />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        Your email <span className="text-ink/50">(optional, only if we may ask you about it)</span>
        <input type="email" name="reporter_email" maxLength={200} className={inputClass} />
      </label>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send report"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink/60 hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}
