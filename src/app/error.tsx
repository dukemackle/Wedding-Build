"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LostPage, primaryAction, secondaryAction } from "@/components/lost-page";
import { WrenMark } from "@/components/wren-mark";

/**
 * Shown when a page throws while rendering. The root layout (footer, Wren)
 * stays; the page's own nav is part of the page, so this brings its own way
 * out. The digest is the id in the server logs, shown so a couple writing in
 * can quote it.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="flex flex-1 flex-col items-center gap-10 px-6 py-10">
      {/* The page's nav went down with it, so the logo is the way home. */}
      <div className="w-full max-w-lg">
        <WrenMark href="/" />
      </div>
      <LostPage
        eyebrow="Something went wrong"
        title="This page didn’t load"
        actions={
          <>
            <button type="button" onClick={() => retry()} className={primaryAction}>
              Try again
            </button>
            <Link href="/dashboard" className={secondaryAction}>
              Go to your dashboard
            </Link>
          </>
        }
      >
        <p>It’s a problem on our side, not something you did. Anything you’d already saved is safe.</p>
        {error.digest && (
          <p className="mt-3 font-mono-numbers text-xs text-ink/70">Reference: {error.digest}</p>
        )}
      </LostPage>
    </main>
  );
}
