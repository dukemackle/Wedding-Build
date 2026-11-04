import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { PageShell } from "@/components/page-shell";
import { SaveTheDateStudio } from "@/components/save-the-date/studio";
import { loadCards, photoLibrary } from "../../load-card";
import { NoWedding } from "../../no-wedding";
import { CARDS_LIST_HREF } from "../../resume";
import { RememberCard } from "../../remember-card";

export const metadata: Metadata = { title: "Save the date" };

/**
 * Guests › Save the date › one design: the Save the Date Studio on that
 * card. Every change autosaves (see /api/save-the-date).
 */
export default async function EditSaveTheDatePage({ params }: { params: Promise<{ id: string }> }) {
  const [loaded, { id }] = await Promise.all([loadCards(), params]);
  if (!loaded.wedding) {
    return (
      <PageShell email={loaded.user.email ?? ""} width="reading">
        <NoWedding />
      </PageShell>
    );
  }
  const card = loaded.cards.find((c) => c.id === id);
  if (!card) notFound();
  const photos = await photoLibrary(loaded.supabase, loaded.wedding);

  return (
    <main className="flex flex-1 flex-col pt-16">
      <RememberCard id={card.id} />
      <AppNav email={loaded.user.email ?? ""} />
      <div className="border-t border-hairline">
        <SaveTheDateStudio
          key={card.id}
          cardId={card.id}
          title={card.name}
          initial={card.doc}
          version={card.updatedAt}
          persist={loaded.canEdit}
          photos={photos}
          backHref={CARDS_LIST_HREF}
          backLabel="Designs"
          sendHref={`/guests/save-the-date/send?card=${card.id}`}
          note="View only · ask the owner for edit access to change the card"
        />
      </div>
    </main>
  );
}
