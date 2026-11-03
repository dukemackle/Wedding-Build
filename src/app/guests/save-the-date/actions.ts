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
import type { Guest, SaveTheDateRow } from "@/lib/supabase/types";
import { requireEditableWedding } from "@/lib/wedding-access";


type Saved = { error?: string; stale?: boolean; version?: string };

/**
 * Saves the couple's card (Guests › Save the date). `version` is the
 * updated_at the editor last saw: when the row has moved on since, nothing
 * is written, so one device's stale copy can't overwrite the other's work.
 * The first save creates the row.
 */
export async function saveSaveTheDate(doc: unknown, version: string | null): Promise<Saved> {
  const parsed = cardDocSchema.safeParse(doc);
  if (!parsed.success) return { error: "That card couldn't be saved." };

  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const now = new Date().toISOString();
  if (!version) {
    const { data, error } = await supabase
      .from("save_the_dates")
      .insert({ wedding_id: wedding.id, doc: parsed.data, updated_at: now })
      .select("updated_at")
      .single<{ updated_at: string }>();
    // 23505: a card already exists, made on another device since this page loaded.
    if (error?.code === "23505") return { error: STALE_CARD, stale: true };
    if (error) return { error: error.message };
    revalidatePath("/guests/save-the-date");
    return { version: data.updated_at };
  }

  const { data, error } = await supabase
    .from("save_the_dates")
    .update({ doc: parsed.data, updated_at: now })
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
export async function setSaveTheDateImage(path: string, version: string): Promise<{ error?: string; url?: string }> {
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
    supabase.from("save_the_dates").select("*").eq("wedding_id", wedding.id).maybeSingle<SaveTheDateRow>(),
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
  trackEvent("save_the_dates_sent", { weddingId: wedding.id, userId: user.id });
  revalidatePath("/guests/save-the-date/send");
  return { sent: deliverable.length, skipped, failed: 0 };
}
