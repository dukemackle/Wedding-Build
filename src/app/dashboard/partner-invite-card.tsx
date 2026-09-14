"use client";

import { useState, useTransition } from "react";
import { generateInviteLink, revokeInviteLink, removePartner } from "./actions";

const SITE_URL = "https://wrenwed.com";

export function PartnerInviteCard({
  inviteToken,
  hasPartner,
}: {
  inviteToken: string | null;
  hasPartner: boolean;
}) {
  const [token, setToken] = useState(inviteToken);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const link = token ? `${SITE_URL}/join-wedding?token=${token}` : null;

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied -- nothing to fall back to here
    }
  }

  function handleGenerate() {
    startTransition(async () => {
      const result = await generateInviteLink();
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setToken(result.token ?? null);
      }
    });
  }

  function handleRevoke() {
    if (!confirm("Revoke this invite link? It will stop working immediately.")) return;
    startTransition(async () => {
      const result = await revokeInviteLink();
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setToken(null);
      }
    });
  }

  function handleRemovePartner() {
    if (!confirm("Remove your partner's access to this wedding?")) return;
    startTransition(async () => {
      const result = await removePartner();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-8 w-full max-w-2xl rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
        Wedding access
      </p>

      {hasPartner ? (
        <>
          <h2 className="mt-2 font-display text-xl font-semibold text-forest">
            Your partner has full access
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            They can view and edit everything on this wedding -- guest list, budget, seating, all
            of it.
          </p>
          <button
            type="button"
            onClick={handleRemovePartner}
            disabled={isPending}
            className="mt-4 text-sm text-ink/50 hover:underline disabled:opacity-60"
          >
            Remove their access
          </button>
        </>
      ) : (
        <>
          <h2 className="mt-2 font-display text-xl font-semibold text-forest">
            Invite your partner
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Share a link so they can log in or sign up and get full access to this wedding --
            no shared password needed.
          </p>

          {link ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="min-w-0 flex-1 truncate rounded-md bg-forest/10 px-4 py-2 font-mono-numbers text-sm text-forest">
                {link}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-md border border-hairline px-3 py-2 text-sm text-ink transition-colors hover:border-forest"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isPending}
                className="text-sm text-brass hover:underline disabled:opacity-60"
              >
                Get a new link
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                disabled={isPending}
                className="text-sm text-ink/50 hover:underline disabled:opacity-60"
              >
                Revoke
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isPending}
              className="mt-4 rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "Generating..." : "Get invite link"}
            </button>
          )}
        </>
      )}

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
    </div>
  );
}
