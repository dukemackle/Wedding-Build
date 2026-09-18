"use client";

import { useState, useTransition } from "react";
import { submitContactDetails } from "./actions";

const fieldClass =
  "w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none transition-colors focus:border-forest";
const labelClass = "flex flex-col gap-1.5 text-sm text-ink/70";

export function ContactForm({ slug, coupleNames }: { slug: string; coupleNames: string }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    formData.set("slug", slug);
    setError(undefined);
    startTransition(async () => {
      const result = await submitContactDetails(formData);
      if (result?.error) setError(result.error);
      else setSent(true);
    });
  }

  // Deliberately terminal: no "submit another" button. One guest, one
  // household, one submission -- and the couple can't be shown the row back,
  // so offering an edit link would be a promise the page can't keep.
  if (sent) {
    return (
      <div className="rounded-lg border border-hairline bg-card p-8 text-center shadow-sm">
        <p className="font-display text-2xl font-semibold text-forest">Thank you!</p>
        <p className="mt-2 text-ink/70">
          {coupleNames || "The couple"} have your details. Nothing else to do — an invitation
          will find its way to you.
        </p>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-8"
    >
      <label className={labelClass}>
        Your name
        <input type="text" name="name" required autoComplete="name" className={fieldClass} />
      </label>

      {/* Asked for rather than optional now, and said plainly: a form that
          demands a phone number without explaining why reads as nosy, and a
          guest who feels that way closes the tab. */}
      <p className="-mt-1 text-sm text-ink/60">
        Both are needed so we can reach you about the wedding — invitations, any change of plan,
        and details closer to the day.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Email
          <input type="email" name="email" required autoComplete="email" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Phone
          <input
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            className={fieldClass}
          />
        </label>
      </div>

      <div className="border-t border-hairline pt-4">
        <p className="font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">
          Mailing address
        </p>
        <p className="mt-1 text-sm text-ink/60">Where should the invitation go?</p>

        <div className="mt-3 flex flex-col gap-4">
          {/* autoComplete tokens matter more here than anywhere else in the app:
              a guest filling this in on a phone should be able to accept their
              browser's saved address in one tap rather than typing six fields. */}
          <label className={labelClass}>
            Street address
            <input
              type="text"
              name="address_line1"
              autoComplete="address-line1"
              className={fieldClass}
            />
          </label>
          <label className={labelClass}>
            Apartment, suite, etc. <span className="text-ink/40">(optional)</span>
            <input
              type="text"
              name="address_line2"
              autoComplete="address-line2"
              className={fieldClass}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
            <label className={labelClass}>
              City
              <input
                type="text"
                name="city"
                autoComplete="address-level2"
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              State
              <input
                type="text"
                name="state"
                autoComplete="address-level1"
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              ZIP
              <input
                type="text"
                name="postal_code"
                autoComplete="postal-code"
                className={fieldClass}
              />
            </label>
          </div>
          <label className={labelClass}>
            Country <span className="text-ink/40">(if outside the US)</span>
            <input
              type="text"
              name="country"
              autoComplete="country-name"
              className={fieldClass}
            />
          </label>
        </div>
      </div>

      <label className={labelClass}>
        Anything the couple should know? <span className="text-ink/40">(optional)</span>
        <textarea name="note" rows={2} className={fieldClass} />
      </label>

      {error && <p className="text-sm text-red-800">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="btn-motion self-start rounded-full bg-forest px-6 py-2.5 font-display text-lg text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Send my details"}
      </button>

      <p className="text-xs text-ink/50">
        Only {coupleNames || "the couple"} can see what you send. It isn&apos;t shown on their
        wedding site or to other guests.
      </p>
    </form>
  );
}
