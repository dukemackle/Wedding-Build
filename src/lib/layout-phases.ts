import type { LayoutItemType, LayoutPhase } from "@/lib/supabase/types";

/**
 * Items that are part of the venue rather than of one event's arrangement.
 * They're added to every phase by default; anything else is added to the
 * phase on screen.
 */
export const VENUE_FIXTURE_TYPES: LayoutItemType[] = ["house", "parking", "entrance"];

/** Phases in the order a wedding day runs. */
export function sortPhases(phases: LayoutPhase[]) {
  return [...phases].sort(
    (a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at),
  );
}

/** The phase a plan opens on: the reception, where the seating lives. */
export function defaultPhaseId(phases: LayoutPhase[]) {
  return (phases.find((p) => p.kind === "reception") ?? sortPhases(phases)[0])?.id ?? null;
}

/** Whether a table or item shows in a phase: its own, or every phase when it has none. */
export function inPhase(node: { phase_id: string | null }, phaseId: string | null) {
  return phaseId == null || node.phase_id == null || node.phase_id === phaseId;
}
