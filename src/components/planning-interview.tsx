"use client";

import type { PlanningQuestion } from "@/lib/ai/planning-profile";

// One interview question as Wren asks it in the chat: the question, a
// counter, and the answers as chips. Single-pick questions answer on tap;
// multi-pick ones collect picks until Next. Anything typed in the chat box
// counts as the couple's own answer (see AssistantChat).
export function InterviewQuestion({
  question,
  index,
  total,
  picked,
  busy,
  onToggle,
  onNext,
  onSkip,
  onPause,
}: {
  question: PlanningQuestion;
  index: number;
  total: number;
  picked: string[];
  busy: boolean;
  onToggle: (option: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPause: () => void;
}) {
  const multi = question.max > 1;
  return (
    <div className="space-y-2">
      <div className="mr-auto max-w-[85%] rounded-lg border border-wren/30 bg-wren-soft px-3 py-2 text-sm text-ink">
        <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-ink/45">
          Question {index} of {total}
        </p>
        {question.question}
      </div>
      {question.options.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {question.options.map((option) => {
            const on = picked.includes(option);
            const full = !on && picked.length >= question.max;
            return (
              <button
                key={option}
                type="button"
                disabled={busy || (multi && full)}
                onClick={() => onToggle(option)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40 ${
                  on
                    ? "border-wren bg-wren text-ink"
                    : "border-wren/40 bg-white text-wren-deep hover:border-wren"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-3 text-xs">
        {multi && (
          <button
            type="button"
            onClick={onNext}
            disabled={busy || picked.length === 0}
            className="rounded-md bg-wren px-3 py-1 font-medium text-ink disabled:opacity-40"
          >
            {busy ? "Saving..." : "Next"}
          </button>
        )}
        <button type="button" onClick={onSkip} disabled={busy} className="text-ink/60 hover:text-ink disabled:opacity-40">
          Skip
        </button>
        <button type="button" onClick={onPause} disabled={busy} className="ml-auto text-ink/60 hover:text-ink disabled:opacity-40">
          Finish later
        </button>
      </div>
    </div>
  );
}
