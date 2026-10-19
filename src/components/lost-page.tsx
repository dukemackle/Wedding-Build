import type { ReactNode } from "react";
import { BirdEmptyState } from "@/components/wren-moments";

/**
 * The card a missing or broken page shows: Wren idling over a short, plain
 * explanation and the way back. Shared by not-found and error so the two
 * read as one family, and kept free of server-only imports because error
 * pages are client components.
 */
export function LostPage({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-lg border border-hairline bg-card px-6 py-10 text-center shadow-sm sm:px-10">
      <BirdEmptyState className="py-0">
        <p className="mt-2 font-mono-numbers text-[11px] uppercase tracking-[0.18em] text-brass">{eyebrow}</p>
        <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{title}</h1>
        <div className="mt-1 max-w-sm text-base text-ink/80">{children}</div>
      </BirdEmptyState>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {actions}
      </div>
    </div>
  );
}

export const primaryAction =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-forest px-5 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90";
export const secondaryAction =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-hairline bg-card px-5 py-2 text-sm text-ink transition-colors hover:border-forest";
