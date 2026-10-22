/**
 * Unsplash photos that stand in for the couple's own while they look through
 * templates, so a photo layout shows a photo instead of an empty band. They
 * appear only in the couple's own template previews, never on the live site
 * guests see: strangers' faces on someone's wedding page would read as theirs.
 *
 * Hotlinked from images.unsplash.com under the Unsplash License (free to use,
 * no credit required). Chosen by eye on 2026-10-21; each id was checked to
 * load and to show a wedding. Replace one by its id, never by a search.
 */
const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

/** The couple centred in warm light, so it still reads at thumbnail size. */
export const SAMPLE_HERO = unsplash("1591604466107-ec97de577aff", 2000);

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
