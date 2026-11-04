/**
 * The save-the-date email: the card as a picture, linking to the guest's own
 * envelope, and one button. Written as plain inline-styled HTML, the only
 * kind every mail app shows the same, with a text part for the rest.
 */

/**
 * At most this many emails per send: Resend takes 100 in one batch request,
 * and Workers allow ~50 outbound requests per request, so one at a time
 * (as RSVP invites do) can't reach a full list. Resend's free plan is also
 * 100 a day for the whole account (docs/email-playbook.md).
 */
export const MAX_PER_SEND = 100;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type CardEmail = {
  /** "Sam & Riley", or the household's name. */
  greeting: string;
  names: string;
  when: string;
  place: string;
  /** The guest's own link, /w/<slug>/s/<code>. */
  url: string;
  imageUrl: string;
};

export function cardEmailSubject({ names, when }: Pick<CardEmail, "names" | "when">) {
  return when ? `Save the date: ${names} · ${when}` : `Save the date: ${names}`;
}

export function cardEmailText(e: CardEmail) {
  const details = [e.when, e.place].filter(Boolean).join(" · ");
  return [
    `Dear ${e.greeting},`,
    "",
    `We're getting married${details ? ` (${details})` : ""}, and we'd love you to save the date.`,
    "",
    `Open your save the date: ${e.url}`,
    "",
    `Love, ${e.names}`,
    "",
    "Reply to this email to reach us.",
  ].join("\n");
}

export function cardEmailHtml(e: CardEmail) {
  const sans = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
  const alt = esc(`Save the date: ${[e.names, e.when, e.place].filter(Boolean).join(", ")}`);
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f1ec;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(e.names)} would love you to save the date${e.when ? ` · ${esc(e.when)}` : ""}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;">
<tr><td align="center" style="font:15px/1.5 ${sans};color:#4a5068;padding-bottom:18px;">Dear ${esc(e.greeting)},</td></tr>
<tr><td align="center"><a href="${esc(e.url)}"><img src="${esc(e.imageUrl)}" width="400" alt="${alt}" style="display:block;width:100%;max-width:400px;height:auto;border:0;border-radius:3px;"></a></td></tr>
<tr><td align="center" style="padding:26px 0 8px;">
<a href="${esc(e.url)}" style="display:inline-block;background:#14203d;color:#ffffff;font:600 15px ${sans};text-decoration:none;padding:13px 26px;border-radius:999px;">Open your save the date</a>
</td></tr>
<tr><td align="center" style="font:12px/1.6 ${sans};color:#8a8f9e;padding-top:18px;">
Sent by ${esc(e.names)} with You Do, I Do.<br>Reply to this email to reach them.
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
