"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EmailField } from "@/components/email-field";
import { PendingSubmit } from "@/components/pending-submit";
import { signup } from "@/app/signup/actions";
import { thenHref, type SignupIntent } from "@/lib/signup-intent";

/**
 * What a logged-out visitor's Save and Request-a-quote buttons open: the
 * signup form over the listing instead of a trip to /signup. The way back
 * carries `then`, so once the account (and the wedding) exist the listing
 * finishes what they tapped: saves it, or opens the inquiry form.
 */

function SignupSheet({
  dialogRef,
  name,
  intent,
  next,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  name: string;
  intent: SignupIntent;
  next: string;
}) {
  const back = thenHref(next, intent);
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="signup-sheet-title"
      // Tapping the backdrop closes it, the way a sheet should.
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none rounded-t-3xl bg-card p-0 text-ink shadow-2xl backdrop:bg-ink/50 sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-3xl"
    >
      <div className="relative px-6 pb-8 pt-6 sm:px-8 sm:pt-8">
        <div aria-hidden="true" className="mx-auto mb-5 h-1 w-10 rounded-full bg-hairline sm:hidden" />
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-ink/60 hover:text-forest"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h2 id="signup-sheet-title" className="pr-8 font-display text-2xl font-semibold leading-tight text-forest">
          {intent === "save" ? <>Save {name}</> : <>Ask {name} about your date</>}
        </h2>
        <p className="mt-2 text-sm text-ink/70">
          {intent === "save"
            ? "Create your free account and it goes on your shortlist, next to your budget and guest count."
            : "Create your free account and we'll bring you straight back here to send your request."}
        </p>

        <form className="mt-5 flex flex-col gap-4" action={signup}>
          <input type="hidden" name="next" value={back} />
          <label className="flex flex-col gap-1 text-sm text-ink">
            Email
            <EmailField autoComplete="email" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Password
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
            />
          </label>
          {/* Same consent as /signup: separate, unticked (docs/legal.md). */}
          <label className="flex items-start gap-2 text-sm text-ink/80">
            <input type="checkbox" name="marketing_opt_in" className="mt-0.5 h-4 w-4 shrink-0 accent-forest" />
            <span>Send me occasional planning tips and news from You Do, I Do. Unsubscribe any time.</span>
          </label>
          <PendingSubmit
            pendingText="Creating account..."
            className="h-12 rounded-full bg-forest px-4 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            {intent === "save" ? "Sign up free and save" : "Sign up free"}
          </PendingSubmit>
        </form>

        <p className="mt-4 text-center text-xs text-ink/50">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-ink">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-ink">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="mt-3 text-center text-sm text-ink/70">
          Have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(back)}`} className="font-medium text-brass hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </dialog>
  );
}

/** A trigger and its sheet. `children` is the button's face. */
export function SignupSheetButton({
  name,
  intent,
  next,
  className,
  ariaLabel,
  children,
}: {
  name: string;
  intent: SignupIntent;
  next: string;
  className: string;
  ariaLabel?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // A results page has a heart and a button on every card: the sheet is only
  // put on the page once one is tapped, not fifty times up front.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (mounted) ref.current?.showModal();
  }, [mounted]);
  return (
    <>
      <button
        type="button"
        onClick={() => (mounted ? ref.current?.showModal() : setMounted(true))}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </button>
      {mounted && <SignupSheet dialogRef={ref} name={name} intent={intent} next={next} />}
    </>
  );
}

/**
 * On a listing reached through the sheet: do what they tapped, once, and take
 * `?then=` off the address so a refresh or a shared link doesn't do it again.
 */
export function useFinishIntent(then: SignupIntent | undefined, handlers: Record<SignupIntent, () => void>) {
  const done = useRef(false);
  useEffect(() => {
    if (!then || done.current) return;
    done.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete("then");
    window.history.replaceState(window.history.state, "", url);
    handlers[then]();
    // Once, on arrival: later renders bring new handler objects, not new taps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [then]);
}
