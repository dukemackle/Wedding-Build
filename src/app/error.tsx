"use client";

import Link from "next/link";
import { unstable_isUnrecognizedActionError } from "next/navigation";
import { useEffect } from "react";
import { LostPage, primaryAction, secondaryAction } from "@/components/lost-page";
import { WrenMark } from "@/components/wren-mark";

/**
 * A tab opened before a deploy still calls the old build's server actions and
 * chunks, which the new build doesn't have ("Server Action … was not found").
 * Nothing is wrong except the tab's age, so it reloads onto the new build.
 */
const STALE_CHUNK = /ChunkLoadError|Loading chunk .* failed/i;
const RELOADED_KEY = "stale-build-reload";

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
  const stale = unstable_isUnrecognizedActionError(error) || STALE_CHUNK.test(String((error as Error).message));

  useEffect(() => {
    console.error(error);
    if (!stale) return;
    // Once per minute at most, so a real failure can't loop the page.
    try {
      const last = Number(sessionStorage.getItem(RELOADED_KEY) ?? 0);
      if (Date.now() - last < 60_000) return;
      sessionStorage.setItem(RELOADED_KEY, String(Date.now()));
    } catch {
      return; // No storage to guard the loop; "Try again" still reloads.
    }
    window.location.reload();
  }, [error, stale]);

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
            {/* An old tab needs a full reload to pick up the new build; retry can't. */}
            <button type="button" onClick={() => (stale ? window.location.reload() : retry())} className={primaryAction}>
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
