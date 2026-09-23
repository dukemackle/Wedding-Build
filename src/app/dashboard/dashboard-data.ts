import { BUDGET_CATEGORIES, VENDOR_CATEGORY_TO_BUDGET_KEY } from "@/lib/budget-categories";
import { CHECKLIST_PHASES } from "@/lib/checklist-template";
import type { ChecklistItem, VendorInquiryStatus } from "@/lib/supabase/types";

export type DashboardSummaryData = {
  guestsConfirmed: number;
  guestsPending: number;
  guestsDeclined: number;
  guestsTotal: number;
  /** The number the budget is planned around -- the override if one is set. */
  headcount: number;
  headcountIsOverride: boolean;
  /** Visible categories plus custom items, the same total the Budget page shows. */
  budgetTotal: number;
  budgetTarget: number | null;
  budgetPaid: number;
  budgetCategoriesQuoted: number;
  budgetCategoriesTotal: number;
  venuesShortlisted: number;
  attireShortlisted: number;
  tasksDone: number;
  tasksTotal: number;
};

export type VendorStatus = "booked" | "talking" | "quoted" | "shortlisted" | "open";

export type VendorTrackerRow = {
  key: string;
  label: string;
  status: VendorStatus;
  /** Who, when it's booked; how many, when it's in progress. */
  detail: string | null;
  href: string;
};

/**
 * The bookings that make a wedding, in roughly the order they get booked.
 *
 * Not every budget line -- rings, stationery and gratuities aren't a vendor
 * anybody "books". Hidden budget categories drop out too, so a couple whose
 * friend is officiating isn't nagged about an officiant.
 */
const TRACKED_KEYS = [
  "venue",
  "catering",
  "photography",
  "music",
  "videography",
  "florals",
  "planner",
  "bar",
  "cake",
  "hair_makeup",
  "officiant",
  "transportation",
];

const SHORT_LABELS: Record<string, string> = {
  venue: "Venue",
  florals: "Florals",
  music: "Music",
  planner: "Planner",
  cake: "Cake",
  hair_makeup: "Hair & makeup",
};

export function buildVendorTracker({
  hiddenCategories,
  lineItems,
  inquiries,
  bookedVenueName,
  venuesShortlisted,
}: {
  hiddenCategories: string[];
  lineItems: {
    category: string;
    override_value: number | null;
    vendor_id: string | null;
    venue_id: string | null;
    purchased_from: string | null;
  }[];
  inquiries: { category: string | null; status: VendorInquiryStatus; vendor_name: string }[];
  bookedVenueName: string | null;
  venuesShortlisted: number;
}): VendorTrackerRow[] {
  const hidden = new Set(hiddenCategories);
  const lineByKey = new Map(lineItems.map((row) => [row.category, row]));

  return TRACKED_KEYS.filter((key) => !hidden.has(key)).map((key) => {
    const category = BUDGET_CATEGORIES.find((c) => c.key === key)!;
    const label = SHORT_LABELS[key] ?? category.label;
    const href = key === "venue" ? "/venues" : "/vendors";
    const line = lineByKey.get(key);
    const forKey = inquiries.filter(
      (inquiry) => inquiry.category && VENDOR_CATEGORY_TO_BUDGET_KEY[inquiry.category] === key,
    );
    const booked = forKey.find((inquiry) => inquiry.status === "booked");

    if (key === "venue" && bookedVenueName) {
      return { key, label, status: "booked", detail: bookedVenueName, href };
    }
    if (booked) {
      return { key, label, status: "booked", detail: booked.vendor_name, href };
    }
    if (line?.vendor_id || line?.venue_id) {
      return { key, label, status: "booked", detail: line.purchased_from, href };
    }
    const live = forKey.filter((i) => i.status === "sent" || i.status === "responded");
    if (live.length > 0) {
      return {
        key,
        label,
        status: "talking",
        detail: `${live.length} ${live.length === 1 ? "inquiry" : "inquiries"} out`,
        href,
      };
    }
    if (line?.override_value != null) {
      return { key, label, status: "quoted", detail: "Quote on file", href };
    }
    if (key === "venue" && venuesShortlisted > 0) {
      return {
        key,
        label,
        status: "shortlisted",
        detail: `${venuesShortlisted} shortlisted`,
        href,
      };
    }
    return { key, label, status: "open", detail: null, href };
  });
}

/** Wren's plan stage the couple is in: the first one with anything left to do. */
export function currentPhase(items: ChecklistItem[]) {
  for (const phase of CHECKLIST_PHASES) {
    const inPhase = items.filter((item) => item.phase === phase.key);
    if (inPhase.some((item) => !item.completed)) {
      return {
        title: phase.title,
        done: inPhase.filter((item) => item.completed).length,
        total: inPhase.length,
      };
    }
  }
  return null;
}
