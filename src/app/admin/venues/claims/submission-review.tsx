"use client";

import { useState, useTransition } from "react";
import type { Venue, VenueSubmission } from "@/lib/supabase/types";
import { CLAIM_FIELD_LABELS, detailsFromVenue, type ClaimDetails } from "@/lib/venue-claim";
import { PRICE_BASES, SERVICE_LEVELS, VENDOR_POLICIES } from "@/lib/wedding-options";
import { approveSubmission, rejectSubmission } from "../claim-actions";

function show(key: keyof ClaimDetails, value: ClaimDetails[keyof ClaimDetails]): string {
  if (value === null || value === undefined || value === "") return "";
  if (key === "service_level") return SERVICE_LEVELS[value as keyof typeof SERVICE_LEVELS] ?? String(value);
  if (key === "vendor_policy") return VENDOR_POLICIES[value as keyof typeof VENDOR_POLICIES] ?? String(value);
  if (key === "price_basis") return PRICE_BASES[value as keyof typeof PRICE_BASES] ?? String(value);
  if (key === "price_from") return `$${Number(value).toLocaleString()}`;
  if (key === "price_options" && Array.isArray(value)) {
    return (value as { label: string; amount: number }[]).map((o) => `${o.label} $${o.amount.toLocaleString()}`).join(" · ");
  }
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

export function SubmissionReview({ submission, venue }: { submission: VenueSubmission; venue: Venue }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = detailsFromVenue(venue);
  const keys = Object.keys(CLAIM_FIELD_LABELS) as (keyof ClaimDetails)[];
  const changed = keys.filter((k) => show(k, current[k]) !== show(k, submission.details[k]));
  const livePhotos = new Set([...venue.photo_urls, venue.image_url].filter(Boolean));

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
            {venue.name}
            {venue.source === "self-listed" && (
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
          {venue.contact_email && submission.submitter_email.split("@")[1] !== venue.contact_email.split("@")[1] && (
            <p className="mt-1 text-xs text-brass">
              Their email domain doesn&apos;t match the venue&apos;s ({venue.contact_email}) — worth checking before
              approving.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => act(rejectSubmission)}
            disabled={isPending}
            className="rounded-md border border-hairline px-3 py-1.5 text-sm text-ink hover:border-forest disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => act(approveSubmission)}
            disabled={isPending}
            className="rounded-md bg-forest px-3 py-1.5 text-sm text-parchment hover:bg-forest/90 disabled:opacity-60"
          >
            Approve &amp; publish
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
          {changed.length === 0 ? "No changes to the details" : `${changed.length} changed`}
          {changed.length > 0 && changed.length < keys.length && ` · ${keys.length - changed.length} unchanged`}
        </p>
        {changed.length > 0 && (
          <div className="mt-2 divide-y divide-hairline border-y border-hairline">
            {changed.map((k) => (
              <div key={k} className="grid grid-cols-1 gap-1 py-2 text-sm sm:grid-cols-[140px_1fr_1fr] sm:gap-4">
                <span className="text-ink/55">{CLAIM_FIELD_LABELS[k]}</span>
                <span className="text-ink/45 line-through decoration-ink/25">{show(k, current[k]) || "—"}</span>
                <span className="whitespace-pre-line text-ink">{show(k, submission.details[k]) || "— (cleared)"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Photos ({submission.photo_urls.length})
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {submission.photo_urls.map((url, i) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="relative block">
                {/* eslint-disable-next-line @next/next/no-img-element -- storage URLs under review */}
                <img src={url} alt="" className="aspect-square w-full rounded border border-hairline object-cover" />
                {!livePhotos.has(url) && (
                  <span className="absolute left-1 top-1 rounded bg-brass px-1 text-[9px] uppercase text-ink">New</span>
                )}
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-forest px-1 text-[9px] uppercase text-white">Cover</span>
                )}
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Preferred vendors ({submission.preferred_vendors.length})
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {submission.preferred_vendors.map((v, i) => (
              <li key={i}>
                <span className="text-ink/50">{v.category}:</span>{" "}
                {v.website ? (
                  <a href={v.website} target="_blank" rel="noreferrer" className="text-ink hover:text-brass">
                    {v.name} ↗
                  </a>
                ) : (
                  v.name
                )}
                {v.required && <span className="ml-1.5 text-xs text-ink/50">(required)</span>}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
            Event spaces ({(submission.spaces ?? []).length})
          </p>
          <ul className="mt-2 space-y-2 text-sm">
            {(submission.spaces ?? []).map((sp, i) => (
              <li key={i} className="flex gap-2">
                {sp.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element -- storage URLs under review
                  <img src={sp.photo_url} alt="" className="h-10 w-12 shrink-0 rounded border border-hairline object-cover" />
                )}
                <div>
                  <p className="text-ink">
                    {sp.name}
                    <span className="text-ink/45">
                      {[sp.setting, sp.capacity && `${sp.capacity} guests`].filter(Boolean).map((x) => ` · ${x}`)}
                    </span>
                  </p>
                  {sp.description && <p className="text-ink/60">{sp.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink/50">FAQs ({submission.faqs.length})</p>
          <ul className="mt-2 space-y-2 text-sm">
            {submission.faqs.map((f, i) => (
              <li key={i}>
                <p className="text-ink">{f.question}</p>
                <p className="text-ink/60">{f.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-5 text-xs text-ink/45">
        Approving replaces the listing&apos;s details, photos, spaces, FAQs and preferred vendors with these, and marks it
        confirmed by the venue.
      </p>
    </div>
  );
}
