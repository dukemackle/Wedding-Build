import "server-only";

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";

// A thin fetch-based wrapper (no Twilio SDK) so this stays lightweight and
// runs fine on the Cloudflare Workers runtime, same reasoning as the Resend
// integration. Silently configured-or-not: callers get back an `error`
// string instead of throwing, so a missing/incomplete Twilio setup doesn't
// crash whatever triggered the text (e.g. saving an itinerary event).
export async function sendSms(to: string, body: string): Promise<{ error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { error: "SMS is not configured (missing Twilio credentials)." };
  }

  const params = new URLSearchParams({ To: to, From: fromNumber, Body: body });
  const response = await fetch(`${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return { error: `Twilio error (${response.status}): ${text.slice(0, 200)}` };
  }

  return {};
}
