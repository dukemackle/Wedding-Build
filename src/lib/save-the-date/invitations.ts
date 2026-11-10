import { carriedArt, hasNoMonogram } from "./back";
import type { ArtLayer, CardContent, Layer, Template, TextLayer } from "./types";

/**
 * Invitations (Guests › Invitations). Each one is a save-the-date design's
 * artwork, colours and lettering around the formal wording, so a couple's
 * invitation can match the save-the-date they sent. Same artboard, renderer
 * and studio; the back is an RSVP card (back.ts).
 *
 * The layout is the traditional centred stack: who's hosting, the request,
 * the names, date and time, the venue and town, then what follows.
 */

/** The save-the-date designs invitations are made from, in gallery order. */
export const INVITATION_SOURCES = [
  "heirloom",
  "midnight",
  "engraved",
  "riviera",
  "laurelarch",
  "decogala",
  "wildflower",
  "calligraphy",
  "homestead",
  // Added 2026-11-10 so every suite (src/lib/suites.ts) has an invitation.
  "goldenhour",
  "editorial",
];

export const INVITATION_PREFIX = "inv-";

export const isInvitationTemplate = (id: string) => id.startsWith(INVITATION_PREFIX);

/** Where the type starts, for designs whose artwork fills the top. */
const TOP: Record<string, number> = { decogala: 430 };
/** How tightly the lines stack, for designs with artwork at the foot too. */
const STEP: Record<string, number> = { decogala: 0.84 };

const text = (l: Omit<TextLayer, "kind" | "anchor" | "x">): TextLayer => ({ kind: "text", anchor: "middle", x: 500, ...l });

function invitationLayers(t: Template): Layer[] {
  const art = carriedArt(t, "art-");
  const frame: ArtLayer[] = art.length ? art : [{ kind: "art", id: "art-frame", label: "Frame", art: "lineFrame", x: 45, y: 45, w: 910, color: "accent", opacity: 0.45 }];
  // A design whose ornament sits at the top starts the type lower.
  const start = TOP[t.id] ?? (hasNoMonogram(t.id) ? 330 : 300);
  const k = STEP[t.id] ?? 1;
  const at = (offset: number) => Math.round(start + offset * k);
  return [
    ...frame,
    text({ id: "host", label: "Hosts", bind: "headline", text: "Together with their families", y: at(0), size: 19, font: "sans", color: "muted", upper: true, tracking: 0.32, maxWidth: 640 }),
    text({ id: "request", label: "Request", bind: "request", y: at(62), size: 30, wrap: 36, lineHeight: 1.35, font: "display", italic: true, color: "ink", maxWidth: 660 }),
    text({ id: "nameA", label: "First name", bind: "nameA", y: at(250), size: 92, font: "script", color: "accent", maxWidth: 640 }),
    text({ id: "and", label: "And", bind: "custom", text: "and", y: at(318), size: 26, font: "display", italic: true, color: "ink", maxWidth: 200 }),
    text({ id: "nameB", label: "Second name", bind: "nameB", y: at(420), size: 92, font: "script", color: "accent", maxWidth: 640 }),
    { kind: "art", id: "rule", label: "Rule", art: "rule", x: 460, y: at(470), w: 80, color: "accent" },
    text({ id: "date", label: "Date", bind: "date", dateStyle: "formal", y: at(540), size: 24, lineHeight: 1.5, font: "display", color: "ink", upper: true, tracking: 0.12, maxWidth: 680 }),
    text({ id: "time", label: "Time", bind: "time", y: at(630), size: 26, font: "display", italic: true, color: "ink", maxWidth: 640 }),
    text({ id: "venue", label: "Venue", bind: "venue", y: at(712), size: 32, font: "display", color: "ink", maxWidth: 680 }),
    text({ id: "place", label: "Town", bind: "place", y: at(758), size: 18, font: "sans", color: "muted", upper: true, tracking: 0.3, maxWidth: 680 }),
    text({ id: "note", label: "Reception", bind: "note", y: at(846), size: 26, font: "script", color: "accent", maxWidth: 640 }),
  ];
}

/** A save-the-date design as an invitation. */
export function invitationFrom(t: Template): Template {
  return {
    ...t,
    id: `${INVITATION_PREFIX}${t.id}`,
    source: t.id,
    usesPhoto: false,
    samplePhoto: undefined,
    noPhotoLayers: undefined,
    layers: invitationLayers(t),
  };
}

/** The usual wording, for a new invitation and the sample sheets. */
export const INVITATION_WORDING: Pick<CardContent, "headline" | "request" | "note"> = {
  headline: "Together with their families",
  request: "request the pleasure of your company at their marriage",
  note: "Dinner and dancing to follow",
};

const HOURS = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];

/** "16:00" as an invitation says it: "at four o'clock in the afternoon". */
export function invitationTime(hhmm: string | null | undefined): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm ?? "");
  if (!m) return "";
  const h = Number(m[1]);
  const min = Number(m[2]);
  const part = h < 12 ? "in the morning" : h < 17 ? "in the afternoon" : "in the evening";
  const hour = HOURS[h % 12];
  if (min === 0) return `at ${hour} o'clock ${part}`;
  if (min === 30) return `at half past ${hour} ${part}`;
  return `at ${h % 12 || 12}:${m[2]} ${part}`;
}

/** "2028-05-01" as the RSVP card's line: "Kindly reply by May 1". */
export function replyLine(deadline: string | null | undefined): string {
  if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return "";
  const when = new Date(`${deadline}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  return `Kindly reply by ${when}`;
}
