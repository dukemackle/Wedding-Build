import { CORE_CATEGORIES, METROS, MIN_VENUES, PASS4_METROS, metroTarget } from "../../scripts/coverage-plan.mjs";

export { CORE_CATEGORIES };

export type StateTarget = {
  state: string;
  venues: number;
  /** Vendors wanted in each core category, summed over the state's metros. */
  perCategory: number;
};

/**
 * Each state's listing targets for the current stage of the coverage plan
 * (scripts/coverage-plan.mjs, the same file `npm run coverage` reads).
 *
 * Pass 4 stage 2: the map-fill stage finished, so targets are doubled and the
 * PASS4_METROS markets are in. `npm run coverage` works that out from the
 * batch files; the Worker doesn't read those (too much CPU per request), so if
 * the plan ever goes back to an undoubled stage, change `doubled` here too.
 */
export function stateTargets(doubled = true): StateTarget[] {
  return Object.entries(METROS as Record<string, string[]>).map(([state, base]) => {
    const extra = (PASS4_METROS as Record<string, string[] | undefined>)[state] ?? [];
    const metros = doubled ? [...base, ...extra] : base;
    const sizes = metros.map((m) => metroTarget(state, m, doubled) as { venues: number; perCategory: number });
    return {
      state,
      venues: Math.max(MIN_VENUES, sizes.reduce((s, t) => s + t.venues, 0)),
      perCategory: sizes.reduce((s, t) => s + t.perCategory, 0),
    };
  });
}
