"use client";

import { useState } from "react";
import { toggleVendorFavorite } from "../actions";
import { useFinishIntent } from "@/components/signup-sheet";
import type { SignupIntent } from "@/lib/signup-intent";
import type { Vendor } from "@/lib/supabase/types";
import { announceSaved } from "@/lib/saved-sync";
import { InquiryForm } from "../inquiry-form";
import { TrackedContactLink, telHref } from "@/components/tracked-contact-link";

export function VendorDetailClient({
  vendor,
  isFavorited: initialFavorited,
  then,
}: {
  vendor: Vendor;
  isFavorited: boolean;
  then?: SignupIntent;
}) {
  const [showInquiry, setShowInquiry] = useState(false);
  useFinishIntent(then, {
    save: () => {
      if (initialFavorited) return;
      const formData = new FormData();
      formData.set("vendor_id", vendor.id);
      formData.set("is_favorited", "false");
      // The heart is in the listing's header now; this tells it.
      toggleVendorFavorite(formData).then((result) => !result?.error && announceSaved("vendor", vendor.id, true));
    },
    ask: () => setShowInquiry(true),
  });

  return (
    <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
      {!showInquiry && (
        <button
          type="button"
          onClick={() => setShowInquiry(true)}
          className="w-full rounded-md bg-forest px-4 py-2.5 text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
        >
          Request a quote
        </button>
      )}

      {/* Email stays behind "Request a quote" so every inquiry is counted;
          the phone is a tracked tap-to-call. */}
      {vendor.contact_phone && !showInquiry && (
        <div className="mt-4 border-t border-hairline pt-4 text-sm text-ink/80">
          <TrackedContactLink
            listingType="vendor"
            listingId={vendor.id}
            kind="phone"
            href={telHref(vendor.contact_phone)}
            className="hover:underline"
          >
            {vendor.contact_phone}
          </TrackedContactLink>
        </div>
      )}

      {showInquiry && <InquiryForm vendor={vendor} onDone={() => setShowInquiry(false)} />}
    </div>
  );
}
