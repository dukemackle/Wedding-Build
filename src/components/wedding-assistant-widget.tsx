"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  applyAssistantProposal,
  askWeddingAssistant,
  type AssistantMessage,
  type ProposalStatus,
} from "@/lib/ai/wedding-assistant";
import type { Proposal } from "@/lib/ai/assistant-tools";
import { SendIcon, CloseIcon, ExpandIcon, CollapseIcon } from "@/components/icons";
import { AnimatedWrenBird } from "@/components/animated-wren-bird";
import { WrenMotto } from "@/components/wren-motto";
import { useAssistant } from "@/components/assistant-context";
import { InterviewQuestion } from "@/components/planning-interview";
import { loadPlanningProfile, savePlanningAnswer } from "@/lib/ai/planning-actions";
import { PLANNING_QUESTIONS, nextQuestion, type PlanningProfile } from "@/lib/ai/planning-profile";

type Card = Proposal & { status: ProposalStatus };

const MAX_LINES = 6;

// A change the assistant offered. Nothing is written until Confirm.
function ProposalCard({
  card,
  busy,
  error,
  onConfirm,
  onSkip,
}: {
  card: Card;
  busy: boolean;
  error?: string;
  onConfirm: () => void;
  onSkip: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const lines = expanded ? card.lines : card.lines.slice(0, MAX_LINES);
  const hidden = card.lines.length - lines.length;

  return (
    <div
      className={`rounded-lg border bg-white px-3 py-2 text-sm ${
        card.status === "pending" ? "border-forest/40" : "border-hairline opacity-70"
      }`}
    >
      <p className="font-medium text-ink">{card.title}</p>
      <ul className="mt-1 space-y-0.5 text-xs text-ink/70">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      {hidden > 0 && (
        <button type="button" onClick={() => setExpanded(true)} className="mt-1 text-xs text-wren-deep underline">
          +{hidden} more
        </button>
      )}
      {error && <p className="mt-1 text-xs text-brass">{error}</p>}
      <div className="mt-2 flex items-center gap-2">
        {card.status === "pending" ? (
          <>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="rounded-md bg-wren px-3 py-1 text-xs font-medium text-ink disabled:opacity-40"
            >
              {busy ? "Saving..." : "Confirm"}
            </button>
            <button
              type="button"
              onClick={onSkip}
              disabled={busy}
              className="px-2 py-1 text-xs text-ink/60 hover:text-ink disabled:opacity-40"
            >
              Skip
            </button>
          </>
        ) : (
          <span className="text-xs text-ink/60">{card.status === "applied" ? "✓ Done" : "Skipped"}</span>
        )}
      </div>
    </div>
  );
}

// The actual chat UI -- shared between the floating widget (below) and
// the always-open embed on the Help page, so there's a real place to
// type a question even without hunting for the corner bubble.
export function AssistantChat({
  onClose,
  expanded,
  onToggleExpand,
}: {
  onClose?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [applying, setApplying] = useState<Set<string>>(new Set());
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // The planning interview. Its answers live in wedding_preferences and reach
  // Wren through its context, so the Q&A shown here is never sent as chat.
  const [profile, setProfile] = useState<PlanningProfile | null>(null);
  const [interviewing, setInterviewing] = useState(false);
  const [interviewLog, setInterviewLog] = useState<{ question: string; answer: string }[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlanningProfile().then(setProfile);
  }, []);

  const current = interviewing && profile ? nextQuestion(profile) : null;
  const answeredCount = profile
    ? PLANNING_QUESTIONS.filter((q) => profile.answers[q.id]?.length).length
    : 0;
  const remaining = profile ? nextQuestion(profile) !== null : false;

  function scrollDown() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function answer(values: string[]) {
    if (!current || saving) return;
    setSaving(true);
    setError(null);
    const result = await savePlanningAnswer(current.id, values);
    setSaving(false);
    if (result.error || !result.profile) {
      setError(result.error ?? "Couldn't save that -- try again.");
      return;
    }
    setInterviewLog((prev) => [
      ...prev,
      { question: current.question, answer: values.length ? values.join(", ") : "Skipped" },
    ]);
    setPicked([]);
    setProfile(result.profile);
    if (!nextQuestion(result.profile)) setInterviewing(false);
    scrollDown();
  }

  function togglePick(option: string) {
    if (!current) return;
    if (current.max === 1) {
      answer([option]);
      return;
    }
    setPicked((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
  }

  function setStatus(id: string, status: ProposalStatus) {
    setMessages((prev) =>
      prev.map((m) =>
        m.proposals?.some((p) => p.id === id)
          ? { ...m, proposals: m.proposals.map((p) => (p.id === id ? { ...p, status } : p)) }
          : m,
      ),
    );
  }

  async function confirm(cards: Card[]) {
    setApplying((prev) => new Set([...prev, ...cards.map((c) => c.id)]));
    let changed = false;
    for (const card of cards) {
      const result = await applyAssistantProposal(card.kind, card.input);
      if (result.error) {
        setCardErrors((prev) => ({ ...prev, [card.id]: result.error! }));
      } else {
        changed = true;
        setStatus(card.id, "applied");
      }
      setApplying((prev) => {
        const next = new Set(prev);
        next.delete(card.id);
        return next;
      });
    }
    // The page behind the chat is showing the old rows.
    if (changed) router.refresh();
  }

  function send(overrideText?: string, options?: { plan?: boolean }) {
    const text = (overrideText ?? input).trim();
    if (!text || isPending) return;

    // Mid-interview, typing is answering in their own words.
    if (current && !overrideText) {
      setInput("");
      answer([...picked, text]);
      return;
    }

    const nextMessages: AssistantMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    if (!overrideText) setInput("");
    setError(null);

    startTransition(async () => {
      const result = await askWeddingAssistant(nextMessages, options);
      if (result.ok) {
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content: result.reply,
            proposals: result.proposals.map((p) => ({ ...p, status: "pending" as const })),
          },
        ]);
      } else {
        setError(result.error);
      }
      scrollDown();
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-hairline bg-wren-soft px-4 py-3">
        <span className="flex items-center gap-2 font-display text-lg text-wren-deep">
          <AnimatedWrenBird className="h-5 w-5" thinking={isPending} />
          Wren
          <WrenMotto className="hidden font-sans text-xs text-ink/60 min-[360px]:inline" />
        </span>
        <div className="flex items-center gap-3">
          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-label={expanded ? "Shrink assistant" : "Expand assistant"}
              className="text-ink/60 hover:text-ink"
            >
              {expanded ? <CollapseIcon className="h-4 w-4" /> : <ExpandIcon className="h-4 w-4" />}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close assistant"
              className="text-ink/60 hover:text-ink"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && interviewLog.length === 0 && !interviewing && (
          <p className="text-sm text-ink/60">
            Hi, I&apos;m Wren! Ask me anything about your wedding plans, or ask me to do
            something -- &ldquo;add my college roommates,&rdquo; &ldquo;mark the florist paid,&rdquo;
            &ldquo;draft our day-of timeline.&rdquo; I&apos;ll show you each change to confirm first.
          </p>
        )}
        {messages.length === 0 && !interviewing && remaining && (
          <div className="rounded-lg border border-wren/40 bg-white px-3 py-2.5 text-sm">
            <p className="text-ink">
              {answeredCount === 0
                ? "Want me to plan like I know you? Ten quick questions -- about two minutes -- and I'll remember the answers."
                : `Pick up where we left off? You've answered ${answeredCount} of ${PLANNING_QUESTIONS.length}.`}
            </p>
            <button
              type="button"
              onClick={() => {
                setInterviewing(true);
                scrollDown();
              }}
              className="mt-2 rounded-md bg-wren px-3 py-1 text-xs font-medium text-ink"
            >
              {answeredCount === 0 ? "Let's do it" : "Continue"}
            </button>
          </div>
        )}
        {interviewLog.map((entry, i) => (
          <div key={`q${i}`} className="space-y-2">
            <div className="mr-auto max-w-[85%] rounded-lg border border-wren/30 bg-wren-soft px-3 py-2 text-sm text-ink">
              {entry.question}
            </div>
            <div className="ml-auto w-fit max-w-[85%] rounded-lg bg-forest px-3 py-2 text-sm text-parchment">
              {entry.answer}
            </div>
          </div>
        ))}
        {current && (
          <InterviewQuestion
            question={current}
            index={PLANNING_QUESTIONS.indexOf(current) + 1}
            total={PLANNING_QUESTIONS.length}
            picked={picked}
            busy={saving}
            onToggle={togglePick}
            onNext={() => answer(picked)}
            onSkip={() => answer([])}
            onPause={() => {
              setInterviewing(false);
              setPicked([]);
            }}
          />
        )}
        {interviewLog.length > 0 && !interviewing && messages.length === 0 && (
          <div className="mr-auto max-w-[85%] rounded-lg border border-wren/30 bg-wren-soft px-3 py-2 text-sm text-ink">
            {remaining
              ? "No problem -- I've saved what you told me. We can finish any time."
              : "That's everything -- thank you! I'll keep all of this in mind. Want me to turn it into a plan?"}
          </div>
        )}
        {messages.length === 0 && !interviewing && !remaining && answeredCount > 0 && (
          <div className="rounded-lg border border-wren/40 bg-white px-3 py-2.5 text-sm">
            <p className="text-ink">
              I&apos;ll fill the gaps in your checklist, draft your day-of timeline and suggest how to
              split the budget. You confirm each change.
            </p>
            <button
              type="button"
              onClick={() => send("Build our plan", { plan: true })}
              disabled={isPending}
              className="mt-2 rounded-md bg-wren px-3 py-1 text-xs font-medium text-ink disabled:opacity-40"
            >
              Build our plan
            </button>
          </div>
        )}
        {messages.map((m, i) => {
          const pending = m.proposals?.filter((p) => p.status === "pending") ?? [];
          return (
            <div key={i} className="space-y-2">
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-forest text-parchment"
                    : "mr-auto border border-wren/30 bg-wren-soft text-ink"
                }`}
              >
                {m.content}
              </div>
              {m.proposals?.map((card) => (
                <ProposalCard
                  key={card.id}
                  card={card}
                  busy={applying.has(card.id)}
                  error={cardErrors[card.id]}
                  onConfirm={() => confirm([card])}
                  onSkip={() => setStatus(card.id, "skipped")}
                />
              ))}
              {pending.length > 1 && (
                <button
                  type="button"
                  onClick={() => confirm(pending)}
                  disabled={pending.some((p) => applying.has(p.id))}
                  className="text-xs font-medium text-wren-deep underline disabled:opacity-40"
                >
                  Confirm all {pending.length}
                </button>
              )}
            </div>
          );
        })}
        {isPending && (
          <div className="mr-auto text-sm text-ink/50">
            {messages[messages.length - 1]?.content === "Build our plan"
              ? "Building your plan -- this takes a minute..."
              : "Thinking..."}
          </div>
        )}
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
          placeholder={current ? "Or type your own answer..." : "Ask or tell Wren..."}
          className="min-h-9 flex-1 resize-none rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-wren"
        />
        <button
          type="button"
          onClick={() => send()}
          disabled={isPending || !input.trim()}
          aria-label="Send message"
          className="wren-pulse flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-wren text-ink disabled:opacity-40"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function WeddingAssistantWidget() {
  const { open, setOpen } = useAssistant();
  const [expanded, setExpanded] = useState(false);
  // The dashboard has its own "Ask Wren" box below the planning boxes, and the
  // floating bubble only sat on top of the checklist box there.
  const onDashboard = usePathname() === "/dashboard";

  // Expanded is two different things: on a phone the chat takes the whole
  // screen (there's no room for a bigger floating box), on desktop the panel
  // grows in place so the page stays visible beside it.
  const panelSize = expanded
    ? "fixed inset-0 z-50 rounded-none sm:static sm:inset-auto sm:h-[min(44rem,calc(100vh-7rem))] sm:w-[34rem] sm:rounded-lg"
    : "h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] rounded-lg";

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className={`flex flex-col overflow-hidden border border-hairline bg-parchment shadow-lg ${panelSize}`}>
          <AssistantChat
            onClose={() => setOpen(false)}
            expanded={expanded}
            onToggleExpand={() => setExpanded(!expanded)}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        hidden={onDashboard && !open}
        aria-label={open ? "Close Wren, your wedding assistant" : "Open Wren, your wedding assistant"}
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-wren bg-card text-ink shadow-lg hover:bg-wren-soft"
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <AnimatedWrenBird className="h-6 w-6" hopOnce />}
      </button>
    </div>
  );
}
