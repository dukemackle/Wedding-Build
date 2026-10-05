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

/** Edit distance between two short strings (names), for catching typos. */
function distance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
}

/**
 * Guests whose name is close but not identical: a typo ("Jordon Lee"), a
 * dropped letter, or a short first name with the same surname ("Jo Lee" for
 * "Jordan Lee"). Offered to the couple as "did you mean", never applied on
 * their own, so a near-miss never overwrites the wrong person. Empty when
 * there's an exact match.
 */
export function findCloseGuests<T extends { name: string }>(guests: T[], name: string, limit = 3): T[] {
  const target = normalizeGuestName(name);
  if (!target || findGuestByName(guests, name)) return [];
  const [first, ...rest] = target.split(" ");
  const last = rest.at(-1);
  return guests
    .map((g) => {
      const candidate = normalizeGuestName(g.name);
      const [gFirst, ...gRest] = candidate.split(" ");
      const gLast = gRest.at(-1);
      const typo = distance(target, candidate);
      const sameSurname = Boolean(last && gLast && last === gLast && first[0] === gFirst[0]);
      // Short names need a tighter bar, or "Al Ng" matches half the list.
      const close = typo <= (target.length >= 8 ? 2 : 1) || sameSurname;
      return { g, typo, close };
    })
    .filter((c) => c.close)
    .sort((a, b) => a.typo - b.typo)
    .slice(0, limit)
    .map((c) => c.g);
}
