import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/page-shell";
import { SaveTheDateStudio } from "@/components/save-the-date/studio";
import { siteAddress } from "@/lib/save-the-date/back";
import { NoWedding } from "../../../save-the-date/no-wedding";
import { loadInvitations } from "../../load";

export const metadata: Metadata = { title: "Invitation" };

/** Guests › Invitations › one design, in the studio. Every change autosaves (see /api/invitation). */
export default async function EditInvitationPage({ params }: { params: Promise<{ id: string }> }) {
  const [loaded, { id }] = await Promise.all([loadInvitations(), params]);
  if (!loaded.wedding) {
    return (
      <PageShell email={loaded.user.email ?? ""} width="reading">
        <NoWedding />
      </PageShell>
    );
  }
  const inv = loaded.invitations.find((c) => c.id === id);
  if (!inv) notFound();

  return (
    <main className="flex flex-1 flex-col pt-16">
      <AppNav email={loaded.user.email ?? ""} />
      <div className="border-t border-hairline">
        <SaveTheDateStudio
          key={inv.id}
          cardId={inv.id}
          title={inv.name}
          initial={inv.doc}
          version={inv.updatedAt}
          persist={loaded.canEdit}
          site={loaded.wedding.public_slug ? siteAddress(loaded.wedding.public_slug) : null}
          backHref="/guests/invitations"
          backLabel="Designs"
          sendHref={`/guests/invitations/send?card=${inv.id}`}
          note="View only · ask the owner for edit access to change the invitation"
        />
      </div>
    </main>
  );
}
