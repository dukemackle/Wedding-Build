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
      <div className="flex flex-wrap items-center gap-2">
        <VendorFavoriteButton vendorId={vendor.id} isFavorited={isFavorited} />
        {!showInquiry && (
          <button
            type="button"
            onClick={() => setShowInquiry(true)}
            className="rounded-full border border-hairline bg-parchment px-3 py-1 text-sm text-forest transition-colors hover:border-forest"
          >
            Request a quote
          </button>
        )}
      </div>

      {vendor.contact_email && !showInquiry && (
        <p className="mt-4 border-t border-hairline pt-4 text-sm text-ink/80">
          {vendor.contact_email}
        </p>
      )}

      {showInquiry && <InquiryForm vendor={vendor} onDone={() => setShowInquiry(false)} />}
    </div>
  );
}
