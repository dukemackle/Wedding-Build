/**
 * Guest notes live in their own editors-only table (migration 0096), so a
 * view-only member never receives them. Writes still go through
 * `guests.notes` -- a trigger moves them across -- but reads must embed the
 * table and flatten it back onto the guest:
 *
 *   .select(GUEST_WITH_NOTES) ... then rows.map(withNotes)
 *
 * A plain `select("*")` on guests now always has `notes: null`.
 */
export const GUEST_WITH_NOTES = "*, guest_notes(notes)";

type Embedded = { guest_notes?: { notes: string | null } | null; notes?: string | null };

export function withNotes<T extends Embedded>(row: T): Omit<T, "guest_notes"> & { notes: string | null } {
  const { guest_notes, ...rest } = row;
  return { ...rest, notes: guest_notes?.notes ?? null };
}
