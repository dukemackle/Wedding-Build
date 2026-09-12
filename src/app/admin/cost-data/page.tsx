import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { BUDGET_CATEGORIES } from "@/lib/budget-categories";
import { STATES } from "@/lib/wedding-options";
import type { RegionalCostData } from "@/lib/supabase/types";
import { CostDataBrowser, ImportForm } from "./cost-data-manager";

export default async function AdminCostDataPage() {
  const admin = createAdminSupabaseClient();
  const { data: rows } = await admin
    .from("regional_cost_data")
    .select("*")
    .returns<RegionalCostData[]>();

  const coverageByCategory = new Map<string, Set<string>>();
  for (const row of rows ?? []) {
    const set = coverageByCategory.get(row.category_key) ?? new Set<string>();
    set.add(row.state);
    coverageByCategory.set(row.category_key, set);
  }

  const totalStates = STATES.length;

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-2 font-display text-3xl font-semibold text-forest">Cost Data</h1>
      <p className="mb-6 text-sm text-ink/70">
        Real wedding cost data by state and category, feeding the public cost estimator. Fill in
        the master spreadsheet, export a tab as CSV, and import it below.
      </p>
      <p className="mb-6 text-sm text-ink/70">
        No need to finish every state before importing &mdash; upload again any time you add
        more, it&apos;ll update existing rows in place.
      </p>

      <div className="w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <p className="mb-3 text-sm font-medium text-ink">Coverage</p>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 font-medium">States covered</th>
              </tr>
            </thead>
            <tbody>
              {BUDGET_CATEGORIES.map((category) => {
                const covered = coverageByCategory.get(category.key)?.size ?? 0;
                return (
                  <tr key={category.key} className="border-b border-hairline last:border-b-0">
                    <td className="py-2 pr-4 text-ink">{category.label}</td>
                    <td className="py-2 font-mono-numbers text-ink/70">
                      {covered} / {totalStates}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <p className="mb-3 text-sm font-medium text-ink">Browse imported data</p>
        <CostDataBrowser
          categoryOptions={BUDGET_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
          rows={rows ?? []}
        />
      </div>

      <div className="mt-8 w-full rounded-lg border border-hairline bg-card p-6 shadow-sm">
        <p className="mb-3 text-sm font-medium text-ink">Import a category&apos;s CSV</p>
        <ImportForm
          categoryOptions={BUDGET_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
        />
      </div>
    </div>
  );
}
