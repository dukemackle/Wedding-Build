/**
 * Wren's wedding plan: what to do, in the order it actually has to happen.
 *
 * The reason couples freeze isn't that there are a hundred tasks. It's that a
 * hundred tasks get presented as equally available when almost all of them are
 * blocked. You can't choose a caterer without a venue. You can't size a venue
 * without a guest count. You can't set a guest count without knowing who's
 * paying. Every big planning site opens with a twelve-month list where "book
 * the venue" sits as item seven of fourteen, styled identically to "pick a
 * hashtag" -- which is why people close the tab and open a spreadsheet.
 *
 * So this is ordered by dependency first and calendar second, and the first
 * phase deliberately contains three things and an instruction to ignore
 * everything else until they're settled.
 *
 * It is also intentionally short. Roughly fifty tasks, none of them
 * decorative. A list people finish beats a longer one they abandon, and
 * anything missing can be added by hand -- Wren shouldn't imply a wedding
 * needs a signature cocktail.
 */

export type ChecklistPhase = {
  key: string;
  title: string;
  /** Why this phase exists, in the couple's language. Shown under the title. */
  blurb: string;
};

export const CHECKLIST_PHASES: ChecklistPhase[] = [
  {
    key: "foundation",
    title: "Start here",
    blurb:
      "Three decisions. Nearly everything else depends on them, so it's worth resisting the urge to look at dresses or flowers until these are settled — they're what tells you what you can afford and how big a room you need.",
  },
  {
    key: "venue",
    title: "Book the venue",
    blurb:
      "The single decision that fixes the most: your date, your maximum guest count, and often your caterer and tables. Almost nothing downstream can be booked until this is signed.",
  },
  {
    key: "vendors",
    title: "The people who matter most",
    blurb:
      "Photographer, food and music book up first — good ones are often gone a year out. These are also the three that couples consistently say they'd spend more on, not less.",
  },
  {
    key: "look",
    title: "How it looks and feels",
    blurb:
      "Attire comes first here, not because it matters most but because alterations take two to three months and nobody plans for that.",
  },
  {
    key: "announce",
    title: "Tell everyone",
    blurb:
      "Guests need time to book flights and hotels. Anything involving travel wants six months' notice, which means addresses need collecting before that.",
  },
  {
    key: "lock",
    title: "Lock it down",
    blurb:
      "Invitations go out, the legal paperwork gets done, and the details stop being changeable. This is the busiest stretch.",
  },
  {
    key: "count",
    title: "The final count",
    blurb:
      "Your caterer needs a number, and everything from seating to final payment follows it. Most contracts set this deadline 7–14 days out — check yours.",
  },
  {
    key: "week",
    title: "The last week",
    blurb: "Nothing new gets decided. This is confirming what's already arranged.",
  },
  {
    key: "after",
    title: "Afterwards",
    blurb: "The short tail nobody warns you about.",
  },
];

/** Something Wren can already see is done, so the task isn't worth showing. */
export type ChecklistSkipCondition = "venue_booked" | "budget_set" | "site_published";

export type ChecklistTemplateTask = {
  phase: string;
  title: string;
  notes?: string;
  /** Weeks before the wedding this is due. Drives the real date. */
  weeksBefore: number;
  /** Where in Wren this actually gets done. */
  href?: string;
  skipIf?: ChecklistSkipCondition;
  /**
   * Survives a compressed plan. A couple marrying in four months shouldn't be
   * handed forty overdue tasks in red -- that's the same overwhelm wearing a
   * different hat -- so a short timeline keeps only these.
   */
  essential?: boolean;
};

