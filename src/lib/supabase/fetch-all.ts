import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Reads every row of a query, a page at a time.
 *
 * Supabase silently stops at 1000 rows per request -- no error, just a short
 * list. The venue directory crossed that line, and the rows past it (sorted by
 * name, so everything after "A...") vanished from /venues and the admin list
 * while the counts still looked plausible. Any list that can grow past a
 * thousand goes through here.
 *
 * `page` must apply `.range(from, to)` to a query with a stable order (add an
 * `id` tiebreak), or rows can repeat or go missing between pages.
 */
const PAGE_SIZE = 1000;

export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

type AnyClient = SupabaseClient<any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Every row of a table's columns, in `order` then `key` order, shaped like a
 * Supabase result (`{ data }`) so it drops into an existing
 * `Promise.all([...])` destructure. For admin pages that count or group whole
 * tables; a count alone should use `count: "exact", head: true` instead.
 *
 * `key` is a unique column to page by: `id` unless the table has none
 * (admin_couple_notes is keyed by wedding_id).
 */
export async function selectAll<T>(
  client: AnyClient,
  table: string,
  columns: string,
  order?: { column: string; ascending: boolean },
  key = "id",
): Promise<{ data: T[] }> {
  const data = await fetchAll<T>((from, to) => {
    let query = client.from(table).select(columns);
    if (order) query = query.order(order.column, { ascending: order.ascending });
    return query.order(key).range(from, to) as unknown as PromiseLike<{
      data: T[] | null;
      error: { message: string } | null;
    }>;
  });
  return { data };
}

/** Every auth user, not just the first page of 1000. Shaped like `listUsers`. */
export async function listAllUsers(client: AnyClient): Promise<{ data: { users: User[] } }> {
  const users: User[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < PAGE_SIZE) return { data: { users } };
  }
}
