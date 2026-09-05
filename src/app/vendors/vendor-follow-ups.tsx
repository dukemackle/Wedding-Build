"use client";

import { useState, useTransition } from "react";
import type { VendorInquiry } from "@/lib/supabase/types";
import { sendVendorFollowUps } from "./actions";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VendorFollowUps({ inquiries }: { inquiries: VendorInquiry[] }) {
  const pending = inquiries
    .filter((i) => i.status === "sent" && i.recipient_email)
    .sort((a, b) => a.sent_at.localeCompare(b.sent_at));

  const [selected, setSelected] = useState<Set<string>>(() => new Set(pending.map((i) => i.id)));
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<
    { sent: number; skipped: number; failed: number } | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();

  if (pending.length === 0) return null;

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
      setError("Select at least one inquiry to follow up on.");
      return;
    }

    const formData = new FormData();
    selected.forEach((id) => formData.append("inquiry_id", id));

    startTransition(async () => {
      const response = await sendVendorFollowUps(formData);
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
    <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <h2 className="font-display text-2xl font-semibold text-forest">Follow up on inquiries</h2>
      <p className="mt-1 text-sm text-ink/70">
        {pending.length} inquir{pending.length === 1 ? "y" : "ies"} still awaiting a response —
        send a follow-up.
      </p>

      <div className="mt-4 max-h-72 overflow-y-auto rounded-md border border-hairline">
        {pending.map((inquiry) => (
          <label
            key={inquiry.id}
            className="flex cursor-pointer items-center justify-between gap-3 border-b border-hairline px-4 py-2.5 last:border-b-0 hover:bg-parchment"
          >
            <span className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.has(inquiry.id)}
                onChange={() => toggle(inquiry.id)}
                className="h-4 w-4 rounded border-hairline"
              />
              <span>
                <span className="text-ink">{inquiry.vendor_name}</span>{" "}
                <span className="text-xs text-ink/50">{inquiry.recipient_email}</span>
              </span>
            </span>
            <span className="shrink-0 text-xs text-ink/50">
              Sent {formatDate(inquiry.sent_at)}
              {inquiry.last_followed_up_at
                ? ` · followed up ${formatDate(inquiry.last_followed_up_at)}`
                : ""}
            </span>
          </label>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      {result && (
        <p className="mt-3 text-sm text-forest">
          Sent {result.sent} follow-up{result.sent === 1 ? "" : "s"}
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
          {isPending ? "Sending..." : `Send follow-ups (${selected.size})`}
        </button>
      </div>
    </div>
  );
}
