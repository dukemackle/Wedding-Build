import type { VendorTrackerRow } from "./dashboard-data";

/**
 * The planning path on the dashboard: six milestones in a wedding's natural
 * order, how many are done, and what's still open, said as a status with
 * quiet links rather than an order (2026-10-21: the owner found "Book your
 * photographer" bossy; couples know they need one). First approved as
 * "Your next step" on 2026-10-20 (https://claude.ai/artifact/UMLSoXHjivMK76zVXgR5yZ).
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

type Link = { label: string; href: string };

export type NextStep = {
  /**
   * What's still open, said as a status rather than an order ("Still to book:"),
   * with the open items as quiet links. Couples know they need a photographer;
   * the card shows where they are and offers a shortcut, it doesn't tell them.
   */
  open: { lead: string; links: Link[] };
  /** A second, quieter way through: "Booked one already?" */
  aside?: Link;
  /** The path's current milestone, or null before it (the basics) and after it (checklist). */
  current: Milestone["key"] | null;
  milestones: Milestone[];
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
const KEY_VENDORS: { key: string; label: string; category: string }[] = [
  { key: "catering", label: "Caterer", category: "Catering" },
  { key: "photography", label: "Photographer", category: "Photography" },
  { key: "music", label: "DJ or band", category: "Music" },
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
      open: { lead: "Your budget starts from where and roughly how many:", links: [{ label: "Add them", href: "/budget/estimate" }] },
    };
  }

  if (!d.venue.booked) {
    return {
      ...base,
      current: "venue",
      open: {
        lead: "Still to book: your venue.",
        links: [
          d.venue.shortlisted > 0
            ? { label: `Compare your ${d.venue.shortlisted} saved`, href: "/venues" }
            : { label: `Venues in ${d.state}`, href: "/venues" },
        ],
      },
    };
  }

  if (!d.weddingDate) {
    return {
      ...base,
      current: "date",
      open: { lead: "No date set yet.", links: [{ label: "Add your date", href: "#edit-details" }] },
    };
  }

  if (d.guests.total === 0) {
    return {
      ...base,
      current: "guests",
      open: { lead: "No guest list yet.", links: [{ label: "Start the list", href: "/guests" }] },
    };
  }

  if (keyOpen.length > 0) {
    return {
      ...base,
      current: "vendors",
      open: {
        lead: "Still to book:",
        links: keyOpen.map((v) => ({
          label: v.label,
          href: `/vendors?category=${encodeURIComponent(v.category)}`,
        })),
      },
      aside: { label: "Booked one already?", href: "/bookings" },
    };
  }

  if (!d.siteLive) {
    return {
      ...base,
      current: "site",
      open: { lead: "Your guest site isn’t live yet.", links: [{ label: "Open your site", href: "/guests/site" }] },
    };
  }

  if (d.guests.pending > 0) {
    return {
      ...base,
      current: "rsvps",
      open: {
        lead: `${d.guests.pending} ${d.guests.pending === 1 ? "guest hasn’t" : "guests haven’t"} answered yet.`,
        links: [{ label: "See who’s answered", href: "/guests" }],
      },
    };
  }

  // The path is done; from here the checklist leads, overdue first.
  const overdue = d.checklist.filter((t) => t.due && t.due < d.today);
  const task = overdue[0] ?? d.checklist[0];
  if (!task) return null;
  return {
    ...base,
    current: null,
    open: {
      lead:
        overdue.length > 1
          ? `${overdue.length} checklist tasks are past due, starting with`
          : overdue.length === 1
            ? "Past due on your checklist:"
            : task.due
              ? `Next on your checklist, due ${shortDate(task.due)}:`
              : "Next on your checklist:",
      links: [{ label: task.title, href: "/checklist" }],
    },
  };
}
