import { STATE_ABBR } from "@/lib/us-states";

/** Joins a city and its state into one option value when no state is picked. */
const SEP = "|";

/**
 * City filter options for the venue and vendor browse screens. With a state
 * picked, just that state's cities. With none, every city labelled with its
 * state ("Austin, TX") so the six Springfields are told apart, and picking
 * one sets the state too.
 */
export function cityOptions(
  listings: { city: string | null; state: string | null }[],
  stateFilter: string,
): { value: string; label: string }[] {
  if (stateFilter !== "all") {
    return Array.from(
      new Set(listings.filter((l) => l.state === stateFilter).map((l) => l.city).filter((c): c is string => Boolean(c))),
    )
      .sort()
      .map((city) => ({ value: city, label: city }));
  }
  const pairs = new Map<string, { city: string; abbr: string }>();
  for (const { city, state } of listings) {
    if (city && state) pairs.set(`${city}${SEP}${state}`, { city, abbr: STATE_ABBR[state] ?? state });
  }
  // By city, then state, so "Spring, TX" comes before "Spring Lake, MI".
  return Array.from(pairs, ([value, { city, abbr }]) => ({ value, city, abbr }))
    .sort((a, b) => a.city.localeCompare(b.city) || a.abbr.localeCompare(b.abbr))
    .map(({ value, city, abbr }) => ({ value, label: `${city}, ${abbr}` }));
}

/** The filter values a picked city option stands for. */
export function cityFilterValues(value: string): { city: string; state?: string } {
  const [city, state] = value.split(SEP);
  return state ? { city, state } : { city };
}
