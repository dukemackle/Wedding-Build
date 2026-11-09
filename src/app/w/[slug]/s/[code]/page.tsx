import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findHousehold } from "@/lib/households";
import { normalizeInviteCode, personalRsvpPath } from "@/lib/invite-codes";
import { loadGuestCard } from "@/lib/save-the-date/guest-card";
import { GuestReveal } from "../guest-reveal";
import { cardMetadata } from "../metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return cardMetadata(await loadGuestCard(slug));
}

/**
 * A guest's save-the-date: /w/<slug>/s/<code>, the link in their email or
 * text. The envelope is addressed to their household; the website button
 * opens the site through their invite link, so a password-protected site
 * opens too (a real code is proof of invitation, owner decision 2026-10-27).
 */
export default async function GuestSaveTheDate({ params }: { params: Promise<{ slug: string; code: string }> }) {
  const { slug, code: raw } = await params;
  const card = await loadGuestCard(slug);
  if (!card) redirect(`/w/${encodeURIComponent(slug)}`);
  const code = normalizeInviteCode(raw);
  const household = code ? await findHousehold(card.wedding.id, code) : null;
  if (!code || !household) redirect(`/w/${encodeURIComponent(slug)}/s`);

  const names = household.members.map((m) => m.name.trim()).filter(Boolean);
  // Never the household text: that's the couple's own label ("Okafor (mom)").
  const guest = names.length && names.length <= 2 ? names.join(" & ") : household.names;

  return (
    <GuestReveal
      doc={card.doc}
      guest={guest}
      siteHref={`${personalRsvpPath(slug, code)}?to=site`}
      rsvpHref={personalRsvpPath(slug, code)}
      fontsHref={card.fontsHref}
      slug={slug}
      code={code}
    />
  );
}
