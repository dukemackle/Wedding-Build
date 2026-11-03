import "server-only";
import { cache } from "react";
import { fontById, fontsHrefFor } from "@/lib/site-design";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { SaveTheDateRow } from "@/lib/supabase/types";
import { formatDate } from "./format";
import { parseCardDoc } from "./schema";
import { templateById } from "./templates";
import type { CardDoc } from "./types";

type CardWedding = {
  id: string;
  user_id: string;
  member_ids: string[] | null;
  public_slug: string;
  site_password_hash: string | null;
};

export type GuestCard = {
  wedding: CardWedding;
  doc: CardDoc;
  imageUrl: string | null;
  /** "Alex & Jordan". */
  names: string;
  /** The date as the card shows it, for titles and the email. */
  when: string;
  /** Only this card's own faces, not the studio's whole library. */
  fontsHref: string;
};

/**
 * A wedding's save-the-date as guests get it, read with the service role:
 * guests aren't signed in, and the card has no public view of its own. Only
 * what the couple put on the card leaves here.
 */
export const loadGuestCard = cache(async (slug: string): Promise<GuestCard | null> => {
  const admin = createAdminSupabaseClient();
  const { data: wedding } = await admin
    .from("weddings")
    .select("id, user_id, member_ids, public_slug, site_password_hash")
    .eq("public_slug", slug)
    .maybeSingle<CardWedding>();
  if (!wedding) return null;
  const { data: row } = await admin
    .from("save_the_dates")
    .select("*")
    .eq("wedding_id", wedding.id)
    .maybeSingle<SaveTheDateRow>();
  const doc = row ? parseCardDoc(row.doc) : null;
  if (!row || !doc) return null;
  return { wedding, doc, imageUrl: row.image_url, ...cardWords(doc), fontsHref: cardFontsHref(doc) };
});

/** The couple's names and the date, as the card reads them. */
export function cardWords(doc: CardDoc) {
  const c = doc.content;
  const names = [c.nameA, c.nameB].map((n) => n.trim()).filter(Boolean).join(" & ") || "Our wedding";
  const when = c.dateText.trim() || (c.date ? formatDate(c.date, "long") : "");
  return { names, when };
}

/** The Google Fonts stylesheet for the faces this card uses. */
export function cardFontsHref(doc: CardDoc) {
  const t = templateById(doc.template);
  const pairing = t.pairings.find((p) => p.id === doc.fonts) ?? t.pairings[0];
  const ids = [pairing.display, pairing.script, pairing.sans, ...Object.values(doc.overrides).flatMap((o) => (o.font ? [o.font] : []))];
  return fontsHrefFor(ids.map((id) => fontById(id)?.css ?? ""));
}

/** Whether this signed-in user is one of the couple (their own visits aren't "opened"). */
export function isCouple(wedding: CardWedding, userId: string | undefined) {
  return !!userId && (wedding.user_id === userId || (wedding.member_ids ?? []).includes(userId));
}
