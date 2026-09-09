import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Keeps the admin panel off the public domain entirely: the couple-facing
// site never serves /admin, and the admin panel only responds on its own
// subdomain. Cookies aren't shared across subdomains (no explicit cookie
// domain is set), so this is access separation, not shared auth -- signing
// in happens independently on admin.wrenwed.com.
const PUBLIC_HOSTS = ["wrenwed.com", "www.wrenwed.com"];
const ADMIN_HOST = "admin.wrenwed.com";

export async function proxy(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;

  if (PUBLIC_HOSTS.includes(hostname) && pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (
    hostname === ADMIN_HOST &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
