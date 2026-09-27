import "server-only";
import { REVIEW_INTERVAL_DAYS } from "@/lib/listing-freshness";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { fetchAll } from "@/lib/supabase/fetch-all";
import { LISTING_PAGE_SIZE, type ListingParams, type ListingStatus } from "./params";

export type ListingConfig = {
  table: "venues" | "vendors";
  /** The column the "Type" / "Category" dropdown filters on. */
  kindColumn: "venue_type" | "category";
  /** A PostgREST `or` filter matching a row that's missing something a couple needs. */
  incompleteFilter: string;
  /** The status chips this list shows, in order. */
  statuses: ListingStatus[];
};

// The subset of Supabase's query builder these lists use. Its real generics
// blow TypeScript's instantiation depth once a helper is shared between two
// tables, and nothing here needs column-level typing -- rows are cast on return.
interface Query
  extends PromiseLike<{ data: unknown[] | null; count: number | null; error: { message: string } | null }> {
  eq(column: string, value: unknown): Query;
  is(column: string, value: null): Query;
  lt(column: string, value: string): Query;
  or(filters: string): Query;
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): Query;
  range(from: number, to: number): Query;
}

function selectFrom(table: ListingConfig["table"], columns: string, head = false): Query {
  return createAdminSupabaseClient()
    .from(table)
    .select(columns, { count: "exact", head }) as unknown as Query;
}

// Characters that mean something inside a PostgREST `or(...)` string. Stripped
// rather than escaped: nobody searches a venue name for a comma.
function searchTerm(q: string) {
  return q.replace(/[,()*%\\:"]/g, " ").trim();
}

function applyStatus(query: Query, status: ListingStatus, config: ListingConfig): Query {
  switch (status) {
    case "live":
      return query.eq("active", true);
    case "hidden":
      return query.eq("active", false);
    case "unverified":
      return query.is("last_verified_at", null);
    case "stale": {
      // Same line freshnessOf() draws for "Out of date".
      const cutoff = new Date(Date.now() - REVIEW_INTERVAL_DAYS * 3 * 24 * 60 * 60 * 1000);
      return query.lt("last_verified_at", cutoff.toISOString());
    }
    case "incomplete":
      return query.or(config.incompleteFilter);
    case "claimed":
      return query.eq("source", "claimed");
    case "no_email":
      return query.is("contact_email", null);
    default:
      return query;
  }
}

function applyFilters(
  query: Query,
  params: ListingParams,
  config: ListingConfig,
  status: ListingStatus,
): Query {
  let q = applyStatus(query, status, config);
  const term = searchTerm(params.q);
  if (term) q = q.or(`name.ilike.%${term}%,city.ilike.%${term}%,contact_email.ilike.%${term}%`);
  if (params.state) q = q.eq("state", params.state);
  if (params.kind) q = q.eq(config.kindColumn, params.kind);
  if (params.source) q = q.eq("source", params.source);
  return q;
}

/**
 * One page of a list, plus the count behind every status chip.
 *
 * The chip counts honour the search and dropdowns but not the chip itself, so
 * with "Texas" picked they read as "how many Texas venues are hidden" -- the
 * number you'd get by clicking that chip next.
 */
export async function fetchListingPage<Row>(config: ListingConfig, params: ListingParams) {
  const from = (params.page - 1) * LISTING_PAGE_SIZE;

  let rowsQuery = applyFilters(selectFrom(config.table, "*"), params, config, params.status);
  if (params.sort === "newest") rowsQuery = rowsQuery.order("created_at", { ascending: false });
  if (params.sort === "check") {
    rowsQuery = rowsQuery.order("last_verified_at", { ascending: true, nullsFirst: true });
  }
  rowsQuery = rowsQuery.order("name").order("id").range(from, from + LISTING_PAGE_SIZE - 1);

  const [{ data, count, error }, ...counts] = await Promise.all([
    rowsQuery,
    ...config.statuses.map((status) =>
      applyFilters(selectFrom(config.table, "id", true), params, config, status),
    ),
  ]);
  if (error) throw new Error(error.message);

  const statusCounts = Object.fromEntries(
    config.statuses.map((status, i) => [status, counts[i].count ?? 0]),
  ) as Record<ListingStatus, number>;

  return { rows: (data ?? []) as Row[], total: count ?? 0, statusCounts };
}

/** Every row matching the filters, for the CSV export. */
export async function fetchAllListings<Row>(config: ListingConfig, params: ListingParams) {
  return fetchAll<Row>(
    (from, to) =>
      applyFilters(selectFrom(config.table, "*"), params, config, params.status)
        .order("name")
        .order("id")
        .range(from, to) as PromiseLike<{ data: Row[] | null; error: { message: string } | null }>,
  );
}

/** The distinct non-empty values of a text column, for a filter dropdown. */
export async function fetchDistinct(table: ListingConfig["table"], column: string) {
  const rows = await fetchAll<Record<string, string | null>>(
    (from, to) =>
      selectFrom(table, column).order(column).order("id").range(from, to) as PromiseLike<{
        data: Record<string, string | null>[] | null;
        error: { message: string } | null;
      }>,
  );
  return [...new Set(rows.map((row) => row[column]).filter((v): v is string => !!v))].sort();
}

/** Weddings the owner marked as tests, so their clicks don't count as demand. */
export async function fetchTestWeddingIds() {
  const { data } = await createAdminSupabaseClient()
    .from("weddings")
    .select("id")
    .eq("is_test", true)
    .returns<{ id: string }[]>();
  return new Set((data ?? []).map((w) => w.id));
}

/** How many rows were added to a list in the last week. */
export async function countAddedThisWeek(table: ListingConfig["table"]) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await createAdminSupabaseClient()
    .from(table)
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo);
  return count ?? 0;
}
