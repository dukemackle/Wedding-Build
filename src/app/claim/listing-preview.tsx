"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { WIDE_WIDTH } from "@/lib/layout";

/**
 * The listing exactly as couples will see it, drawn by the same component as
 * the public page, over the whole screen. Portalled out of the claim form so
 * the listing's own buttons and forms aren't nested in it, and `inert` so
 * nothing in it saves, reports or counts as a lead.
 */
export function ListingPreview({
  onClose,
  onSend,
  children,
}: {
  onClose: () => void;
  /** Shown before sending; left out once it's sent. */
  onSend?: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Only ever opened by a click, so there's always a document; this keeps a
  // server render from throwing if that changes.
  if (typeof document === "undefined") return null;
  return createPortal(
    <div role="dialog" aria-modal aria-label="Listing preview" className="fixed inset-0 z-50 overflow-y-auto bg-parchment">
      <div className="sticky top-0 z-10 border-b border-hairline bg-card/95 backdrop-blur">
        <div className={`mx-auto flex w-full ${WIDE_WIDTH} items-center justify-between gap-3 px-4 py-3 sm:px-6`}>
          <div className="min-w-0">
            <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Preview</p>
            <p className="hidden text-sm text-ink/70 sm:block">
              How couples will see your listing once we&apos;ve reviewed it.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-hairline bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
            >
              {onSend ? <>&larr; Keep editing</> : "Close"}
            </button>
            {onSend && (
              <button
                type="button"
                onClick={onSend}
                className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
              >
                Send for review
              </button>
            )}
          </div>
        </div>
      </div>
      <div inert className={`mx-auto w-full ${WIDE_WIDTH} px-4 py-8 sm:px-6`}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** The final step's way in to the preview, above the sign-off. */
export function PreviewPrompt({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="font-display text-lg font-semibold text-forest">See it the way couples will</p>
        <p className="mt-0.5 text-sm text-ink/65">Your whole listing page, with photos, prices and answers, before you send it.</p>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-md border-2 border-forest px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-parchment"
      >
        Preview your listing
      </button>
    </div>
  );
}
