"use client";

import { useState, useTransition } from "react";
import type { Guest } from "@/lib/supabase/types";
import { sendRsvpReminders } from "./actions";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RsvpReminders({
  guests,
  publicSlug,
  origin,
}: {
  guests: Guest[];
  publicSlug: string | null;
  origin: string;
}) {
  const stragglers = guests
    .filter(
      (g) => g.email && g.invite_sent_at && (g.status === "invited" || g.status === "pending"),
    )
    .sort((a, b) => (a.invite_sent_at ?? "").localeCompare(b.invite_sent_at ?? ""));

  const [selected, setSelected] = useState<Set<string>>(() => new Set(stragglers.map((g) => g.id)));
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<
    { sent: number; skipped: number; failed: number } | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();

  if (!publicSlug || stragglers.length === 0) return null;

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

  function handleSend() {
    if (selected.size === 0) {
      setError("Select at least one guest to remind.");
      return;
    }

    const formData = new FormData();
    selected.forEach((id) => formData.append("guest_id", id));
    formData.set("origin", origin);

    startTransition(async () => {
      const response = await sendRsvpReminders(formData);
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
      <h2 className="font-display text-2xl font-semibold text-forest">Nudge stragglers</h2>
      <p className="mt-1 text-sm text-ink/70">
        {stragglers.length} invited guest{stragglers.length === 1 ? "" : "s"} still haven&apos;t{" "}
        responded — send a reminder.
      </p>

      <div className="mt-4 max-h-72 overflow-y-auto rounded-md border border-hairline">
        {stragglers.map((guest) => (
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
            <span className="shrink-0 text-xs text-ink/50">
              Invited {formatDate(guest.invite_sent_at!)}
              {guest.last_reminded_at ? ` · reminded ${formatDate(guest.last_reminded_at)}` : ""}
            </span>
          </label>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      {result && (
        <p className="mt-3 text-sm text-forest">
          Sent {result.sent} reminder{result.sent === 1 ? "" : "s"}
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
          {isPending ? "Sending..." : `Send reminders (${selected.size})`}
        </button>
      </div>
    </div>
  );
}
