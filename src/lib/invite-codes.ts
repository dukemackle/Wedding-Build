/** Personal RSVP links (0141): the parts the browser and server share. */

const CODE = /^[A-HJKMNP-Z2-9]{6}$/;

/** The code as typed or linked ("k7m2-qx" reads as K7M2QX), or null if it can't be one. */
export function normalizeInviteCode(raw: string | null | undefined): string | null {
  const code = (raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return CODE.test(code) ? code : null;
}

/** The cookie that remembers which household this browser opened, per site. */
export function inviteCookie(slug: string) {
  return `ydid_invite_${slug}`;
}

/** /w/<slug>/i/<code>: the link that goes on invitations and in emails. */
export function personalRsvpPath(slug: string, code: string) {
  return `/w/${slug}/i/${code}`;
}
