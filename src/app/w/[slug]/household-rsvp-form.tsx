"use client";

import { useState, useTransition } from "react";
import { RSVP_YES_EVENT } from "@/components/site-motion";
import { submitHouseholdRsvp } from "./actions";
import { forgetInvite } from "./invite-actions";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { LegalNotice } from "@/components/legal-notice";
import { asksMeal, mealChoices } from "@/lib/meal-options";
import type { Household } from "@/lib/households";

const inputClass =
  "w-full rounded-md border border-hairline bg-parchment px-3 py-2.5 text-ink outline-none focus:border-forest";

type Answer = {
  coming: boolean | null;
  meal: string;
  bringing: boolean;
  plusOneName: string;
  events: Record<string, boolean>;
};

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function startingAnswers(household: Household): Record<string, Answer> {
  return Object.fromEntries(
    household.members.map((m) => [
      m.id,
      {
        coming:
          m.status === "confirmed"
            ? true
            : m.status === "declined"
              ? false
              : null,
        meal: m.meal ?? "",
        bringing: m.plus_one,
        plusOneName: m.plus_one_name ?? "",
        events: Object.fromEntries(
          m.eventIds.map((id) => [id, m.event_rsvps?.[id] !== false]),
        ),
      },
    ]),
  );
}

/**
 * The RSVP for a guest who came through their personal link (0141): their
 * whole household on one screen, a card per person. Answers that were
 * already given show as chosen, so coming back to the link is how a guest
 * changes their mind.
 */
