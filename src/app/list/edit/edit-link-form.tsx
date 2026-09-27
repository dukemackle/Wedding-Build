"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestEditLinks } from "../actions";

export function EditLinkForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestEditLinks(email);
      if (result.error) setError(result.error);
      else setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-md border border-hairline bg-parchment px-4 py-3 text-sm text-ink">
        If {email} is on a You Do, I Do listing, the link is on its way. Nothing arrived? Check spam, or write to{" "}
        <a href="mailto:hello@wrenwed.com" className="font-medium text-brass hover:underline">
          hello@wrenwed.com
        </a>{" "}
        from your business email and we&apos;ll sort it out.
      </div>
    );
  }

  return (
    <>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Business email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest"
          />
        </label>
        {error && (
          <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Sending…" : "Email me my link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/70">
        Not listed yet?{" "}
        <Link href="/list" className="font-medium text-brass hover:underline">
          List your business
        </Link>
      </p>
    </>
  );
}
