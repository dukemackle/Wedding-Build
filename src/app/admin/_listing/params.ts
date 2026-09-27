/**
 * The filters on the admin Venues and Vendors lists, read from the URL.
 *
 * They live in the query string rather than in component state so a view like
 * "Texas, never checked" survives a refresh, can be bookmarked, and is what the
 * server filters on -- the lists are paged, so filtering in the browser would
 * only ever search the fifty rows on screen.
 */

export const LISTING_PAGE_SIZE = 50;

export type ListingStatus =
  | "all"
  | "live"
  | "hidden"
  | "unverified"
  | "stale"
  | "incomplete"
  | "claimed"
  | "no_email";

export type ListingSort = "name" | "newest" | "check";

export type ListingParams = {
  q: string;
  status: ListingStatus;
  state: string;
  /** Venue type or vendor category, depending on the list. */
  kind: string;
  source: string;
  sort: ListingSort;
  /** 1-based. */
  page: number;
};

const STATUSES: ListingStatus[] = [
  "all",
  "live",
  "hidden",
  "unverified",
  "stale",
  "incomplete",
  "claimed",
  "no_email",
];
const SORTS: ListingSort[] = ["name", "newest", "check"];

export const SORT_LABELS: Record<ListingSort, string> = {
  name: "Name A–Z",
  newest: "Newest first",
  check: "Longest since checked",
};

/** Where a listing came from. `null` is the hand-seeded rows from before `source` existed. */
export const LISTING_SOURCES = ["manual", "import", "claimed", "google", "osm"] as const;

type RawParams = { [key: string]: string | string[] | undefined };

function one(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export function parseListingParams(raw: RawParams): ListingParams {
  const status = one(raw.status) as ListingStatus;
  const sort = one(raw.sort) as ListingSort;
  const page = Number.parseInt(one(raw.page), 10);
  return {
    q: one(raw.q).slice(0, 100),
    status: STATUSES.includes(status) ? status : "all",
    state: one(raw.state),
    kind: one(raw.kind),
    source: one(raw.source),
    sort: SORTS.includes(sort) ? sort : "name",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** The query string for `params` with `changes` applied, leaving defaults out. */
export function listingQueryString(params: ListingParams, changes: Partial<ListingParams>): string {
  const next = { ...params, ...changes };
  const search = new URLSearchParams();
  if (next.q) search.set("q", next.q);
  if (next.status !== "all") search.set("status", next.status);
  if (next.state) search.set("state", next.state);
  if (next.kind) search.set("kind", next.kind);
  if (next.source) search.set("source", next.source);
  if (next.sort !== "name") search.set("sort", next.sort);
  if (next.page > 1) search.set("page", String(next.page));
  const text = search.toString();
  return text ? `?${text}` : "";
}
