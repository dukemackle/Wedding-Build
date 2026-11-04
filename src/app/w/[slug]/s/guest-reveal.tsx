"use client";

import { Reveal } from "@/components/save-the-date/reveal";
import { siteAddress } from "@/lib/save-the-date/back";
import type { CardDoc } from "@/lib/save-the-date/types";

/**
 * The guest's envelope. Opening it tells us this household has seen their
 * card ("Opened" on the couple's send list). Only the tap counts, not the
 * page loading, because text and chat apps load links to draw previews.
 */
export function GuestReveal({
  doc,
  guest,
  siteHref,
  rsvpHref,
  fontsHref,
  slug,
  code,
}: {
  doc: CardDoc;
  guest: string;
  siteHref: string;
  rsvpHref?: string;
  fontsHref: string;
  slug: string;
  code?: string;
}) {
  const opened = () => {
    if (!code) return;
    fetch("/api/save-the-date/opened", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, code }),
      keepalive: true,
    }).catch(() => {});
  };
  return (
    <div className="flex min-h-dvh flex-col">
      <link rel="stylesheet" href={fontsHref} precedence="default" />
      <Reveal doc={doc} guest={guest} siteHref={siteHref} rsvpHref={rsvpHref} site={siteAddress(slug)} onOpen={opened} />
    </div>
  );
}
