// Names couples typed into "Purchased from" on their budget, turned into keys
// for grouping ("Pecan St. Photo" and "pecan street photo" are one lead) and
// for spotting the listing a lead probably means. Used by /admin/leads.

const ABBREVIATIONS: Record<string, string> = { st: "street", co: "company", mt: "mount", ft: "fort" };

// Words that don't tell two businesses apart.
const FILLER = new Set([
  "the", "and", "by", "of", "llc", "inc", "company", "studio", "studios", "photography", "photo", "photos",
  "photographer", "films", "film", "events", "event", "weddings", "wedding", "co",
]);

function words(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w) => ABBREVIATIONS[w] ?? w);
}

/** The grouping key for a typed name: lower case, abbreviations spelled out, punctuation gone. */
export function leadKey(name: string): string {
  return words(name).join(" ");
}

/** The words that identify the business, for matching against listings. */
function core(name: string): string[] {
  const all = words(name);
  const kept = all.filter((w) => !FILLER.has(w));
  return kept.length ? kept : all;
}

/**
 * The listing a typed name most likely means: one whose identifying words are
 * the same, or contain all of the typed ones (at least five letters' worth, so
 * "Rose" doesn't match every Rose). Null when nothing is close enough.
 */
export function likelyMatch<T extends { name: string }>(typed: string, listings: T[]): T | null {
  const want = core(typed);
  if (want.join("").length < 5) return null;
  const same = (a: string[], b: string[]) => a.length === b.length && a.every((w) => b.includes(w));
  return (
    listings.find((l) => same(core(l.name), want)) ??
    listings.find((l) => {
      const have = core(l.name);
      return want.every((w) => have.includes(w));
    }) ??
    null
  );
}
