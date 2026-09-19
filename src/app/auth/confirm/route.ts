import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Turns an emailed link into a signed-in session.
 *
 * This has to be a Route Handler, and the cookie writes have to go onto the
 * redirect response by hand. Next.js forbids setting cookies from a Server
 * Component, and our shared server client swallows that failure by design
 * (it assumes middleware will refresh the session instead -- true for an
 * existing session, useless for establishing a new one). Verifying a link on
 * a page therefore *appears* to work: Supabase returns a real session, the
 * cookies are dropped on the floor, and the visitor lands on a form with
 * nothing behind it. That is what made password reset fail with
 * "Auth session missing!" no matter how many times it was requested.
 *
 * Handles both shapes Supabase sends: a token_hash (email OTP) and a code
 * (PKCE). The third -- tokens in the URL fragment -- can't reach a server at
 * all and is picked up client-side on /reset-password instead.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const requestedNext = searchParams.get("next") ?? "/dashboard";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";

  // Built up front so the Supabase client can write the session cookies
  // straight onto the response the browser will actually receive.
  const response = NextResponse.redirect(new URL(next, request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return response;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }

  return NextResponse.redirect(
    new URL(
      "/login?error=" + encodeURIComponent("That link is invalid or has expired."),
      request.url,
    ),
  );
}
