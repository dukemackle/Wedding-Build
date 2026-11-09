import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { AssistantProvider } from "@/components/assistant-context";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import { SkipLink } from "@/components/skip-link";
import { FirstTouch } from "@/components/first-touch";
import "./globals.css";
import { SITE_URL } from "@/lib/public-listings";

// Self-hosted (latin subset, OFL-licensed files from Fontsource) rather than
// next/font/google: the Google download at build time kept failing Cloudflare
// builds (deploy-doctor #2). Arguments must stay literals for next/font.
const cormorant = localFont({
  variable: "--font-display",
  src: [
    { path: "./fonts/cormorant-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/cormorant-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/cormorant-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

const plexSans = localFont({
  variable: "--font-body",
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

const plexMono = localFont({
  variable: "--font-mono-numbers",
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
});

export const metadata: Metadata = {
  // Resolves relative canonical and share-image URLs on every page.
  metadataBase: new URL(SITE_URL),
  title: { default: "You Do, I Do", template: "%s | You Do, I Do" },
  openGraph: { siteName: "You Do, I Do", locale: "en_US" },
  description: "Plan your wedding budget, venues, guests, and vendors in one place.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "You Do, I Do",
  },
};

export const viewport: Viewport = {
  themeColor: "#14203d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-parchment text-ink font-body">
        <SkipLink />
        <AssistantProvider>
          <PageTransition>{children}</PageTransition>
          <SiteFooter />
        </AssistantProvider>
        <RegisterServiceWorker />
        <FirstTouch />
      </body>
    </html>
  );
}
