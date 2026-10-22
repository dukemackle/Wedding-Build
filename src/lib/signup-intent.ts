/**
 * What a logged-out visitor tapped on a listing before signing up: save it,
 * or ask about their date. Rides along on the way back as `?then=` so the
 * listing can finish it (src/components/signup-sheet.tsx).
 */
export type SignupIntent = "save" | "ask";

export function thenHref(href: string, intent: SignupIntent): string {
  return `${href}${href.includes("?") ? "&" : "?"}then=${intent}`;
}

export function parseThen(value: string | string[] | undefined): SignupIntent | undefined {
  return value === "save" || value === "ask" ? value : undefined;
}
