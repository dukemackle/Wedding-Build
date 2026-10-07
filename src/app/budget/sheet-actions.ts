"use server";

import { BUDGET_CATEGORIES } from "@/lib/budget-categories";
import {
  CATEGORY_ID_PREFIX,
  budgetColumnsFromValues,
  budgetSiteRows,
  budgetSyncValues,
  isCategoryId,
  readBudgetSheet,
} from "@/lib/budget-sheet";
import { loadBudgetLines } from "@/lib/budget-sheet-server";
import { normaliseHeading } from "@/lib/spreadsheet";
import { runSheetSync, type SheetSyncResult } from "@/lib/sheet-sync-server";

/** One sync of the budget with its linked tab. See runSheetSync. */
export async function syncBudgetSheet(formData: FormData): Promise<SheetSyncResult> {
  return runSheetSync(formData, ({ supabase, user, wedding }) => {
    let owners = new Map<string, string>();

    return {
      kind: "budget",
      revalidate: ["/budget", "/dashboard"],
      read: readBudgetSheet,
      normalizeName: normaliseHeading,
      // A category's name is the app's, and the category itself can be
      // hidden on the page but not deleted from a sheet.
      locked: (id) => (isCategoryId(id) ? { fields: ["name"], undeletable: true } : undefined),

      async loadSiteRows() {
        const loaded = await loadBudgetLines(supabase, wedding);
        if (loaded.error) return { error: loaded.error, rows: [] };
        owners = loaded.customOwners;
        return { rows: budgetSiteRows(loaded.lines) };
      },

      async apply(plan, final) {
        const now = new Date().toISOString();
        const categoryRows = [];
        const itemRows = [];
        for (const { id } of plan.updates) {
          const columns = budgetColumnsFromValues(final.get(id)!);
          if (isCategoryId(id)) {
            const key = id.slice(CATEGORY_ID_PREFIX.length);
            const category = BUDGET_CATEGORIES.find((c) => c.key === key);
            if (!category) continue;
            categoryRows.push({
              wedding_id: wedding.id,
              category: key,
              label: category.label,
              override_value: columns.amount,
              paid_amount: columns.paid_amount,
              purchased_from: columns.purchased_from,
              paid_by: columns.paid_by,
              due_date: columns.due_date,
              notes: columns.notes,
              updated_at: now,
            });
          } else {
            itemRows.push({
              id,
              wedding_id: wedding.id,
              user_id: owners.get(id) ?? user.id,
              ...columns,
              amount: columns.amount ?? 0,
              updated_at: now,
            });
          }
        }

        if (categoryRows.length > 0) {
          const { error } = await supabase
            .from("budget_line_items")
            .upsert(categoryRows, { onConflict: "wedding_id,category" });
          if (error) return { error: error.message, created: [] };
        }
        if (itemRows.length > 0) {
          const { error } = await supabase
            .from("budget_custom_items")
            .upsert(itemRows, { onConflict: "id" });
          if (error) return { error: error.message, created: [] };
        }

        const created: { id: string; values: Record<string, string> }[] = [];
        if (plan.creates.length > 0) {
          const inserts = plan.creates.map(({ values }) => {
            const columns = budgetColumnsFromValues(values);
            return { wedding_id: wedding.id, user_id: user.id, ...columns, amount: columns.amount ?? 0 };
          });
          const { data, error } = await supabase
            .from("budget_custom_items")
            .insert(inserts)
            .select("id")
            .returns<{ id: string }[]>();
          if (error) return { error: error.message, created: [] };
          (data ?? []).forEach((row, index) => {
            const insert = inserts[index];
            created.push({ id: row.id, values: budgetSyncValues({ id: row.id, ...insert }) });
          });
        }

        const deletable = plan.deleteOnSite.filter((id) => !isCategoryId(id));
        if (deletable.length > 0) {
          const { error } = await supabase
            .from("budget_custom_items")
            .delete()
            .eq("wedding_id", wedding.id)
            .in("id", deletable);
          if (error) return { error: error.message, created };
        }

        return { created };
      },
    };
  });
}
