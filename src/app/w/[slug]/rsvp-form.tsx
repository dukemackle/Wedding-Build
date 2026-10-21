"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { RSVP_YES_EVENT } from "@/components/site-motion";
import { getRsvpEvents, submitRsvp } from "./actions";
import type { RsvpEvent } from "@/lib/supabase/types";
import { formatFullDate, formatTime } from "@/lib/itinerary";
import { shrinkImage } from "@/lib/shrink-image";
import { asksMeal, mealChoices } from "@/lib/meal-options";
import { SMS_CONSENT_DETAIL } from "@/lib/sms-consent";
import { LegalNotice } from "@/components/legal-notice";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

export function RsvpForm({
  weddingId,
  partnerAName,
  partnerBName,
  shareHref,
  initialEvents = [],
  mealOptions = null,
  askDietary = true,
}: {
  /** The open RSVP events, known when the page renders; refined by name as they type. */
  initialEvents?: RsvpEvent[];
  weddingId: string;
  partnerAName: string | null;
  partnerBName: string | null;
  /** The photo-wall posting page, offered once the RSVP is in. */
  shareHref?: string;
  /** The couple's menu; null is the preset list, fewer than two isn't asked. */
  mealOptions?: string[] | null;
  askDietary?: boolean;
}) {
  // "John's side" reads to a guest; "Side A" doesn't. With no names set up
  // yet the question is dropped rather than asked in the abstract.
  const sideA = (partnerAName ?? "").trim().split(/\s+/)[0];
  const sideB = (partnerBName ?? "").trim().split(/\s+/)[0];
  const askSide = Boolean(sideA && sideB);
  const meals = mealChoices(mealOptions);

  const [error, setError] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [bringingPlusOne, setBringingPlusOne] = useState(false);
  const [attending, setAttending] = useState(true);
  const [showExtras, setShowExtras] = useState(false);
  // Two steps: just the name first, so the section reads as an invitation
  // rather than a form; the rest opens once they press Continue.
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  // Multi-day weddings ask about each event. Which events depends on who's
  // answering (invite-only ones are for named guests), so they're looked up
  // from the name once it's typed.
  const [name, setName] = useState("");
  const [events, setEvents] = useState<RsvpEvent[]>(initialEvents);
  const [going, setGoing] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    const timer = setTimeout(async () => {
      try {
        setEvents(await getRsvpEvents(weddingId, trimmed));
      } catch {
        // Keep the events already shown; the form still sends without them.
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [name, weddingId]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const photo = formData.get("photo") as File | null;
      if (photo && photo.size > 0) formData.set("photo", await shrinkImage(photo));
      const result = await submitRsvp(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        // Confetti, if the couple turned it on (Motion tab).
        if (attending) window.dispatchEvent(new Event(RSVP_YES_EVENT));
        setSubmitted(true);
        setBringingPlusOne(false);
        setAttending(true);
        setShowExtras(false);
        setStep(1);
        setName("");
        setGoing({});
        formRef.current?.reset();
      }
    });
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-md border border-forest/40 bg-forest/10 px-4 py-3 text-forest">
        <p>Thanks — your RSVP has been sent!</p>
        {shareHref && (
          <a href={shareHref} className="mt-1 inline-block text-sm font-medium text-brass hover:underline">
            Add another photo to the wall &rarr;
          </a>
        )}
      </div>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="wedding_id" value={weddingId} />
      {/* Spam trap: invisible to people, so only bots fill it in. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />
      {/* The one question every guest answers comes first; the rest only
          appears once it applies, so a "no" is two fields, not twelve. */}
      {step === 1 ? (
        <div className="flex flex-col gap-3">
          <label className={labelClass}>
            Find your invitation
            <input
              name="guest_name"
              required
              autoComplete="name"
              placeholder="Your first and last name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (name.trim()) setStep(2);
                }
              }}
              className={`${inputClass} py-3`}
            />
            <span className="text-xs text-ink/60">Use the name on your invitation.</span>
          </label>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => setStep(2)}
            className="btn-motion self-start rounded-md bg-forest px-5 py-2.5 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      ) : (
        <>
          <input type="hidden" name="guest_name" value={name} />
          <p className="text-ink">
            Replying as <span className="font-medium">{name.trim()}</span>{" "}
            <button type="button" onClick={() => setStep(1)} className="text-sm text-brass hover:underline">
              Change
            </button>
          </p>
          <input type="hidden" name="events" value={JSON.stringify(going)} />
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm text-ink">Will you be attending?</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { value: "confirmed", label: "Joyfully accepts", yes: true },
                { value: "declined", label: "Regretfully declines", yes: false },
              ].map((choice) => (
                <label
                  key={choice.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-ink transition-colors ${
                    attending === choice.yes
                      ? "border-forest bg-forest/10"
                      : "border-hairline bg-parchment hover:border-forest/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={choice.value}
                    checked={attending === choice.yes}
                    onChange={() => setAttending(choice.yes)}
                    className="accent-forest"
                  />
                  {choice.label}
                </label>
              ))}
            </div>
          </fieldset>
          {attending && events.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm text-ink">Which events can you make?</legend>
              {events.map((event) => {
                const yes = going[event.id] !== false;
                const when = [formatFullDate(event.event_date), event.start_time && formatTime(event.start_time)]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <div
                    key={event.id}
                    className="flex flex-col gap-2 rounded-md border border-hairline bg-parchment px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-ink">{event.title}</p>
                      <p className="text-xs text-ink/60">{[when, event.location].filter(Boolean).join(" · ")}</p>
                    </div>
                    <div role="group" aria-label={event.title} className="flex shrink-0 gap-2">
                      {[
                        { label: "Yes", value: true },
                        { label: "No", value: false },
                      ].map((choice) => (
                        <button
                          key={choice.label}
                          type="button"
                          aria-pressed={yes === choice.value}
                          onClick={() => setGoing((g) => ({ ...g, [event.id]: choice.value }))}
                          className={`min-h-10 min-w-16 rounded-md border px-3 text-sm ${
                            yes === choice.value
                              ? "border-forest bg-forest/10 text-forest"
                              : "border-hairline text-ink hover:border-forest/50"
                          }`}
                        >
                          {choice.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </fieldset>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {attending && (
              <>
                {asksMeal(mealOptions) && (
                  <label className={labelClass}>
                    Meal preference
                    <select name="meal" defaultValue="" className={inputClass}>
                      <option value="">Optional — choose one</option>
                      {meals.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {askDietary && (
                  <label className={labelClass}>
                    Any allergies or dietary needs?
                    <input name="dietary" placeholder="Optional — e.g. nut allergy, vegan" className={inputClass} />
                  </label>
                )}
                <div className="flex flex-col justify-end gap-2 sm:pb-2">
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      name="plus_one"
                      checked={bringingPlusOne}
                      onChange={(e) => setBringingPlusOne(e.target.checked)}
                      className="h-4 w-4 rounded border-hairline"
                    />
                    Bringing a plus one
                  </label>
                </div>
                {bringingPlusOne && (
                  <label className={`${labelClass} sm:col-span-2`}>
                    Plus one&apos;s name
                    <input name="plus_one_name" placeholder="Optional" className={inputClass} />
                  </label>
                )}
              </>
            )}
            {showExtras ? (
              <>
                <label className={labelClass}>
                  Household
                  <input name="household" placeholder="Optional" className={inputClass} />
                </label>
                {askSide && (
                  <label className={labelClass}>
                    Who are you here for?
                    <select name="side" defaultValue="" className={inputClass}>
                      <option value="">Optional — choose one</option>
                      <option value="a">{sideA}</option>
                      <option value="b">{sideB}</option>
                      <option value="both">Both of you</option>
                    </select>
                  </label>
                )}
                {attending && (
                  <>
                    <label className={labelClass}>
                      Song request
                      <input
                        name="song_request"
                        placeholder="Optional — a song you'd want to hear"
                        className={inputClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Phone number
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Optional"
                        className={inputClass}
                      />
                    </label>
                    <div className="flex flex-col justify-end gap-2 sm:pb-2">
                      <label className="flex items-start gap-2 text-sm text-ink">
                        <input type="checkbox" name="sms_opt_in" className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline" />
                        <span>
                          Text me schedule changes for this wedding
                          <span className="block text-xs text-ink/70">{SMS_CONSENT_DETAIL}</span>
                        </span>
                      </label>
                    </div>
                  </>
                )}
                <label className={`${labelClass} sm:col-span-2`}>
                  Notes (private — only the couple sees this)
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder={askDietary ? "Optional — questions, anything we should know..." : "Optional — allergies, dietary restrictions, questions..."}
                    className={inputClass}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  A message for the couple (shown on this site once approved)
                  <textarea
                    name="message"
                    rows={2}
                    placeholder="Optional — well wishes, a favorite memory..."
                    className={inputClass}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Add a photo (shown alongside your message)
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    className="block w-full text-sm text-ink file:mr-3 file:rounded-md file:border file:border-hairline file:bg-card file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:border-forest"
                  />
                </label>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowExtras(true)}
                className="self-start text-left text-sm text-brass hover:underline sm:col-span-2"
              >
                + More (optional): a song request, text updates, a note or a photo
              </button>
            )}
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-800">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="btn-motion self-start rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Submit RSVP"}
          </button>
          <LegalNotice action="sending your RSVP" />
        </>
      )}
    </form>
  );
}
