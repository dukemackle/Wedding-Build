import Link from "next/link";
import type { NextStep } from "./next-step";

/**
 * The dashboard's one gold moment: where the couple is on the planning path.
 * A status, not an instruction: how many of the six milestones are done and
 * what's still open, with quiet links for anyone who wants a shortcut.
 *
 * Computer: the count and what's open on the left, the six-milestone path on
 * the right. Phone: the count over a thin six-part bar, and the path folded
 * into "See all six steps" so it doesn't push the tiles off the screen.
 */
export function NextStepCard({ step }: { step: NextStep }) {
  const currentIndex = step.milestones.findIndex((m) => m.key === step.current);
  const total = step.milestones.length;
  const done = step.milestones.filter((m) => m.done).length;
  // The line fills up to the current milestone (or all the way once the path is done).
  const filled = currentIndex >= 0 ? currentIndex / (total - 1) : done === total ? 1 : 0;
  const headline = done === 0 ? "Just getting started" : done === total ? "All six done" : `${done} of ${total} done`;

  return (
    <section
      aria-labelledby="next-step-title"
      className="mt-6 grid gap-5 rounded-2xl border-2 border-[#ffd301] bg-card p-5 shadow-[0_18px_44px_-24px_rgb(224_161_0/0.55)] sm:p-7 lg:grid-cols-[4fr_8fr] lg:items-center lg:gap-12 lg:px-9"
    >
      <div className="flex flex-col">
        <span className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">Your planning path</span>
        <h2
          id="next-step-title"
          className="mt-2 font-display text-[30px] font-semibold leading-[1.05] text-forest lg:text-[36px]"
        >
          {headline}
        </h2>
        <div className="mt-3 grid grid-cols-6 gap-1 lg:hidden" aria-hidden="true">
          {step.milestones.map((m, i) => (
            <span
              key={m.key}
              className={`h-1 rounded-full ${i === currentIndex ? "bg-[#ffd301]" : m.done ? "bg-forest" : "bg-hairline"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
          {step.open.lead}{" "}
          {step.open.links.map((l, i) => (
            <span key={l.href + l.label}>
              {i > 0 && <span aria-hidden="true" className="text-ink/40"> · </span>}
              <StepLink link={l} className="font-medium text-brass underline-offset-2 hover:underline" />
            </span>
          ))}
        </p>
        {step.aside && (
          <StepLink link={step.aside} className="mt-1.5 self-start py-1 text-sm text-ink/70 hover:text-forest hover:underline" />
        )}
      </div>

      {/* The path, on a computer. */}
      <div className="relative hidden lg:block">
        <div aria-hidden="true" className="absolute left-[8.33%] right-[8.33%] top-3.5 h-1 rounded-full bg-hairline">
          <div
            className="h-full rounded-full bg-forest"
            style={{ width: `${filled * 100}%` }}
          />
        </div>
        <Path step={step} currentIndex={currentIndex} />
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

/** A plain anchor for "#edit-details", so the hash change opens the dashboard's own form. */
function StepLink({ link, className }: { link: { label: string; href: string }; className: string }) {
  return link.href.startsWith("#") ? (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

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
