"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Picks up a recovery session that arrived in the URL fragment.
 *
 * Supabase hands back a password-reset session in one of three shapes,
 * depending on how the project is configured: `?token_hash=`, `?code=`, or
 * `#access_token=...&refresh_token=...`. The page handles the first two on
 * the server. It cannot handle the third there and never could -- a browser
 * strips everything after the `#` before it sends the request, so a server
 * component is structurally blind to it.
 *
 * So it gets read here, handed to the browser client (which writes the auth
 * cookies), and the server page is re-rendered -- at which point it finds a
 * session and shows the form. Without this, the couple gets a form that looks
 * perfectly fine and fails on submit with "Auth session missing!", which tells
 * them nothing and reads like their account is broken.
 */
export function RecoveryBridge() {
  const router = useRouter();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    // Supabase also reports a dead link through the fragment
    // (#error=access_denied&error_code=otp_expired), which arrives here as
    // simply no tokens -- same outcome for the couple, so same path. Kept as
    // one promise rather than an early return so every setState lands in a
    // callback, which is what React wants of an effect.
    const settled: Promise<{ error: { message: string } | null }> =
      access_token && refresh_token
        ? createClient().auth.setSession({ access_token, refresh_token })
        : Promise.resolve({ error: { message: "no recovery tokens in the link" } });

    let cancelled = false;
    settled
      .then(({ error }) => {
        if (cancelled) return;
        if (error) {
          setExpired(true);
          return;
        }
        // Don't leave a live session token sitting in the address bar, in
        // browser history, or in whatever the next screenshot catches.
        window.history.replaceState(null, "", "/reset-password");
        router.refresh();
      })
      .catch(() => {
        if (!cancelled) setExpired(true);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!expired) {
    return <p className="mt-4 text-sm text-ink/60">Checking your link…</p>;
  }

  return (
    <div className="mt-4">
      <p className="rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink">
        This reset link has expired or has already been used. Reset links are good for one use,
        and only for a short while after they&apos;re sent.
      </p>
      <Link
        href="/forgot-password"
        className="mt-4 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
      >
        Send me a new link
      </Link>
    </div>
  );
}
