"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { inquiryContext, type InquiryContext } from "@/app/inquiry-context";

export type InquiryQuestion = {
  /** The chip. */
  label: string;
  /** The line it adds to the message, after "Could you let us know". */
  line: string;
  /** "our date" questions read differently when there isn't one. */
  lineNoDate?: string;
  on?: boolean;
};

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/**
 * The inquiry form for venues and vendors. The couple picks what to share
 * and what to ask with chips, and the message writes itself from those,
 * in their voice, until they edit it; then it's theirs.
 *
 * Replaces the blank textarea whose suggested message was hidden behind
 * pressing Tab (invisible, and impossible on a phone), and fills in the
 * date and headcount every venue asks first.
 */
export function InquiryComposer({
  to,
  questions,
  hidden,
  needsRecipient,
  send,
  onDone,
}: {
  to: string;
  questions: InquiryQuestion[];
  hidden: Record<string, string>;
  /** No stored email for this listing: the couple types one. */
  needsRecipient: boolean;
  send: (formData: FormData) => Promise<{ error?: string } | undefined | void>;
  onDone: () => void;
}) {
  const [ctx, setCtx] = useState<InquiryContext | null>(null);
  const [shareDate, setShareDate] = useState(true);
  const [shareGuests, setShareGuests] = useState(true);
  const [flexible, setFlexible] = useState(false);
  const [asks, setAsks] = useState(() => questions.filter((q) => q.on).map((q) => q.label));
  const [edited, setEdited] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let live = true;
    inquiryContext().then(
      (c) => live && setCtx(c),
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, []);

  const hasDate = Boolean(ctx?.date);
  const draft = buildDraft({ ctx, shareDate, shareGuests, flexible, asks, questions });
  const message = edited ?? draft;

  function toggleAsk(label: string) {
    setAsks((a) => (a.includes(label) ? a.filter((x) => x !== label) : [...a, label]));
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await send(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        onDone();
      }
    });
  }

  const whenLabel = ctx?.date ? longDate(ctx.date) : ctx?.season ? `${ctx.season}, date to come` : null;

  return (
    <form
      action={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      className="mt-4 flex flex-col gap-4 border-t border-hairline pt-4"
    >
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      {(whenLabel || ctx?.guests) && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink">Share with {to}</legend>
          <div className="flex flex-wrap gap-2">
            {whenLabel && (
              <Chip pressed={shareDate} onClick={() => setShareDate((v) => !v)}>
                {whenLabel}
              </Chip>
            )}
            {ctx?.guests && (
              <Chip pressed={shareGuests} onClick={() => setShareGuests((v) => !v)}>
                About {ctx.guests} guests
              </Chip>
            )}
            {hasDate && shareDate && (
              <Chip pressed={flexible} onClick={() => setFlexible((v) => !v)}>
                We’re flexible on the date
              </Chip>
            )}
          </div>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">What would you like to know?</legend>
        <div className="flex flex-wrap gap-2">
          {questions.map((q) => (
            <Chip key={q.label} pressed={asks.includes(q.label)} onClick={() => toggleAsk(q.label)}>
              {q.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      {needsRecipient && (
        <label className="flex flex-col gap-1 text-sm text-ink">
          Send to
          <input
            type="email"
            name="recipient_email"
            required
            placeholder="Their email address"
            className="h-11 rounded-md border border-hairline bg-card px-3 text-ink outline-none focus:border-forest"
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm text-ink">
        <span className="flex items-baseline justify-between gap-3">
          Your message
          {edited !== null && edited !== draft && (
            <button type="button" onClick={() => setEdited(null)} className="text-xs text-brass hover:underline">
              Rewrite from my choices
            </button>
          )}
        </span>
        <textarea
          name="message"
          rows={9}
          required
          value={message}
          onChange={(e) => setEdited(e.target.value)}
          className="rounded-md border border-hairline bg-card px-3 py-2 text-[15px] leading-relaxed text-ink outline-none focus:border-forest"
        />
        <span className="text-xs text-ink/70">
          Written from your choices above. Change anything; it’s sent as you, and their reply comes to your email.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm text-ink">
        <span>
          Phone <span className="text-ink/70">(optional)</span>
        </span>
        <input
          type="tel"
          name="sender_phone"
          autoComplete="tel"
          placeholder="So they can call or text you back"
          className="h-11 rounded-md border border-hairline bg-card px-3 text-ink outline-none focus:border-forest"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="h-11 flex-1 rounded-md bg-forest px-4 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60 sm:flex-none"
        >
          {isPending ? "Sending…" : `Send to ${to}`}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-11 rounded-md border border-hairline px-4 text-sm text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors ${
        pressed ? "border-forest bg-forest text-parchment" : "border-hairline bg-card text-ink hover:border-forest"
      }`}
    >
      {pressed && (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
      {children}
    </button>
  );
}

/** The message, in the couple's voice (wren-voice: the couple speaks; Wren disappears). */
function buildDraft({
  ctx,
  shareDate,
  shareGuests,
  flexible,
  asks,
  questions,
}: {
  ctx: InquiryContext | null;
  shareDate: boolean;
  shareGuests: boolean;
  flexible: boolean;
  asks: string[];
  questions: InquiryQuestion[];
}) {
  const names = ctx?.names.length ? ctx.names.join(" and ") : null;
  const hasDate = Boolean(ctx?.date) && shareDate;

  const when = !shareDate
    ? ""
    : ctx?.date
      ? ` on ${longDate(ctx.date)}`
      : ctx?.season
        ? ` for the ${ctx.season.toLowerCase()}`
        : "";
  const size = shareGuests && ctx?.guests ? `, with about ${ctx.guests} guests` : "";
  const intro = `${names ? `We’re ${names}, and we’re` : "We’re"} planning our wedding${when}${size}.`;
  const dateNote = hasDate && flexible ? " We’re flexible on the date if another day works better." : "";

  const lines = questions
    .filter((q) => asks.includes(q.label))
    .map((q) => (!hasDate && q.lineNoDate ? q.lineNoDate : q.line));
  const ask =
    lines.length === 0
      ? "We’d love to hear more about what you offer."
      : lines.length === 1
        ? `Could you let us know ${lines[0]}?`
        : `Could you let us know:\n${lines.map((l) => `• ${l}`).join("\n")}`;

  // "Hello," rather than "Hi <name>": many names start with "The".
  return `Hello,\n\n${intro}${dateNote}\n\n${ask}\n\nThank you,\n${names ? names.replace(" and ", " & ") : ""}`.trimEnd();
}
