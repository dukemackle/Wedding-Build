/**
 * When RSVPs open (weddings.rsvp_opens_on, 0159). The date is a bare day, so
 * it opens as soon as that day has begun anywhere (UTC+14): a guest out east
 * is never turned away on the morning the invitation said.
 */
export function rsvpNotOpenYet(opensOn: string | null | undefined, now = Date.now()): boolean {
  if (!opensOn || !/^\d{4}-\d{2}-\d{2}$/.test(opensOn)) return false;
  return now < Date.parse(`${opensOn}T00:00:00Z`) - 14 * 60 * 60 * 1000;
}

export const RSVP_NOT_OPEN_ERROR = "RSVPs aren't open yet. Your invitation will say when to reply.";
