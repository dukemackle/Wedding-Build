import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { SITE_URL, vendorHref } from "@/lib/public-listings";
import { foundUsLines } from "@/lib/attribution";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { RecentlyApproved, type ApprovedClaim } from "../../_listing/recently-approved";
import type { Vendor, VendorSubmission } from "@/lib/supabase/types";
import { VendorSubmissionReview } from "./vendor-submission-review";
import { AdminEyebrow } from "@/app/admin/admin-nav";

export default async function AdminVendorClaimsPage() {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const { data: submissions } = await admin
    .from("vendor_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at")
    .returns<VendorSubmission[]>();
  const { data: approved } = await admin
    .from("vendor_submissions")
    .select("id, vendor_id, submitter_name, submitter_email, submitter_role, reviewed_at, heard_from, arrived_via, first_touch")
    .eq("status", "approved")
    .order("reviewed_at", { ascending: false })
    .returns<Pick<VendorSubmission, "id" | "vendor_id" | "submitter_name" | "submitter_email" | "submitter_role" | "reviewed_at" | "heard_from" | "arrived_via" | "first_touch">[]>();

  const ids = [...new Set([...(submissions ?? []), ...(approved ?? [])].map((s) => s.vendor_id))];
  const { data: vendors } = ids.length
    ? await admin.from("vendors").select("*").in("id", ids).returns<Vendor[]>()
    : { data: [] as Vendor[] };
  const byId = new Map((vendors ?? []).map((v) => [v.id, v]));
  const recent: ApprovedClaim[] = (approved ?? []).flatMap((s) => {
    const v = byId.get(s.vendor_id);
    if (!v) return [];
    return [{
      id: s.id,
      name: v.name,
      listingUrl: `${SITE_URL}${vendorHref(v)}`,
      where: [v.category, [v.city, v.state].filter(Boolean).join(", ")].filter(Boolean).join(" · "),
      submitterName: s.submitter_name,
      submitterRole: s.submitter_role,
      submitterEmail: s.submitter_email,
      reviewedAt: s.reviewed_at,
      foundUs: foundUsLines(s),
    }];
  });

  return (
    <div>
      <AdminEyebrow />
      <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Vendor changes to review</h1>
      <p className="mt-2 mb-6 text-sm text-ink/60">
        Sent by vendors through their claim links. Nothing here is live until you approve it.{" "}
        <Link href="/admin/vendors" className="text-brass hover:underline">
          Back to vendors
        </Link>
      </p>
      {(submissions ?? []).length === 0 ? (
        <div className="rounded-lg border border-hairline bg-card p-6 text-sm text-ink/60 shadow-sm">
          Nothing waiting. Send vendors their claim links from the Vendors page.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {(submissions ?? []).map((s) => {
            const vendor = byId.get(s.vendor_id);
            return vendor ? <VendorSubmissionReview key={s.id} submission={s} vendor={vendor} /> : null;
          })}
        </div>
      )}
      <RecentlyApproved claims={recent} />
    </div>
  );
}
