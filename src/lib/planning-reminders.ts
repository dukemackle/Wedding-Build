/**
 * Planning reminders: a handful of emails timed to each couple's wedding date,
 * each pointing back to the page where that step gets done.
 *
 * Transactional, not marketing (reasoning in docs/legal.md, "Planning
 * reminders"): they are about the couple's own wedding and carry no promotion.
 * They still have their own off switch on /account and an unsubscribe link,
 * and that is honoured before every send.
 *
 * The schedule follows the checklist (src/lib/checklist-template.ts): each
 * reminder names the checklist tasks it is about, by title, and is skipped
 * when the couple has already ticked all of them.
 */

export type PlanningReminder = {
  key: string;
  /** Days before the wedding it is sent. The window runs until the next reminder's day. */
  daysBefore: number;
  /** "About 9 months out", shown in the email. */
  when: string;
  subject: string;
  /** Why this matters now, in Wren's voice. One or two sentences. */
  why: string;
  /** Checklist task titles this covers, as written by the checklist template. */
  tasks: string[];
  href: string;
  button: string;
  /** Skip when the wedding already has a venue. */
  skipIfVenue?: boolean;
};

export const PLANNING_REMINDERS: PlanningReminder[] = [
  {
    key: "12m-foundation",
    daysBefore: 365,
    when: "About a year out",
    subject: "A year to go: the three decisions first",
    why: "Before venues or outfits, settle who's contributing, roughly how many people you're inviting, and a rough date. Every later choice is a fraction of those numbers.",
    tasks: [
      "Agree who's contributing, and what the total is",
      "Draft a rough guest count",
      "Pick a season and a rough date range",
    ],
    href: "/budget",
    button: "Open your budget",
  },
  {
    key: "10m-venue",
    daysBefore: 305,
    when: "About 10 months out",
    subject: "Time to book the venue",
    why: "The venue fixes your date, your maximum guest count and often your caterer. Popular places go 10 to 12 months ahead, and almost nothing else can be booked until it's signed.",
    tasks: ["Tour your top venues", "Book the venue and pay the deposit"],
    href: "/venues",
    button: "Find your venue",
    skipIfVenue: true,
  },
  {
    key: "9m-vendors",
    daysBefore: 270,
    when: "About 9 months out",
    subject: "Photographer, food and music book up first",
    why: "Good photographers, caterers and bands are often gone 9 months ahead. These are also the three couples most often say they'd spend more on, not less.",
    tasks: ["Book your photographer", "Book catering, or confirm the venue's", "Book music for the reception"],
    href: "/checklist",
    button: "Open your checklist",
  },
  {
    key: "6m-save-the-dates",
    daysBefore: 182,
    when: "About 6 months out",
    subject: "Six months out: save-the-dates",
    why: "Guests who travel need about six months' notice to book flights and hotels, so this is the time to collect addresses and send save-the-dates.",
    tasks: ["Collect everyone's mailing address", "Send save-the-dates", "Reserve hotel room blocks"],
    href: "/guests",
    button: "Open your guest list",
  },
  {
    key: "8w-invitations",
    daysBefore: 56,
    when: "8 weeks out",
    subject: "Eight weeks out: send the invitations",
    why: "Invitations usually go out six to eight weeks before, with an RSVP date about three weeks after that. That leaves time to chase replies before the caterer needs a number.",
    tasks: ["Send the invitations", "Apply for your marriage license"],
    href: "/guests/invitations",
    button: "Send your invitations",
  },
  {
    key: "3w-rsvps",
    daysBefore: 21,
    when: "3 weeks out",
    subject: "Three weeks out: chase the missing RSVPs",
    why: "Your caterer will want a final headcount in about a week. A short note to anyone who hasn't replied now saves a scramble later.",
    tasks: ["Chase anyone who hasn't replied"],
    href: "/guests",
    button: "See who hasn't replied",
  },
  {
    key: "2w-final-numbers",
    daysBefore: 14,
    when: "2 weeks out",
    subject: "Two weeks out: final headcount and payments",
    why: "Most caterers set their headcount deadline 7 to 14 days out, and final payments usually fall due around now. Check your contracts for the exact dates.",
    tasks: ["Give your caterer the final headcount", "Make final payments", "Build the seating chart"],
    href: "/budget",
    button: "Open your budget",
  },
  {
    key: "1w-timeline",
    daysBefore: 7,
    when: "1 week out",
    subject: "One week out: confirm the timeline with your vendors",
    why: "Nothing new gets decided this week. Send every vendor the day-of timeline and confirm their arrival times, so the day runs without you.",
    tasks: ["Send the timeline to every vendor", "Confirm arrival times with every vendor"],
    href: "/itinerary",
    button: "Open your timeline",
  },
];

