import type { Metadata, Viewport } from "next";
import { Cormorant, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { AssistantProvider } from "@/components/assistant-context";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import "./globals.css";

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
  title: "Wren",
  description: "Plan your wedding budget, venues, guests, and vendors in one place.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wren",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b4a3a",
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
        <AssistantProvider>
          <PageTransition>{children}</PageTransition>
          <SiteFooter />
        </AssistantProvider>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
