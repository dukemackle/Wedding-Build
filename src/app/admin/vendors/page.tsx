import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Vendor } from "@/lib/supabase/types";
import { AdminVendorsManager } from "./admin-vendors-manager";

export default async function AdminVendorsPage() {
  const admin = createAdminSupabaseClient();
  const { data: vendors } = await admin
    .from("vendors")
    .select("*")
    .order("name")
    .returns<Vendor[]>();

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Vendors</h1>
      <AdminVendorsManager vendors={vendors ?? []} />
    </div>
  );
}
