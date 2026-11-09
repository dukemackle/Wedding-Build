import { NextResponse, type NextRequest } from "next/server";
import { isValidUnsubscribeToken, parseUnsubscribeList, recordOptOut, recordReminderOptOut } from "@/lib/unsubscribe";

/**
 * RFC 8058 one-click unsubscribe: Gmail's and Apple Mail's own "Unsubscribe"
 * button POSTs here with no page and no confirmation, using the URL from the
 * List-Unsubscribe header that sendMarketingEmail sets. A GET (a person who
 * pasted the URL, or a link scanner) goes to the page instead, which asks
 * before doing anything. `l=reminders` stops planning reminders only.
 */
export async function POST(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("e") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!email || !(await isValidUnsubscribeToken(email, token))) {
    return new NextResponse("Invalid unsubscribe link", { status: 400 });
  }
  const ok =
    parseUnsubscribeList(request.nextUrl.searchParams.get("l")) === "reminders"
      ? await recordReminderOptOut(email, "one-click")
      : await recordOptOut(email, "one-click");
  return new NextResponse(ok ? "Unsubscribed" : "Try again", { status: ok ? 200 : 500 });
}

export function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/unsubscribe";
  return NextResponse.redirect(url, 303);
}
