import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { AttireItem, AttireMerchant } from "@/lib/supabase/types";
import { AdminAttireManager } from "./admin-attire-manager";

const sinceIso = (days: number) => new Date(Date.now() - days * 864e5).toISOString();

export default async function AdminAttirePage() {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  // Our own click count, last 30 days. Sales come from each network's
  // dashboard and are never shown here as ours.
  const [{ data: items }, { data: vendors }, { data: saves }, { data: merchants }, { data: clicks }] = await Promise.all([
    admin.from("attire_items").select("*").order("category").order("name").returns<AttireItem[]>(),
    admin.from("vendors").select("id, name").order("name").returns<{ id: string; name: string }[]>(),
    admin.from("attire_shortlist").select("attire_item_id").returns<{ attire_item_id: string }[]>(),
    admin.from("attire_merchants").select("*").order("name").returns<AttireMerchant[]>(),
    admin
      .from("attire_clicks")
      .select("attire_item_id, merchant_id")
      .gte("created_at", sinceIso(30))
      .returns<{ attire_item_id: string; merchant_id: string | null }[]>(),
  ]);

  const saveCounts: Record<string, number> = {};
  for (const s of saves ?? []) saveCounts[s.attire_item_id] = (saveCounts[s.attire_item_id] ?? 0) + 1;
  const clickCounts: Record<string, number> = {};
  const merchantClicks: Record<string, number> = {};
  for (const c of clicks ?? []) {
    clickCounts[c.attire_item_id] = (clickCounts[c.attire_item_id] ?? 0) + 1;
    if (c.merchant_id) merchantClicks[c.merchant_id] = (merchantClicks[c.merchant_id] ?? 0) + 1;
  }

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Attire</h1>
      <AdminAttireManager
        items={items ?? []}
        vendors={vendors ?? []}
        merchants={merchants ?? []}
        saveCounts={saveCounts}
        clickCounts={clickCounts}
        merchantClicks={merchantClicks}
      />
    </div>
  );
}
