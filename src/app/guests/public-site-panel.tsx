"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { RsvpSubmission } from "@/lib/supabase/types";
import {
  approveRsvpSubmission,
  dismissRsvpSubmission,
  disablePublicSite,
  enablePublicSite,
} from "./actions";

function SubmissionRow({ submission }: { submission: RsvpSubmission }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [handled, setHandled] = useState(false);

  function handleApprove() {
    const formData = new FormData();
    formData.set("submission_id", submission.id);
    startTransition(async () => {
      const result = await approveRsvpSubmission(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setHandled(true);
      }
    });
  }

  function handleDismiss() {
    const formData = new FormData();
    formData.set("submission_id", submission.id);
    startTransition(async () => {
      const result = await dismissRsvpSubmission(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setHandled(true);
      }
    });
  }

  if (handled) return null;

  return (
    <div className="border-b border-hairline py-4 last:border-b-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex gap-3">
          {submission.photo_url && (
            <Image
              src={submission.photo_url}
              alt={submission.guest_name}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full border border-hairline object-cover"
            />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ink">{submission.guest_name}</span>
              {submission.plus_one && (
                <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-ink/60">
                  +1
                </span>
              )}
              <span
                className={`rounded-full border px-2 py-0.5 text-xs ${
                  submission.status === "confirmed"
                    ? "border-forest/40 bg-forest/10 text-forest"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {submission.status === "confirmed" ? "Attending" : "Not attending"}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink/50">
              {[submission.household, submission.meal].filter(Boolean).join(" · ") || "—"}
            </p>
            {submission.notes && (
              <p className="mt-1 text-sm text-ink/70">Private note: {submission.notes}</p>
            )}
            {submission.message && (
              <p className="mt-1 text-sm text-ink/70">Message: {submission.message}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="text-xs text-brass hover:underline disabled:opacity-60"
          >
            Add to guest list
          </button>
          <button
            onClick={handleDismiss}
            disabled={isPending}
            className="text-xs text-ink/50 hover:underline disabled:opacity-60"
          >
            Dismiss
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
    </div>
  );
}

export function PublicSitePanel({
  publicSlug,
  origin,
  pendingSubmissions,
}: {
  publicSlug: string | null;
  origin: string;
  pendingSubmissions: RsvpSubmission[];
}) {
  const [slug, setSlug] = useState(publicSlug);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const shareUrl = slug ? `${origin}/w/${slug}` : null;

  function handleEnable() {
    startTransition(async () => {
      const result = await enablePublicSite();
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setSlug(result.slug ?? null);
      }
    });
  }

  function handleDisable() {
    if (!confirm("Turn off the guest site? The link will stop working.")) return;
    startTransition(async () => {
      const result = await disablePublicSite();
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setSlug(null);
      }
    });
  }

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Guest site</h2>
          <p className="mt-1 text-sm text-ink/70">
            A public page (no login needed) where invited guests can view your
            registry and RSVP themselves.
          </p>
        </div>
        {slug ? (
          <button
            onClick={handleDisable}
            disabled={isPending}
            className="rounded-full border border-hairline bg-parchment px-4 py-1.5 font-mono-numbers text-sm text-ink transition-colors hover:border-forest disabled:opacity-60"
          >
            Turn off
          </button>
        ) : (
          <button
            onClick={handleEnable}
            disabled={isPending}
            className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            {isPending ? "Creating link..." : "Turn on"}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}

      {shareUrl && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-hairline bg-parchment px-3 py-2">
          <code className="flex-1 truncate text-sm text-ink">{shareUrl}</code>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-md border border-hairline bg-card px-3 py-1 text-xs text-forest transition-colors hover:border-forest"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}

      {slug && pendingSubmissions.length > 0 && (
        <div className="mt-6 border-t border-hairline pt-6">
          <h3 className="text-sm font-medium uppercase tracking-wide text-ink/50">
            New RSVPs ({pendingSubmissions.length})
          </h3>
          <div className="mt-2">
            {pendingSubmissions.map((submission) => (
              <SubmissionRow key={submission.id} submission={submission} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
