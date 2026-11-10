import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { NoWedding } from "../save-the-date/no-wedding";
import { InvitationHome } from "./invitation-home";
import { invitationContent, loadInvitations } from "./load";
import { suiteCard } from "../save-the-date/load-card";

export const metadata: Metadata = { title: "Invitations" };

/** Guests › Invitations: the couple's designs and every design to start one from. */
export default async function InvitationsPage() {
  const loaded = await loadInvitations();
  if (!loaded.wedding) {
    return (
      <PageShell email={loaded.user.email ?? ""} width="reading">
        <NoWedding />
      </PageShell>
    );
  }
  const [words, card] = await Promise.all([
    invitationContent(loaded.supabase, loaded.wedding),
    suiteCard(loaded.supabase, loaded.wedding.id),
  ]);
  return (
    <PageShell email={loaded.user.email ?? ""} width="wide">
      <InvitationHome
        invitations={loaded.invitations}
        canEdit={loaded.canEdit}
        words={words}
        matchCard={card}
        rsvpOpensOn={loaded.wedding.rsvp_opens_on && loaded.wedding.rsvp_opens_on > new Date().toISOString().slice(0, 10) ? loaded.wedding.rsvp_opens_on : null}
      />
    </PageShell>
  );
}
