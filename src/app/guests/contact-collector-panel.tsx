"use client";

import { useState, useTransition } from "react";
import type { ContactSubmission, Guest } from "@/lib/supabase/types";
import { applyContactSubmission, dismissContactSubmission } from "./contact-actions";

/**
 * Best-effort guess at which guest a submission belongs to.
 *
 * Exact email first, then exact case-insensitive name. Nothing fuzzier:
 * a guest list is full of the cases fuzzy matching gets wrong -- two Sarah
 * Millers, or a "Rob" on the list who submits as "Robert". This only
 * pre-selects a dropdown the couple still confirms.
 */
function suggestMatch(submission: ContactSubmission, guests: Guest[]) {
  if (submission.email) {
    const email = submission.email.toLowerCase();
    const byEmail = guests.find((g) => g.email?.toLowerCase() === email);
    if (byEmail) return byEmail.id;
  }
  const name = submission.name.trim().toLowerCase();
  return guests.find((g) => g.name.trim().toLowerCase() === name)?.id ?? "";
}

function formatAddress(s: ContactSubmission) {
  const cityLine = [s.city, s.state].filter(Boolean).join(", ");
  return [s.address_line1, s.address_line2, [cityLine, s.postal_code].filter(Boolean).join(" "), s.country]
    .filter(Boolean)
    .join(" · ");
}

function SubmissionCard({
  submission,
  guests,
}: {
  submission: ContactSubmission;
  guests: Guest[];
}) {
  const [guestId, setGuestId] = useState(() => suggestMatch(submission, guests));
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const address = formatAddress(submission);
  const matched = guests.find((g) => g.id === guestId);

  function run(action: (fd: FormData) => Promise<{ error?: string }>, withGuest: boolean) {
    const formData = new FormData();
    formData.set("id", submission.id);
    if (withGuest && guestId) formData.set("guest_id", guestId);
    setError(undefined);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <li className="rounded-md border border-hairline bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium text-ink">{submission.name}</p>
        <p className="font-mono-numbers text-[11px] text-ink/50">
          {new Date(submission.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      {address && <p className="mt-1 text-sm text-ink/70">{address}</p>}
      {(submission.email || submission.phone) && (
        <p className="mt-0.5 text-sm text-ink/55">
          {[submission.email, submission.phone].filter(Boolean).join(" · ")}
        </p>
      )}
      {submission.note && (
        <p className="mt-2 text-sm italic text-ink/70">&ldquo;{submission.note}&rdquo;</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={guestId}
          onChange={(e) => setGuestId(e.target.value)}
          aria-label={`Match ${submission.name} to a guest`}
          className="rounded-md border border-hairline bg-parchment px-2 py-1.5 text-sm text-ink outline-none focus:border-forest"
        >
          <option value="">Add as a new guest</option>
          {guests.map((guest) => (
            <option key={guest.id} value={guest.id}>
              Update {guest.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => run(applyContactSubmission, true)}
          disabled={isPending}
          className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : matched ? "Update" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => run(dismissContactSubmission, false)}
          disabled={isPending}
          className="rounded-full border border-hairline px-4 py-1.5 font-mono-numbers text-sm text-ink/70 transition-colors hover:border-forest hover:text-forest disabled:opacity-50"
        >
          Dismiss
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </li>
  );
}

export function ContactCollectorPanel({
  slug,
  origin,
  submissions,
  guests,
  missingAddressCount,
}: {
  slug: string | null;
  origin: string;
  submissions: ContactSubmission[];
  guests: Guest[];
  missingAddressCount: number;
}) {
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const shareUrl = slug ? `${origin}/w/${slug}/contact` : null;

  /**
   * The link with words around it, ready to paste into a group chat.
   *
   * The bare URL is what you send one person who already knows why. Reaching
   * everyone means a family thread or a story, and there the link needs to
   * explain itself -- most people won't tap an unexplained address form from
   * someone they haven't spoken to since last Christmas.
   *
   * Written to be edited: names are the couple's own to add, and a message
   * that sounds like them beats one that sounds like Wren.
   */
  const shareMessage = shareUrl
    ? `We're getting married! Send us your address (and the best email and phone for you) so we can get your invitation out: ${shareUrl}`
    : null;

  return (
    <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-5 shadow-sm sm:p-8">
      <h2 className="font-display text-2xl font-semibold text-forest">Collect addresses</h2>
      <p className="mt-1 max-w-2xl text-sm text-ink/70">
        Send this link instead of asking everyone individually. Guests fill in their own
        address, and you approve each one before it reaches your list.
      </p>

      {shareUrl ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md border border-hairline bg-parchment px-3 py-2 font-mono-numbers text-sm text-ink">
            {shareUrl}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-full border border-hairline px-4 py-2 font-mono-numbers text-sm text-forest transition-colors hover:border-forest"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : (
        // The link lives under the public wedding site's slug, so it can't
        // exist before that does.
        <p className="mt-4 rounded-md border border-hairline bg-parchment p-3 text-sm text-ink/70">
          Turn on your guest site above to get a link you can share.
        </p>
      )}

      {shareMessage && (
        <div className="mt-3 rounded-md border border-hairline bg-parchment p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="min-w-0 flex-1 text-sm text-ink/75">{shareMessage}</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(shareMessage);
                setMessageCopied(true);
                setTimeout(() => setMessageCopied(false), 2000);
              }}
              className="shrink-0 rounded-full border border-hairline bg-card px-4 py-1.5 font-mono-numbers text-sm text-forest transition-colors hover:border-forest"
            >
              {messageCopied ? "Copied" : "Copy message"}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink/55">
            Paste it into your family group chat, a story, or a text — it reaches people who
            aren&apos;t on your list yet, which is most of the ones whose address you&apos;re
            missing.
          </p>
        </div>
      )}

      {missingAddressCount > 0 && (
        <p className="mt-3 font-mono-numbers text-[11px] text-ink/55">
          {missingAddressCount} {missingAddressCount === 1 ? "guest is" : "guests are"} still
          missing an address.
        </p>
      )}

      {/* A plain outbound link, deliberately not an affiliate one: Wren's
          claim is that it takes nothing from couples, and a tracked link
          that pays us would quietly stop that being true. */}
      <p className="mt-4 border-t border-hairline pt-4 text-sm text-ink/60">
        Designing the invitation itself?{" "}
        <a
          href="https://www.canva.com/wedding-invitations/templates/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brass hover:underline"
        >
          Browse Canva&apos;s wedding templates &#8599;
        </a>
      </p>

      {submissions.length > 0 && (
        <div className="mt-6 border-t border-hairline pt-5">
          <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
            {submissions.length} waiting for you
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} guests={guests} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
