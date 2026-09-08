import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { VendorInquiry, Wedding } from "@/lib/supabase/types";
import { ReferralLookup } from "./referral-lookup";

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-hairline bg-card p-4">
      <p className="font-mono-numbers text-2xl font-semibold text-forest">{value}</p>
      <p className="mt-1 text-xs text-ink/60">{label}</p>
    </div>
  );
}

export default async function AdminRevenuePage() {
  const admin = createAdminSupabaseClient();

  const [{ data: inquiries }, { data: weddings }] = await Promise.all([
    admin.from("vendor_inquiries").select("*").returns<VendorInquiry[]>(),
    admin
      .from("weddings")
      .select("id, partner_a_name, partner_b_name, referral_code")
      .returns<Pick<Wedding, "id" | "partner_a_name" | "partner_b_name" | "referral_code">[]>(),
  ]);

  const allInquiries = inquiries ?? [];
  const bookedInquiries = allInquiries.filter((i) => i.status === "booked");
  const totalBookedAmount = bookedInquiries.reduce((sum, i) => sum + (i.booked_amount ?? 0), 0);

  const byVendor = new Map<
    string,
    { sent: number; booked: number; bookedAmount: number }
  >();
  for (const inquiry of allInquiries) {
    const entry = byVendor.get(inquiry.vendor_name) ?? { sent: 0, booked: 0, bookedAmount: 0 };
    entry.sent += 1;
    if (inquiry.status === "booked") {
      entry.booked += 1;
      entry.bookedAmount += inquiry.booked_amount ?? 0;
    }
    byVendor.set(inquiry.vendor_name, entry);
  }
  const vendorRows = Array.from(byVendor.entries()).sort(
    (a, b) => b[1].bookedAmount - a[1].bookedAmount,
  );

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Revenue</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Inquiries sent" value={String(allInquiries.length)} />
        <StatTile label="Bookings confirmed" value={String(bookedInquiries.length)} />
        <StatTile label="Total booked amount" value={formatCurrency(totalBookedAmount)} />
      </div>

      <div className="mt-8 w-full overflow-x-auto rounded-lg border border-hairline bg-card shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs uppercase tracking-wide text-ink/50">
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Inquiries</th>
              <th className="px-4 py-3 font-medium">Booked</th>
              <th className="px-4 py-3 font-medium">Booked amount</th>
            </tr>
          </thead>
          <tbody>
            {vendorRows.map(([vendorName, stats]) => (
              <tr key={vendorName} className="border-b border-hairline last:border-b-0">
                <td className="px-4 py-3 text-ink">{vendorName}</td>
                <td className="px-4 py-3 font-mono-numbers text-ink/70">{stats.sent}</td>
                <td className="px-4 py-3 font-mono-numbers text-ink/70">{stats.booked}</td>
                <td className="px-4 py-3 font-mono-numbers text-ink/70">
                  {formatCurrency(stats.bookedAmount)}
                </td>
              </tr>
            ))}
            {vendorRows.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-ink/50" colSpan={4}>
                  No inquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <ReferralLookup weddings={weddings ?? []} />
      </div>
    </div>
  );
}
