export const NOTICE_STATUSES = [
  { value: "received", label: "Received" },
  { value: "removed", label: "Content removed" },
  { value: "rejected", label: "Incomplete or rejected" },
  { value: "counter_notice", label: "Counter-notice in" },
  { value: "restored", label: "Restored" },
] as const;

export type NoticeStatus = (typeof NOTICE_STATUSES)[number]["value"];

/** A strike is a notice that ended with the content down. */
export const COUNTS_AS_STRIKE: readonly NoticeStatus[] = ["removed"];
