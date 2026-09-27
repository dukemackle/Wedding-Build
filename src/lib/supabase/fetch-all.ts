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
