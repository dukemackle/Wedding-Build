import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { VendorFaq, VendorSubmission } from "@/lib/supabase/types";
import { vendorDetailsFrom } from "@/lib/vendor-claim";
import { vendorForClaimToken } from "@/lib/vendor-claim-server";
import { SUGGESTED_VENDOR_QUESTIONS } from "@/lib/wedding-options";
import { WIDE_WIDTH } from "@/lib/layout";
import { VendorClaimForm } from "./vendor-claim-form";

export const metadata = {
  title: "Update your listing — Wren",
  robots: { index: false, follow: false },
};

export default async function VendorClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const vendor = await vendorForClaimToken(token);

  if (!vendor) {
    return (
      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-forest">This link has expired</h1>
          <p className="mt-3 text-sm text-ink/70">
            Claim links are replaced from time to time. Reply to the email it came in and we&apos;ll send you a new
            one.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-brass hover:underline">
            Go to Wren &rarr;
          </Link>
        </div>
      </main>
    );
  }

  const admin = createAdminSupabaseClient();
  const [{ data: pending }, { data: faqs }] = await Promise.all([
    admin
      .from("vendor_submissions")
      .select("*")
      .eq("vendor_id", vendor.id)
      .eq("status", "pending")
      .maybeSingle<VendorSubmission>(),
    admin.from("vendor_faqs").select("*").eq("vendor_id", vendor.id).order("sort_order").returns<VendorFaq[]>(),
  ]);

  // The questions couples ask this kind of vendor first, waiting for answers.
  const liveFaqs = (faqs ?? []).map((f) => ({ question: f.question, answer: f.answer }));
  const asked = new Set(liveFaqs.map((f) => f.question.toLowerCase()));
  const suggested = (SUGGESTED_VENDOR_QUESTIONS[vendor.category ?? ""] ?? SUGGESTED_VENDOR_QUESTIONS.default)
    .filter((q) => !asked.has(q.toLowerCase()))
    .map((question) => ({ question, answer: "" }));

  const initial = pending
    ? {
        details: pending.details,
        faqs: pending.faqs,
        photoUrls: pending.photo_urls,
        submitter: { name: pending.submitter_name, email: pending.submitter_email, role: pending.submitter_role, represents: false },
      }
    : {
        details: vendorDetailsFrom(vendor),
        faqs: [...liveFaqs, ...suggested],
        photoUrls: vendor.photo_urls.length > 0 ? vendor.photo_urls : vendor.image_url ? [vendor.image_url] : [],
        submitter: { name: "", email: "", role: null, represents: false },
      };

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14">
      <div className={`w-full ${WIDE_WIDTH}`}>
        <Link href="/" className="font-display text-xl font-semibold text-forest">
          Wren
        </Link>
        <p className="mt-8 font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Your listing</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">{vendor.name}</h1>
        <p className="mt-2 max-w-2xl text-ink/70">
          Couples planning weddings on Wren can already find {vendor.name}. Check the details below, fix anything
          that&apos;s wrong, and add your photos and pricing. We review every change before it goes live.
        </p>
        {pending && (
          <p className="mt-4 max-w-2xl rounded-md border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink/80">
            Your earlier changes are waiting for review. Anything you submit now replaces them.
          </p>
        )}
        <VendorClaimForm token={token} category={vendor.category} initial={initial} />
      </div>
    </main>
  );
}
