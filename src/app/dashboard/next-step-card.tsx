import Link from "next/link";
import type { NextStep } from "./next-step";

/**
 * The dashboard's one gold moment: where the couple is on the planning path.
 * A status, not an instruction: how many of the six milestones are done and
 * what's still open, with quiet links for anyone who wants a shortcut.
 *
 * A slim strip rather than a card. Computer: one row, the count, the six
 * milestones as pills (done, now in gold, still to come) and what's open.
 * Phone: the count over a thin six-part bar, then what's open.
 */
export function NextStepCard({ step }: { step: NextStep }) {
  const currentIndex = step.milestones.findIndex((m) => m.key === step.current);
  const total = step.milestones.length;
  const done = step.milestones.filter((m) => m.done).length;
  const headline = done === 0 ? "Just getting started" : done === total ? "All six done" : `${done} of ${total} done`;

  return (
    <section
      aria-labelledby="next-step-title"
      className="mt-6 flex flex-col gap-2.5 rounded-2xl border-[1.5px] border-[#ffd301] bg-card px-4 py-3.5 shadow-[0_12px_30px_-20px_rgb(20_32_61/0.45)] lg:flex-row lg:items-center lg:gap-7 lg:px-6"
    >
      <div className="shrink-0">
        <div className="flex items-baseline gap-2">
          <h2 id="next-step-title" className="font-display text-[26px] font-semibold leading-none text-forest">
            {headline}
          </h2>
          <span className="text-[13px] text-ink/75">planning path</span>
        </div>
        <div className="mt-2.5 grid grid-cols-6 gap-1 lg:hidden" aria-hidden="true">
          {step.milestones.map((m, i) => (
            <span
              key={m.key}
              className={`h-1 rounded-full ${i === currentIndex ? "bg-[#ffd301]" : m.done ? "bg-forest" : "bg-hairline"}`}
            />
          ))}
        </div>
      </div>

      <ol aria-label="Your planning path" className="hidden flex-1 flex-wrap gap-1.5 lg:flex">
        {step.milestones.map((m, i) => (
          <Pill key={m.key} label={m.label} detail={m.detail} done={m.done} current={i === currentIndex} />
        ))}
      </ol>

      <p className="text-[13.5px] leading-relaxed text-ink/80 lg:text-right">
        {step.open.lead}{" "}
        {step.open.links.map((l, i) => (
          <span key={l.href + l.label}>
            {i > 0 && <span aria-hidden="true" className="text-ink/40"> · </span>}
            <StepLink link={l} className="font-medium text-[#9a6b00] underline-offset-2 hover:underline" />
          </span>
        ))}
        {step.aside && (
          <>
            <span aria-hidden="true" className="text-ink/40"> · </span>
            <StepLink link={step.aside} className="text-ink/70 underline-offset-2 hover:text-forest hover:underline" />
          </>
        )}
      </p>
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

function Pill({ label, detail, done, current }: { label: string; detail: string; done: boolean; current: boolean }) {
  const look = current
    ? "bg-[#ffd301] font-semibold text-forest"
    : done
      ? "bg-forest/[0.06] text-forest"
      : "border border-dashed border-ink/25 text-ink/70";
  return (
    <li
      aria-current={current ? "step" : undefined}
      title={current ? undefined : detail}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[13px] ${look}`}
    >
      {done && (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
      {label}
      {current ? <span>· {detail}</span> : <span className="sr-only">: {detail}</span>}
      <span className="sr-only">{done ? "(done)" : current ? "(now)" : "(to do)"}</span>
    </li>
  );
}
