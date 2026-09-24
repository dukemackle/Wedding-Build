import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { AttireItem } from "@/lib/supabase/types";
import { AdminAttireManager } from "./admin-attire-manager";

export default async function AdminAttirePage() {
  const admin = createAdminSupabaseClient();
  const [{ data: items }, { data: vendors }, { data: saves }] = await Promise.all([
    admin.from("attire_items").select("*").order("category").order("name").returns<AttireItem[]>(),
    admin.from("vendors").select("id, name").order("name").returns<{ id: string; name: string }[]>(),
    admin.from("attire_shortlist").select("attire_item_id").returns<{ attire_item_id: string }[]>(),
  ]);

  const saveCounts: Record<string, number> = {};
  for (const s of saves ?? []) saveCounts[s.attire_item_id] = (saveCounts[s.attire_item_id] ?? 0) + 1;

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Attire</h1>
      <AdminAttireManager items={items ?? []} vendors={vendors ?? []} saveCounts={saveCounts} />
    </div>
  );
}
