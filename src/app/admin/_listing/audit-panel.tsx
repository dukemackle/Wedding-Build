"use client";

import { useState, useTransition } from "react";
import { applyAudit, previewAudit, type AuditPlan } from "./audit-actions";

// Upload the data-audit-fixes.json that /data-audit writes, see what it would
// change, then apply it. Nothing changes until "Apply" is clicked.
export function AuditPanel({ table, noun }: { table: "venues" | "vendors"; noun: "venue" | "vendor" }) {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState<string | null>(null);
  const [plan, setPlan] = useState<AuditPlan | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const plural = (n: number) => `${n.toLocaleString()} ${n === 1 ? noun : `${noun}s`}`;

  function reset() {
    setJson(null);
    setPlan(null);
    setError(undefined);
    setDone(false);
  }

  async function handleFile(file: File | undefined) {
    reset();
    if (!file) return;
    const text = await file.text();
    startTransition(async () => {
      const result = await previewAudit(table, text);
      if (result.error) return setError(result.error);
      setJson(text);
      setPlan(result.plan ?? null);
    });
  }

  function handleApply() {
    if (!json) return;
    setError(undefined);
    startTransition(async () => {
      const result = await applyAudit(table, json);
      if (result.error) return setError(result.error);
      setDone(true);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 text-sm text-ink/55 underline decoration-hairline underline-offset-4 hover:text-forest"
      >
        Apply a data audit
      </button>
    );
  }

  const nothing = plan && plan.verify === 0 && plan.update.length === 0 && plan.hide.length === 0;

  return (
    <div className="mb-4 rounded-md border border-hairline bg-parchment px-4 py-3 text-sm text-ink">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-forest">Apply a data audit</p>
          <p className="mt-0.5 text-xs text-ink/55">
            Upload the data-audit-fixes.json from /data-audit. You&apos;ll see what changes before anything does.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-xs text-ink/55 hover:text-forest"
        >
          Close
        </button>
      </div>

      {done ? (
        <p className="mt-3 text-forest">
          Done. {plan && plan.verify > 0 && `${plural(plan.verify)} marked checked`}
          {plan && plan.update.length > 0 && `, ${plan.update.length} fixed`}
          {plan && plan.hide.length > 0 && `, ${plan.hide.length} hidden`}.
        </p>
      ) : (
        <>
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={isPending}
            className="mt-3 block w-full text-xs file:mr-3 file:rounded-md file:border file:border-hairline file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-forest"
          />

          {plan && (
            <div className="mt-3 space-y-3">
              <ul className="space-y-1">
                <li>
                  <span className="font-mono-numbers">{plan.verify.toLocaleString()}</span> marked checked (the audit
                  loaded their site and found nothing wrong)
                </li>
                {plan.update.length > 0 && (
                  <li>
                    <span className="font-mono-numbers">{plan.update.length}</span> fixed:
                    <ul className="mt-1 space-y-0.5 break-words pl-4 text-xs text-ink/70">
                      {plan.update.map((u) => (
                        <li key={u.name}>
                          <span className="text-ink">{u.name}</span>: {u.changes}
                          {u.reason && ` (${u.reason})`}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
                {plan.hide.length > 0 && (
                  <li>
                    <span className="font-mono-numbers">{plan.hide.length}</span> hidden (Live off, not deleted):
                    <ul className="mt-1 space-y-0.5 break-words pl-4 text-xs text-ink/70">
                      {plan.hide.map((h) => (
                        <li key={h.name}>
                          <span className="text-ink">{h.name}</span>
                          {h.reason && `: ${h.reason}`}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
              {plan.unmatched.length > 0 && (
                <p className="text-xs text-ink/55">
                  {plural(plan.unmatched.length)} in the file aren&apos;t in the database yet and will be skipped
                  {plan.unmatched.length <= 5 && `: ${plan.unmatched.join(", ")}`}.
                </p>
              )}
              {nothing ? (
                <p className="text-xs text-ink/55">Nothing in this file matches a {noun} here.</p>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isPending}
                  className="rounded-md bg-forest px-3 py-1.5 text-sm text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
                >
                  {isPending ? "Applying…" : "Apply"}
                </button>
              )}
            </div>
          )}
          {isPending && !plan && <p className="mt-2 text-xs text-ink/55">Reading the file…</p>}
        </>
      )}
      {error && <p className="mt-2 text-xs text-red-800">{error}</p>}
    </div>
  );
}
