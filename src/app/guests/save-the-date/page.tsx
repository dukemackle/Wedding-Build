import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CardHome } from "./card-home";
import { loadCards } from "./load-card";
import { NoWedding } from "./no-wedding";

export const metadata: Metadata = { title: "Save the date" };

/**
 * Guests › Save the date: the couple's designs (the one guests see marked)
 * and every template to start another from, like the guest site's home.
 * Each design opens in the studio at /guests/save-the-date/edit/[id].
 */
export default async function SaveTheDateHomePage() {
  const loaded = await loadCards();
  if (!loaded.wedding) {
    return (
      <PageShell email={loaded.user.email ?? ""} width="reading">
        <NoWedding />
      </PageShell>
    );
  }

  const { data: guests } = await loaded.supabase
    .from("guests")
    .select("std_sent_at, std_opened_at")
    .eq("wedding_id", loaded.wedding.id)
    .returns<{ std_sent_at: string | null; std_opened_at: string | null }[]>();
  const w = loaded.wedding;

  return (
    <PageShell email={loaded.user.email ?? ""} width="wide">
      <CardHome
        cards={loaded.cards}
        canEdit={loaded.canEdit}
        sent={(guests ?? []).filter((g) => g.std_sent_at).length}
        opened={(guests ?? []).filter((g) => g.std_opened_at).length}
        sample={{
          nameA: w.partner_a_name ?? "",
          nameB: w.partner_b_name ?? "",
          date: w.wedding_date,
          dateText: "",
          place: [w.own_venue_city, w.own_venue_state ?? w.state].filter(Boolean).join(", "),
          note: "Formal invitation to follow",
          headline: "",
        }}
        bannerPhoto={w.hero_photo_url}
      />
    </PageShell>
  );
}
