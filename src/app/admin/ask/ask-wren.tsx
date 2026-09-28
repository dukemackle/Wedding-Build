"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { askAdminAssistant, type AdminAssistantMessage } from "@/lib/ai/admin-assistant";
import { AnswerText } from "./answer-text";

const SUGGESTIONS = [
  "Which venues are missing photos or a price?",
  "How many couples signed up this week vs last week?",
  "Summarise the feedback that's still new",
  "Which vendors have inquiries still marked sent after a week?",
  "Are there any venues that look like duplicates?",
];

function WrenDot() {
  return <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-forest ring-2 ring-wren" aria-hidden />;
}

export function AskWren({ initialUsed, cap }: { initialUsed: number; cap: number }) {
  const [messages, setMessages] = useState<AdminAssistantMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [used, setUsed] = useState(initialUsed);
  const [isPending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isPending]);

  function ask(text: string) {
    const question = text.trim();
    if (!question || isPending) return;
    const next: AdminAssistantMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setDraft("");
    setError(null);
    startTransition(async () => {
      // Lookups are for display only; the model sees just the words.
      const result = await askAdminAssistant(next.map(({ role, content }) => ({ role, content })));
      if (result.ok) {
        setMessages([...next, { role: "assistant", content: result.reply, lookups: result.lookups }]);
        setUsed(result.usedToday);
      } else {
        setError(result.error);
      }
    });
  }

  const suggestionButtons = SUGGESTIONS.map((s) => (
    <button
      key={s}
      type="button"
      onClick={() => ask(s)}
      disabled={isPending}
      className="shrink-0 rounded-full border border-hairline bg-card px-3 py-1.5 text-left text-xs text-ink transition-colors hover:border-wren hover:text-forest disabled:opacity-50 lg:rounded-md lg:py-2 lg:text-sm"
    >
      {s}
    </button>
  ));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-6">
      {/* Phone: suggestions as a swipeable chip row above the conversation. */}
      <div className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 lg:hidden">{suggestionButtons}</div>

      <section className="flex min-w-0 flex-col rounded-lg bg-card shadow-sm">
        <div className="min-h-[16rem] space-y-5 p-4 lg:min-h-[28rem] lg:p-6">
          {messages.length === 0 && !isPending && (
            <p className="text-sm text-ink/50">Ask anything about the app&apos;s data, or pick a question to start.</p>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-forest px-4 py-2.5 text-sm text-white">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <WrenDot />
                <div className="min-w-0 flex-1 text-sm text-ink">
                  {!!m.lookups?.length && (
                    <p className="mb-2 text-xs text-wren-deep">
                      Looked at{" "}
                      {m.lookups.map((l, j) => (
                        <span key={j}>
                          {j > 0 && ", "}
                          <b>{l.table.replace(/_/g, " ")}</b> · {l.rows.toLocaleString()} rows
                        </span>
                      ))}
                    </p>
                  )}
                  <AnswerText text={m.content} />
                </div>
              </div>
            ),
          )}
          {isPending && (
            <div className="flex gap-3">
              <WrenDot />
              <p className="animate-pulse text-sm text-ink/50">Looking…</p>
            </div>
          )}
          {error && <p className="rounded-md bg-parchment px-3 py-2 text-sm text-ink/70">{error}</p>}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
          className="mt-auto border-t border-hairline p-3 lg:p-4"
        >
          <div className="flex items-end gap-2 rounded-lg border border-hairline bg-parchment p-2 focus-within:border-wren">
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(draft);
                }
              }}
              maxLength={2000}
              placeholder="Ask about your data…"
              className="max-h-40 min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-base outline-none lg:text-sm"
            />
            <button
              type="submit"
              disabled={isPending || !draft.trim() || used >= cap}
              className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Ask
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink/40">
            <span>
              {used} of {cap} questions used today
            </span>
            {messages.length > 0 && (
              <button type="button" onClick={() => setMessages([])} disabled={isPending} className="hover:text-forest">
                Clear
              </button>
            )}
          </div>
        </form>
      </section>

      <aside className="hidden min-w-0 space-y-4 lg:block">
        <div className="rounded-lg bg-card p-5 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink/50">Try asking</p>
          <div className="flex flex-col gap-2">{suggestionButtons}</div>
        </div>
        <div className="rounded-lg bg-card p-5 text-sm shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink/50">What Wren can see</p>
          <ul className="space-y-1 text-ink/70">
            <li>Couples &amp; sign-ups</li>
            <li>Vendors, venues &amp; claims</li>
            <li>Inquiries &amp; bookings</li>
            <li>
              <Link href="/admin/feedback" className="hover:text-forest hover:underline">
                Feedback
              </Link>
            </li>
          </ul>
          <p className="mt-3 text-xs text-ink/50">
            Not guest names, emails, phone numbers, or what couples write to vendors.
          </p>
        </div>
      </aside>
    </div>
  );
}
