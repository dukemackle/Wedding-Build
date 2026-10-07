import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { BudgetCustomItem } from "@/lib/supabase/types";
import { BUDGET_CATEGORIES } from "@/lib/budget-categories";
import { CATEGORY_ID_PREFIX, customItemLine, type BudgetSiteLine } from "@/lib/budget-sheet";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type CategoryLineRow = {
  category: string;
  override_value: number | null;
  paid_amount: number | null;
  purchased_from: string | null;
  paid_by: string | null;
  due_date: string | null;
  notes: string | null;
};

/**
 * Every budget line the page shows, as one list: the visible standard
 * categories (whether or not the couple has touched them) and their own items.
 */
export async function loadBudgetLines(
  supabase: SupabaseServerClient,
  wedding: { id: string; hidden_budget_categories: string[] | null },
): Promise<{ error?: string; lines: BudgetSiteLine[]; customOwners: Map<string, string> }> {
  const [{ data: overrides, error: lineError }, { data: items, error: itemError }] =
    await Promise.all([
      supabase
        .from("budget_line_items")
        .select("category, override_value, paid_amount, purchased_from, paid_by, due_date, notes")
        .eq("wedding_id", wedding.id)
        .returns<CategoryLineRow[]>(),
      supabase
        .from("budget_custom_items")
        .select("*")
        .eq("wedding_id", wedding.id)
        .order("created_at", { ascending: true })
        .returns<BudgetCustomItem[]>(),
    ]);
  const error = lineError?.message ?? itemError?.message;
  if (error) return { error, lines: [], customOwners: new Map() };

  const byCategory = new Map((overrides ?? []).map((row) => [row.category, row]));
  const hidden = new Set(wedding.hidden_budget_categories ?? []);
  const lines: BudgetSiteLine[] = BUDGET_CATEGORIES.filter((c) => !hidden.has(c.key)).map(
    (category) => {
      const row = byCategory.get(category.key);
      return {
        id: `${CATEGORY_ID_PREFIX}${category.key}`,
        label: category.label,
        amount: row?.override_value ?? null,
        paid_amount: row?.paid_amount ?? null,
        purchased_from: row?.purchased_from ?? null,
        paid_by: row?.paid_by ?? null,
        due_date: row?.due_date ?? null,
        notes: row?.notes ?? null,
      };
    },
  );
  for (const item of items ?? []) lines.push(customItemLine(item));
  return {
    lines,
    customOwners: new Map((items ?? []).map((item) => [item.id, item.user_id])),
  };
}