export function HouseholdRsvpForm({
  household,
  slug,
  mealOptions = null,
  turnstileSiteKey,
}: {
  household: Household;
  slug: string;
  mealOptions?: string[] | null;
  turnstileSiteKey?: string | null;
}) {
  const meals = mealChoices(mealOptions);
  const askMeal = asksMeal(mealOptions);
  const eventsById = new Map(household.events.map((e) => [e.id, e]));
  const alreadyAnswered = household.members.some(
    (m) => m.status === "confirmed" || m.status === "declined",
  );

  const [answers, setAnswers] = useState(() => startingAnswers(household));
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [isPending, startTransition] = useTransition();

  const update = (id: string, change: Partial<Answer>) =>
    setAnswers((all) => ({ ...all, [id]: { ...all[id], ...change } }));
  const unanswered = household.members.filter(
    (m) => answers[m.id].coming === null,
  );

  function handleSubmit(formData: FormData) {
    if (unanswered.length > 0) {
      setError(
        `Let us know if ${unanswered.map((m) => firstName(m.name)).join(" and ")} can come.`,
      );
      return;
    }
    startTransition(async () => {
      const result = await submitHouseholdRsvp(formData);
      setAttempt((n) => n + 1);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        // Confetti, if the couple turned it on (Motion tab).
        if (Object.values(answers).some((a) => a.coming))
          window.dispatchEvent(new Event(RSVP_YES_EVENT));
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-md border border-forest/40 bg-forest/10 px-4 py-4 text-ink sm:px-5">
        <p className="font-medium text-forest">Thank you, your RSVP is in.</p>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {household.members.map((m) => {
            const a = answers[m.id];
            const extra = [
              a.coming && a.meal,
              a.coming && a.bringing && `+ ${a.plusOneName || "a guest"}`,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <li key={m.id}>
                <span className="font-medium">{m.name}</span>:{" "}
                {a.coming ? "coming" : "can't make it"}
                {extra && <span className="text-ink/70"> ({extra})</span>}
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-3 text-sm text-brass hover:underline"
        >
          Change your answers
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="mt-6 flex flex-col gap-5">
      <input type="hidden" name="wedding_id" value={household.weddingId} />
      <input type="hidden" name="invite_code" value={household.code} />

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-ink">
          Replying for <span className="font-medium">{household.label}</span>
        </p>
        <button
          type="button"
          onClick={() => startTransition(() => forgetInvite(slug))}
          className="text-sm text-brass hover:underline"
        >
          Not you?
        </button>
      </div>
      {alreadyAnswered && (
        <p className="-mt-2 text-sm text-ink/70">
          These are the answers you sent. Change anything and send again.
        </p>
      )}

      <div
        className={`grid items-start gap-3 ${household.members.length > 1 ? "lg:grid-cols-2" : ""}`}
      >
        {household.members.map((m) => {
          const a = answers[m.id];
          const first = firstName(m.name);
          return (
            <fieldset
              key={m.id}
              className={`flex flex-col gap-3 rounded-lg border bg-parchment p-4 transition-colors ${
                a.coming === null ? "border-hairline" : "border-forest/50"
              }`}
            >
              <legend className="sr-only">{m.name}</legend>
              <input
                type="hidden"
                name={`status_${m.id}`}
                value={
                  a.coming === null ? "" : a.coming ? "confirmed" : "declined"
                }
              />
              <p className="font-display text-xl text-ink">{m.name}</p>
              <div
                role="group"
                aria-label={`Can ${first} come?`}
                className="grid grid-cols-2 gap-2"
              >
                {[
                  { label: "Coming", value: true },
                  { label: "Can't make it", value: false },
                ].map((choice) => (
                  <button
                    key={choice.label}
                    type="button"
                    aria-pressed={a.coming === choice.value}
                    onClick={() => update(m.id, { coming: choice.value })}
                    className={`min-h-11 rounded-md border px-3 text-sm font-medium transition-colors ${
                      a.coming === choice.value
                        ? choice.value
                          ? "border-forest bg-forest text-parchment"
                          : "border-ink/40 bg-ink/10 text-ink"
                        : "border-hairline bg-card text-ink hover:border-forest/50"
                    }`}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>

              {a.coming && (
                <div className="flex flex-col gap-3 border-t border-hairline pt-3">
                  {askMeal && (
                    <label className="flex flex-col gap-1 text-sm text-ink">
                      {first}&apos;s meal
                      <select
                        name={`meal_${m.id}`}
                        value={a.meal}
                        onChange={(e) => update(m.id, { meal: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Choose one</option>
                        {meals.map((meal) => (
                          <option key={meal} value={meal}>
                            {meal}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {m.eventIds.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-ink">Which events?</p>
                      {m.eventIds.map((id) => {
                        const event = eventsById.get(id);
                        if (!event) return null;
                        const yes = a.events[id] !== false;
                        return (
                          <label
                            key={id}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-hairline bg-card px-3 py-2 text-sm text-ink"
                          >
                            <span className="min-w-0">{event.title}</span>
                            <input
                              type="hidden"
                              name={`event_${m.id}_${id}`}
                              value={yes ? "yes" : "no"}
                            />
                            <input
                              type="checkbox"
                              checked={yes}
                              onChange={(e) =>
                                update(m.id, {
                                  events: {
                                    ...a.events,
                                    [id]: e.target.checked,
                                  },
                                })
                              }
                              className="h-5 w-5 shrink-0 accent-forest"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {m.plus_one_allowed && (
                    <div className="flex flex-col gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                        <input
                          type="checkbox"
                          name={`plus_one_${m.id}`}
                          checked={a.bringing}
                          onChange={(e) =>
                            update(m.id, { bringing: e.target.checked })
                          }
                          className="h-5 w-5 accent-forest"
                        />
                        {first} is bringing a guest
                      </label>
                      {a.bringing && (
                        <input
                          name={`plus_one_name_${m.id}`}
                          value={a.plusOneName}
                          onChange={(e) =>
                            update(m.id, { plusOneName: e.target.value })
                          }
                          placeholder="Their name (optional)"
                          className={inputClass}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      <TurnstileWidget key={attempt} siteKey={turnstileSiteKey} />
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="btn-motion w-full rounded-md bg-forest px-5 py-3 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60 sm:w-auto sm:self-start"
      >
        {isPending
          ? "Sending..."
          : alreadyAnswered
            ? "Update RSVP"
            : "Send RSVP"}
      </button>
      <LegalNotice action="sending your RSVP" />
    </form>
  );
}
