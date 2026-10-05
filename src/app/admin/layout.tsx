import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { AdminContent, AdminNav } from "./admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  const admin = createAdminSupabaseClient();
  const [{ count: venueClaims }, { count: vendorClaims }, { count: openReports }] = await Promise.all([
    admin.from("venue_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("vendor_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("listing_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row">
      <AdminNav pendingClaims={{ venues: venueClaims ?? 0, vendors: vendorClaims ?? 0, reports: openReports ?? 0 }} />
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-10">
        <AdminContent>{children}</AdminContent>
      </main>
    </div>
  );
}
