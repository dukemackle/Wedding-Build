import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Keeps the admin panel off the public domain entirely: the couple-facing
// site never serves /admin, and the admin panel only responds on its own
// subdomain. Cookies aren't shared across subdomains (no explicit cookie
// domain is set), so this is access separation, not shared auth -- signing
// in happens independently on admin.wrenwed.com.
const PUBLIC_HOSTS = ["wrenwed.com", "www.wrenwed.com"];
const ADMIN_HOST = "admin.wrenwed.com";

// Listings moved from /venues/<uuid> to /venues/<slug>. The page can't send a
// real 308 itself -- /venues streams behind a loading state, so a redirect
// there arrives as a meta refresh with a 200 -- so old links (admin, emails,
// bookmarks) are sent on here instead. One indexed lookup, only for uuids.
const OLD_LISTING_LINK = /^\/(venues|vendors)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

async function listingSlugRedirect(request: NextRequest): Promise<NextResponse | null> {
  const match = OLD_LISTING_LINK.exec(request.nextUrl.pathname);
  if (!match) return null;
  const [, table, id] = match;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=slug&id=eq.${id}&active=eq.true`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { slug?: string }[];
    const slug = rows[0]?.slug;
    if (!slug) return null;
    const url = request.nextUrl.clone();
    url.pathname = `/${table}/${slug}`;
    return NextResponse.redirect(url, 308);
  } catch {
    // Supabase unreachable, or 0090 not applied yet: the page still renders
    // the listing by uuid.
    return null;
  }
}

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
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/forgot-password") &&
    !pathname.startsWith("/reset-password")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  const moved = await listingSlugRedirect(request);
  if (moved) return moved;

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
