import type { NextConfig } from "next";

// Baseline security headers on every response. Framing is limited to our own
// pages (the guest-site editor and template gallery preview the site in an
// iframe), which stops another site from wrapping the admin or a guest site to
// trick clicks. HSTS leaves out includeSubDomains/preload until every
// subdomain is confirmed HTTPS-only. A full Content-Security-Policy is a
// separate change: it needs testing against maps, Drive picker and video
// embeds first.
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Marketplace "near me" asks for location on our own pages; nothing uses
  // the camera or microphone through the browser API (photo inputs are files).
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // Contacts and the old Wedding Plan page were merged into Bookings.
  // Temporary redirects, so browsers don't cache them if either path is reused.
  async redirects() {
    return [
      { source: "/contacts", destination: "/bookings", permanent: false },
      { source: "/wedding-plan", destination: "/bookings", permanent: false },
    ];
  },
  experimental: {
    // Server Actions default to a 1MB request body limit -- too small for
    // the 5MB photo uploads on the dashboard hero photo and guestbook
    // photo forms (src/app/dashboard/actions.ts, src/app/w/[slug]/actions.ts),
    // which was silently failing the whole request before it ever reached
    // those actions' own size check.
    serverActions: {
      bodySizeLimit: "6mb",
      // Next.js checks a Server Action POST's Origin header against the
      // app's own host to prevent CSRF, and 403s if they don't match --
      // seen live as "POST https://youdoido.com/dashboard 403 (Forbidden)"
      // on the hero photo upload. Needed because the app is served through
      // Cloudflare on this custom domain (and its admin subdomain), not
      // whatever host Next.js infers by default.
      allowedOrigins: ["youdoido.com", "admin.youdoido.com"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Vendor/venue photo URLs are pasted in by the admin (the owner),
      // not submitted by end users, so allowing any https host here
      // isn't an open image-proxy risk the way it would be for
      // user-submitted content.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
