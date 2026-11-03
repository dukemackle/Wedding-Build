import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { undeliverableAmong } from "@/lib/resend";
import { cardFontsHref } from "@/lib/save-the-date/guest-card";
import { parseCardDoc } from "@/lib/save-the-date/schema";
import { createClient } from "@/lib/supabase/server";
import type { Guest, SaveTheDateRow, Wedding } from "@/lib/supabase/types";
import { canEditWedding } from "@/lib/wedding-access";
import { SendPanel, type SendGuest } from "./send-panel";

export const metadata: Metadata = { title: "Send your save the date" };

/**
 * Guests › Save the date › Send: every guest with their status (not sent,
 * emailed, opened, bounced), a personal link to copy or share, and email for
 * the ones the couple picks, after a confirm step.
 */
export default async function SendSaveTheDatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();
  if (!wedding) redirect("/guests/save-the-date");

  const [{ data: row }, { data: guests }, canEdit] = await Promise.all([
    supabase.from("save_the_dates").select("*").eq("wedding_id", wedding.id).maybeSingle<SaveTheDateRow>(),
    supabase
      .from("guests")
      .select("*")
      .eq("wedding_id", wedding.id)
      .order("household", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })
      .returns<Guest[]>(),
    canEditWedding(supabase, wedding, user.id),
  ]);
  const doc = row ? parseCardDoc(row.doc) : null;

  if (!row || !doc) {
    return (
      <PageShell email={user.email ?? ""} width="reading">
        <div className="rounded-lg border border-hairline bg-card p-6 text-center shadow-sm sm:p-10">
          <h1 className="font-display text-3xl font-semibold text-forest">Design your card first</h1>
          <p className="mt-4 text-ink/70">Pick a design and add your details, then come back here to send it.</p>
          <Link
            href="/guests/save-the-date"
            className="mt-6 inline-block rounded-md bg-forest px-4 py-2 font-medium text-parchment transition-colors hover:bg-forest/90"
          >
            Open the studio
          </Link>
        </div>
      </PageShell>
    );
  }

  const list = guests ?? [];
  const bounced = await undeliverableAmong(list.flatMap((g) => (g.email ? [g.email] : [])));
  const rows: SendGuest[] = list.map((g) => ({
    id: g.id,
    name: g.name,
    household: g.household?.trim() || null,
    email: g.email?.trim() || null,
    code: g.invite_code,
    sentAt: g.std_sent_at,
    openedAt: g.std_opened_at,
    bounced: !!g.email && bounced.has(g.email.trim().toLowerCase()),
  }));

  return (
    <PageShell email={user.email ?? ""} width="wide">
      <SendPanel
        doc={doc}
        version={row.updated_at}
        imageVersion={row.image_version}
        fontsHref={cardFontsHref(doc)}
        slug={wedding.public_slug}
        locked={Boolean(wedding.site_password_hash)}
        guests={rows}
        canEdit={canEdit}
        replyTo={user.email ?? ""}
      />
    </PageShell>
  );
}
