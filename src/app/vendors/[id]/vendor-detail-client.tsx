"use client";

import { useState } from "react";
import type { Vendor } from "@/lib/supabase/types";
import { VendorFavoriteButton } from "../vendor-card-shared";
import { InquiryForm } from "../inquiry-form";

export function VendorDetailClient({
  vendor,
  isFavorited,
}: {
  vendor: Vendor;
  isFavorited: boolean;
}) {
  const [showInquiry, setShowInquiry] = useState(false);

  return (
    <div className="rounded-lg border border-hairline bg-card p-6 shadow-sm">
      <VendorFavoriteButton vendorId={vendor.id} isFavorited={isFavorited} />
      {!showInquiry && (
        <button
          type="button"
          onClick={() => setShowInquiry(true)}
          className="mt-4 w-full rounded-md bg-forest px-4 py-2.5 text-sm font-medium text-parchment transition-colors hover:bg-forest/90"
        >
          Request a quote
        </button>
      )}

      {vendor.contact_email && !showInquiry && (
        <p className="mt-4 border-t border-hairline pt-4 text-sm text-ink/80">
          {vendor.contact_email}
        </p>
      )}

      {showInquiry && <InquiryForm vendor={vendor} onDone={() => setShowInquiry(false)} />}
    </div>
  );
}
