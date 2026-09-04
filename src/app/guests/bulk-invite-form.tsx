"use client";

import { useState, useTransition } from "react";
import type { Guest } from "@/lib/supabase/types";
import { sendBulkRsvpInvites } from "./actions";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function BulkInviteForm({
  guests,
  publicSlug,
  origin,
}: {
  guests: Guest[];
  publicSlug: string | null;
  origin: string;
}) {
  const invitable = guests.filter((g) => g.email);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(invitable.filter((g) => !g.invite_sent_at).map((g) => g.id)),
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<
    { sent: number; skipped: number; failed: number } | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();

  if (!publicSlug) {
    return (
      <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-forest">Invite guests by email</h2>
        <p className="mt-2 text-sm text-ink/70">
          Turn on your guest site above, then come back here to email guests their RSVP link
          directly instead of sharing it yourself.
        </p>
      </div>
    );
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(invitable.map((g) => g.id)));
  }

  function selectNone() {
    setSelected(new Set());
  }

  function handleSend() {
    if (selected.size === 0) {
      setError("Select at least one guest to invite.");
      return;
    }

    const formData = new FormData();
    selected.forEach((id) => formData.append("guest_id", id));
    formData.set("origin", origin);

    startTransition(async () => {
      const response = await sendBulkRsvpInvites(formData);
      if (response?.error) {
        setError(response.error);
        setResult(undefined);
      } else {
        setError(undefined);
        setResult({
          sent: response.sent ?? 0,
          skipped: response.skipped ?? 0,
          failed: response.failed ?? 0,
        });
      }
    });
  }

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-forest">Invite guests by email</h2>
          <p className="mt-1 text-sm text-ink/70">
            Send guests their RSVP link directly instead of sharing it yourself.{" "}
            {invitable.length} of {guests.length} guests have an email on file.
          </p>
        </div>
        {invitable.length > 0 && (
          <div className="flex gap-3 text-xs">
            <button onClick={selectAll} className="text-brass hover:underline">
              Select all
            </button>
            <button onClick={selectNone} className="text-ink/50 hover:underline">
              Select none
            </button>
          </div>
        )}
      </div>

      {invitable.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">
          None of your guests have an email on file yet — add one from the guest list below.
        </p>
      ) : (
        <>
          <div className="mt-4 max-h-72 overflow-y-auto rounded-md border border-hairline">
            {invitable.map((guest) => (
              <label
                key={guest.id}
                className="flex cursor-pointer items-center justify-between gap-3 border-b border-hairline px-4 py-2.5 last:border-b-0 hover:bg-parchment"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(guest.id)}
                    onChange={() => toggle(guest.id)}
                    className="h-4 w-4 rounded border-hairline"
                  />
                  <span>
                    <span className="text-ink">{guest.name}</span>{" "}
                    <span className="text-xs text-ink/50">{guest.email}</span>
                  </span>
                </span>
                {guest.invite_sent_at && (
                  <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-xs text-ink/50">
                    Invited {formatDate(guest.invite_sent_at)}
                  </span>
                )}
              </label>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
          {result && (
            <p className="mt-3 text-sm text-forest">
              Sent {result.sent} invite{result.sent === 1 ? "" : "s"}
              {result.skipped > 0 ? ` — skipped ${result.skipped} without an email` : ""}
              {result.failed > 0 ? ` — ${result.failed} failed to send` : ""}.
            </p>
          )}

          <div className="mt-4">
            <button
              onClick={handleSend}
              disabled={isPending || selected.size === 0}
              className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "Sending..." : `Send invites (${selected.size})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
