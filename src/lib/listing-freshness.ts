/**
 * How stale a listing is, and whether that matters yet.
 *
 * Different facts rot at different speeds, which is why one "last checked"
 * date isn't enough on its own to say a listing is bad. A venue's capacity is
 * the same this year as last; its phone number probably isn't; whether it's
 * still trading can change overnight. The cadences below are the intervals
 * worth re-checking each of those at, and the overall staleness of a row is
 * governed by the fastest-rotting thing on it.
 */

export type RefreshCadence = {
  key: string;
  label: string;
  /** Days between checks. */
  days: number;
  /** What this cadence is actually re-checking. */
  checks: string;
};

export const REFRESH_CADENCES: RefreshCadence[] = [
  { key: "weekly", label: "Weekly", days: 7, checks: "Still open and trading" },
  { key: "monthly", label: "Monthly", days: 30, checks: "Email, phone, website" },
  { key: "quarterly", label: "Quarterly", days: 91, checks: "Price tier" },
  { key: "semiannual", label: "Twice a year", days: 182, checks: "Description, photos" },
  { key: "annual", label: "Yearly", days: 365, checks: "Capacity, amenities, setting" },
];

/**
 * The interval a listing is judged against.
 *
 * Monthly rather than weekly, deliberately. A weekly "is it still open" check
 * can't be done by re-reading a database row -- it needs someone or something
 * to look -- so holding every listing to it would mark the entire directory
 * stale and make the signal meaningless. Monthly is the fastest thing an
 * admin can honestly confirm by hand.
 */
export const REVIEW_INTERVAL_DAYS = 30;

export type Freshness = "unverified" | "fresh" | "due" | "stale";

export function freshnessOf(lastVerifiedAt: string | null): Freshness {
  if (!lastVerifiedAt) return "unverified";

  const days = (Date.now() - new Date(lastVerifiedAt).getTime()) / (24 * 60 * 60 * 1000);
  if (days < 0) return "fresh";
  if (days <= REVIEW_INTERVAL_DAYS) return "fresh";
  if (days <= REVIEW_INTERVAL_DAYS * 3) return "due";
  return "stale";
}

export const FRESHNESS_LABELS: Record<Freshness, string> = {
  unverified: "Never checked",
  fresh: "Checked recently",
  due: "Due a check",
  stale: "Out of date",
};

export function describeLastVerified(lastVerifiedAt: string | null): string {
  if (!lastVerifiedAt) return "never checked";

  const days = Math.floor((Date.now() - new Date(lastVerifiedAt).getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "checked today";
  if (days === 1) return "checked yesterday";
  if (days < 31) return `checked ${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `checked ${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(days / 365);
  return `checked ${years} year${years === 1 ? "" : "s"} ago`;
}
