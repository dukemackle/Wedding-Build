import type { Metadata } from "next";
import type { GuestCard } from "@/lib/save-the-date/guest-card";
import { isInvitationTemplate } from "@/lib/save-the-date/invitations";

/**
 * What a texted save-the-date link unfurls into: the card itself, names and
 * date. Kept out of search either way.
 */
export function cardMetadata(card: GuestCard | null): Metadata {
  if (!card) return { robots: { index: false, follow: false } };
  const title = `${isInvitationTemplate(card.doc.template) ? "You're invited" : "Save the date"} · ${card.names}`;
  const description = [card.when, card.doc.content.place].filter(Boolean).join(" · ") || "Save the date!";
  const images = card.imageUrl ? [{ url: card.imageUrl, width: 1200, height: 1680 }] : undefined;
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images: card.imageUrl ? [card.imageUrl] : undefined },
  };
}
