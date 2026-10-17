/**
 * Live details: text elements on the guest site that show the wedding's own
 * names, date, countdown or venue, so a changed date changes everywhere it's
 * placed (src/lib/site-canvas-schema.ts, `live`). The RSVP button is a link
 * to the RSVP section with the couple's own words on it.
 */

export const LIVE_FIELDS = [
  { id: "names", label: "Names" },
  { id: "date", label: "Date" },
  { id: "countdown", label: "Countdown" },
  { id: "venue", label: "Venue" },
  { id: "rsvp", label: "RSVP button" },
] as const;

export type LiveField = (typeof LIVE_FIELDS)[number]["id"];

export const DATE_STYLES = [
  { id: "long", label: "Saturday, June 5, 2027" },
  { id: "medium", label: "June 5, 2027" },
  { id: "dots", label: "06 · 05 · 2027" },
] as const;

export type DateStyle = (typeof DATE_STYLES)[number]["id"];

/** What a live element can show; null where the couple hasn't said yet. */
export type LiveDetails = {
  names: string | null;
  /** yyyy-mm-dd */
  date: string | null;
  venue: string | null;
};

export const NO_LIVE_DETAILS: LiveDetails = { names: null, date: null, venue: null };

export function formatLiveDate(date: string, style: DateStyle) {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  if (style === "dots") {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getMonth() + 1)} · ${pad(d.getDate())} · ${d.getFullYear()}`;
  }
  return d.toLocaleDateString("en-US", {
    ...(style === "long" ? { weekday: "long" as const } : {}),
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "236 days to go", "Today's the day", then "Just married". `today` is yyyy-mm-dd. */
export function countdownWords(date: string, today: string) {
  const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  if (Number.isNaN(days)) return null;
  if (days > 1) return `${days} days to go`;
  if (days === 1) return "1 day to go";
  if (days === 0) return "Today’s the day";
  return "Just married";
}

/** Today in the viewer's own time zone, as yyyy-mm-dd. */
export function localToday() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The words a live element shows, or null when the detail isn't set. */
export function liveWords(
  field: LiveField,
  details: LiveDetails,
  { dateStyle = "long", today, label }: { dateStyle?: DateStyle; today: string; label: string },
) {
  if (field === "names") return details.names;
  if (field === "venue") return details.venue;
  if (field === "rsvp") return label.trim() || "RSVP";
  if (!details.date) return null;
  return field === "date" ? formatLiveDate(details.date, dateStyle) : countdownWords(details.date, today);
}

/** Names and venue as the site writes them, from a wedding's columns. */
export function liveDetailsOf(w: {
  partner_a_name: string | null;
  partner_b_name: string | null;
  wedding_date: string | null;
  venue_name: string | null;
  venue_city: string | null;
  venue_state: string | null;
}): LiveDetails {
  const names = [w.partner_a_name, w.partner_b_name].map((n) => n?.trim()).filter(Boolean).join(" & ");
  const place = [w.venue_city, w.venue_state].filter(Boolean).join(", ");
  return {
    names: names || null,
    date: w.wedding_date,
    venue: [w.venue_name, place].filter(Boolean).join(" · ") || null,
  };
}
