import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
