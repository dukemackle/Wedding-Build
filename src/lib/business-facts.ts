/**
 * The booking facts both venues and vendors can add on their claim form:
 * how long they've been going, how far ahead couples book them, what it
 * takes to book and what happens if plans change. Self-reported, like the
 * rest of a claimed listing, and every one optional.
 *
 * Shared by both claim validators, the "Fill this in for me" field list and
 * both listing pages, so the columns, labels and limits live in one place.
 */

export const REPLY_TIMES = {
  same_day: "the same day",
  one_day: "within a day",
  few_days: "within 2–3 days",
  week: "within a week",
} as const;
export type ReplyTime = keyof typeof REPLY_TIMES;

export type BusinessFacts = {
  /** A year, not a count, so "12 years" never goes stale. */
  founded_year: number | null;
  weddings_per_year: number | null;
  booking_lead_months: number | null;
  reply_time: ReplyTime | null;
  deposit_percent: number | null;
  /** Days before the wedding the balance is due; 0 means on the day. */
  balance_due_days: number | null;
  cancellation_policy: string | null;
};

export const BUSINESS_FACT_KEYS = [
  "founded_year",
  "weddings_per_year",
  "booking_lead_months",
  "reply_time",
  "deposit_percent",
  "balance_due_days",
  "cancellation_policy",
] as const satisfies readonly (keyof BusinessFacts)[];

export const BUSINESS_FACT_LABELS: Record<keyof BusinessFacts, string> = {
  founded_year: "Year founded",
  weddings_per_year: "Weddings a year",
  booking_lead_months: "Usually booked ahead",
  reply_time: "Replies",
  deposit_percent: "Deposit to book",
  balance_due_days: "Balance due",
  cancellation_policy: "Cancellation policy",
};

export const CANCELLATION_POLICY_MAX = 600;
export const FIRST_FOUNDED_YEAR = 1800;

export function businessFactsFrom(row: BusinessFacts): BusinessFacts {
  return {
    founded_year: row.founded_year,
    weddings_per_year: row.weddings_per_year,
    booking_lead_months: row.booking_lead_months,
    reply_time: row.reply_time,
    deposit_percent: row.deposit_percent,
    balance_due_days: row.balance_due_days,
    cancellation_policy: row.cancellation_policy,
  };
}

/** Checks the submitted facts; problems are pushed onto `errors` in the form's words. */
export function validateBusinessFacts(d: Partial<Record<keyof BusinessFacts, unknown>>, errors: string[]): BusinessFacts {
  const whole = (key: keyof BusinessFacts, min: number, max: number, problem: string) => {
    const raw = d[key];
    if (raw === null || raw === undefined || String(raw).trim() === "") return null;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < min || n > max) {
      errors.push(problem);
      return null;
    }
    return n;
  };
  const thisYear = new Date().getFullYear();
  const reply = typeof d.reply_time === "string" ? d.reply_time.trim() : "";
  if (reply && !(reply in REPLY_TIMES)) errors.push("Pick how quickly you reply from the list.");
  const policy = typeof d.cancellation_policy === "string" ? d.cancellation_policy.trim() : "";
  if (policy.length > CANCELLATION_POLICY_MAX) {
    errors.push(`Cancellation policy is too long (${CANCELLATION_POLICY_MAX} characters at most).`);
  }

  return {
    founded_year: whole("founded_year", FIRST_FOUNDED_YEAR, thisYear, `Year founded should be a year between ${FIRST_FOUNDED_YEAR} and ${thisYear}.`),
    weddings_per_year: whole("weddings_per_year", 0, 2000, "Weddings a year should be a whole number."),
    booking_lead_months: whole("booking_lead_months", 0, 48, "How far ahead couples book should be a number of months, 48 at most."),
    reply_time: reply in REPLY_TIMES ? (reply as ReplyTime) : null,
    deposit_percent: whole("deposit_percent", 0, 100, "The deposit should be a percentage from 0 to 100."),
    balance_due_days: whole("balance_due_days", 0, 365, "When the balance is due should be a number of days, 365 at most."),
    cancellation_policy: policy || null,
  };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** The listing's "Booking & policies" rows, in reading order; facts not given are left out. */
export function businessFactRows(f: BusinessFacts, now = new Date()): [string, string][] {
  const years = f.founded_year ? now.getFullYear() - f.founded_year : null;
  const rows: [string, string | null][] = [
    ["In business since", f.founded_year ? `${f.founded_year}${years && years > 0 ? ` (${plural(years, "year")})` : ""}` : null],
    ["Weddings a year", f.weddings_per_year ? `About ${f.weddings_per_year}` : null],
    [
      "Couples usually book",
      f.booking_lead_months === null ? null : f.booking_lead_months === 0 ? "Close to the date is fine" : `${plural(f.booking_lead_months, "month")} ahead`,
    ],
    ["Usually replies", f.reply_time ? REPLY_TIMES[f.reply_time][0].toUpperCase() + REPLY_TIMES[f.reply_time].slice(1) : null],
    ["To book", f.deposit_percent === null ? null : f.deposit_percent === 0 ? "No deposit" : `${f.deposit_percent}% deposit`],
    [
      "Balance due",
      f.balance_due_days === null ? null : f.balance_due_days === 0 ? "On the day" : `${plural(f.balance_due_days, "day")} before the wedding`,
    ],
  ];
  return rows.filter((r): r is [string, string] => Boolean(r[1]));
}
