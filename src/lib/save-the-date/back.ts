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
  heirloom: ["frame", ["roses", { x: -46, y: -64, w: 250 }], ["peony", { x: 770, y: -58, w: 260 }], "myrtle", "roses2"],
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

/**
 * Batch A suites: the back's own art, because each front's painting covers
 * the card. A sprig or corner of the same watercolours, clear of the type.
 */
const BACK_ART: Record<string, ArtLayer[]> = {
  "highland-lake": [
    { kind: "art", id: "back-pines", label: "Pines", art: "highlandForest", x: 40, y: 1186, w: 180 },
    { kind: "art", id: "back-pines2", label: "Pines", art: "highlandForest", x: 780, y: 1186, w: 180, flip: true },
    { kind: "art", id: "back-deckle", label: "Deckled edge", art: "deckle", x: 0, y: 0, w: 1000, color: "ink", opacity: 0.6 },
  ],
  "heirloom-peony": [
    { kind: "art", id: "back-top", label: "Peonies", art: "heirloomTop", x: 0, y: 0, w: 280 },
    { kind: "art", id: "back-bottom", label: "Peonies (lower)", art: "heirloomBottom", x: 690, y: 1090, w: 310 },
    { kind: "art", id: "back-deckle", label: "Deckled edge", art: "deckle", x: 0, y: 0, w: 1000, color: "ink", opacity: 0.45 },
  ],
  "wildflower-meadow": [
    { kind: "art", id: "back-left", label: "Wildflowers", art: "wildflowerLeft", x: -60, y: 0, w: 300 },
    { kind: "art", id: "back-right", label: "Wildflowers", art: "wildflowerRight", x: 760, y: 0, w: 300 },
    { kind: "art", id: "back-deckle", label: "Deckled edge", art: "deckle", x: 0, y: 0, w: 1000, color: "ink", opacity: 0.4 },
  ],
  // The whole painting, the back's type on a paper panel laid over it.
  "meadow-vista": [{ kind: "art", id: "back-scene", label: "Meadow vista", art: "meadowVistaStd", x: 0, y: 0, w: 1000 }],
  "evergreen-ridge": [{ kind: "art", id: "back-scene", label: "Evergreen ridge", art: "evergreenStd", x: 0, y: 0, w: 1000 }],
  "palm-shore": [{ kind: "art", id: "back-scene", label: "Palms on the shore", art: "shorelineInv", x: 0, y: 0, w: 1000 }],
  regatta: [{ kind: "art", id: "back-scene", label: "Lighthouse and hydrangeas", art: "regattaStd", x: 0, y: 975, w: 1000 }],
  "french-riviera": [{ kind: "art", id: "back-scene", label: "Riviera terrace", art: "rivieraStd", x: 0, y: 900, w: 1000 }],
  postmark: [
    { kind: "art", id: "back-scene", label: "Tuscan villa", art: "postmarkStd", x: 0, y: 960, w: 1000 },
    { kind: "art", id: "back-border", label: "Airmail edge", art: "airmailSoft", x: 0, y: 0, w: 1000 },
  ],
  sonoran: [{ kind: "art", id: "back-scene", label: "Sonoran desert", art: "sonoranInv", x: 0, y: 0, w: 1000 }],
  "garden-arch": [{ kind: "art", id: "back-scene", label: "Garden arch over the lake", art: "gardenStd", x: 0, y: 900, w: 1000 }],
  "joshua-tree": [{ kind: "art", id: "back-scene", label: "Joshua tree at sunset", art: "joshuaStd", x: 0, y: 867, w: 1000 }],
  bougainvillea: [{ kind: "art", id: "back-scene", label: "Bougainvillea terrace", art: "terraceStd", x: 0, y: 0, w: 1000 }],
  "coastal-sunset": [{ kind: "art", id: "back-coast", label: "Coast and poppies", art: "coastalFoot", x: 0, y: 1000, w: 1000 }],
  "black-tie": [{ kind: "art", id: "back-frame", label: "Double frame", art: "doubleFrame", x: 0, y: 0, w: 1000, color: "ink" }],
};

/** Designs whose top ornament takes the initials' place. */
const NO_MONOGRAM = new Set(["decogala", "pressed"]);

/** Designs whose type only reads on a panel (the front sets it on a badge). */
const PANEL: Record<string, ArtLayer> = {
  hotellabel: { kind: "art", id: "back-panel", label: "Panel", art: "panel", x: 110, y: 170, w: 780, color: "onPhoto" },
  bougainvillea: { kind: "art", id: "back-panel", label: "Panel", art: "panel", x: 110, y: 170, w: 780, color: "paper", opacity: 0.94 },
};

/** Where the QR code sits, in artboard units. */
export const BACK_QR = { x: 360, y: 600, w: 280 } as const;

/**
 * Designs whose back carries a deep piece of painting along the foot: the
 * type moves up by this much to leave it room (Coastal Sunset: the surf,
 * rocks and poppies, not a sliver of them, owner 2026-11-12).
 */
