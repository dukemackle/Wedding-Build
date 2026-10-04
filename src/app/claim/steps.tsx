"use client";

// The claim forms run to a dozen sections, so they're split into steps. All
// steps stay mounted (hidden, not unmounted) so nothing typed or mid-upload
// is lost when moving between them.

export type Step = { title: string; done: boolean; optional?: boolean };

// Desktop: a sticky list down the left with a track that fills as steps are
// completed. Phone: a sticky strip across the top with the same progress as
// segments -- there's no room for a column beside the fields.
export function StepRail({ steps, current, onPick }: { steps: Step[]; current: number; onPick: (i: number) => void }) {
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-hairline bg-parchment/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <p className="font-medium text-forest">
            <span className="text-ink/50">
              Step {current + 1} of {steps.length} ·
            </span>{" "}
            {steps[current].title}
          </p>
          <p className="shrink-0 font-mono-numbers text-xs text-ink/50">{pct}% done</p>
        </div>
        <div className="mt-2 flex gap-1">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => onPick(i)}
              aria-label={`Go to ${s.title}`}
              aria-current={i === current ? "step" : undefined}
              className="flex-1 py-1.5"
            >
              <span
                className={`block h-1.5 rounded-full ${
                  s.done ? "bg-forest" : i === current ? "bg-brass" : "bg-hairline"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <nav aria-label="Form steps" className="hidden lg:sticky lg:top-8 lg:block">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-ink/50">{pct}% done</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hairline">
          <div className="h-full rounded-full bg-forest transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <ol className="mt-6">
          {steps.map((s, i) => {
            const isCurrent = i === current;
            return (
              <li key={s.title} className="relative pb-6 last:pb-0">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className={`absolute left-[11px] top-7 bottom-1 w-px ${s.done ? "bg-forest" : "bg-hairline"}`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => onPick(i)}
                  aria-current={isCurrent ? "step" : undefined}
                  className="group flex w-full items-start gap-3 text-left"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                      s.done
                        ? "border-forest bg-forest text-parchment"
                        : isCurrent
                          ? "border-brass bg-brass/15 text-forest ring-4 ring-brass/15"
                          : "border-hairline bg-card text-ink/50 group-hover:border-forest/40"
                    }`}
                  >
                    {s.done ? "✓" : i + 1}
                  </span>
                  <span className="pt-0.5">
                    <span className={`block text-sm ${isCurrent ? "font-semibold text-forest" : "text-ink/75 group-hover:text-forest"}`}>
                      {s.title}
                    </span>
                    {s.optional && !s.done && <span className="block text-xs text-ink/45">Optional</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

// Back / Next under each step. The last step passes its submit button as
// `finish` in place of Next.
export function StepNav({
  current,
  steps,
  onBack,
  onNext,
  finish,
}: {
  current: number;
  steps: Step[];
  onBack: () => void;
  onNext: () => void;
  finish?: React.ReactNode;
}) {
  const next = steps[current + 1];
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {current > 0 ? (
        <button type="button" onClick={onBack} className="text-sm text-ink/60 hover:text-forest">
          &larr; Back
        </button>
      ) : (
        <span />
      )}
      {finish ??
        (next && (
          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-md bg-forest px-5 py-3 font-medium text-parchment transition-colors hover:bg-forest/90 sm:w-auto"
          >
            Next: {next.title} &rarr;
          </button>
        ))}
    </div>
  );
}
