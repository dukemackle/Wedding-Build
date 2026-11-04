import type { ArtLayer, CardDoc, Layer, Template, TextLayer } from "./types";

/**
 * The back of a printed save the date ("Details"): the couple's initials, the
 * wedding website, a QR code to it, an optional travel line and the date.
 *
 * One layout for every design. It takes the front's colours and fonts, and
 * carries over the front's own frame or a corner of its artwork, so the two
 * sides read as one card. Designs with nothing that frames well get a thin
 * line border instead.
 */

/** How a wedding's public site is written on paper; the QR code adds https://. */
export const siteAddress = (slug: string) => `youdoido.com/w/${slug}`;

/** Where the back's QR code goes: the site, or straight to its RSVP form when the card asks for replies. */
export const backQrUrl = (site: string | null, rsvp: boolean) => `https://${site ?? "youdoido.com"}${site && rsvp ? "#rsvp" : ""}`;

/** Shown on the back until the couple's website is on (the PDF leaves the back out then). */
export const PLACEHOLDER_SITE = "youdoido.com/w/your-names";

/** Front layers each design brings to its back, by id, sometimes moved to clear the type. */
const KEEP: Record<string, (string | [string, Partial<ArtLayer>])[]> = {
  heirloom: ["frame", "myrtle", "roses2"],
  midnight: ["arch", "stars", "moon"],
  swiss: [["square", { y: 1290 }]],
  riviera: ["tiles", "lemons", "lemons2"],
  homestead: ["frame"],
  engraved: ["frame", ["crest", { x: 430, y: 92, w: 140 }]],
  postcard: ["border", "stamp"],
  decogala: ["frame"],
  wildflower: ["bow", "lily", "sweetpea"],
  laurelarch: ["arch"],
  pressed: [["sprig", { x: 400, y: 64, w: 200 }]],
  gardenparty: ["gingham", ["card", { x: 100, y: 160, w: 800 }]],
  brand: ["rope"],
  calligraphy: ["deckle"],
};

/** Designs whose top ornament takes the initials' place. */
const NO_MONOGRAM = new Set(["decogala", "pressed"]);

/** Designs whose type only reads on a panel (the front sets it on a badge). */
const PANEL: Record<string, ArtLayer> = {
  hotellabel: { kind: "art", id: "back-panel", label: "Panel", art: "panel", x: 110, y: 170, w: 780, color: "onPhoto" },
};

/** Where the QR code sits, in artboard units. */
export const BACK_QR = { x: 360, y: 600, w: 280 } as const;

const text = (l: Omit<TextLayer, "kind" | "anchor" | "x">): TextLayer => ({ kind: "text", anchor: "middle", x: 500, ...l });

export function backLayers(t: Template, doc: CardDoc, site: string | null): Layer[] {
  const front = new Map(t.layers.map((l) => [l.id, l]));
  const carried = (KEEP[t.id] ?? []).flatMap((k) => {
    const [id, move] = typeof k === "string" ? [k, {}] : k;
    const l = front.get(id);
    return l && l.kind === "art" ? [{ ...l, ...move, id: `back-${id}` }] : [];
  });
  const travel = doc.back?.travel.trim() ?? "";
  const panel = PANEL[t.id];
  const rsvp = Boolean(doc.back?.rsvp);
  return [
    ...(panel ? [{ kind: "art", id: "back-frame", label: "Frame", art: "lineFrame", x: 45, y: 45, w: 910, color: "accent", opacity: 0.6 } satisfies ArtLayer, panel] : []),
    ...(panel ? [] : carried.length ? carried : [{ kind: "art", id: "back-frame", label: "Frame", art: "lineFrame", x: 45, y: 45, w: 910, color: "accent", opacity: 0.45 } satisfies ArtLayer]),
    ...(NO_MONOGRAM.has(t.id) ? [] : [text({ id: "back-monogram", label: "Initials", bind: "monogram", joiner: " & ", y: 330, size: 84, font: "script", color: "accent", maxWidth: 520 })]),
    { kind: "art", id: "back-rule", label: "Rule", art: "rule", x: 460, y: 376, w: 80, color: "accent" },
    text({ id: "back-label", label: "Website label", bind: "custom", text: rsvp ? "Kindly reply online" : "Our wedding website", y: 466, size: 18, font: "sans", color: "muted", upper: true, tracking: 0.4, maxWidth: 620 }),
    text({ id: "back-site", label: "Website", bind: "custom", text: site ?? PLACEHOLDER_SITE, y: 536, size: 40, font: "display", color: "ink", maxWidth: 560 }),
    text({ id: "back-scan", label: "Scan line", bind: "custom", text: rsvp ? "Scan to RSVP · travel & stays too" : "Scan for travel, stays & updates", y: 972, size: 16, font: "sans", color: "muted", upper: true, tracking: 0.32, maxWidth: 640 }),
    ...(travel ? [text({ id: "back-travel", label: "Travel", bind: "custom", text: travel, y: 1056, size: 30, wrap: 34, lineHeight: 1.4, font: "display", italic: true, color: "ink", opacity: 0.85, maxWidth: 680 })] : []),
    text({ id: "back-date", label: "Date", bind: "date", dateStyle: "dots", y: 1190, size: 16, font: "sans", color: "muted", upper: true, tracking: 0.4, maxWidth: 560 }),
  ];
}

/** The front's design with its layers swapped for the back's. */
export function backTemplate(t: Template, doc: CardDoc, site: string | null): Template {
  return { ...t, usesPhoto: false, noPhotoLayers: undefined, layers: backLayers(t, doc, site) };
}
