import type { ReactNode } from "react";
import { WrenChatBirdIcon } from "@/components/icons";

// Small bird moments used around the app. The motion is all CSS (the
// wren-* rules in globals.css), so these are plain server-safe components
// and reduced-motion users get a still bird.

/** A bird idling above an empty list's message. */
export function BirdEmptyState({ children, className = "py-8" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 text-center ${className}`}>
      <span className="wren-idle inline-flex">
        <WrenChatBirdIcon className="h-16 w-16" />
      </span>
      {children}
    </div>
  );
}

/** A bird hopping along a dotted line, for a page that's still loading. */
export function BirdLoader({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-2 py-16">
      <div className="wren-walk-track relative h-12 w-48 border-b-2 border-dotted border-hairline">
        <span className="wren-walk absolute bottom-0 inline-flex">
          <WrenChatBirdIcon className="h-9 w-9" />
        </span>
      </div>
      <p className="text-sm text-ink/55">{label}</p>
    </div>
  );
}
