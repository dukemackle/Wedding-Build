import type { Metadata } from "next";
import { Cormorant, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { PageTransition } from "@/components/page-transition";
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
  title: "The Wedding Ledger",
  description: "Plan your wedding budget, venues, guests, and vendors in one place.",
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
      <body className="min-h-full flex flex-col bg-parchment text-ink font-body">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
