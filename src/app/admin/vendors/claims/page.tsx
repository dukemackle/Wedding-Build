import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { Vendor, VendorSubmission } from "@/lib/supabase/types";
import { VendorSubmissionReview } from "./vendor-submission-review";

export default async function AdminVendorClaimsPage() {
  await requireAdmin();
  const admin = createAdminSupabaseClient();
  const { data: submissions } = await admin
    .from("vendor_submissions")
    .select("*")
    .eq("status", "pending")
    .order("created_at")
    .returns<VendorSubmission[]>();

  const ids = [...new Set((submissions ?? []).map((s) => s.vendor_id))];
  const { data: vendors } = ids.length
    ? await admin.from("vendors").select("*").in("id", ids).returns<Vendor[]>()
    : { data: [] as Vendor[] };
  const byId = new Map((vendors ?? []).map((v) => [v.id, v]));

  return (
    <div>
      <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Admin</p>
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
    </div>
  );
}
