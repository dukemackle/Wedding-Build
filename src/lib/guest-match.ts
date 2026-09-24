/**
 * Matching an RSVP from the public site to a guest already on the list.
 *
 * Guests type their own name on the site, so "jordan  lee" and "Jordan Lee"
 * have to land on the same row -- otherwise approving the RSVP of someone the
 * couple already invited adds them a second time.
 */
export function normalizeGuestName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * The one guest whose name matches, or null. Two guests sharing a name is
 * ambiguous, so neither is picked and the couple adds it as a new row.
 */
export function findGuestByName<T extends { name: string }>(guests: T[], name: string): T | null {
  const target = normalizeGuestName(name);
  if (!target) return null;
  const matches = guests.filter((g) => normalizeGuestName(g.name) === target);
  return matches.length === 1 ? matches[0] : null;
}
