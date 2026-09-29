"use client";

import { useState } from "react";

type ExportResult = { ok: true; text: string } | { ok: false; error: string };

/**
 * "Take Wren with you": copies Wren's instructions plus a snapshot of the
 * plan, for couples who'd rather talk to ChatGPT, Claude or Gemini. Costs us
 * nothing (no model call) and every copy carries a link back.
 */
export function ExportForAI({ load }: { load: () => Promise<ExportResult> }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "copied">("idle");
  const [error, setError] = useState<string | null>(null);

  async function copy() {
    setState("busy");
    setError(null);
    const result = text ? { ok: true as const, text } : await load();
    if (!result.ok) {
      setError(result.error);
      setState("idle");
      return;
    }
    setText(result.text);
    try {
      await navigator.clipboard.writeText(result.text);
      setState("copied");
    } catch {
      // Clipboard can be blocked; the text below is still selectable.
      setError("Couldn't copy automatically -- select the text below and copy it.");
      setState("idle");
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-wren-deep underline">
        Prefer ChatGPT or Claude? Take your plan with you
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-wren/40 bg-white px-3 py-2.5 text-sm">
      <p className="font-medium text-ink">Use Wren in your own AI</p>
      <p className="mt-1 text-xs text-ink/70">
        Copies Wren&apos;s planning instructions and a snapshot of your plan. Paste it into ChatGPT,
        Claude or Gemini to get advice there. It can&apos;t change anything in your plan, and it
        won&apos;t see updates -- copy again after big changes.
      </p>
      <p className="mt-1 text-xs text-ink/60">Guest names and contact details aren&apos;t included.</p>
      {error && <p className="mt-1 text-xs text-brass">{error}</p>}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={copy}
          disabled={state === "busy"}
          className="rounded-md bg-wren px-3 py-1 text-xs font-medium text-ink disabled:opacity-40"
        >
          {state === "copied" ? "✓ Copied" : state === "busy" ? "Copying..." : "Copy plan & prompt"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-2 py-1 text-xs text-ink/60 hover:text-ink"
        >
          Close
        </button>
      </div>
      {text && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-ink/60">See what&apos;s copied</summary>
          <textarea
            readOnly
            value={text}
            rows={6}
            className="mt-1 w-full resize-none rounded-md border border-hairline bg-parchment p-2 font-mono text-[11px] text-ink/80"
          />
        </details>
      )}
    </div>
  );
}
