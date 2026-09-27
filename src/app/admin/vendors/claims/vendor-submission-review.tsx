"use client";

import { useState, useTransition } from "react";
import type { Vendor, VendorSubmission } from "@/lib/supabase/types";
import { detailsFromVendor, type VendorClaimDetails } from "@/lib/vendor-claim";
import { approveVendorSubmission, rejectVendorSubmission } from "../claim-actions";

const LABELS: Record<keyof VendorClaimDetails, string> = {
  name: "Name",
  category: "Main service",
  city: "Town",
  state: "State",
  price_tier: "Price level",
  description: "Short description",
  about: "About",
  included: "What's included",
  contact_email: "Email",
};

export function VendorSubmissionReview({ submission, vendor }: { submission: VendorSubmission; vendor: Vendor }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isNew = vendor.source === "self-listed";
  const current = detailsFromVendor(vendor);
  const keys = Object.keys(LABELS) as (keyof VendorClaimDetails)[];
  // A new listing has nothing live to compare against: show every field it filled in.
  const shown = isNew
    ? keys.filter((k) => submission.details[k])
    : keys.filter((k) => (current[k] ?? "") !== (submission.details[k] ?? ""));
  const photoChanged = submission.photo_url !== vendor.image_url;

  function act(action: (id: string) => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action(submission.id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-forest">
            {submission.details.name}
            {isNew && (
              <span className="ml-2 rounded-full bg-brass/15 px-2 py-0.5 align-middle font-body text-xs font-medium text-brass">
                New listing
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-ink/60">
            From {submission.submitter_name}
            {submission.submitter_role && `, ${submission.submitter_role}`} ·{" "}
            <a href={`mailto:${submission.submitter_email}`} className="text-brass hover:underline">
              {submission.submitter_email}
            </a>{" "}
            · {new Date(submission.created_at).toLocaleDateString()}
          </p>
          {isNew && (
            <p className="mt-1 text-xs text-ink/55">
              Listed itself — worth checking the business is real (website, Instagram) before publishing.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => act(rejectVendorSubmission)}
            disabled={isPending}
            className="rounded-md border border-hairline px-3 py-1.5 text-sm text-ink hover:border-forest disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => act(approveVendorSubmission)}
            disabled={isPending}
            className="rounded-md bg-forest px-3 py-1.5 text-sm text-parchment hover:bg-forest/90 disabled:opacity-60"
          >
            Approve &amp; publish
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
        <dl className="divide-y divide-hairline text-sm">
          {shown.length === 0 && <p className="text-ink/55">No changes to the details.</p>}
          {shown.map((k) => (
            <div key={k} className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink/50">{LABELS[k]}</dt>
              <dd className="whitespace-pre-line text-ink">
                {!isNew && current[k] && <span className="mr-2 text-ink/40 line-through">{current[k]}</span>}
                {submission.details[k] || <span className="text-ink/40">(removed)</span>}
              </dd>
            </div>
          ))}
        </dl>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Photo{photoChanged && !isNew ? " (changed)" : ""}
          </p>
          {submission.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- storage URL
            <img src={submission.photo_url} alt="" className="mt-2 aspect-[16/10] w-full rounded-md border border-hairline object-cover" />
          ) : (
            <p className="mt-2 text-sm text-ink/45">None</p>
          )}
        </div>
      </div>
    </div>
  );
}
