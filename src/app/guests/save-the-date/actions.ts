"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/error-log";
import { trackEvent } from "@/lib/events";
import { personalCardPath } from "@/lib/invite-codes";
import { getResendClient, INQUIRY_FROM_ADDRESS, undeliverableAmong } from "@/lib/resend";
import { MAX_PER_SEND, cardEmailHtml, cardEmailSubject, cardEmailText } from "@/lib/save-the-date/email";
import { cardWords } from "@/lib/save-the-date/guest-card";
import { STALE_CARD, cardDocSchema, parseCardDoc } from "@/lib/save-the-date/schema";
import { MAX_CARDS, newCard, templateById } from "@/lib/save-the-date/templates";
import type { CardDoc } from "@/lib/save-the-date/types";
import type { Guest, SaveTheDateRow } from "@/lib/supabase/types";
import { starterCard } from "./load-card";
import { requireEditableWedding } from "@/lib/wedding-access";


type Saved = { error?: string; stale?: boolean; version?: string };

/**
 * Saves one of the couple's cards (Guests › Save the date). `version` is the
 * updated_at the editor last saw: when the row has moved on since, nothing
 * is written, so one device's stale copy can't overwrite the other's work.
 * Cards are created by createCard, never here.
 */
export async function saveSaveTheDate(id: string, doc: unknown, version: string | null): Promise<Saved> {
  const parsed = cardDocSchema.safeParse(doc);
  if (!parsed.success || !id) return { error: "That card couldn't be saved." };
  if (!version) return { error: STALE_CARD, stale: true };

  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { data, error } = await supabase
    .from("save_the_dates")
    .update({ doc: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .eq("updated_at", version)
    .select("updated_at")
    .maybeSingle<{ updated_at: string }>();
  if (error) return { error: error.message };
  if (!data) return { error: STALE_CARD, stale: true };
  revalidatePath("/guests/save-the-date");
  return { version: data.updated_at };
}

/**
 * A new card: a copy of one of theirs (`copyOf`), or a design (`template`)
 * carrying the words and photo of their latest card, or of their wedding
 * details when it's their first. The first card is the one guests see.
 */
export async function createCard(from: {
  template?: string;
  copyOf?: string;
  /** The banner photo's proportions, measured in the browser, for a first card. */
  aspect?: number;
}): Promise<{ error?: string; id?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { data: cards } = await supabase
    .from("save_the_dates")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("updated_at", { ascending: false })
    .returns<SaveTheDateRow[]>();
  const list = cards ?? [];
  if (list.length >= MAX_CARDS) return { error: `You can keep ${MAX_CARDS} designs. Delete one to start another.` };

  let doc: CardDoc | null = null;
  let name: string;
  if (from.copyOf) {
    const source = list.find((c) => c.id === from.copyOf);
    doc = source ? parseCardDoc(source.doc) : null;
    if (!source || !doc) return { error: "That design couldn't be copied." };
    name = `${source.name} copy`.slice(0, 60);
  } else {
    const latest = list.map((c) => parseCardDoc(c.doc)).find(Boolean) ?? null;
    const starter = latest ? null : await starterCard(supabase, wedding);
    const aspect = typeof from.aspect === "number" && from.aspect > 0 && from.aspect <= 10 ? from.aspect : null;
    const base =
      latest ?? { ...starter!, photo: starter!.photo && aspect ? { ...starter!.photo, aspect } : null };
    const t = from.template ? templateById(from.template) : templateById(base.template);
    doc = latest || from.template ? newCard(t.id, base.content, base.photo, false) : base;
    name = templateById(doc.template).name;
  }

  const { data, error } = await supabase
    .from("save_the_dates")
    .insert({ wedding_id: wedding.id, doc, name, chosen: !list.some((c) => c.chosen) })
    .select("id")
    .single<{ id: string }>();
  if (error) return { error: error.message };
  revalidatePath("/guests/save-the-date");
  return { id: data.id };
}

export async function renameCard(id: string, name: string): Promise<{ error?: string }> {
  const clean = name.trim().slice(0, 60);
  if (!clean) return { error: "Give it a name." };
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const { error } = await supabase.from("save_the_dates").update({ name: clean }).eq("id", id).eq("wedding_id", wedding.id);
  if (error) return { error: error.message };
  revalidatePath("/guests/save-the-date");
  return {};
}

/** Makes this the card guests see at their links (sending a card does the same). */
export async function chooseCard(id: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const error = await makeChosen(supabase, wedding.id, id);
  if (error) return { error };
  revalidatePath("/guests/save-the-date");
  return {};
}

/** Deletes a card. The one guests see can go only while it's the last, or before anything's been sent. */
export async function deleteCard(id: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const [{ data: cards }, { count: sent }] = await Promise.all([
    supabase
      .from("save_the_dates")
      .select("id, chosen")
      .eq("wedding_id", wedding.id)
      .order("updated_at", { ascending: false })
      .returns<{ id: string; chosen: boolean }[]>(),
    supabase.from("guests").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id).not("std_sent_at", "is", null),
  ]);
  const card = (cards ?? []).find((c) => c.id === id);
  if (!card) return { error: "That design is already gone." };
  const next = (cards ?? []).find((c) => c.id !== id);
  if (card.chosen && next && sent) return { error: "Guests see this one at their link. Make another the one guests see first." };

  const { error } = await supabase.from("save_the_dates").delete().eq("id", id).eq("wedding_id", wedding.id);
  if (error) return { error: error.message };
  if (card.chosen && next) await makeChosen(supabase, wedding.id, next.id);
  revalidatePath("/guests/save-the-date");
  return {};
}

type Db = Awaited<ReturnType<typeof requireEditableWedding>>["supabase"];

/** One chosen card per wedding (a unique index), so the old one is cleared first. */
async function makeChosen(supabase: Db, weddingId: string, id: string): Promise<string | null> {
  const { data: card } = await supabase.from("save_the_dates").select("id").eq("id", id).eq("wedding_id", weddingId).maybeSingle();
  if (!card) return "That design couldn't be found.";
  const cleared = await supabase.from("save_the_dates").update({ chosen: false }).eq("wedding_id", weddingId).eq("chosen", true).neq("id", id);
  if (cleared.error) return cleared.error.message;
  const set = await supabase.from("save_the_dates").update({ chosen: true }).eq("id", id);
  return set.error?.message ?? null;
}

/**
 * A signed URL for the browser to put the card's photo straight into
 * Storage (the dashboard photos' route, so the bytes never pass through the
 * Worker). The bucket enforces size and type (migration 0152).
 */
export async function startSaveTheDatePhotoUpload(
  fileName: string,
): Promise<{ error?: string; path?: string; signedUrl?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const extension = /\.([a-z0-9]{1,5})$/i.exec(fileName)?.[1]?.toLowerCase() ?? "jpg";
  const path = `${wedding.id}/save-the-date/${randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage.from("wedding-photos").createSignedUploadUrl(path);
  if (error || !data) {
    await logError("planning", "startSaveTheDatePhotoUpload", error ?? "no signed URL");
    return { error: "Couldn't start the upload. Please try again." };
  }
  return { path: data.path, signedUrl: data.signedUrl };
}

/** The public URL of a photo just uploaded for this wedding's card. */
export async function saveTheDatePhotoUrl(path: string): Promise<{ error?: string; url?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const [folder, sub, name, ...rest] = path.split("/");
  if (folder !== wedding.id || sub !== "save-the-date" || !name || rest.length > 0) {
    return { error: "That photo doesn't belong to this wedding." };
  }
  return { url: supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl };
}

/**
 * Stores the card's picture (uploaded by the browser on a signed URL from
 * startSaveTheDatePhotoUpload) for the email and link previews, with the
 * card version it shows.
 */
export async function setSaveTheDateImage(id: string, path: string, version: string): Promise<{ error?: string; url?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const [folder, sub, name, ...rest] = path.split("/");
  if (folder !== wedding.id || sub !== "save-the-date" || !name || rest.length > 0) {
    return { error: "That picture doesn't belong to this wedding." };
  }
  const url = supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;
  const { error } = await supabase
    .from("save_the_dates")
    .update({ image_url: url, image_version: version })
    .eq("id", id)
    .eq("wedding_id", wedding.id);
  if (error) return { error: error.message };
  return { url };
}

/** The household greeting on an email: "Sam & Riley", or "The Alvarez household". */
function greetingFor(guest: Guest, everyone: Guest[]) {
  const key = guest.household?.trim().toLowerCase();
  const members = key ? everyone.filter((g) => g.household?.trim().toLowerCase() === key) : [guest];
  const names = members.map((g) => g.name.trim()).filter(Boolean);
  if (names.length && names.length <= 2) return names.join(" & ");
  const h = guest.household!.trim();
  return /\s/.test(h) ? h : `The ${h} household`;
}

/**
 * Emails the save-the-date to these guests, each with their own link. The
 * couple confirms in the browser first; nothing here runs on its own. A
 * guest with no email, or whose address has bounced before, is skipped.
 */
export async function sendSaveTheDates(
  cardId: string,
  guestIds: string[],
  origin: string,
): Promise<{ error?: string; sent?: number; skipped?: number; failed?: number }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  if (!wedding.public_slug) return { error: "Turn on your guest site first: your save-the-date links live at its address." };
  if (!process.env.RESEND_API_KEY) return { error: "Email sending isn't configured (missing RESEND_API_KEY)." };
  if (!Array.isArray(guestIds) || guestIds.length === 0) return { error: "Choose at least one guest." };
  if (guestIds.length > MAX_PER_SEND) return { error: `You can send up to ${MAX_PER_SEND} at a time.` };
  if (!/^https?:\/\/[^/]+$/.test(origin)) return { error: "That send didn't come from the app." };

  const [{ data: row }, { data: everyone }] = await Promise.all([
    supabase.from("save_the_dates").select("*").eq("id", cardId).eq("wedding_id", wedding.id).maybeSingle<SaveTheDateRow>(),
    supabase.from("guests").select("*").eq("wedding_id", wedding.id).returns<Guest[]>(),
  ]);
  const doc = row ? parseCardDoc(row.doc) : null;
  if (!row || !doc) return { error: "Design your card first." };
  if (!row.image_url || row.image_version !== row.updated_at) {
    return { error: "Your card's picture is out of date. Try sending again." };
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
      place: doc.content.place,
      url: `${origin}${personalCardPath(wedding.public_slug!, g.invite_code)}`,
      imageUrl: row.image_url!,
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
      await logError("planning", "sendSaveTheDates", error ?? "no data");
      return { error: "Couldn't send right now. Nothing went out; please try again.", skipped };
    }
  } catch (e) {
    await logError("planning", "sendSaveTheDates", e);
    return { error: "Couldn't send right now. Nothing went out; please try again.", skipped };
  }

  await supabase
    .from("guests")
    .update({ std_sent_at: new Date().toISOString() })
    .in(
      "id",
      deliverable.map((g) => g.id),
    );
  // Guests' links show the card they were last sent.
  if (!row.chosen) await makeChosen(supabase, wedding.id, row.id);
  trackEvent("save_the_dates_sent", { weddingId: wedding.id, userId: user.id });
  revalidatePath("/guests/save-the-date", "layout");
  return { sent: deliverable.length, skipped, failed: 0 };
}

/**
 * Opens RSVPs on the guest site now (weddings.rsvp_opens_on = null), for a
 * save-the-date that asks guests to reply early (Back of the card).
 */
export async function openRsvpsNow(): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const { error } = await supabase.from("weddings").update({ rsvp_opens_on: null }).eq("id", wedding.id);
  if (error) {
    await logError("planning", "openRsvpsNow", error);
    return { error: "We couldn't open RSVPs. Try again, or clear the date under Dashboard › Wedding details." };
  }
  revalidatePath("/guests/save-the-date");
  revalidatePath("/dashboard");
  return {};
}
