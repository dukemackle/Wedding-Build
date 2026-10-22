"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { WrenMark } from "@/components/wren-mark";
import { WrenChatBirdIcon } from "@/components/icons";
import { daysUntilWedding } from "@/lib/countdown";
import { SEASONS, STATES, STYLE_TIERS, VENUE_TYPES } from "@/lib/wedding-options";
import { startWedding } from "./actions";

const STEP_COUNT = 5;

const GUEST_CHOICES = [
  { label: "Under 50", value: 40 },
  { label: "50–100", value: 75 },
  { label: "100–150", value: 125 },
  { label: "150–200", value: 175 },
  { label: "200+", value: 225 },
];

const TIER_NOTES: Record<string, string> = {
  Simple: "Pared back, with the money on what matters most to you",
  Classic: "The full day: dinner, dancing, flowers and photos",
  Luxury: "Every detail done properly, from venue to favours",
};

type When = "date" | "season" | "none" | null;

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * The five questions of /start, one per screen. Every answer lives in state
 * and reaches the server through the hidden inputs at the bottom, because a
 * step's own controls unmount once the couple moves on.
 *
 * Phone: one column, Continue pinned to the bottom, a strip with their names
 * and countdown at the top. From 1024px: the question on the left and their
 * dashboard filling in on the right, so each answer shows what it's for.
 */
