"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * A listing opened over the search results, the way Zillow opens a home.
 *
 * It is a real route (/venues/[id]) intercepted into a panel, so the URL can
 * be shared and the browser's back button closes it. Closing is always
 * router.back(): that returns to the results exactly as they were -- filters,
 * map position, scroll -- instead of reloading them.
 *
 * Desktop: a wide panel with the results dimmed behind; click outside to
 * close. Phone: the full screen, since a panel with margins wastes a phone.
 */
export function ListingModal({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") router.back();
    }
    window.addEventListener("keydown", onKey);
    // The results behind shouldn't scroll along with the panel.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink/40 sm:px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) router.back();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        // Margin, not the backdrop's padding: the close bar sticks to the top of
        // the scrolling area, and padding there would leave it floating 32px down.
        className="relative mx-auto min-h-full w-full max-w-6xl bg-parchment shadow-2xl outline-none sm:my-8 sm:min-h-0 sm:rounded-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-hairline bg-parchment/95 px-4 py-2.5 backdrop-blur sm:rounded-t-xl sm:px-6">
          <button type="button" onClick={() => router.back()} className="text-sm text-brass hover:underline">
            &larr; Back to search
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-ink/60 hover:bg-ink/5 hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="px-4 pb-10 pt-4 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
