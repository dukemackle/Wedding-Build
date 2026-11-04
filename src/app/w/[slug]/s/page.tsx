import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadGuestCard } from "@/lib/save-the-date/guest-card";
import { GuestReveal } from "./guest-reveal";
import { cardMetadata } from "./metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = await loadGuestCard(slug);
  return cardMetadata(card && !card.wedding.site_password_hash ? card : null);
}

/**
 * The save-the-date without a guest's code: the link a couple posts in a
 * group chat or on social. A password-protected site keeps its card behind
 * personal links only, so this goes to the site's gate instead.
 */
export default async function SharedSaveTheDate({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await loadGuestCard(slug);
  if (!card || card.wedding.site_password_hash) redirect(`/w/${encodeURIComponent(slug)}`);
  return <GuestReveal doc={card.doc} guest="For you" siteHref={`/w/${encodeURIComponent(slug)}`} fontsHref={card.fontsHref} slug={slug} />;
}
