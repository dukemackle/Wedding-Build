"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isInvitationTemplate } from "@/lib/save-the-date/invitations";
import { STALE_CARD, cardDocSchema, parseCardDoc } from "@/lib/save-the-date/schema";
import { MAX_INVITATIONS, templateById } from "@/lib/save-the-date/templates";
import { requireEditableWedding } from "@/lib/wedding-access";
import { invitationIdFor, lookFromCard } from "@/lib/suites";
import { logError } from "@/lib/error-log";
import { trackEvent } from "@/lib/events";
import { personalInvitationPath } from "@/lib/invite-codes";
import { getResendClient, INQUIRY_FROM_ADDRESS, undeliverableAmong } from "@/lib/resend";
import { MAX_PER_SEND, cardEmailHtml, cardEmailSubject, cardEmailText } from "@/lib/save-the-date/email";
import { cardWords } from "@/lib/save-the-date/guest-card";
import { greetingFor } from "@/lib/save-the-date/greeting";
import type { Guest } from "@/lib/supabase/types";

type Db = Awaited<ReturnType<typeof requireEditableWedding>>["supabase"];
import { invitationContent, newInvitation, type InvitationRow } from "./load";

const LIST = "/guests/invitations";

/**
 * Autosaves one invitation (via /api/invitation). `version` is the updated_at
 * the editor last saw; a row that has moved on since isn't overwritten.
 */
