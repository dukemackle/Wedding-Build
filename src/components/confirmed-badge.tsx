// Marks what the venue itself confirmed through its claim link, as opposed to
// what we researched. Gold is You Do, I Do's "this matters" colour: a gold
// fill with navy text, on white or over a photo, never gold text.

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2.4}>
      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "Confirmed by venue" pill, for a result card or a listing header. */
export function ConfirmedChip({ label = "Confirmed by venue", className = "" }: { label?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[#FFD301] px-2.5 py-1 text-[11px] font-semibold text-forest shadow-sm ${className}`}
    >
      <Check className="h-3 w-3" />
      {label}
    </span>
  );
}

/** A small gold tick beside one fact the venue confirmed. */
export function ConfirmedMark({ noun = "venue" }: { noun?: "venue" | "vendor" }) {
  return (
    <span
      title={`Confirmed by the ${noun}`}
      className="ml-1.5 inline-flex h-4 w-4 translate-y-[-1px] items-center justify-center rounded-full bg-[#FFD301] align-middle text-forest"
    >
      <Check className="h-2.5 w-2.5" />
      <span className="sr-only">Confirmed by the {noun}</span>
    </span>
  );
}
