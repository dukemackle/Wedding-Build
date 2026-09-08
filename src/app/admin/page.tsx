import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-hairline bg-card p-4">
      <p className="font-mono-numbers text-2xl font-semibold text-forest">{value}</p>
      <p className="mt-1 text-xs text-ink/60">{label}</p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const admin = createAdminSupabaseClient();

  const [
    { count: weddingCount },
    { count: vendorCount },
    { count: venueCount },
    { count: inquiryCount },
    { count: bookedCount },
  ] = await Promise.all([
    admin.from("weddings").select("id", { count: "exact", head: true }),
    admin.from("vendors").select("id", { count: "exact", head: true }),
    admin.from("venues").select("id", { count: "exact", head: true }),
    admin.from("vendor_inquiries").select("id", { count: "exact", head: true }),
    admin.from("vendor_inquiries").select("id", { count: "exact", head: true }).eq("status", "booked"),
  ]);

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-6 font-display text-3xl font-semibold text-forest">Overview</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Couples" value={weddingCount ?? 0} />
        <StatTile label="Vendors" value={vendorCount ?? 0} />
        <StatTile label="Venues" value={venueCount ?? 0} />
        <StatTile label="Inquiries sent" value={inquiryCount ?? 0} />
        <StatTile label="Bookings confirmed" value={bookedCount ?? 0} />
      </div>
    </div>
  );
}
