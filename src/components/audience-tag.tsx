import type { EventAudience } from "@/lib/supabase/types";
import { AUDIENCES } from "@/lib/itinerary";

/** The tag on each event saying who sees it. */
const AUDIENCE_TAG: Record<EventAudience, string> = {
  guests: "bg-[#FFD301] text-forest",
  party: "bg-[#2243B6]/10 text-[#2243B6]",
  private: "bg-ink/5 text-ink/60",
};

/** The same three, as fills for the banner's split bar and the editor's dots. */
export const AUDIENCE_FILL: Record<EventAudience, string> = {
  guests: "bg-[#FFD301]",
  party: "bg-[#2243B6]/40",
  private: "bg-ink/15",
};

export function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

export function AudienceTag({ audience }: { audience: EventAudience }) {
  const meta = AUDIENCES.find((a) => a.value === audience)!;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${AUDIENCE_TAG[audience]}`}
    >
      {audience === "private" && <LockIcon />}
      {meta.short}
    </span>
  );
}
