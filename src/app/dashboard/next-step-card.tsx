import Link from "next/link";
import type { NextStep } from "./next-step";

/**
 * The dashboard's one gold moment: the step to take now, why it comes now,
 * and where it sits on the planning path.
 *
 * Computer: the step on the left, the six-milestone path on the right.
 * Phone: a thin six-part progress bar over the step, and the path folded
 * into "See all six steps" so it doesn't push the tiles off the screen.
 */
export function NextStepCard({ step }: { step: NextStep }) {
  const currentIndex = step.milestones.findIndex((m) => m.key === step.current);
  const allDone = step.milestones.every((m) => m.done);
  // The line fills up to the current milestone (or all the way once the path is done).
  const filled = currentIndex >= 0 ? currentIndex / (step.milestones.length - 1) : allDone ? 1 : 0;

  return (
    <section
      aria-labelledby="next-step-title"
      className="mt-6 grid gap-6 rounded-2xl border-2 border-[#ffd301] bg-card p-5 shadow-[0_18px_44px_-24px_rgb(224_161_0/0.55)] sm:p-7 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-12 lg:px-9"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <span className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">Your next step</span>
          {currentIndex >= 0 && (
            <span className="text-xs text-ink/70 lg:hidden">
              {currentIndex + 1} of {step.milestones.length}
            </span>
          )}
        </div>
        <div className="mt-2.5 grid grid-cols-6 gap-1 lg:hidden" aria-hidden="true">
          {step.milestones.map((m, i) => (
            <span
              key={m.key}
              className={`h-1 rounded-full ${i === currentIndex ? "bg-[#ffd301]" : m.done ? "bg-forest" : "bg-hairline"}`}
            />
          ))}
        </div>
        <h2
          id="next-step-title"
          className="mt-3.5 font-display text-[32px] font-semibold leading-[1.05] text-forest lg:mt-2.5 lg:text-[40px]"
        >
          {step.title}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/80 lg:text-base">{step.why}</p>
        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-5 lg:mt-5">
          {/* A plain anchor for "#edit-details", so the hash change opens the dashboard's own form. */}
          {step.action.href.startsWith("#") ? (
            <a href={step.action.href} className={primary}>
              {step.action.label}
            </a>
          ) : (
            <Link href={step.action.href} className={primary}>
              {step.action.label}
            </Link>
          )}
          {step.aside && (
            <Link href={step.aside.href} className="py-2.5 text-sm text-brass hover:underline sm:text-[15px]">
              {step.aside.label}
            </Link>
          )}
        </div>
      </div>

      {/* The path, on a computer. */}
      <div className="hidden flex-col gap-4 lg:flex">
        <div className="relative">
          <div aria-hidden="true" className="absolute left-[8.33%] right-[8.33%] top-3.5 h-1 rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-forest"
              style={{ width: `${filled * 100}%` }}
            />
          </div>
          <Path step={step} currentIndex={currentIndex} />
        </div>
        {step.note && <p className="text-center text-sm text-ink/70">{step.note}</p>}
      </div>

      {/* The same path, folded away on a phone. */}
      <details className="-mt-3 lg:hidden">
        <summary className="cursor-pointer py-2 text-sm text-ink/80">See all six steps</summary>
        <ol className="mt-2 flex flex-col gap-2.5">
          {step.milestones.map((m, i) => (
            <li key={m.key} className="flex items-center justify-between gap-3 text-sm" aria-current={i === currentIndex ? "step" : undefined}>
              <span className={`flex items-center gap-2.5 ${i === currentIndex ? "font-semibold" : ""}`}>
                <Dot done={m.done} current={i === currentIndex} n={i + 1} small />
                {m.label}
              </span>
              <span className="text-ink/70">{m.detail}</span>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}

const primary =
  "flex h-12 items-center justify-center rounded-md bg-forest px-6 text-[15px] font-medium text-parchment transition-colors hover:bg-forest/90";

function Path({ step, currentIndex }: { step: NextStep; currentIndex: number }) {
  return (
    <ol aria-label="Your planning path" className="relative grid grid-cols-6">
      {step.milestones.map((m, i) => (
        <li
          key={m.key}
          aria-current={i === currentIndex ? "step" : undefined}
          className="flex flex-col items-center gap-2 text-center"
        >
          <Dot done={m.done} current={i === currentIndex} n={i + 1} />
          <span className={`text-sm ${i === currentIndex ? "font-semibold" : m.done ? "font-medium" : "text-ink/80"}`}>
            {m.label}
          </span>
          <span className="max-w-full truncate px-1 text-xs text-ink/70">{m.detail}</span>
          <span className="sr-only">{m.done ? "(done)" : i === currentIndex ? "(now)" : "(to do)"}</span>
        </li>
      ))}
    </ol>
  );
}

function Dot({ done, current, n, small }: { done: boolean; current: boolean; n: number; small?: boolean }) {
  const size = small ? "h-6 w-6 text-[11px]" : "h-8 w-8 text-[13px]";
  if (current) {
    return (
      <span className={`${size} flex shrink-0 items-center justify-center rounded-full border-2 border-forest bg-[#ffd301] font-mono-numbers font-medium text-forest`}>
        {n}
      </span>
    );
  }
  if (done) {
    return (
      <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-forest`}>
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="#fcfbf7" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink/35 bg-card font-mono-numbers text-ink/70`}>
      {n}
    </span>
  );
}
