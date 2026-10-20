import type { VendorTrackerRow } from "./dashboard-data";

/**
 * "Your next step" on the dashboard: the first thing in a wedding's natural
 * order that isn't done yet, with why it comes now. Approved from the mockup
 * on 2026-10-20 (https://claude.ai/artifact/UMLSoXHjivMK76zVXgR5yZ).
 *
 * The order is the one couples actually book in: the venue fixes the date
 * and the headcount ceiling; the date is what vendors quote against; the
 * list sizes catering and the RSVP site; the vendors who take one wedding a
 * day go next; then the site goes live and the RSVPs come in. Before any of
 * it, a place and rough headcount, because the budget is built from them.
 */

export type Milestone = {
  key: "venue" | "date" | "guests" | "vendors" | "site" | "rsvps";
  label: string;
  done: boolean;
  /** Under the label: what's booked, or how far along. */
  detail: string;
};

export type NextStep = {
  title: string;
  why: string;
  action: { label: string; href: string };
  /** A second, quieter way through: "Already booked one?" */
  aside?: { label: string; href: string };
  /** The path's current milestone, or null before it (the basics) and after it (checklist). */
  current: Milestone["key"] | null;
  milestones: Milestone[];
  /** Under the path on a computer, when there's something worth spelling out. */
  note?: string;
};

export type NextStepInput = {
  state: string | null;
  /** The headcount the budget uses: the override, else confirmed guests. Zero when neither. */
  headcount: number;
  weddingDate: string | null;
  venue: { booked: boolean; name: string | null; shortlisted: number };
  guests: { total: number; pending: number };
  vendors: VendorTrackerRow[];
  siteLive: boolean;
  checklist: { title: string; due: string | null }[];
  today: string;
};

/** The vendors who can only do one wedding a day, so they go first. Caterer, photographer, music. */
const KEY_VENDORS: { key: string; noun: string; plural: string; why: string }[] = [
  {
    key: "catering",
    noun: "caterer",
    plural: "caterers",
    why: "The menu sets most of your cost per guest, so it shapes the rest of the budget.",
  },
  {
    key: "photography",
    noun: "photographer",
    plural: "photographers",
    why: "Photographers can only shoot one wedding a day, so the ones you like book up early.",
  },
  {
    key: "music",
    noun: "DJ or band",
    plural: "DJs and bands",
    why: "Like photographers, a DJ or band can only take one wedding a day.",
  },
];

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" });

export function nextStep(d: NextStepInput): NextStep | null {
  const key = KEY_VENDORS.map((v) => ({ ...v, row: d.vendors.find((r) => r.key === v.key) }))
    // A category the couple hid from their budget isn't one they're booking.
    .filter((v) => v.row);
  const keyBooked = key.filter((v) => v.row!.status === "booked");
  const keyOpen = key.filter((v) => v.row!.status !== "booked");

  const milestones: Milestone[] = [
    {
      key: "venue",
      label: "Venue",
      done: d.venue.booked,
      detail: d.venue.booked
        ? (d.venue.name ?? "Booked")
        : d.venue.shortlisted > 0
          ? `${d.venue.shortlisted} saved`
          : "Not yet",
    },
    {
      key: "date",
      label: "Date",
      done: d.weddingDate != null,
      detail: d.weddingDate ? shortDate(d.weddingDate) : "Not set",
    },
    {
      key: "guests",
      label: "Guest list",
      done: d.guests.total > 0,
      detail: d.guests.total > 0 ? `${d.guests.total} ${d.guests.total === 1 ? "person" : "people"}` : "Not started",
    },
    {
      key: "vendors",
      label: "Key vendors",
      done: keyOpen.length === 0,
      detail: key.length === 0 ? "None needed" : `${keyBooked.length} of ${key.length} booked`,
    },
    {
      key: "site",
      label: "Guest site",
      done: d.siteLive,
      detail: d.siteLive ? "Live" : "Not live yet",
    },
    {
      key: "rsvps",
      label: "RSVPs",
      done: d.guests.total > 0 && d.guests.pending === 0,
      detail:
        d.guests.total === 0
          ? "After the list"
          : !d.siteLive
            ? "After the site"
            : d.guests.pending === 0
            ? "All in"
            : `${d.guests.pending} to answer`,
    },
  ];

  const base = { milestones };

  if (!d.state || d.headcount === 0) {
    return {
      ...base,
      current: null,
      title: "Tell us where and roughly how many",
      why: "Your budget estimate, and the venues and vendors we suggest, all start from these two answers. A guess is fine.",
      action: { label: "Add them", href: "/budget/estimate" },
    };
  }

  if (!d.venue.booked) {
    return {
      ...base,
      current: "venue",
      title: "Book your venue",
      why: "Your date, guest count and most vendors depend on it, so it’s the first big decision.",
      action:
        d.venue.shortlisted > 0
          ? { label: `Compare your ${d.venue.shortlisted} saved`, href: "/venues" }
          : { label: `Browse venues in ${d.state}`, href: "/venues" },
    };
  }

  if (!d.weddingDate) {
    return {
      ...base,
      current: "date",
      title: "Set your date",
      why: "Vendors quote by date, and your checklist and countdown count back from it.",
      action: { label: "Add your date", href: "#edit-details" },
    };
  }

  if (d.guests.total === 0) {
    return {
      ...base,
      current: "guests",
      title: "Start your guest list",
      why: "It sizes your catering, your seating and your RSVP site. A rough first pass is enough, and you can bring it in from a spreadsheet.",
      action: { label: "Start the list", href: "/guests" },
    };
  }

  if (keyOpen.length > 0) {
    const v = keyOpen[0];
    const talking = v.row!.status === "talking" ? `You have ${v.row!.detail}. ` : "";
    return {
      ...base,
      current: "vendors",
      title: `Book your ${v.noun}`,
      why: talking + v.why,
      action: { label: `Find ${v.plural}`, href: "/vendors" },
      aside: { label: "Already booked one?", href: "/bookings" },
      note: [
        keyBooked.length ? `Booked: ${keyBooked.map((k) => k.noun).join(", ")}.` : "",
        `Still to book: ${keyOpen.map((k) => k.noun).join(", ")}.`,
      ]
        .filter(Boolean)
        .join(" "),
    };
  }

  if (!d.siteLive) {
    return {
      ...base,
      current: "site",
      title: "Publish your guest site",
      why: "Guests RSVP there, and it keeps the schedule, travel and registry in one link you can send.",
      action: { label: "Open your site", href: "/guests/site" },
    };
  }

  if (d.guests.pending > 0) {
    return {
      ...base,
      current: "rsvps",
      title: "Collect your RSVPs",
      why: `${d.guests.pending} ${d.guests.pending === 1 ? "guest hasn’t" : "guests haven’t"} answered yet. Your caterer and seating plan need final numbers.`,
      action: { label: "See who’s answered", href: "/guests" },
    };
  }

  // The path is done; from here the checklist leads, overdue first.
  const overdue = d.checklist.filter((t) => t.due && t.due < d.today);
  const task = overdue[0] ?? d.checklist[0];
  if (!task) return null;
  return {
    ...base,
    current: null,
    title: task.title,
    why:
      overdue.length > 1
        ? `This and ${overdue.length - 1} more ${overdue.length === 2 ? "task is" : "tasks are"} past due on your checklist.`
        : overdue.length === 1
          ? "This one is past due on your checklist."
          : task.due
            ? `Next on your checklist, due ${shortDate(task.due)}.`
            : "Next on your checklist.",
    action: { label: "Open your checklist", href: "/checklist" },
  };
}
