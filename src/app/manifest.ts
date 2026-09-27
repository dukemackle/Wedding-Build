import type { MetadataRoute } from "next";

// Lets a couple (or a guest) install Wren to their phone's home screen --
// standalone display, no browser chrome, opens straight to the dashboard.
// Next.js serves this automatically at /manifest.webmanifest and links it
// in every page's <head>, no extra wiring needed.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "You Do, I Do",
    short_name: "You Do, I Do",
    description: "Plan your wedding budget, venues, guests, and vendors in one place.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#14203d",
    // Two separate files on purpose. Android crops a maskable icon to a circle
    // or squircle, so anything outside the centre 80% can be cut off -- the
    // maskable variant is full-bleed parchment with the disc pulled inside
    // that safe zone. The "any" icon keeps its transparent corners, which is
    // what looks right everywhere a maskable crop isn't applied.
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
