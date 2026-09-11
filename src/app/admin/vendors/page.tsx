import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Vendor } from "@/lib/supabase/types";
import { AdminVendorsManager, type VendorStats } from "./admin-vendors-manager";

export default async function AdminVendorsPage() {
  const admin = createAdminSupabaseClient();
  const [{ data: vendors }, { data: inquiries }] = await Promise.all([
    admin.from("vendors").select("*").order("name").returns<Vendor[]>(),
    admin
      .from("vendor_inquiries")
      .select("vendor_name, status, booked_amount")
      .returns<{ vendor_name: string; status: string; booked_amount: number | null }[]>(),
  ]);

  // Inquiries key on vendor_name, not vendor_id -- couples can inquire to a
  // vendor that isn't in the managed vendors table at all, so name is the
  // only field guaranteed to line up between the two.
  const statsByVendorName = new Map<string, VendorStats>();
  for (const inquiry of inquiries ?? []) {
    const entry = statsByVendorName.get(inquiry.vendor_name) ?? {
      sent: 0,
      booked: 0,
      bookedAmount: 0,
    };
    entry.sent += 1;
    if (inquiry.status === "booked") {
      entry.booked += 1;
      entry.bookedAmount += inquiry.booked_amount ?? 0;
    }
    statsByVendorName.set(inquiry.vendor_name, entry);
  }

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Vendors</h1>
      <AdminVendorsManager
        vendors={vendors ?? []}
        statsByVendorName={Object.fromEntries(statsByVendorName)}
      />
    </div>
  );
}
