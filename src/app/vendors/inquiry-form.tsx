"use client";

import type { Vendor } from "@/lib/supabase/types";
import { InquiryComposer, type InquiryQuestion } from "@/components/inquiry-composer";
import { sendVendorInquiry } from "./actions";

/** What couples most often need from a vendor first. */
const VENDOR_QUESTIONS: InquiryQuestion[] = [
  { label: "Our date", line: "whether you’re available on our date", lineNoDate: "how far ahead you usually book up", on: true },
  { label: "Pricing", line: "your pricing and packages", on: true },
  { label: "Past work", line: "a few weddings you’ve done that we could look at" },
  { label: "Travel", line: "whether there’s a travel fee for our venue" },
  { label: "A call", line: "a good time for a quick call" },
];

export function InquiryForm({ vendor, onDone }: { vendor: Vendor; onDone: () => void }) {
  return (
    <InquiryComposer
      to={vendor.name}
      questions={VENDOR_QUESTIONS}
      hidden={{ vendor_id: vendor.id, vendor_name: vendor.name, category: vendor.category ?? "" }}
      needsRecipient={!vendor.contact_email}
      send={sendVendorInquiry}
      onDone={onDone}
    />
  );
}
