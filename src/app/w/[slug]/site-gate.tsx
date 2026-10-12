"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { unlockGuestSite } from "./gate-actions";

/**
 * What guests see first when the couple has put a password on their site:
 * the names, in the site's own colours and fonts, and one box.
 */
export function SiteGate({ slug, names, when }: { slug: string; names: string; when: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await unlockGuestSite(slug, (formData.get("password") as string) ?? "");
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="site-card w-full max-w-md rounded-lg border border-hairline bg-card px-6 py-10 text-center shadow-sm sm:px-10 sm:py-14">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.25em] text-brass">You&rsquo;re invited</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-forest sm:text-5xl">{names}</h1>
        {when && <p className="mt-3 text-ink/70">{when}</p>}
        <form action={submit} className="mt-8 flex flex-col gap-3 text-left">
          <label htmlFor="site-password" className="text-sm text-ink/75">
            Enter the password from your invitation
          </label>
          <input
            id="site-password"
            name="password"
            type="password"
            autoComplete="off"
            autoFocus
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "site-password-error" : undefined}
            className="h-12 rounded-md border border-hairline bg-card px-3 text-base text-ink outline-none focus:border-forest"
          />
          {error && (
            <p id="site-password-error" className="text-sm text-red-800">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="btn-motion mt-1 h-12 rounded-md bg-forest text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
          >
            {isPending ? "Checking…" : "Open the site"}
          </button>
        </form>
      </div>
    </main>
  );
}
