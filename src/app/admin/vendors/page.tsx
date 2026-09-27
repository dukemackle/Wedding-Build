import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Vendor, VendorContactLog, VendorFaq } from "@/lib/supabase/types";
import { countAddedThisWeek, fetchDistinct, fetchListingPage, fetchTestWeddingIds } from "../_listing/query";
import { parseListingParams } from "../_listing/params";
import { AdminVendorsManager, type VendorStats } from "./admin-vendors-manager";
import { VENDOR_LISTING } from "./listing-config";

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = parseListingParams(await searchParams);
  const admin = createAdminSupabaseClient();

  const [{ rows: vendors, total, statusCounts }, categories, addedThisWeek, testWeddingIds, { count: pendingClaims }] =
    await Promise.all([
      fetchListingPage<Vendor>(VENDOR_LISTING, params),
      fetchDistinct("vendors", "category"),
      countAddedThisWeek("vendors"),
      fetchTestWeddingIds(),
      admin.from("vendor_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);

  // Everything below is for the rows on screen only.
  const ids = vendors.map((v) => v.id);
  const names = vendors.map((v) => v.name);
  const [{ data: inquiries }, { data: contactLogs }, { data: favorites }, { data: faqs }] = ids.length
    ? await Promise.all([
        // Inquiries key on vendor_name, not vendor_id -- couples can inquire to a
        // vendor that isn't in the managed vendors table at all, so name is the
        // only field guaranteed to line up between the two.
        admin
          .from("vendor_inquiries")
          .select("vendor_name, status, booked_amount, wedding_id")
          .in("vendor_name", names)
          .returns<{ vendor_name: string; status: string; booked_amount: number | null; wedding_id: string }[]>(),
        admin
          .from("vendor_contact_log")
          .select("*")
          .in("vendor_id", ids)
          .order("created_at", { ascending: false })
          .returns<VendorContactLog[]>(),
        admin
          .from("vendor_favorites")
          .select("vendor_id, wedding_id")
          .in("vendor_id", ids)
          .returns<{ vendor_id: string; wedding_id: string }[]>(),
        admin.from("vendor_faqs").select("*").in("vendor_id", ids).order("sort_order").returns<VendorFaq[]>(),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  // Test weddings (marked on the Couples page) are left out so per-vendor
  // counts reflect real demand -- the Phase 1 monetization trigger in
  // docs/monetization.md depends on genuine, non-owner-test inquiry volume.
  const statsByVendorName: Record<string, VendorStats> = {};
  for (const inquiry of inquiries ?? []) {
    if (testWeddingIds.has(inquiry.wedding_id)) continue;
    const entry = (statsByVendorName[inquiry.vendor_name] ??= { sent: 0, booked: 0, bookedAmount: 0 });
    entry.sent += 1;
    if (inquiry.status === "booked") {
      entry.booked += 1;
      entry.bookedAmount += inquiry.booked_amount ?? 0;
    }
  }

  const savesByVendorId: Record<string, number> = {};
  for (const fav of favorites ?? []) {
    if (testWeddingIds.has(fav.wedding_id)) continue;
    savesByVendorId[fav.vendor_id] = (savesByVendorId[fav.vendor_id] ?? 0) + 1;
  }

  const logsByVendorId: Record<string, VendorContactLog[]> = {};
  for (const log of contactLogs ?? []) (logsByVendorId[log.vendor_id] ??= []).push(log);

  const faqsByVendorId: Record<string, VendorFaq[]> = {};
  for (const faq of faqs ?? []) (faqsByVendorId[faq.vendor_id] ??= []).push(faq);

  const heading = (
    <>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Marketplace</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Vendors</h1>
      <p className="mt-1 text-sm text-ink/55">
        {statusCounts.all.toLocaleString()} vendors
        {addedThisWeek > 0 && ` · ${addedThisWeek} added this week`}
      </p>
    </>
  );

  const notice = (pendingClaims ?? 0) > 0 && (
    <Link
      href="/admin/vendors/claims"
      className="mb-4 flex items-center justify-between rounded-md border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink hover:border-brass"
    >
      <span>
        {pendingClaims} {pendingClaims === 1 ? "vendor has" : "vendors have"} sent changes to review
      </span>
      <span className="text-brass">Review &rarr;</span>
    </Link>
  );

  return (
    <div>
      <AdminVendorsManager
        heading={heading}
        notice={notice}
        vendors={vendors}
        total={total}
        params={params}
        statusCounts={statusCounts}
        categories={categories}
        statsByVendorName={statsByVendorName}
        savesByVendorId={savesByVendorId}
        logsByVendorId={logsByVendorId}
        faqsByVendorId={faqsByVendorId}
      />
    </div>
  );
}
