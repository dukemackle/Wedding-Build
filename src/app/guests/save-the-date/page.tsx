import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CardHome } from "./card-home";
import { loadCard } from "./load-card";
import { NoWedding } from "./no-wedding";

export const metadata: Metadata = { title: "Save the date" };

/**
 * Guests › Save the date: the couple's card (with how far sending has got)
 * and every design to start from, like the guest site's home. A card opens in
 * the studio at /guests/save-the-date/edit; a design opens it with ?t=.
 */
export default async function SaveTheDateHomePage() {
  const card = await loadCard();
  if (!card.wedding) {
    return (
      <PageShell email={card.user.email ?? ""} width="reading">
        <NoWedding />
      </PageShell>
    );
  }

  const { data: guests } = await card.supabase
    .from("guests")
    .select("std_sent_at, std_opened_at")
    .eq("wedding_id", card.wedding.id)
    .returns<{ std_sent_at: string | null; std_opened_at: string | null }[]>();

  return (
    <PageShell email={card.user.email ?? ""} width="wide">
      <CardHome
        card={card.card}
        updatedAt={card.row?.updated_at ?? null}
        canEdit={card.canEdit}
        sent={(guests ?? []).filter((g) => g.std_sent_at).length}
        opened={(guests ?? []).filter((g) => g.std_opened_at).length}
      />
    </PageShell>
  );
}