/** Whole days from `today` to the wedding date (both YYYY-MM-DD, counted in UTC). */
export function daysUntilWedding(weddingDate: string, today: string): number {
  return Math.round((Date.parse(`${weddingDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

/**
 * The reminder whose window today falls in, or null. A reminder's window runs
 * from its day until the next reminder's day, so a couple who signs up late
 * gets the current one, never a pile of old ones.
 */
export function reminderDue(daysOut: number): PlanningReminder | null {
  if (daysOut <= 0) return null;
  for (let i = PLANNING_REMINDERS.length - 1; i >= 0; i--) {
    const r = PLANNING_REMINDERS[i];
    const next = PLANNING_REMINDERS[i + 1];
    if (daysOut <= r.daysBefore && daysOut > (next?.daysBefore ?? 0)) return r;
  }
  return null;
}

/**
 * The reminder's tasks still open on this couple's checklist, or null when
 * every one of them is ticked (skip the email). A task not on the checklist
 * at all (removed, renamed, or no plan yet) counts as open.
 */
export function openTasks(reminder: PlanningReminder, checklist: { title: string; completed: boolean }[]): string[] | null {
  const done = new Set(checklist.filter((t) => t.completed).map((t) => t.title));
  const open = reminder.tasks.filter((t) => !done.has(t));
  return open.length ? open : null;
}

const SITE = "https://youdoido.com";

export type ReminderEmail = {
  reminder: PlanningReminder;
  /** "Sam & Riley", or null. */
  names: string | null;
  /** YYYY-MM-DD. */
  weddingDate: string;
  daysOut: number;
  open: string[];
  /** Signed unsubscribe page link for this recipient. */
  unsubscribeUrl: string;
};

export function formatWeddingDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function countdown(daysOut: number): string {
  return daysOut === 1 ? "1 day to go" : `${daysOut} days to go`;
}

export function reminderEmailText(e: ReminderEmail): string {
  const { reminder: r } = e;
  return [
    e.names ? `Hi ${e.names},` : "Hi there,",
    "",
    `${countdown(e.daysOut)} until ${formatWeddingDate(e.weddingDate)}. ${r.why}`,
    "",
    "Still open on your checklist:",
    ...e.open.map((t) => `- ${t}`),
    "",
    `${r.button}: ${SITE}${r.href}`,
    "",
    "Wren, You Do, I Do's assistant",
    "",
    "--",
    "You're getting this because you're planning a wedding on You Do, I Do.",
    `Stop planning reminders: ${e.unsubscribeUrl}`,
    `Or change it on your account: ${SITE}/account`,
  ].join("\n");
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Inline-styled table HTML, the only kind every mail app shows the same.
 * Navy and Royal on white/cream, one gold rule as the highlight (CLAUDE.md
 * palette); no white text on the yellows.
 */
export function reminderEmailHtml(e: ReminderEmail): string {
  const { reminder: r } = e;
  const sans = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
  const serif = "Georgia,'Times New Roman',serif";
  const url = `${SITE}${r.href}`;
  const tasks = e.open
    .map(
      (t) =>
        `<tr><td width="22" valign="top" style="padding:6px 0;"><div style="width:12px;height:12px;border:2px solid #2243B6;border-radius:3px;margin-top:3px;"></div></td><td style="font:15px/1.5 ${sans};color:#14203d;padding:6px 0;">${esc(t)}</td></tr>`,
    )
    .join("");
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f4ec;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(countdown(e.daysOut))}. ${esc(r.why)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ec;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e2d4;">
<tr><td style="background:#14203d;padding:22px 28px;">
<div style="font:600 11px/1 ${sans};letter-spacing:2px;text-transform:uppercase;color:#5AE4FF;">${esc(r.when)}</div>
<div style="font:600 28px/1.2 ${serif};color:#ffffff;padding-top:10px;">${esc(countdown(e.daysOut))}</div>
<div style="font:14px/1.4 ${sans};color:#c9d1e6;padding-top:4px;">${esc(formatWeddingDate(e.weddingDate))}${e.names ? ` · ${esc(e.names)}` : ""}</div>
</td></tr>
<tr><td style="height:4px;background:#FFD301;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:26px 28px 6px;">
<div style="font:600 21px/1.3 ${serif};color:#14203d;">${esc(r.subject)}</div>
<div style="font:15px/1.6 ${sans};color:#3d4560;padding-top:10px;">${esc(r.why)}</div>
</td></tr>
<tr><td style="padding:14px 28px 0;">
<div style="font:600 11px/1 ${sans};letter-spacing:1.5px;text-transform:uppercase;color:#6b7184;padding-bottom:6px;">Still open on your checklist</div>
<table role="presentation" cellpadding="0" cellspacing="0">${tasks}</table>
</td></tr>
<tr><td style="padding:22px 28px 26px;">
<a href="${esc(url)}" style="display:inline-block;background:#2243B6;color:#ffffff;font:600 15px ${sans};text-decoration:none;padding:13px 24px;border-radius:999px;">${esc(r.button)}</a>
<div style="font:italic 14px/1.5 ${serif};color:#6b7184;padding-top:22px;">Wren, You Do, I Do's assistant</div>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td align="center" style="font:12px/1.6 ${sans};color:#8a8f9e;padding-top:18px;">
You're getting this because you're planning a wedding on You Do, I Do.<br>
<a href="${esc(e.unsubscribeUrl)}" style="color:#8a8f9e;">Stop planning reminders</a> · <a href="${SITE}/account" style="color:#8a8f9e;">Email settings</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
