import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { type OpsService } from "@/lib/spend";
import { SpendManager } from "./spend-manager";

/**
 * What the company pays for and when each thing renews, entered by hand.
 * Running notes for the owner, not the books: receipts for taxes live with
 * the accountant (docs/admin-blueprint.md, section 8).
 */
export default async function AdminSpendPage() {
  await requireAdmin();
  const { data, error } = await createAdminSupabaseClient()
    .from("ops_services")
    .select("*")
    .order("next_renewal", { ascending: true, nullsFirst: false })
    .order("name")
    .returns<OpsService[]>();

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-2 font-display text-3xl font-semibold text-forest">Spend &amp; renewals</h1>
      <p className="mb-6 max-w-2xl text-sm text-ink/70">
        Everything You Do, I Do pays for, what it costs and when it renews. These are your own running notes. For
        taxes, keep the receipts themselves.
      </p>
      {error ? (
        <p className="rounded-lg border border-hairline bg-card p-4 text-sm text-red-800">
          Couldn&apos;t load services ({error.message}). If the table is missing, run migration 0128_ops_services.sql.
        </p>
      ) : (
        <SpendManager services={data ?? []} />
      )}
    </div>
  );
}
