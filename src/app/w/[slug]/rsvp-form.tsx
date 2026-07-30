"use client";

import { useRef, useState, useTransition } from "react";
import { submitRsvp } from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

export function RsvpForm({ weddingId }: { weddingId: string }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitRsvp(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setSubmitted(true);
        formRef.current?.reset();
      }
    });
  }

  if (submitted) {
    return (
      <p className="mt-6 rounded-md border border-forest/40 bg-forest/10 px-4 py-3 text-forest">
        Thanks — your RSVP has been sent!
      </p>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="wedding_id" value={weddingId} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Your name
          <input name="guest_name" required className={inputClass} />
        </label>
        <label className={labelClass}>
          Household
          <input name="household" placeholder="Optional" className={inputClass} />
        </label>
        <label className={labelClass}>
          Will you be attending?
          <select name="status" defaultValue="confirmed" className={inputClass}>
            <option value="confirmed">Yes, we&apos;ll be there</option>
            <option value="declined">Sorry, can&apos;t make it</option>
          </select>
        </label>
        <label className={labelClass}>
          Meal preference
          <input name="meal" placeholder="Optional" className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
          <input type="checkbox" name="plus_one" className="h-4 w-4 rounded border-hairline" />
          Bringing a plus one
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Notes
          <textarea
            name="notes"
            rows={2}
            placeholder="Optional — allergies, questions, well wishes..."
            className={inputClass}
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
      >
        {isPending ? "Submitting..." : "Submit RSVP"}
      </button>
    </form>
  );
}
