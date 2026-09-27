import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { VendorSubmission } from "@/lib/supabase/types";
import { detailsFromVendor } from "@/lib/vendor-claim";
import { vendorForClaimToken } from "@/lib/vendor-claim-server";
import { STANDARD_WIDTH } from "@/lib/layout";
import { VendorClaimForm } from "./vendor-claim-form";

export const metadata = {
  title: "Update your listing — Wren",
  // A private link: keep it out of search results even if it gets shared.
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
            Links are replaced from time to time. Ask for a fresh one and we&apos;ll email it to the
            address on your listing.
          </p>
          <Link href="/list/edit" className="mt-6 inline-block text-sm text-brass hover:underline">
            Get a new link &rarr;
          </Link>
        </div>
      </main>
    );
  }

  const admin = createAdminSupabaseClient();
  const { data: pending } = await admin
    .from("vendor_submissions")
    .select("*")
    .eq("vendor_id", vendor.id)
    .eq("status", "pending")
    .maybeSingle<VendorSubmission>();

  const isNew = vendor.source === "self-listed";

  // Coming back before we've reviewed: start from what they already sent.
  const initial = pending
    ? {
        details: pending.details,
        photoUrl: pending.photo_url,
        submitter: {
          name: pending.submitter_name,
          email: pending.submitter_email,
          role: pending.submitter_role,
          represents: false,
        },
      }
    : {
        details: detailsFromVendor(vendor),
        photoUrl: vendor.image_url,
        submitter: { name: "", email: isNew ? (vendor.contact_email ?? "") : "", role: null, represents: false },
      };

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14">
      <div className={`w-full ${STANDARD_WIDTH}`}>
        <Link href="/" className="font-display text-xl font-semibold text-forest">
          Wren
        </Link>
        <p className="mt-8 font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">
          {isNew ? "Your new listing" : "Your listing"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">{vendor.name}</h1>
        <p className="mt-2 max-w-2xl text-ink/70">
          {isNew
            ? "Add a photo, your prices and what couples get, then send it to us. We review every listing and email you when it's live. We've emailed you this link too, so you can finish later."
            : `Couples planning weddings on Wren can already find ${vendor.name}. Check the details below, fix anything that's wrong, and add a photo. We review every change before it goes live.`}
        </p>
        {pending && (
          <p className="mt-4 max-w-2xl rounded-md border border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink/80">
            Your earlier changes are waiting for review. Anything you submit now replaces them.
          </p>
        )}
        <VendorClaimForm token={token} initial={initial} />
      </div>
    </main>
  );
}
