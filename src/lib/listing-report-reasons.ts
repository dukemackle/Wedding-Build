/** Why a couple says a listing is wrong (listing_reports.reason). */
export const REPORT_REASONS = [
  { value: "closed", label: "It's closed or no longer does weddings" },
  { value: "contact", label: "Phone, email or website is wrong" },
  { value: "price", label: "Price is wrong" },
  { value: "details", label: "Capacity, address or other details are wrong" },
  { value: "photos", label: "Photos are wrong or not theirs" },
  { value: "other", label: "Something else" },
] as const;

export const reportReasonLabel = (value: string) =>
  REPORT_REASONS.find((r) => r.value === value)?.label ?? value;
