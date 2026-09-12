import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Server Actions default to a 1MB request body limit -- too small for
    // the 5MB photo uploads on the dashboard hero photo and guestbook
    // photo forms (src/app/dashboard/actions.ts, src/app/w/[slug]/actions.ts),
    // which was silently failing the whole request before it ever reached
    // those actions' own size check.
    serverActions: {
      bodySizeLimit: "6mb",
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
