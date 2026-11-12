import { carriedArt, hasNoMonogram } from "./back";
import type { ArtLayer, CardContent, Layer, Palette, Template, TextLayer } from "./types";

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
  // Batch A suites (2026-11-11), each with its own invitation layout below.
  "highland-lake",
  "heirloom-peony",
  "wildflower-meadow",
  "black-tie",
  "coastal-sunset",
  "bougainvillea",
];

export const INVITATION_PREFIX = "inv-";

export const isInvitationTemplate = (id: string) => id.startsWith(INVITATION_PREFIX);

/** Where the type starts, for designs whose artwork fills the top. */
const TOP: Record<string, number> = { decogala: 474 };
/** How tightly the lines stack, for designs with artwork at the foot too. */
const STEP: Record<string, number> = { decogala: 0.78 };

/**
 * Invitations whose save the date is a full-bleed photo have nothing to
 * carry over: their paper is only the colour behind the photo. These get
 * their own paper and ornament instead, keeping the colourway ids so a card's
 * look still carries across the suite (src/lib/suites.ts).
 */
const OWN: Record<string, { palettes: Palette[]; art: ArtLayer[] }> = {
  goldenhour: {
    palettes: [
      { id: "honey", label: "Honey", paper: "#fbf3e4", ink: "#4a3420", accent: "#a8762a", muted: "#82684c", onPhoto: "#ffffff" },
      { id: "blush", label: "Blush", paper: "#fbefee", ink: "#4f2a31", accent: "#b06873", muted: "#86666b", onPhoto: "#ffffff" },
      { id: "white", label: "White", paper: "#ffffff", ink: "#1e1e1e", accent: "#94804f", muted: "#686868", onPhoto: "#ffffff" },
    ],
    art: [
      { kind: "art", id: "art-frame", label: "Frame", art: "lineFrame", x: 45, y: 45, w: 910, color: "accent", opacity: 0.5 },
      { kind: "art", id: "art-sun", label: "Sun", art: "sunRing", x: 428, y: 92, w: 144, color: "accent" },
      { kind: "art", id: "art-sundisc", label: "Setting sun", art: "sunDisc", x: 468, y: 132, w: 64, color: "accent", opacity: 0.85 },
    ],
  },
};

const text = (l: Omit<TextLayer, "kind" | "anchor" | "x">): TextLayer => ({ kind: "text", anchor: "middle", x: 500, ...l });
const art = (l: Omit<ArtLayer, "kind">): ArtLayer => ({ kind: "art", ...l });

/**
 * Batch A suites: invitations laid out from the owner's approved references
 * (docs/batch-a-suites.md), not the generic stack, because each one's
 * artwork leaves a different shape of room for the type. Art ids start with
 * "art-" only where the RSVP back should not carry them (it has its own, back.ts).
 */
