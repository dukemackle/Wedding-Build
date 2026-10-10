import type { Metadata, Viewport } from "next";
import { Cormorant, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { AssistantProvider } from "@/components/assistant-context";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import "./globals.css";
import { SITE_URL } from "@/lib/public-listings";

const cormorant = Cormorant({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono-numbers",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      // Sideways overflow is cut on <html>, not just <body>: iOS Safari lets a
      // page pan sideways past body's overflow-x-hidden, which shifted the
      // whole Venues screen left and chopped the first filter. Body uses
      // `clip` because `hidden` there would make it a scroll container once
      // html stops propagating it, and the sticky header would stop sticking.
      className={`${cormorant.variable} ${plexSans.variable} ${plexMono.variable} h-full overflow-x-hidden antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-clip bg-parchment text-ink font-body">
        <AssistantProvider>
          <PageTransition>{children}</PageTransition>
          <SiteFooter />
        </AssistantProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