export async function saveInvitation(id: string, doc: unknown, version: string | null): Promise<{ error?: string; stale?: boolean; version?: string }> {
  const parsed = cardDocSchema.safeParse(doc);
  if (!parsed.success || !id || !isInvitationTemplate(parsed.data.template)) return { error: "That invitation couldn't be saved." };
  if (!version) return { error: STALE_CARD, stale: true };

  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { data, error } = await supabase
    .from("invitations")
    .update({ doc: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .eq("updated_at", version)
    .select("updated_at")
    .maybeSingle<{ updated_at: string }>();
  if (error) return { error: error.message };
  if (!data) return { error: STALE_CARD, stale: true };
  revalidatePath(LIST);
  return { version: data.updated_at };
}

/**
 * A new invitation on a design, carrying the words of their latest one (or,
 * for the first, their wedding details), then into the studio.
 */
export async function createInvitation(template: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { data: rows } = await supabase
    .from("invitations")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("updated_at", { ascending: false })
    .returns<InvitationRow[]>();
  const list = rows ?? [];
  if (list.length >= MAX_INVITATIONS) return { error: `You can keep ${MAX_INVITATIONS} designs. Delete one to start another.` };

  const latest = list.map((r) => parseCardDoc(r.doc)).find(Boolean) ?? null;
  const fresh = newInvitation(template, latest?.content ?? (await invitationContent(supabase, wedding)));
  const doc = latest ? { ...fresh, back: latest.back ?? fresh.back } : fresh;

  const { data, error } = await supabase
    .from("invitations")
    .insert({ wedding_id: wedding.id, doc, name: templateById(doc.template).name, chosen: !list.some((r) => r.chosen) })
    .select("id")
    .single<{ id: string }>();
  if (error) return { error: error.message };
  revalidatePath(LIST);
  redirect(`${LIST}/edit/${data.id}`);
}

/**
 * The invitation that matches one of their save-the-dates: the same suite's
 * design in the card's colourway and fonts, with the card's names, date and
 * place over their wedding details. Then into the studio.
 */
export async function createMatchingInvitation(cardId: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const [{ data: card }, { count }] = await Promise.all([
    supabase.from("save_the_dates").select("doc").eq("id", cardId).eq("wedding_id", wedding.id).maybeSingle<{ doc: unknown }>(),
    supabase.from("invitations").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id),
  ]);
  const from = card ? parseCardDoc(card.doc) : null;
  const template = from ? invitationIdFor(from) : null;
  if (!from || !template) return { error: "That save the date has no matching invitation." };
  if ((count ?? 0) >= MAX_INVITATIONS) return { error: `You can keep ${MAX_INVITATIONS} designs. Delete one to start another.` };

  const words = await invitationContent(supabase, wedding);
  const content = { ...words, date: from.content.date ?? words.date, nameA: from.content.nameA || words.nameA, nameB: from.content.nameB || words.nameB, place: from.content.place || words.place };
  const doc = { ...newInvitation(template, content), ...lookFromCard(from) };

  const { data, error } = await supabase
    .from("invitations")
    .insert({ wedding_id: wedding.id, doc, name: templateById(doc.template).name, chosen: !count })
    .select("id")
    .single<{ id: string }>();
  if (error) return { error: error.message };
  revalidatePath(LIST);
  redirect(`${LIST}/edit/${data.id}`);
}

export async function deleteInvitation(id: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const { data: gone, error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .select("chosen")
    .maybeSingle<{ chosen: boolean }>();
  if (error) return { error: error.message };
  // The next newest becomes the one they're using.
  if (gone?.chosen) {
    const { data: next } = await supabase
      .from("invitations")
      .select("id")
      .eq("wedding_id", wedding.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string }>();
    if (next) await supabase.from("invitations").update({ chosen: true }).eq("id", next.id);
  }
  revalidatePath(LIST);
  return {};
}

/**
 * Stores the invitation's picture (uploaded by the browser on a signed URL
 * from startSaveTheDatePhotoUpload) for the email and link previews.
 */
export async function setInvitationImage(id: string, path: string, version: string): Promise<{ error?: string; url?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const [folder, sub, name, ...rest] = path.split("/");
  if (folder !== wedding.id || sub !== "save-the-date" || !name || rest.length > 0) {
    return { error: "That picture doesn't belong to this wedding." };
  }
  const url = supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;
  const { error } = await supabase.from("invitations").update({ image_url: url, image_version: version }).eq("id", id).eq("wedding_id", wedding.id);
  if (error) return { error: error.message };
  return { url };
}

/** One invitation per wedding is the one guests' links show. */
async function makeChosen(supabase: Db, weddingId: string, id: string) {
  await supabase.from("invitations").update({ chosen: false }).eq("wedding_id", weddingId).eq("chosen", true).neq("id", id);
  await supabase.from("invitations").update({ chosen: true }).eq("id", id).eq("wedding_id", weddingId);
}

/**
 * Emails the invitation to these guests, each with their own link to it
 * (/w/<slug>/v/<code>), from which they RSVP. As sendSaveTheDates: the
 * couple confirms first, and guests without a working email are skipped.
 */
export async function sendInvitations(
  invitationId: string,
  guestIds: string[],
  origin: string,
): Promise<{ error?: string; sent?: number; skipped?: number; failed?: number }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  if (!wedding.public_slug) return { error: "Turn on your guest site first: your invitation links live at its address." };
  if (!process.env.RESEND_API_KEY) return { error: "Email sending isn't configured (missing RESEND_API_KEY)." };
  if (!Array.isArray(guestIds) || guestIds.length === 0) return { error: "Choose at least one guest." };
  if (guestIds.length > MAX_PER_SEND) return { error: `You can send up to ${MAX_PER_SEND} at a time.` };
  if (!/^https?:\/\/[^/]+$/.test(origin)) return { error: "That send didn't come from the app." };

  const [{ data: row }, { data: everyone }] = await Promise.all([
    supabase
      .from("invitations")
      .select("*")
      .eq("id", invitationId)
      .eq("wedding_id", wedding.id)
      .maybeSingle<InvitationRow & { image_url: string | null; image_version: string | null }>(),
    supabase.from("guests").select("*").eq("wedding_id", wedding.id).returns<Guest[]>(),
  ]);
  const doc = row ? parseCardDoc(row.doc) : null;
  if (!row || !doc) return { error: "Design your invitation first." };
  if (!row.image_url || row.image_version !== row.updated_at) {
    return { error: "Your invitation's picture is out of date. Try sending again." };
  }

  const chosen = (everyone ?? []).filter((g) => guestIds.includes(g.id));
  const withEmail = chosen.filter((g) => g.email?.trim());
  const bounced = await undeliverableAmong(withEmail.map((g) => g.email!));
  const deliverable = withEmail.filter((g) => !bounced.has(g.email!.trim().toLowerCase()));
  const skipped = guestIds.length - deliverable.length;
  if (!deliverable.length) return { error: "None of those guests have an email that works.", skipped };

  const { names, when } = cardWords(doc);
  const from = INQUIRY_FROM_ADDRESS.replace(/^[^<]*/, `${names.replace(/[<>"]/g, "")} via You Do, I Do `);
  const emails = deliverable.map((g) => {
    const e = {
      greeting: greetingFor(g, everyone ?? []),
      names,
      when,
      place: [doc.content.venue, doc.content.place].filter(Boolean).join(", "),
      url: `${origin}${personalInvitationPath(wedding.public_slug!, g.invite_code)}`,
      imageUrl: row.image_url!,
      invitation: true,
    };
    return {
      from,
      to: g.email!.trim(),
      // Replies reach the couple; nothing receives at the from address.
      replyTo: user.email,
      subject: cardEmailSubject(e),
      html: cardEmailHtml(e),
      text: cardEmailText(e),
    };
  });

  try {
    const { data, error } = await getResendClient().batch.send(emails);
    if (error || !data) {
      await logError("planning", "sendInvitations", error ?? "no data");
      return { error: "Couldn't send right now. Nothing went out; please try again.", skipped };
    }
  } catch (e) {
    await logError("planning", "sendInvitations", e);
    return { error: "Couldn't send right now. Nothing went out; please try again.", skipped };
  }

  await supabase
    .from("guests")
    .update({ inv_sent_at: new Date().toISOString() })
    .in(
      "id",
      deliverable.map((g) => g.id),
    );
  if (!row.chosen) await makeChosen(supabase, wedding.id, row.id);
  trackEvent("invitations_sent", { weddingId: wedding.id, userId: user.id });
  revalidatePath(LIST, "layout");
  return { sent: deliverable.length, skipped, failed: 0 };
}
