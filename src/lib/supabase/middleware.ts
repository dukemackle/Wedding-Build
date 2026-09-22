import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Kept in sync with proxy.ts's ADMIN_HOST. /dashboard isn't a real page on
// this host and a signed-in-but-wrong-account visitor must be able to stay
// on /login to see why -- bouncing them to /dashboard here would send them
// straight back into the admin routing's redirect-to-/login, forever.
const ADMIN_HOST = "admin.wrenwed.com";

/**
 * Refreshes the session on every request -- and never fails the request.
 *
 * This runs in front of every page on the site, so anything thrown here is a
 * bare "Internal Server Error" on the marketing pages, the guest sites and
 * the app alike. Two things throw: `createServerClient` when the Supabase
 * URL or key is missing from the environment (a deploy that lost its
 * variables), and `getUser` when Supabase can't be reached (an outage, a
 * paused project, a DNS blip). Neither is a reason for a stranger reading
 * the front page to see a 500.
 *
 * So a failure here is treated as "nobody is signed in": public pages render
 * as they do for a visitor, and the signed-in areas send you to /login,
 * which is what an expired session does anyway.
 */
export async function updateSession(request: NextRequest) {
  try {
    return await refreshSession(request);
  } catch {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }
}

async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/auth");

  if (!user && !isAuthRoute && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (
    request.nextUrl.hostname !== ADMIN_HOST &&
    user &&
    (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
