"use client";

import { useRef, useState, useTransition } from "react";
import { submitFeedback } from "./actions";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "idea", label: "Idea / suggestion" },
  { value: "bug", label: "Something's broken" },
  { value: "other", label: "Something else" },
];

export function FeedbackForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setSent(false);
    startTransition(async () => {
      const result = await submitFeedback(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setSent(true);
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="mt-4 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-ink">
        What kind of feedback is this?
        <select
          id="feedback-category"
          name="category"
          defaultValue="idea"
          className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-ink">
        Tell us what to fix or what we could do better
        <textarea
          id="feedback-message"
          name="message"
          required
          rows={5}
          placeholder="The more specific, the more useful -- what were you trying to do, and what happened?"
          className="resize-none rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send feedback"}
      </button>

      {sent && <p className="text-sm text-forest">Thanks -- we read every one of these.</p>}
      {error && <p className="text-sm text-red-800">{error}</p>}
    </form>
  );
}
