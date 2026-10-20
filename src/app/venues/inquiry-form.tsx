"use client";

import type { Venue } from "@/lib/supabase/types";
import { InquiryComposer, type InquiryQuestion } from "@/components/inquiry-composer";
import { sendVenueInquiry } from "./actions";

/** What couples most often need from a venue first, in the order they ask. */
const VENUE_QUESTIONS: InquiryQuestion[] = [
  { label: "Our date", line: "whether you’re available on our date", lineNoDate: "which dates you have open", on: true },
  { label: "Pricing", line: "your pricing for a wedding our size", on: true },
  { label: "What’s included", line: "what’s included (tables, chairs, linens, staff)", on: true },
  { label: "Catering", line: "whether we can bring our own caterer or need to use yours" },
  { label: "Rain plan", line: "what the plan is if the weather turns" },
  { label: "A visit", line: "when we could come and see it" },
];

export function InquiryForm({ venue, onDone }: { venue: Venue; onDone: () => void }) {
  return (
    <InquiryComposer
      to={venue.name}
      questions={VENUE_QUESTIONS}
      hidden={{ venue_id: venue.id, venue_name: venue.name }}
      needsRecipient={!venue.contact_email}
      send={sendVenueInquiry}
      onDone={onDone}
    />
  );
}
