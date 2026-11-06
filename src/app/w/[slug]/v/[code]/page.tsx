import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findHousehold } from "@/lib/households";
import { normalizeInviteCode, personalRsvpPath } from "@/lib/invite-codes";
import { loadGuestInvitation } from "@/lib/save-the-date/guest-card";
import { GuestReveal } from "../../s/guest-reveal";
import { cardMetadata } from "../../s/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return cardMetadata(await loadGuestInvitation(slug));
}

/**
 * A guest's invitation: /w/<slug>/v/<code>, the link in their invitation
 * email. The envelope is addressed to their household; RSVP opens their own
 * reply form through their invite link, as the save-the-date's does.
 */
export default async function GuestInvitation({ params }: { params: Promise<{ slug: string; code: string }> }) {
  const { slug, code: raw } = await params;
  const card = await loadGuestInvitation(slug);
  if (!card) redirect(`/w/${encodeURIComponent(slug)}`);
  const code = normalizeInviteCode(raw);
  const household = code ? await findHousehold(card.wedding.id, code) : null;
  if (!code || !household) redirect(`/w/${encodeURIComponent(slug)}`);

  const names = household.members.map((m) => m.name.trim()).filter(Boolean);
  const guest = names.length && names.length <= 2 ? names.join(" & ") : household.label;

  return (
    <GuestReveal
      doc={card.doc}
      guest={guest}
      siteHref={`${personalRsvpPath(slug, code)}?to=site`}
      rsvpHref={personalRsvpPath(slug, code)}
      fontsHref={card.fontsHref}
      slug={slug}
      code={code}
      invitation
    />
  );
}