export const CHECKLIST_TEMPLATE: ChecklistTemplateTask[] = [
  // --- Start here -----------------------------------------------------
  {
    phase: "foundation",
    title: "Agree who's contributing, and what the total is",
    notes:
      "The most uncomfortable conversation and the one that saves the most grief. Every later decision is a fraction of this number.",
    weeksBefore: 52,
    href: "/budget",
    skipIf: "budget_set",
    essential: true,
  },
  {
    phase: "foundation",
    title: "Draft a rough guest count",
    notes: "Within twenty either way is fine. It decides which venues are even possible.",
    weeksBefore: 52,
    href: "/guests",
    essential: true,
  },
  {
    phase: "foundation",
    title: "Pick a season and a rough date range",
    notes: "A range, not a date — the venue you want will settle the exact day.",
    weeksBefore: 52,
    essential: true,
  },
  {
    phase: "foundation",
    title: "Talk about the kind of wedding you actually want",
    notes:
      "Big or small, formal or relaxed, near or far. Worth saying out loud before anyone's parents have opinions.",
    weeksBefore: 52,
  },

  // --- Book the venue -------------------------------------------------
  {
    phase: "venue",
    title: "Shortlist venues that fit your guest count and budget",
    weeksBefore: 48,
    href: "/venues",
    skipIf: "venue_booked",
    essential: true,
  },
  {
    phase: "venue",
    title: "Tour your top venues",
    notes:
      "Ask what's included, what the rain plan is, when you can get in to set up, and whether you must use their caterer.",
    weeksBefore: 46,
    skipIf: "venue_booked",
    essential: true,
  },
  {
    phase: "venue",
    title: "Book the venue and pay the deposit",
    notes: "Upload the contract when you sign — Wren will pull the payment dates out of it.",
    weeksBefore: 44,
    href: "/venues",
    skipIf: "venue_booked",
    essential: true,
  },
  {
    phase: "venue",
    title: "Set your exact wedding date",
    weeksBefore: 44,
    href: "/dashboard",
    essential: true,
  },

  // --- The people who matter most --------------------------------------
  {
    phase: "vendors",
    title: "Book your photographer",
    notes: "The one vendor whose work you keep. Popular ones book twelve months out.",
    weeksBefore: 42,
    href: "/vendors",
    essential: true,
  },
  {
    phase: "vendors",
    title: "Book catering, or confirm the venue's",
    notes: "Ask now when the final headcount is due — it's usually 7–14 days before.",
    weeksBefore: 40,
    href: "/vendors",
    essential: true,
  },
  {
    phase: "vendors",
    title: "Book music for the reception",
    notes: "Band or DJ. Ask whether they also cover the ceremony and announcements.",
    weeksBefore: 40,
    href: "/vendors",
    essential: true,
  },
  {
    phase: "vendors",
    title: "Book your officiant",
    notes: "Whoever signs the licence. If it's a friend, check what your state requires of them.",
    weeksBefore: 38,
    essential: true,
  },
  {
    phase: "vendors",
    title: "Book a videographer, if you want one",
    weeksBefore: 38,
    href: "/vendors",
  },

  // --- How it looks and feels -------------------------------------------
  {
    phase: "look",
    title: "Start shopping for what you're wearing",
    notes:
      "Ordering plus alterations runs six to nine months on a made-to-order dress. This is the deadline people miss.",
    weeksBefore: 36,
    href: "/attire",
    essential: true,
  },
  {
    phase: "look",
    title: "Ask the people you want standing up with you",
    weeksBefore: 36,
  },
  {
    phase: "look",
    title: "Settle your colours and overall look",
    notes: "Enough to brief a florist. It doesn't have to be a mood board.",
    weeksBefore: 34,
  },
  { phase: "look", title: "Book florals", weeksBefore: 32, href: "/vendors" },
  {
    phase: "look",
    title: "Order the cake or dessert",
    notes: "Book the tasting when you enquire; the good bakeries schedule those out too.",
    weeksBefore: 30,
    href: "/vendors",
  },
  { phase: "look", title: "Book hair and makeup", weeksBefore: 30, href: "/vendors" },

  // --- Tell everyone -----------------------------------------------------
  {
    phase: "announce",
    title: "Collect everyone's mailing address",
    notes:
      "Share Wren's address link instead of texting fifty people individually — they fill in their own.",
    weeksBefore: 28,
    href: "/guests",
    essential: true,
  },
  {
    phase: "announce",
    title: "Turn on your wedding site",
    weeksBefore: 28,
    href: "/guests",
    skipIf: "site_published",
  },
  {
    phase: "announce",
    title: "Reserve hotel room blocks",
    notes: "Worth doing before save-the-dates so the link can go out with them.",
    weeksBefore: 26,
  },
  {
    phase: "announce",
    title: "Send save-the-dates",
    notes: "Six months out, earlier if people are flying or it's a holiday weekend.",
    weeksBefore: 26,
    href: "/guests",
    essential: true,
  },
  { phase: "announce", title: "Set up your gift registry", weeksBefore: 24, href: "/guests" },
  {
    phase: "announce",
    title: "Sort transport for the day",
    notes: "Only if guests need moving between sites, or people will be drinking far from home.",
    weeksBefore: 24,
  },

  // --- Lock it down -------------------------------------------------------
  {
    phase: "lock",
    title: "Buy your rings",
    notes: "Engraving and sizing take a few weeks.",
    weeksBefore: 16,
  },
  {
    phase: "lock",
    title: "Book the honeymoon, and check your passports",
    notes: "Passport renewals take months, and many countries want six months' validity left.",
    weeksBefore: 16,
  },
  { phase: "lock", title: "Order your invitations", weeksBefore: 14 },
  {
    phase: "lock",
    title: "Plan the rehearsal dinner",
    weeksBefore: 12,
  },
  {
    phase: "lock",
    title: "Send the invitations",
    notes: "Six to eight weeks before, with an RSVP date about three weeks after that.",
    weeksBefore: 8,
    href: "/guests",
    essential: true,
  },
  {
    phase: "lock",
    title: "Apply for your marriage licence",
    notes:
      "Check your county clerk for two numbers: the waiting period before it's valid, and how long it stays valid. Both vary by state, and applying too early is as broken as too late.",
    weeksBefore: 6,
    essential: true,
  },
  {
    phase: "lock",
    title: "Decide the order of the ceremony",
    notes: "Who walks in, who speaks, how long it runs. Your officiant will want this.",
    weeksBefore: 6,
  },
  { phase: "lock", title: "Write your vows", weeksBefore: 5 },
  {
    phase: "lock",
    title: "Final fitting",
    notes: "Bring the shoes and underwear you'll actually be wearing.",
    weeksBefore: 4,
  },
  { phase: "lock", title: "Choose your first-dance song", weeksBefore: 4 },

  // --- The final count -----------------------------------------------------
  {
    phase: "count",
    title: "Chase anyone who hasn't replied",
    notes: "Wren can send the stragglers a reminder in one go.",
    weeksBefore: 3,
    href: "/guests",
    essential: true,
  },
  {
    phase: "count",
    title: "Give your caterer the final headcount",
    notes: "Check your contract for the exact deadline — after it, you pay for no-shows anyway.",
    weeksBefore: 2,
    href: "/guests",
    essential: true,
  },
  {
    phase: "count",
    title: "Build the seating chart",
    weeksBefore: 2,
    href: "/seating",
    essential: true,
  },
  {
    phase: "count",
    title: "Write the day-of timeline",
    notes: "Hour by hour, from hair and makeup to last dance.",
    weeksBefore: 2,
    href: "/itinerary",
    essential: true,
  },
  {
    phase: "count",
    title: "Send the timeline to every vendor",
    weeksBefore: 2,
    href: "/contacts",
    essential: true,
  },
  {
    phase: "count",
    title: "Make final payments",
    weeksBefore: 2,
    href: "/budget",
    essential: true,
  },

  // --- The last week --------------------------------------------------------
  {
    phase: "week",
    title: "Confirm arrival times with every vendor",
    weeksBefore: 1,
    href: "/contacts",
    essential: true,
  },
  {
    phase: "week",
    title: "Put tips and final payments in labelled envelopes",
    notes: "Hand them to whoever is running the day, not to yourselves.",
    weeksBefore: 1,
  },
  {
    phase: "week",
    title: "Pack an emergency kit",
    notes: "Safety pins, stain remover, painkillers, plasters, a phone charger, flat shoes.",
    weeksBefore: 1,
  },
  {
    phase: "week",
    title: "Hold the rehearsal",
    weeksBefore: 1,
    essential: true,
  },
  {
    phase: "week",
    title: "Give someone else the day-of phone",
    notes:
      "Pick the person vendors should call. It should not be either of you — you'll be getting married.",
    weeksBefore: 1,
    essential: true,
  },

  // --- Afterwards ------------------------------------------------------------
  {
    phase: "after",
    title: "Return the rentals",
    notes: "Suits, linens, anything hired. Usually due within a couple of days.",
    weeksBefore: -1,
  },
  {
    phase: "after",
    title: "Write your thank-you notes",
    notes: "Wren keeps track of who gave what and can draft each one.",
    weeksBefore: -4,
    href: "/guests",
    essential: true,
  },
  {
    phase: "after",
    title: "Name-change paperwork, if either of you is changing",
    notes: "Social security first, then licence, then passport and banks.",
    weeksBefore: -6,
  },
];

