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
    { data: weddings },
    { count: vendorCount },
    { count: venueCount },
    { data: inquiries },
    { data: venueInquiries },
    { data: pendingPosts },
  ] = await Promise.all([
    admin.from("weddings").select("id, is_test").returns<{ id: string; is_test: boolean }[]>(),
    admin.from("vendors").select("id", { count: "exact", head: true }),
    admin.from("venues").select("id", { count: "exact", head: true }),
    admin
      .from("vendor_inquiries")
      .select("id, wedding_id, status")
      .returns<{ id: string; wedding_id: string; status: string }[]>(),
    admin
      .from("venue_inquiries")
      .select("id, wedding_id")
      .returns<{ id: string; wedding_id: string }[]>(),
    admin
      .from("guest_posts")
      .select("id, wedding_id")
      .eq("status", "pending")
      .returns<{ id: string; wedding_id: string }[]>(),
  ]);

  // Excludes weddings marked as test on the Couples admin page -- see the
  // same note on Growth and Vendors, which filter the same way.
  const testWeddingIds = new Set((weddings ?? []).filter((w) => w.is_test).map((w) => w.id));
  const realInquiries = (inquiries ?? []).filter((i) => !testWeddingIds.has(i.wedding_id));

  const weddingCount = (weddings ?? []).length - testWeddingIds.size;
  const realVenueInquiries = (venueInquiries ?? []).filter((i) => !testWeddingIds.has(i.wedding_id));
  const inquiryCount = realInquiries.length;
  const venueInquiryCount = realVenueInquiries.length;
  // Unfiltered: a post waiting on a test wedding still needs a look.
  const pendingPostCount = (pendingPosts ?? []).length;
  const bookedCount = realInquiries.filter((i) => i.status === "booked").length;

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
      <h1 className="mt-2 mb-2 font-display text-3xl font-semibold text-forest">Overview</h1>
      <p className="mb-6 text-xs text-ink/50">
        {testWeddingIds.size > 0
          ? `Excluding ${testWeddingIds.size} couple${testWeddingIds.size === 1 ? "" : "s"} marked as test on the Couples page.`
          : "Mark any test/owner accounts as test on the Couples page to exclude them here."}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Couples" value={weddingCount} />
        <StatTile label="Vendors" value={vendorCount ?? 0} />
        <StatTile label="Venues" value={venueCount ?? 0} />
        <StatTile label="Vendor inquiries" value={inquiryCount} />
        <StatTile label="Vendor bookings" value={bookedCount} />
        <StatTile label="Venue inquiries" value={venueInquiryCount} />
        <StatTile label="Photo-wall posts awaiting couples" value={pendingPostCount} />
      </div>
    </div>
  );
}
