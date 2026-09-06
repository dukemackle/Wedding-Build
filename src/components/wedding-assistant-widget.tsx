"use client";

import { useRef, useState, useTransition } from "react";
import { askWeddingAssistant, type AssistantMessage } from "@/lib/ai/wedding-assistant";
import { ChatIcon, SendIcon, CloseIcon } from "@/components/icons";

export function WeddingAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  function send() {
    const text = input.trim();
    if (!text || isPending) return;

    const nextMessages: AssistantMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);

    startTransition(async () => {
      const result = await askWeddingAssistant(nextMessages);
      if (result.ok) {
        setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
      } else {
        setError(result.error);
      }
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    });
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-lg border border-hairline bg-parchment shadow-lg">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="font-display text-lg text-forest">Wedding Assistant</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="text-ink/60 hover:text-ink"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-ink/60">
                Ask me anything about your wedding plans -- budgeting, guest list strategy, vendor
                tips, timelines, or etiquette.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-forest text-parchment"
                    : "mr-auto bg-white text-ink border border-hairline"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isPending && <div className="mr-auto text-sm text-ink/50">Thinking...</div>}
            {error && <div className="mr-auto text-sm text-brass">{error}</div>}
          </div>

          <div className="flex items-end gap-2 border-t border-hairline p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask a question..."
              className="min-h-9 flex-1 resize-none rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-forest"
            />
            <button
              type="button"
              onClick={send}
              disabled={isPending || !input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-forest text-parchment disabled:opacity-40"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close wedding assistant" : "Open wedding assistant"}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-parchment shadow-lg hover:bg-forest/90"
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <ChatIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