/**
 * A short engagement gets the essentials only.
 *
 * Below this, a full plan would be mostly overdue on the day it's created --
 * forty red items is the same overwhelm this is meant to cure.
 */
export const SHORT_TIMELINE_WEEKS = 30;

export type PlanContext = {
  weddingDate: string | null;
  venueBooked: boolean;
  budgetSet: boolean;
  sitePublished: boolean;
};

function shouldSkip(task: ChecklistTemplateTask, context: PlanContext): boolean {
  if (!task.skipIf) return false;
  if (task.skipIf === "venue_booked") return context.venueBooked;
  if (task.skipIf === "budget_set") return context.budgetSet;
  if (task.skipIf === "site_published") return context.sitePublished;
  return false;
}

export type PlannedTask = {
  title: string;
  notes: string | null;
  due_date: string | null;
  phase: string;
};

/**
 * Turns the template into dated tasks for one wedding.
 *
 * Without a date there's nothing to count back from, so tasks come through
 * undated rather than not at all -- the order still helps, and dates fill in
 * once the couple sets the day.
 */
export function buildPlan(context: PlanContext): PlannedTask[] {
  const weddingDate = context.weddingDate ? new Date(`${context.weddingDate}T00:00:00`) : null;
  const validDate = weddingDate && !Number.isNaN(weddingDate.getTime()) ? weddingDate : null;

  const weeksAway = validDate
    ? Math.round((validDate.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
    : null;
  const compressed = weeksAway !== null && weeksAway < SHORT_TIMELINE_WEEKS;

  return CHECKLIST_TEMPLATE.filter((task) => {
    if (shouldSkip(task, context)) return false;
    if (compressed && !task.essential) return false;
    return true;
  }).map((task) => {
    let due: string | null = null;
    if (validDate) {
      const date = new Date(validDate);
      date.setDate(date.getDate() - task.weeksBefore * 7);
      // A compressed plan's early tasks would land in the past, which reads as
      // failure before they've started. Anything already overdue becomes due
      // in a week instead -- soon, but not already lost.
      const soonest = new Date();
      soonest.setDate(soonest.getDate() + 7);
      const chosen = compressed && date < soonest ? soonest : date;
      due = chosen.toISOString().slice(0, 10);
    }
    return {
      title: task.title,
      notes: task.notes ?? null,
      due_date: due,
      phase: task.phase,
    };
  });
}
