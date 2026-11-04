/**
 * Coming back to Save the date picks up where the couple left off, like the
 * guest site (see ../site/resume.ts): Guests › Save the date reopens the card
 * they were last editing on this device. Leaving through "Designs" goes back to
 * the list, and the list is then where they left off.
 */

/** The card last open in the studio, read by /guests/save-the-date to reopen it. Per device. */
export const LAST_CARD_COOKIE = "std-studio-last";

/** "Designs" from inside the studio: the list, not a bounce back into the studio. */
export const CARDS_LIST_HREF = "/guests/save-the-date?designs";

export function rememberCard(cardId: string) {
  document.cookie = `${LAST_CARD_COOKIE}=${encodeURIComponent(cardId)}; path=/guests/save-the-date; max-age=${60 * 60 * 24 * 60}; samesite=lax`;
}

export function forgetCard() {
  document.cookie = `${LAST_CARD_COOKIE}=; path=/guests/save-the-date; max-age=0; samesite=lax`;
}
