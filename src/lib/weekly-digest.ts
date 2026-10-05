import { SITE_URL } from "@/lib/public-listings";

/** How far ahead the Monday email looks. */
export const LOOKAHEAD_DAYS = 14;

/** owed is null when the line only has an estimate, so no amount is quoted. */
export type DigestPayment = { label: string; owed: number | null; dueDate: string };
export type DigestTask = { title: string; dueDate: string };
export type Digest = {
  overduePayments: DigestPayment[];
  upcomingPayments: DigestPayment[];
  overdueTasks: DigestTask[];
  upcomingTasks: DigestTask[];
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const day = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

const amount = (p: DigestPayment) => (p.owed === null ? "" : `: ${currency.format(p.owed)}`);

/** "2026-10-05" for a date, in UTC. */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The Monday (UTC) of the week a date falls in: the digest's dedupe key. */
export function weekStart(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return isoDay(d);
}

/**
 * Sorts a wedding's dated, unfinished items into overdue and coming up. Paid-off
 * payments and finished tasks never appear: reminding someone about a bill
 * they've paid is exactly the kind of wrong that loses trust.
 */
export function buildDigest(
  payments: DigestPayment[],
  tasks: DigestTask[],
  today: string,
): Digest {
  const horizon = new Date(`${today}T00:00:00Z`);
  horizon.setUTCDate(horizon.getUTCDate() + LOOKAHEAD_DAYS);
  const until = isoDay(horizon);
  const byDate = <T extends { dueDate: string }>(a: T, b: T) => a.dueDate.localeCompare(b.dueDate);
  return {
    overduePayments: payments.filter((p) => p.dueDate < today).sort(byDate),
    upcomingPayments: payments.filter((p) => p.dueDate >= today && p.dueDate <= until).sort(byDate),
    overdueTasks: tasks.filter((t) => t.dueDate < today).sort(byDate),
    upcomingTasks: tasks.filter((t) => t.dueDate >= today && t.dueDate <= until).sort(byDate),
  };
}

export function isEmpty(d: Digest): boolean {
  return !d.overduePayments.length && !d.upcomingPayments.length && !d.overdueTasks.length && !d.upcomingTasks.length;
}

/** Subject and plain-text body, in Wren's voice: specific, calm, no guilt. */
export function digestEmail(d: Digest, opts: { coupleNames: string | null; daysToGo: number | null }) {
  const lines: string[] = [];
  const countdown =
    opts.daysToGo !== null && opts.daysToGo >= 0
      ? `${opts.daysToGo} ${opts.daysToGo === 1 ? "day" : "days"} to go`
      : null;
  lines.push(`Hi${opts.coupleNames ? `, ${opts.coupleNames}` : ""}.${countdown ? ` ${countdown}.` : ""} Here's what's on deck for the next two weeks.`);

  const section = (title: string, rows: string[]) => {
    if (rows.length === 0) return;
    lines.push("", title, ...rows.map((r) => `  - ${r}`));
  };
  section(
    "Payments past their due date",
    d.overduePayments.map((p) => `${p.label}${amount(p)} (was due ${day(p.dueDate)})`),
  );
  section(
    "Payments coming up",
    d.upcomingPayments.map((p) => `${p.label}${amount(p)}, due ${day(p.dueDate)}`),
  );
  section("Checklist items that slipped", d.overdueTasks.map((t) => `${t.title} (was ${day(t.dueDate)})`));
  section("On the checklist", d.upcomingTasks.map((t) => `${t.title}, ${day(t.dueDate)}`));

  if (d.overduePayments.length || d.overdueTasks.length) {
    lines.push("", "If any of these are already done, mark them paid or checked off and they'll drop out of next week's note.");
  }
  lines.push(
    "",
    `Budget: ${SITE_URL}/budget`,
    `Checklist: ${SITE_URL}/checklist`,
    "",
    "Wren, your planning assistant at You Do, I Do",
    "",
    "--",
    `You get this on Mondays when something's due. Turn it off: ${SITE_URL}/account#emails`,
  );

  const payments = d.overduePayments.length + d.upcomingPayments.length;
  const tasks = d.overdueTasks.length + d.upcomingTasks.length;
  const parts = [
    payments ? `${payments} ${payments === 1 ? "payment" : "payments"}` : null,
    tasks ? `${tasks} checklist ${tasks === 1 ? "item" : "items"}` : null,
  ].filter(Boolean);
  const subject = `This week: ${parts.join(" and ")}`;
  return { subject, text: lines.join("\n") };
}