export function SetupFlow({
  initialState,
  initialTier,
  initialGuests,
  next: returnTo,
}: {
  initialState: string;
  initialTier: string;
  initialGuests: number | null;
  /** Where to go once it's saved, when setup was a detour (e.g. a listing's Save). */
  next?: string;
}) {
  const [step, setStep] = useState(0);
  const [partnerA, setPartnerA] = useState("");
  const [partnerB, setPartnerB] = useState("");
  const [when, setWhen] = useState<When>(null);
  const [date, setDate] = useState("");
  const [season, setSeason] = useState("");
  const [state, setState] = useState(initialState);
  const [guests, setGuests] = useState<number | null>(initialGuests);
  const [tier, setTier] = useState(initialTier);
  const [venueType, setVenueType] = useState("");
  const [result, submit, pending] = useActionState(startWedding, {});

  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    // Moving to a new question puts focus on it, so a screen reader announces
    // it and Tab starts from the top of the step. Not on load: the name field
    // takes focus there.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [step]);

  const namesDone = partnerA.trim() !== "" && partnerB.trim() !== "";
  const last = step === STEP_COUNT - 1;
  const today = new Date().toISOString().slice(0, 10);

  function next() {
    if (step === 0 && !namesDone) return;
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    // Enter in a field, or Continue before the last step, moves on rather
    // than saving. "Skip the rest" and Finish save.
    if (!last && submitter?.value !== "finish") {
      e.preventDefault();
      next();
    }
  }

  const dateLine =
    when === "date" && date
      ? formatDate(date)
      : when === "season" && season
        ? `${season}, date to come`
        : when
          ? "Date to come"
          : null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b border-hairline px-4 sm:h-[72px] sm:px-10">
        <div className="hidden sm:block">
          <WrenMark href="/" />
        </div>
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          aria-label="Back"
          disabled={step === 0}
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-ink disabled:invisible sm:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <Progress step={step} className="sm:hidden" />
        {step > 0 ? (
          <button
            type="submit"
            form="setup-form"
            value="finish"
            className="py-3 text-[15px] text-brass hover:underline"
          >
            <span className="sm:hidden">Skip</span>
            <span className="hidden sm:inline">Skip the rest, take me to my dashboard</span>
          </button>
        ) : (
          <span className="w-11 sm:hidden" aria-hidden="true" />
        )}
      </header>

      <div className="grid flex-1 lg:grid-cols-2">
        <form
          id="setup-form"
          action={submit}
          onSubmit={onSubmit}
          className="flex flex-col px-4 pb-32 pt-5 sm:px-10 lg:pb-12 lg:pl-16 lg:pr-12 lg:pt-14 xl:pl-[120px]"
        >
          <div className="hidden items-center gap-4 sm:flex">
            <span className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
              Step {step + 1} of {STEP_COUNT}
            </span>
            <Progress step={step} />
          </div>

          {step > 0 && namesDone && (
            <div className="mb-5 flex items-center justify-between rounded-xl bg-forest px-4 py-2.5 sm:hidden">
              <span className="truncate font-display text-[22px] font-semibold text-parchment">
                {partnerA} &amp; {partnerB}
              </span>
              <span className="ml-3 shrink-0 font-mono-numbers text-xs text-parchment/85">
                {when === "date" && date ? daysUntilWedding(date) : (dateLine ?? "")}
              </span>
            </div>
          )}

          <div key={step} className="animate-page-in flex flex-col">
            <WrenSays>{WREN_LINES[step]}</WrenSays>

            <h1
              ref={heading}
              tabIndex={-1}
              className="mt-5 font-display text-[38px] font-semibold leading-[1.05] text-forest outline-none sm:mt-7 sm:text-5xl lg:text-[52px]"
            >
              {HEADINGS[step]}
            </h1>

            <div className="mt-6 flex max-w-[520px] flex-col gap-3 sm:mt-8">
              {step === 0 && (
                <>
                  <TextField label="Your first name" value={partnerA} onChange={setPartnerA} autoFocus autoComplete="given-name" />
                  <TextField label="Your partner’s first name" value={partnerB} onChange={setPartnerB} />
                </>
              )}

              {step === 1 && (
                <fieldset className="flex flex-col gap-3">
                  <legend className="sr-only">Do you have a date?</legend>
                  <Choice name="when" checked={when === "date"} onPick={() => setWhen("date")} title="Yes, we’ve picked one">
                    <label className="flex flex-col gap-1 text-sm text-ink/80">
                      Wedding date
                      <input
                        type="date"
                        min={today}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-12 rounded-md border border-hairline bg-parchment px-3 text-base text-ink outline-none focus:border-forest sm:w-60"
                      />
                    </label>
                  </Choice>
                  <Choice
                    name="when"
                    checked={when === "season"}
                    onPick={() => setWhen("season")}
                    title="We know roughly when"
                    hint="Pick a season"
                  >
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Season">
                      {SEASONS.map((s) => (
                        <Chip key={s} selected={season === s} onClick={() => setSeason(s)}>
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </Choice>
                  <Choice
                    name="when"
                    checked={when === "none"}
                    onPick={() => setWhen("none")}
                    title="Not yet"
                    hint="Most couples choose the venue and the date together"
                  />
                </fieldset>
              )}

              {step === 2 && (
                <label className="flex flex-col gap-1.5 text-sm text-ink/80">
                  State
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="h-12 rounded-md border border-hairline bg-card px-3 text-base text-ink outline-none focus:border-forest"
                  >
                    <option value="">Choose a state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {step === 3 && (
                <>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Roughly how many guests">
                    {GUEST_CHOICES.map((c) => (
                      <Chip key={c.label} selected={guests === c.value} onClick={() => setGuests(c.value)} large>
                        {c.label}
                      </Chip>
                    ))}
                  </div>
                  <label className="mt-2 flex flex-col gap-1.5 text-sm text-ink/80">
                    Or an exact number
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={2000}
                      value={guests ?? ""}
                      onChange={(e) => setGuests(e.target.value ? Number(e.target.value) : null)}
                      className="h-12 rounded-md border border-hairline bg-card px-3 text-base text-ink outline-none focus:border-forest sm:w-40"
                    />
                  </label>
                </>
              )}

              {step === 4 && (
                <>
                  <fieldset className="flex flex-col gap-3">
                    <legend className="sr-only">What feel are you going for?</legend>
                    {STYLE_TIERS.map((t) => (
                      <Choice key={t} name="tier" checked={tier === t} onPick={() => setTier(t)} title={t} hint={TIER_NOTES[t]} />
                    ))}
                  </fieldset>
                  <p className="mt-4 text-sm text-ink/80">Any setting in mind? (optional)</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Setting">
                    {VENUE_TYPES.map((v) => (
                      <Chip key={v} selected={venueType === v} onClick={() => setVenueType(venueType === v ? "" : v)}>
                        {v}
                      </Chip>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {result.error && (
            <p role="alert" className="mt-6 max-w-[520px] rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
              {result.error}
            </p>
          )}

          <input type="hidden" name="partner_a_name" value={partnerA} />
          <input type="hidden" name="partner_b_name" value={partnerB} />
          <input type="hidden" name="wedding_date" value={when === "date" ? date : ""} />
          <input type="hidden" name="season" value={when === "season" ? season : ""} />
          <input type="hidden" name="state" value={state} />
          <input type="hidden" name="guest_count" value={guests ?? ""} />
          <input type="hidden" name="style_tier" value={tier} />
          <input type="hidden" name="venue_type" value={venueType} />
          {returnTo && <input type="hidden" name="next" value={returnTo} />}

          <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-hairline bg-parchment px-4 pb-7 pt-3 lg:static lg:mt-auto lg:max-w-[520px] lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-10">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="hidden h-12 rounded-md border border-hairline bg-card px-5 text-[15px] text-ink transition-colors hover:border-forest lg:block"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              value={last ? "finish" : "next"}
              disabled={(step === 0 && !namesDone) || pending}
              className="h-[52px] flex-1 rounded-md bg-forest px-7 text-base font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50 lg:h-12 lg:flex-none"
            >
              {pending ? "Setting things up…" : last ? "Finish" : "Continue"}
            </button>
            {step >= 2 && !last && (
              <button type="button" onClick={next} className="h-12 px-3 text-[15px] text-brass hover:underline">
                Not sure yet
              </button>
            )}
          </div>
        </form>

        <aside
          aria-label="Your dashboard so far"
          className="hidden flex-col gap-5 border-l border-hairline bg-[radial-gradient(700px_circle_at_70%_20%,rgb(255_211_1/0.14),transparent_60%)] bg-hairline/30 px-12 pt-14 lg:flex xl:pr-[120px]"
        >
          <span className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
            Your dashboard, filling in as you go
          </span>
          <div className="overflow-hidden rounded-2xl bg-card shadow-[0_18px_50px_-18px_rgb(20_32_61/0.28)]">
            <div className="relative flex h-[150px] items-end bg-forest px-7 pb-5">
              <span className="font-display text-[44px] font-semibold leading-none text-parchment">
                {namesDone ? `${partnerA} & ${partnerB}` : "Your names"}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-hairline px-7 py-5">
              <span className={dateLine ? "text-base" : "text-sm text-ink/70"}>
                {dateLine ?? (step < 1 ? "Your date, next" : "Your date")}
              </span>
              {when === "date" && date && (
                <span className="shrink-0 font-mono-numbers text-[15px]">{daysUntilWedding(date)}</span>
              )}
            </div>
            <div className="flex flex-col px-7 pb-5 pt-2">
              <PreviewRow label="Where" value={state} status={rowStatus(step, 2)} />
              <PreviewRow label="Guests" value={guests ? `About ${guests}` : ""} status={rowStatus(step, 3)} />
              <PreviewRow
                label="Style"
                value={[tier, venueType].filter(Boolean).join(" · ")}
                status={rowStatus(step, 4)}
              />
              <PreviewRow
                label="Budget estimate"
                value=""
                status={state && guests ? "On the next screen" : "Once we know where and how many"}
                lastRow
              />
            </div>
          </div>
          <p className="max-w-[440px] text-sm leading-relaxed text-ink/70">
            Every answer lands here straight away. Anything you skip shows up as a gentle prompt on your
            dashboard later.
          </p>
        </aside>
      </div>
    </div>
  );
}

const HEADINGS = [
  "First, who’s getting married?",
  "Do you have a date?",
  "Where’s the wedding?",
  "Roughly how many guests?",
  "What feel are you going for?",
];

const WREN_LINES = [
  "Hi, I’m Wren. Five quick questions and I’ll set up your budget, checklist and countdown. Skip anything you don’t know yet.",
  "Plenty of couples don’t have one yet. If that’s you, I’ll plan around a season instead.",
  "Even a rough idea helps. Prices vary a lot from state to state.",
  "A guess is fine. It sets your budget and the size of venue to look for.",
  "This shapes your budget estimate. You can change it any time.",
];

function rowStatus(step: number, at: number) {
  if (step > at) return "Skipped for now";
  if (step === at) return "Answering now";
  return "Coming up";
}

function Progress({ step, className = "" }: { step: number; className?: string }) {
  return (
    <div className={`flex gap-1.5 ${className}`} aria-hidden="true">
      {Array.from({ length: STEP_COUNT }, (_, i) => (
        <span key={i} className={`h-1 w-7 rounded-full sm:w-10 ${i <= step ? "bg-forest" : "bg-hairline"}`} />
      ))}
    </div>
  );
}

function WrenSays({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 flex items-start gap-3 sm:mt-10">
      <span className="wren-idle inline-flex shrink-0">
        <WrenChatBirdIcon className="h-9 w-9 sm:h-11 sm:w-11" />
      </span>
      <p className="mt-1 max-w-[400px] rounded-[4px_14px_14px_14px] bg-wren-soft px-3.5 py-2.5 text-[15px] leading-normal text-ink">
        {children}
      </p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  autoFocus,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink/80">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        maxLength={60}
        className="h-12 rounded-md border border-hairline bg-card px-3 text-base text-ink outline-none focus:border-forest"
      />
    </label>
  );
}

function Choice({
  name,
  checked,
  onPick,
  title,
  hint,
  children,
}: {
  name: string;
  checked: boolean;
  onPick: () => void;
  title: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border-2 bg-card transition-colors ${checked ? "border-forest shadow-sm" : "border-hairline hover:border-ink/30"}`}
    >
      <label className="flex min-h-16 cursor-pointer items-center gap-3.5 px-4 py-3 sm:px-5">
        <input type="radio" name={name} checked={checked} onChange={onPick} className="h-5 w-5 shrink-0 accent-forest" />
        <span className="flex flex-col gap-0.5">
          <span className="text-[17px] font-medium text-ink">{title}</span>
          {hint && <span className="text-sm text-ink/70">{hint}</span>}
        </span>
      </label>
      {checked && children && <div className="px-4 pb-4 sm:pl-[54px] sm:pr-5">{children}</div>}
    </div>
  );
}

function Chip({
  selected,
  onClick,
  large,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  large?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border px-4 text-[15px] transition-colors ${large ? "h-12 px-5" : "h-11"} ${
        selected ? "border-forest bg-forest text-parchment" : "border-hairline bg-card text-ink hover:border-forest"
      }`}
    >
      {children}
    </button>
  );
}

function PreviewRow({
  label,
  value,
  status,
  lastRow,
}: {
  label: string;
  value: string;
  status: string;
  lastRow?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 py-3.5 ${lastRow ? "" : "border-b border-dashed border-hairline"}`}>
      <span className="text-[15px] text-ink/70">{label}</span>
      {value ? (
        <span className="text-right text-[15px] font-medium text-ink">{value}</span>
      ) : (
        <span className="text-right text-sm text-ink/70">{status}</span>
      )}
    </div>
  );
}
