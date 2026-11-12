/**
 * Unsplash photos that stand in for the couple's own while they look through
 * templates, so a photo layout shows a photo instead of an empty band. They
 * appear only in the couple's own template previews, never on the live site
 * guests see: strangers' faces on someone's wedding page would read as theirs.
 *
 * Hotlinked from images.unsplash.com under the Unsplash License (free to use,
 * no credit required). Chosen by eye on 2026-10-21; each id was checked to
 * load and to show a wedding (the per-template
 * banners on 2026-11-12). Replace one by its id, never by a search.
 */
const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

/** The couple centred in warm light, so it still reads at thumbnail size. */
export const SAMPLE_HERO = unsplash("1591604466107-ec97de577aff", 2000);

/**
 * A different couple per template, matched to its mood, so the gallery
 * doesn't show the same photo fourteen times (owner, 2026-11-12). Keyed by
 * template id (site-templates.ts); a template missing here gets SAMPLE_HERO.
 */
const SAMPLE_HEROES: Record<string, string> = {
  classic: "1591604466107-ec97de577aff",
  heirloom: "1541250848049-b4f7141dca3f",
  editorial: "1460978812857-470ed1c77af0",
  riviera: "1511285560929-80b456fea0bc",
  "night-swim": "1494774157365-9e04c6720e47",
  "golden-hour": "1460364157752-926555421a7e",
  monogram: "1550784718-990c6de52adf",
  homestead: "1501901609772-df0848060b33",
  "deco-gala": "1595407753234-0882f1e77954",
  wildflower: "1546032996-6dfacbacbf3f",
  highland: "1604017011826-d3b4c23f8914",
  gilded: "1550005809-91ad75fb315f",
  signature: "1606216794074-735e91aa2c92",
  whitespace: "1621621667797-e06afc217fb0",
};

/** The sample banner for a template, or the default one. */
export function sampleHero(template: string | null | undefined): string {
  const id = template ? SAMPLE_HEROES[template] : undefined;
  return id ? unsplash(id, 2000) : SAMPLE_HERO;
}

/** Couple, details, then the day, so the first (largest) is the couple. */
export const SAMPLE_GALLERY = [
  "1583939003579-730e3918a45a",
  "1465495976277-4387d4b0b4c6",
  "1537633552985-df8429e8048b",
  "1522673607200-164d1b6ce486",
  "1532712938310-34cb3982ef74",
  "1525258946800-98cfd641d0de",
  "1519225421980-715cb0215aed",
  "1544078751-58fee2d8a03b",
  "1515934751635-c81c6bc9a2d8",
].map((id) => unsplash(id, 1200));

/**
 * Stand-in guests for "Who's coming" in the editor preview, so a couple can
 * see and style the section before anyone RSVPs. Initials only, no faces.
 * Never on the live site: the section stays hidden there until a real yes.
 */
export const SAMPLE_GUEST_NAMES = [
  "Avery Brooks",
  "Jordan Lee",
  "Priya Shah",
  "Marcus Hill",
  "Sofia Reyes",
  "Ethan Cole",
  "Grace Kim",
  "Noah Turner",
  "Maya Patel",
  "Liam Walsh",
  "Chloe Martin",
  "Diego Alvarez",
];
