"use client";

import { useState, useTransition } from "react";
import type { Wedding } from "@/lib/supabase/types";
import { emailCouples } from "./actions";

export type CoupleRow = {
  wedding: Wedding;
  email: string | null;
  guestCount: number;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";

function ComposeForm({
  selectedIds,
  onDone,
}: {
  selectedIds: string[];
  onDone: () => void;
}) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<{ sent: number; failed: number } | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    for (const id of selectedIds) formData.append("wedding_id", id);
    startTransition(async () => {
      const res = await emailCouples(formData);
      if (res.error) {
        setError(res.error);
        setResult(undefined);
      } else {
        setError(undefined);
        setResult({ sent: res.sent ?? 0, failed: res.failed ?? 0 });
      }
    });
  }

  return (
    <div className="mb-6 rounded-lg border border-hairline bg-parchment p-6">
      <p className="mb-3 font-medium text-ink">
        Email {selectedIds.length} couple{selectedIds.length === 1 ? "" : "s"}
      </p>
      {result ? (
        <div>
          <p className="text-sm text-ink">
            Sent to {result.sent} couple{result.sent === 1 ? "" : "s"}
            {result.failed > 0 && ` — ${result.failed} failed (no email on file or send error).`}
          </p>
          <button
            type="button"
            onClick={onDone}
            className="mt-4 rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-forest"
          >
            Close
          </button>
        </div>
      ) : (
        <form action={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-ink">
            Subject
            <input name="subject" required className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Message
            <textarea name="message" required rows={6} className={inputClass} />
          </label>
          {error && <p className="text-sm text-red-800">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "Sending..." : "Send"}
            </button>
            <button
              type="button"
              onClick={onDone}
              className="rounded-md border border-hairline px-4 py-2 font-medium text-ink transition-colors hover:border-forest"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function CouplesManager({ rows }: { rows: CoupleRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showCompose, setShowCompose] = useState(false);

  const allSelected = rows.length > 0 && selected.size === rows.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.wedding.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowCompose(true)}
          disabled={selected.size === 0}
          className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-40"
        >
          Email selected ({selected.size})
        </button>
      </div>

      {showCompose && (
        <ComposeForm
          selectedIds={Array.from(selected)}
          onDone={() => {
            setShowCompose(false);
            setSelected(new Set());
          }}
        />
      )}

      <div className="w-full overflow-x-auto rounded-lg border border-hairline bg-card shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all couples"
                />
              </th>
              <th className="px-4 py-3 font-medium">Couple</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Wedding date</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">Guests</th>
              <th className="px-4 py-3 font-medium">Referral code</th>
              <th className="px-4 py-3 font-medium">Signed up</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ wedding, email, guestCount }) => {
              const names = [wedding.partner_a_name, wedding.partner_b_name]
                .filter(Boolean)
                .join(" & ");
              return (
                <tr key={wedding.id} className="border-b border-hairline last:border-b-0">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(wedding.id)}
                      onChange={() => toggleOne(wedding.id)}
                      aria-label={`Select ${names || "couple"}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-ink">{names || "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{email ?? "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{formatDate(wedding.wedding_date)}</td>
                  <td className="px-4 py-3 text-ink/70">{wedding.region ?? "—"}</td>
                  <td className="px-4 py-3 font-mono-numbers text-ink/70">{guestCount}</td>
                  <td className="px-4 py-3 font-mono-numbers text-ink/70">
                    {wedding.referral_code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{formatDate(wedding.created_at)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-ink/50" colSpan={8}>
                  No couples yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
