import type { MetadataRoute } from "next";

// Lets a couple (or a guest) install Wren to their phone's home screen --
// standalone display, no browser chrome, opens straight to the dashboard.
// Next.js serves this automatically at /manifest.webmanifest and links it
// in every page's <head>, no extra wiring needed.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wren",
    short_name: "Wren",
    description: "Plan your wedding budget, venues, guests, and vendors in one place.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#0b4a3a",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
