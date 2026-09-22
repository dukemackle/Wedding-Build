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
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(invitable.filter((g) => !g.invite_sent_at).map((g) => g.id)),
  );
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<
    { sent: number; skipped: number; failed: number } | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();

  const shown = invitable.filter((g) =>
    g.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  if (!publicSlug) {
    return (
      <p className="text-sm text-ink/70">
        Turn on your guest site, then come back here to email guests their RSVP link directly
        instead of sharing it yourself.
      </p>
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
    setSelected(new Set(shown.map((g) => g.id)));
  }

  /** Back to the default: everyone who hasn't already had one. */
  function selectNotYetInvited() {
    setSelected(new Set(invitable.filter((g) => !g.invite_sent_at).map((g) => g.id)));
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-ink/70">
            Send guests their RSVP link directly instead of sharing it yourself.{" "}
            {invitable.length} of {guests.length} guests have an email on file.
          </p>
        </div>
        {invitable.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs">
            <button onClick={selectAll} className="text-brass hover:underline">
              {search ? "Select these" : "Select all"}
            </button>
            <button onClick={selectNotYetInvited} className="text-brass hover:underline">
              Not yet invited
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
          {/* A 270-name list in a 288px scroller needs a way in. */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search these guests by name..."
            className="mt-4 w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest"
          />

          <div className="mt-2 max-h-72 overflow-y-auto rounded-md border border-hairline">
            {shown.length === 0 && (
              <p className="px-4 py-3 text-sm text-ink/50">No guests match that.</p>
            )}
            {shown.map((guest) => (
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
