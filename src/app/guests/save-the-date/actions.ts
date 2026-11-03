"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/error-log";
import { STALE_CARD, cardDocSchema } from "@/lib/save-the-date/schema";
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
