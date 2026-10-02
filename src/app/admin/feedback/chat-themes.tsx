"use client";

import { useState, useTransition } from "react";
import { summarizeChatThemes, type ChatTheme, type ThemeKind } from "@/lib/ai/chat-themes";

// Gold marks what to build, Sky (Wren's colour) what to fix in Wren.
const KIND: Record<ThemeKind, { label: string; style: string }> = {
  gap: { label: "Product gap", style: "bg-[#FFD301] text-[#14203d]" },
  wren: { label: "Fix in Wren", style: "bg-[#00BFFE] text-[#14203d]" },
  faq: { label: "FAQ / ready answer", style: "bg-forest/10 text-forest" },
};

export function ChatThemes() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ themes: ChatTheme[]; questionCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await summarizeChatThemes();
      if (res.ok) setResult({ themes: res.themes, questionCount: res.questionCount });
      else setError(res.error);
    });
  }

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-forest">Wren chat themes</h2>
          <p className="mt-1 text-sm text-ink/60">
            What couples asked Wren in the last 30 days, grouped. Test weddings are left out, and
            examples are paraphrased by Wren. Read them over before reusing one in an FAQ or email.
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "Reading chats…" : result ? "Run again" : "Find themes"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {result && result.questionCount === 0 && (
        <p className="mt-3 text-sm text-ink/60">No questions from real couples in the last 30 days.</p>
      )}

      {result && result.questionCount > 0 && (
        <>
          <p className="mt-3 font-mono-numbers text-xs text-ink/50">
            {result.questionCount} questions · {result.themes.length} themes
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {result.themes.map((t) => (
              <div key={t.title} className="rounded-lg border border-hairline bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-ink">{t.title}</p>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${KIND[t.kind]?.style ?? KIND.faq.style}`}>
                      {KIND[t.kind]?.label ?? KIND.faq.label}
                    </span>
                    <span className="font-mono-numbers text-xs text-ink/50">{t.count}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink/80">{t.summary}</p>
                <p className="mt-1 text-sm italic text-ink/60">&ldquo;{t.example}&rdquo;</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
