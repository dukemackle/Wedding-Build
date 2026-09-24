"use client";

import { useRef, useState, useTransition } from "react";
import { submitRsvp } from "./actions";
import { shrinkImage } from "@/lib/shrink-image";
import { MEAL_OPTIONS } from "@/lib/meal-options";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

export function RsvpForm({
  weddingId,
  partnerAName,
  partnerBName,
  shareHref,
}: {
  weddingId: string;
  partnerAName: string | null;
  partnerBName: string | null;
  /** The photo-wall posting page, offered once the RSVP is in. */
  shareHref?: string;
}) {
  // "John's side" reads to a guest; "Side A" doesn't. With no names set up
  // yet the question is dropped rather than asked in the abstract.
  const sideA = (partnerAName ?? "").trim().split(/\s+/)[0];
  const sideB = (partnerBName ?? "").trim().split(/\s+/)[0];
  const askSide = Boolean(sideA && sideB);

  const [error, setError] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [bringingPlusOne, setBringingPlusOne] = useState(false);
  const [attending, setAttending] = useState(true);
  const [showExtras, setShowExtras] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const photo = formData.get("photo") as File | null;
      if (photo && photo.size > 0) formData.set("photo", await shrinkImage(photo));
      const result = await submitRsvp(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setSubmitted(true);
        setBringingPlusOne(false);
        setAttending(true);
        setShowExtras(false);
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
      {/* The one question every guest answers comes first; the rest only
          appears once it applies, so a "no" is two fields, not twelve. */}
      <label className={labelClass}>
        Your name
        <input name="guest_name" required autoComplete="name" className={inputClass} />
      </label>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              Meal preference
              <select name="meal" defaultValue="" className={inputClass}>
                <option value="">Optional — choose one</option>
                {MEAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
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
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="sms_opt_in" className="h-4 w-4 rounded border-hairline" />
                Text me for schedule updates
              </label>
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
            <label className={`${labelClass} sm:col-span-2`}>
              Notes (private — only the couple sees this)
              <textarea
                name="notes"
                rows={2}
                placeholder="Optional — allergies, dietary restrictions, questions..."
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
            + Add a note, a message for the couple, or a photo
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="btn-motion self-start rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit RSVP"}
      </button>
    </form>
  );
}