const LAID_OUT: Record<string, Layer[]> = {
  // The wording in the arch's sky, the venue on the terrace floor, as on the save the date.
  bougainvillea: [
    art({ id: "scene", label: "Bougainvillea terrace", art: "terraceStd", x: 0, y: 0, w: 1000 }),
    text({ id: "host", label: "Hosts", bind: "headline", text: "Together with their families", y: 236, size: 22, font: "sans", weight: 600, color: "ink", upper: true, tracking: 0.18, maxWidth: 500 }),
    text({ id: "nameA", label: "First name", bind: "nameA", y: 340, size: 96, font: "display", italic: true, weight: 500, color: "ink", maxWidth: 620 }),
    text({ id: "and", label: "And", bind: "custom", text: "and", y: 392, size: 34, font: "display", italic: true, color: "ink", maxWidth: 120 }),
    text({ id: "nameB", label: "Second name", bind: "nameB", y: 470, size: 96, font: "display", italic: true, weight: 500, color: "ink", maxWidth: 640 }),
    text({ id: "request", label: "Request", bind: "request", y: 530, size: 27, font: "display", italic: true, weight: 500, color: "ink", maxWidth: 640 }),
    text({ id: "date", label: "Date", bind: "date", dateStyle: "formalDay", y: 594, size: 30, font: "display", weight: 600, color: "ink", upper: true, tracking: 0.08, maxWidth: 680 }),
    text({ id: "year", label: "Year", bind: "date", dateStyle: "yearWords", when: "numericDate", y: 628, size: 17, font: "sans", weight: 600, color: "ink", upper: true, tracking: 0.18, maxWidth: 640 }),
    text({ id: "time", label: "Time", bind: "time", y: 662, size: 23, font: "display", italic: true, weight: 500, color: "ink", maxWidth: 640 }),
    text({ id: "venue", label: "Venue", bind: "venue", y: 1238, size: 40, font: "display", weight: 600, color: "ink", upper: true, tracking: 0.1, maxWidth: 780 }),
    text({ id: "place", label: "Town", bind: "place", y: 1284, size: 20, font: "sans", weight: 600, color: "ink", upper: true, tracking: 0.2, maxWidth: 700 }),
    text({ id: "note", label: "Reception", bind: "note", y: 1348, size: 32, font: "display", italic: true, weight: 500, color: "ink", maxWidth: 640 }),
  ],
  "coastal-sunset": [
    // The painting sits lower than on the save the date, so the clouds start under the wording.
    art({ id: "scene", label: "Big Sur coast", art: "coastalStd", x: 0, y: 150, w: 1000 }),
    text({ id: "host", label: "Hosts", bind: "headline", text: "Together with their families", y: 120, size: 22, font: "sans", color: "ink", upper: true, tracking: 0.2, maxWidth: 640 }),
    text({ id: "nameA", label: "First name", bind: "nameA", y: 236, size: 120, font: "script", color: "ink", maxWidth: 560 }),
    text({ id: "and", label: "And", bind: "custom", text: "and", y: 292, size: 32, font: "display", italic: true, color: "ink", maxWidth: 120 }),
    text({ id: "nameB", label: "Second name", bind: "nameB", y: 392, size: 120, font: "script", color: "ink", maxWidth: 600 }),
    text({ id: "request", label: "Request", bind: "request", y: 458, size: 27, font: "display", italic: true, color: "ink", tracking: 0.05, maxWidth: 760 }),
    text({ id: "date", label: "Date", bind: "date", dateStyle: "formalDay", y: 530, size: 31, font: "display", color: "ink", upper: true, tracking: 0.1, maxWidth: 800 }),
    text({ id: "year", label: "Year", bind: "date", dateStyle: "yearWords", when: "numericDate", y: 564, size: 17, font: "sans", color: "ink", upper: true, tracking: 0.2, maxWidth: 760 }),
    text({ id: "time", label: "Time", bind: "time", y: 598, size: 23, font: "display", italic: true, color: "ink", maxWidth: 760 }),
    text({ id: "venue", label: "Venue", bind: "venue", y: 650, size: 31, font: "display", color: "ink", upper: true, tracking: 0.12, maxWidth: 720 }),
    text({ id: "place", label: "Town", bind: "place", y: 684, size: 17, font: "sans", color: "ink", upper: true, tracking: 0.26, maxWidth: 640 }),
    text({ id: "note", label: "Reception", bind: "note", y: 726, size: 26, font: "display", italic: true, color: "ink", tracking: 0.04, maxWidth: 520 }),
  ],
  "highland-lake": [
    // The painting sits lower than on the save the date, under the longer wording.
    art({ id: "scene", label: "Alpine lake", art: "highlandInv", x: 0, y: 110, w: 1000 }),
    art({ id: "deckle", label: "Deckled edge", art: "deckle", x: 0, y: 0, w: 1000, color: "ink", opacity: 0.6 }),
    text({ id: "host", label: "Hosts", bind: "headline", text: "Together with their families", y: 146, size: 23, font: "sans", color: "ink", upper: true, tracking: 0.2, maxWidth: 640 }),
    text({ id: "nameA", label: "First name", bind: "nameA", y: 262, size: 128, font: "script", color: "ink", maxWidth: 560 }),
    art({ id: "andL", label: "Rule", art: "rule", x: 345, y: 309, w: 95, color: "accent", opacity: 0.7 }),
    text({ id: "and", label: "And", bind: "custom", text: "and", y: 322, size: 34, font: "display", italic: true, color: "ink", maxWidth: 120 }),
    art({ id: "andR", label: "Rule", art: "rule", x: 560, y: 309, w: 95, color: "accent", opacity: 0.7 }),
    text({ id: "nameB", label: "Second name", bind: "nameB", y: 416, size: 128, font: "script", color: "ink", maxWidth: 600 }),
    text({ id: "request", label: "Request", bind: "request", y: 492, size: 29, font: "display", italic: true, color: "ink", tracking: 0.06, maxWidth: 760 }),
    art({ id: "rule", label: "Rule", art: "rule", x: 440, y: 538, w: 120, color: "accent", opacity: 0.7 }),
    text({ id: "date", label: "Date", bind: "date", dateStyle: "formalDay", y: 604, size: 33, font: "display", color: "ink", upper: true, tracking: 0.1, maxWidth: 800 }),
    text({ id: "year", label: "Year", bind: "date", dateStyle: "yearWords", when: "numericDate", y: 640, size: 18, font: "sans", color: "ink", upper: true, tracking: 0.2, maxWidth: 760 }),
    text({ id: "time", label: "Time", bind: "time", y: 676, size: 24, font: "display", italic: true, color: "ink", maxWidth: 760 }),
    text({ id: "venue", label: "Venue", bind: "venue", y: 730, size: 34, font: "display", color: "ink", upper: true, tracking: 0.12, maxWidth: 720 }),
    text({ id: "place", label: "Town", bind: "place", y: 766, size: 18, font: "sans", color: "ink", upper: true, tracking: 0.26, maxWidth: 640 }),
    text({ id: "note", label: "Reception", bind: "note", y: 812, size: 28, font: "display", italic: true, color: "ink", tracking: 0.04, maxWidth: 520 }),
  ],
  "heirloom-peony": [
    art({ id: "flowers", label: "Peonies", art: "heirloomInv", x: 0, y: 0, w: 1000 }),
    art({ id: "deckle", label: "Deckled edge", art: "deckle", x: 0, y: 0, w: 1000, color: "ink", opacity: 0.45 }),
    text({ id: "host", label: "Hosts", bind: "headline", text: "Together with their families", y: 300, size: 25, font: "sans", weight: 600, color: "ink", upper: true, tracking: 0.08, maxWidth: 520 }),
    text({ id: "nameA", label: "First name", bind: "nameA", y: 436, size: 140, font: "script", color: "ink", maxWidth: 520 }),
    text({ id: "and", label: "And", bind: "custom", text: "and", y: 486, size: 46, font: "script", color: "ink", maxWidth: 140 }),
    text({ id: "nameB", label: "Second name", bind: "nameB", y: 600, size: 140, font: "script", color: "ink", maxWidth: 560 }),
    text({ id: "request", label: "Request", bind: "request", y: 680, size: 30, font: "display", italic: true, color: "ink", maxWidth: 640 }),
    art({ id: "divider", label: "Rule", art: "rule", x: 440, y: 728, w: 120, color: "accent" }),
    text({ id: "date", label: "Date", bind: "date", dateStyle: "formalDay", y: 806, size: 34, font: "display", weight: 600, color: "ink", upper: true, tracking: 0.06, maxWidth: 720 }),
    text({ id: "year", label: "Year", bind: "date", dateStyle: "yearWords", when: "numericDate", y: 846, size: 19, font: "sans", weight: 600, color: "ink", upper: true, tracking: 0.08, maxWidth: 640 }),
    text({ id: "time", label: "Time", bind: "time", y: 882, size: 24, font: "display", italic: true, color: "ink", maxWidth: 640 }),
    art({ id: "divider2", label: "Rule", art: "rule", x: 440, y: 914, w: 120, color: "accent" }),
    text({ id: "venue", label: "Venue", bind: "venue", y: 986, size: 37, font: "display", weight: 600, color: "ink", upper: true, tracking: 0.06, maxWidth: 680 }),
    text({ id: "place", label: "Town", bind: "place", y: 1024, size: 18, font: "sans", weight: 600, color: "ink", upper: true, tracking: 0.28, maxWidth: 560 }),
    text({ id: "note", label: "Reception", bind: "note", y: 1094, size: 50, font: "script", color: "ink", maxWidth: 520 }),
  ],
  "wildflower-meadow": [
    art({ id: "flowers", label: "Wildflowers", art: "wildflowerFrame", x: 0, y: 0, w: 1000 }),
    art({ id: "deckle", label: "Deckled edge", art: "deckle", x: 0, y: 0, w: 1000, color: "ink", opacity: 0.4 }),
    text({ id: "host", label: "Hosts", bind: "headline", text: "Together with their families", y: 186, size: 26, wrap: 14, lineHeight: 1.6, font: "sans", color: "ink", upper: true, tracking: 0.2, maxWidth: 440 }),
    art({ id: "rule", label: "Rule", art: "rule", x: 440, y: 262, w: 120, color: "accent" }),
    text({ id: "nameA", label: "First name", bind: "nameA", y: 356, size: 82, font: "display", weight: 500, color: "ink", upper: true, tracking: 0.08, maxWidth: 600 }),
    art({ id: "andL", label: "Rule", art: "rule", x: 300, y: 398, w: 140, color: "accent" }),
    text({ id: "and", label: "And", bind: "custom", text: "and", y: 414, size: 46, font: "script", italic: true, color: "ink", maxWidth: 140 }),
    art({ id: "andR", label: "Rule", art: "rule", x: 560, y: 398, w: 140, color: "accent" }),
    text({ id: "nameB", label: "Second name", bind: "nameB", y: 524, size: 82, font: "display", weight: 500, color: "ink", upper: true, tracking: 0.08, maxWidth: 620 }),
    text({ id: "request", label: "Request", bind: "request", y: 590, size: 24, wrap: 30, lineHeight: 1.6, font: "sans", color: "ink", upper: true, tracking: 0.16, maxWidth: 540 }),
    text({ id: "date", label: "Date", bind: "date", dateStyle: "weekday", y: 712, size: 34, font: "display", color: "ink", upper: true, tracking: 0.1, maxWidth: 580 }),
    text({ id: "time", label: "Time", bind: "time", y: 752, size: 20, font: "sans", color: "ink", upper: true, tracking: 0.14, maxWidth: 540 }),
    text({ id: "venue", label: "Venue", bind: "venue", y: 830, size: 34, font: "display", color: "ink", upper: true, tracking: 0.12, maxWidth: 560 }),
    text({ id: "place", label: "Town", bind: "place", y: 876, size: 21, font: "sans", color: "ink", upper: true, tracking: 0.2, maxWidth: 520 }),
    art({ id: "rule2", label: "Rule", art: "rule", x: 440, y: 910, w: 120, color: "accent" }),
    text({ id: "note", label: "Reception", bind: "note", y: 976, size: 36, font: "script", italic: true, color: "ink", maxWidth: 520 }),
  ],
  "black-tie": [
    art({ id: "art-frame", label: "Double frame", art: "doubleFrame", x: 0, y: 0, w: 1000, color: "ink" }),
    text({ id: "host", label: "Hosts", bind: "headline", text: "Together with their families", y: 140, size: 26, wrap: 14, lineHeight: 1.75, font: "sans", color: "ink", upper: true, tracking: 0.24, maxWidth: 640 }),
    art({ id: "rule", label: "Rule", art: "rule", x: 440, y: 248, w: 120, color: "accent" }),
    text({ id: "nameA", label: "First name", bind: "nameA", y: 382, size: 76, font: "display", color: "ink", upper: true, tracking: 0.12, maxWidth: 780 }),
    text({ id: "and", label: "And", bind: "custom", text: "and", y: 468, size: 52, font: "script", italic: true, color: "accent", maxWidth: 160 }),
    text({ id: "nameB", label: "Second name", bind: "nameB", y: 578, size: 76, font: "display", color: "ink", upper: true, tracking: 0.12, maxWidth: 780 }),
    text({ id: "request", label: "Request", bind: "request", y: 684, size: 22, wrap: 36, lineHeight: 1.9, font: "sans", color: "ink", upper: true, tracking: 0.2, maxWidth: 760 }),
    art({ id: "rule2", label: "Rule", art: "rule", x: 440, y: 790, w: 120, color: "accent" }),
    text({ id: "date", label: "Date", bind: "date", dateStyle: "weekday", y: 884, size: 36, font: "display", color: "ink", upper: true, tracking: 0.12, maxWidth: 780 }),
    text({ id: "time", label: "Time", bind: "time", y: 936, size: 21, font: "sans", color: "ink", upper: true, tracking: 0.2, maxWidth: 720 }),
    text({ id: "venue", label: "Venue", bind: "venue", y: 1044, size: 44, font: "display", color: "ink", upper: true, tracking: 0.14, maxWidth: 760 }),
    text({ id: "place", label: "Town", bind: "place", y: 1104, size: 24, font: "sans", color: "ink", upper: true, tracking: 0.3, maxWidth: 700 }),
    art({ id: "rule3", label: "Rule", art: "rule", x: 440, y: 1170, w: 120, color: "accent" }),
    text({ id: "note", label: "Reception", bind: "note", y: 1258, size: 34, font: "display", italic: true, color: "ink", tracking: 0.04, maxWidth: 640 }),
  ],
};

function invitationLayers(t: Template): Layer[] {
  if (LAID_OUT[t.id]) return LAID_OUT[t.id];
  const art = OWN[t.id]?.art ?? carriedArt(t, "art-");
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
    ...(OWN[t.id] && { palettes: OWN[t.id].palettes }),
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