const BACK_LIFT: Record<string, number> = { "coastal-sunset": 200, "joshua-tree": 200, sonoran: 230, "garden-arch": 260, postmark: 230, "french-riviera": 250, regatta: 250, "palm-shore": 200, "evergreen-ridge": 200, "meadow-vista": 200 };
const liftOf = (t: Pick<Template, "id" | "source">) => BACK_LIFT[t.source ?? t.id] ?? 0;

/** Where a design's back puts the QR code. */
export const backQrFor = (t: Pick<Template, "id" | "source">) => ({ ...BACK_QR, y: BACK_QR.y - liftOf(t) });

const text = (l: Omit<TextLayer, "kind" | "anchor" | "x">): TextLayer => ({ kind: "text", anchor: "middle", x: 500, ...l });

/**
 * The front's artwork that frames a centred column of type (the back, and
 * every invitation): its frame or a corner of its flowers, ids prefixed.
 * Empty for designs with nothing that frames well.
 */
export function carriedArt(t: Template, prefix: string): ArtLayer[] {
  const front = new Map(t.layers.map((l) => [l.id, l]));
  return (KEEP[t.id] ?? []).flatMap((k) => {
    const [id, move] = typeof k === "string" ? [k, {}] : k;
    const l = front.get(id);
    return l && l.kind === "art" ? [{ ...l, ...move, id: `${prefix}${id}` }] : [];
  });
}

/** Designs whose top ornament takes the initials' place, by save-the-date id. */
export const hasNoMonogram = (id: string) => NO_MONOGRAM.has(id);

export function backLayers(t: Template, doc: CardDoc, site: string | null): Layer[] {
  // An invitation's back is its save-the-date design's: the same art, as an RSVP card.
  const id = t.source ?? t.id;
  const invitation = Boolean(t.source);
  const carried = BACK_ART[id] ?? (invitation ? t.layers.filter((l): l is ArtLayer => l.kind === "art" && l.id.startsWith("art-")).map((l) => ({ ...l, id: `back-${l.id}` })) : carriedArt(t, "back-"));
  const travel = doc.back?.travel.trim() ?? "";
  const panel = PANEL[id];
  const rsvp = invitation || Boolean(doc.back?.rsvp);
  const reply = invitation ? (doc.content.reply ?? "").trim() : "";
  const lift = liftOf(t);
  const type: Layer[] = [
    ...(panel ? [...(carried.length ? carried : [{ kind: "art", id: "back-frame", label: "Frame", art: "lineFrame", x: 45, y: 45, w: 910, color: "accent", opacity: 0.6 } satisfies ArtLayer]), panel] : []),
    ...(panel ? [] : carried.length ? carried : [{ kind: "art", id: "back-frame", label: "Frame", art: "lineFrame", x: 45, y: 45, w: 910, color: "accent", opacity: 0.45 } satisfies ArtLayer]),
    ...(NO_MONOGRAM.has(id) ? [] : [text({ id: "back-monogram", label: "Initials", bind: "monogram", joiner: " & ", y: 330, size: 84, font: "script", color: "accent", maxWidth: 520 })]),
    { kind: "art", id: "back-rule", label: "Rule", art: "rule", x: 460, y: 376, w: 80, color: "accent" },
    text({ id: "back-label", label: "Website label", bind: "custom", text: reply || (rsvp ? "Kindly reply online" : "Our wedding website"), y: 466, size: 18, font: "sans", color: "muted", upper: true, tracking: 0.4, maxWidth: 620 }),
    text({ id: "back-site", label: "Website", bind: "custom", text: site ?? PLACEHOLDER_SITE, y: 536, size: 40, font: "display", color: "ink", maxWidth: 560 }),
    text({ id: "back-scan", label: "Scan line", bind: "custom", text: rsvp ? "Scan to RSVP · travel & stays too" : "Scan for travel, stays & updates", y: 972, size: 16, font: "sans", color: "muted", upper: true, tracking: 0.32, maxWidth: 640 }),
    ...(travel ? [text({ id: "back-travel", label: "Travel", bind: "custom", text: travel, y: 1056, size: 30, wrap: 34, lineHeight: 1.4, font: "display", italic: true, color: "ink", opacity: 0.85, maxWidth: 680 })] : []),
    text({ id: "back-date", label: "Date", bind: "date", dateStyle: "dots", y: 1190, size: 16, font: "sans", color: "muted", upper: true, tracking: 0.4, maxWidth: 560 }),
  ];
  const art = type.filter((l) => l.kind === "art" && l.id !== "back-rule");
  return [...art, ...type.filter((l) => !art.includes(l)).map((l) => (lift ? { ...l, y: l.y - lift } : l))];
}

/** The front's design with its layers swapped for the back's. */
export function backTemplate(t: Template, doc: CardDoc, site: string | null): Template {
  return { ...t, usesPhoto: false, noPhotoLayers: undefined, layers: backLayers(t, doc, site) };
}
