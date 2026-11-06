import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { undeliverableAmong } from "@/lib/resend";
import { cardFontsHref } from "@/lib/save-the-date/guest-card";
import type { Guest } from "@/lib/supabase/types";
import { SendPanel, type SendGuest } from "../../save-the-date/send/send-panel";
import { NoWedding } from "../../save-the-date/no-wedding";
import { loadInvitations } from "../load";

export const metadata: Metadata = { title: "Send your invitation" };

/**
 * Guests › Invitations › Send: every guest with their invitation's status, a
 * personal link to copy or share, and email for the ones the couple picks,
 * after a confirm step. The save-the-date's send screen, for the invitation.
 */
export default async function SendInvitationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ card: wanted }, loaded] = await Promise.all([searchParams, loadInvitations()]);
  if (!loaded.wedding) {
    return (
      <PageShell email={loaded.user.email ?? ""} width="reading">
        <NoWedding />
      </PageShell>
    );
  }
  const { supabase, wedding, invitations, user } = loaded;
  // The design asked for (Send in the studio), else the one guests see, else the newest.
  const inv = invitations.find((c) => c.id === wanted) ?? invitations.find((c) => c.chosen) ?? invitations[0] ?? null;

  if (!inv) {
    return (
      <PageShell email={user.email ?? ""} width="reading">
        <div className="rounded-lg border border-hairline bg-card p-6 text-center shadow-sm sm:p-10">
          <h1 className="font-display text-3xl font-semibold text-forest">Design your invitation first</h1>
          <p className="mt-4 text-ink/70">Pick a design and check your details, then come back here to send it.</p>
          <Link
            href="/guests/invitations"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Pick a design
          </Link>
        </div>
      </PageShell>
    );
  }

  const [{ data: guests }, { data: image }] = await Promise.all([
    supabase
      .from("guests")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("household", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })
      .returns<Guest[]>(),
    supabase.from("invitations").select("image_version").eq("id", inv.id).maybeSingle<{ image_version: string | null }>(),
  ]);
  const list = guests ?? [];
  const bounced = await undeliverableAmong(list.flatMap((g) => (g.email ? [g.email] : [])));
  const rows: SendGuest[] = list.map((g) => ({
    id: g.id,
    name: g.name,
    household: g.household?.trim() || null,
    email: g.email?.trim() || null,
    code: g.invite_code,
    sentAt: g.inv_sent_at ?? null,
    openedAt: g.inv_opened_at ?? null,
    bounced: !!g.email && bounced.has(g.email.trim().toLowerCase()),
  }));

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <SendPanel
        invitation
        cardId={inv.id}
        cardName={inv.name}
        chosen={inv.chosen}
        doc={inv.doc}
        version={inv.updatedAt}
        imageVersion={image?.image_version ?? null}
        fontsHref={cardFontsHref(inv.doc)}
        slug={wedding.public_slug}
        locked={Boolean(wedding.site_password_hash)}
        guests={rows}
        canEdit={loaded.canEdit}
        replyTo={user.email ?? ""}
      />
    </PageShell>
  );
}
