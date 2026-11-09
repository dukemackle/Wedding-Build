import type { SupabaseClient } from "@supabase/supabase-js";

/** Two guests the couple asked not to seat together (0166). Editors only. */
export type KeepApartPair = { id: string; guest_a: string; guest_b: string };

/**
 * The wedding's keep-apart pairs. A view-only member gets none (RLS), and so
 * does a database without 0166 yet: seating then behaves as it always did.
 */
export async function loadKeepApart(supabase: SupabaseClient, weddingId: string): Promise<KeepApartPair[]> {
  const { data, error } = await supabase
    .from("guest_keep_apart")
    .select("id, guest_a, guest_b")
    .eq("wedding_id", weddingId)
    .returns<KeepApartPair[]>();
  return error ? [] : (data ?? []);
}

export function pairIds(pairs: KeepApartPair[]): [string, string][] {
  return pairs.map((p) => [p.guest_a, p.guest_b]);
}

/**
 * Tables where a keep-apart pair is sitting together, for the warning on the
 * seating screen: one entry per clash, with both names and the table.
 */
export function seatingClashes<G extends { id: string; name: string; table_id: string | null }>(
  guests: G[],
  pairs: KeepApartPair[],
): { tableId: string; a: G; b: G }[] {
  const byId = new Map(guests.map((g) => [g.id, g]));
  const out: { tableId: string; a: G; b: G }[] = [];
  for (const p of pairs) {
    const a = byId.get(p.guest_a);
    const b = byId.get(p.guest_b);
    if (a?.table_id && a.table_id === b?.table_id) out.push({ tableId: a.table_id, a, b });
  }
  return out;
}
