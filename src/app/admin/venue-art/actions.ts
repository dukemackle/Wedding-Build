"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import type { VenueArt } from "@/lib/supabase/types";
import { VENUE_ART_BUCKET, VENUE_ART_MAX_BYTES, VENUE_ART_TYPES, venueArtStyle } from "@/lib/venue-art";

type Result = { error?: string };
type Size = "wide" | "tall";

const PAGE = "/admin/venue-art";
const EXT: Record<string, string> = { "image/png": "png", "image/webp": "webp", "image/jpeg": "jpg" };

type ConsentRow = {
  id: string;
  name: string;
  photo_urls: string[] | null;
  photo_marketing_ok: boolean;
  photo_marketing_ok_at: string | null;
  photo_credit: string | null;
};

async function consentingVenue(venueId: string): Promise<ConsentRow | null> {
  const { data } = await createAdminSupabaseClient()
    .from("venues")
    .select("id, name, photo_urls, photo_marketing_ok, photo_marketing_ok_at, photo_credit")
    .eq("id", venueId)
    .maybeSingle<ConsentRow>();
  return data?.photo_marketing_ok ? data : null;
}

async function artRow(artId: string): Promise<VenueArt | null> {
  const { data } = await createAdminSupabaseClient().from("venue_art").select("*").eq("id", artId).maybeSingle<VenueArt>();
  return data;
}

/** Starts (or re-points) a venue's art in one style at the photo it's painted from. */
export async function startVenueArt(venueId: string, style: string, sourcePhotoUrl: string): Promise<Result & { id?: string }> {
  await requireAdmin();
  const def = venueArtStyle(style);
  if (!def?.line) return { error: "Pick a style that's ready." };
  const venue = await consentingVenue(venueId);
  if (!venue) return { error: "This venue hasn't agreed to its photos being featured." };
  if (!(venue.photo_urls ?? []).includes(sourcePhotoUrl)) return { error: "Pick one of the venue's own photos." };

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("venue_art")
    .upsert(
      {
        venue_id: venueId,
        style: def.id,
        source_photo_url: sourcePhotoUrl,
        photo_credit: venue.photo_credit,
        consent_at: venue.photo_marketing_ok_at,
        // A new source photo means the old paintings no longer match it.
        status: "draft",
        approved_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "venue_id,style" },
    )
    .select("id")
    .single<{ id: string }>();
  if (error || !data) return { error: error?.message ?? "Couldn't save." };
  revalidatePath(PAGE);
  return { id: data.id };
}

/** A signed upload URL for the wide or tall painting; the browser uploads straight to storage. */
export async function createVenueArtUpload(
  artId: string,
  size: Size,
  file: { type: string; size: number },
): Promise<Result & { upload?: { path: string; token: string } }> {
  await requireAdmin();
  if (size !== "wide" && size !== "tall") return { error: "Unknown size." };
  if (!VENUE_ART_TYPES.includes(file.type)) return { error: "Upload a PNG, WebP or JPEG." };
  if (file.size > VENUE_ART_MAX_BYTES) return { error: "That file is over 20MB." };
  const art = await artRow(artId);
  if (!art) return { error: "Start this style first." };
  if (!(await consentingVenue(art.venue_id))) return { error: "This venue has withdrawn its photo consent." };

  const path = `${art.venue_id}/${art.style}-${size}-${randomUUID()}.${EXT[file.type]}`;
  const { data, error } = await createAdminSupabaseClient().storage.from(VENUE_ART_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: "Couldn't start the upload. Try again." };
  return { upload: { path, token: data.token } };
}

/** Records an uploaded painting, removes the one it replaces, and puts the art back to Draft. */
export async function saveVenueArtUpload(artId: string, size: Size, path: string): Promise<Result> {
  await requireAdmin();
  const art = await artRow(artId);
  if (!art) return { error: "Art not found." };
  if (!path.startsWith(`${art.venue_id}/${art.style}-${size}-`)) return { error: "That upload doesn't belong here." };

  const column = size === "wide" ? "wide_path" : "tall_path";
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("venue_art")
    .update({ [column]: path, status: "draft", approved_at: null, updated_at: new Date().toISOString() })
    .eq("id", artId);
  if (error) return { error: error.message };
  const old = art[column];
  if (old && old !== path) await admin.storage.from(VENUE_ART_BUCKET).remove([old]);
  revalidatePath(PAGE);
  return {};
}

export async function approveVenueArt(artId: string): Promise<Result> {
  await requireAdmin();
  const art = await artRow(artId);
  if (!art) return { error: "Art not found." };
  if (!art.wide_path || !art.tall_path) return { error: "Upload both the wide and tall versions first." };
  const venue = await consentingVenue(art.venue_id);
  if (!venue) return { error: "This venue has withdrawn its photo consent." };

  const { error } = await createAdminSupabaseClient()
    .from("venue_art")
    .update({ status: "approved", approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", artId);
  if (error) return { error: error.message };
  await logAdminAction("venue_art.approve", { type: "venue", ids: [art.venue_id] }, `Approved ${art.style} art for ${venue.name}`);
  revalidatePath(PAGE);
  return {};
}

/** Back to Draft, keeping the files, to redo one size. */
export async function reopenVenueArt(artId: string): Promise<Result> {
  await requireAdmin();
  const { error } = await createAdminSupabaseClient()
    .from("venue_art")
    .update({ status: "draft", approved_at: null, updated_at: new Date().toISOString() })
    .eq("id", artId);
  if (error) return { error: error.message };
  revalidatePath(PAGE);
  return {};
}

/** Deletes the art and its files (also how withdrawn consent is honoured). */
export async function deleteVenueArt(artId: string): Promise<Result> {
  await requireAdmin();
  const art = await artRow(artId);
  if (!art) return {};
  const admin = createAdminSupabaseClient();
  const files = [art.wide_path, art.tall_path].filter((p): p is string => !!p);
  if (files.length) {
    const { error: rmError } = await admin.storage.from(VENUE_ART_BUCKET).remove(files);
    if (rmError) return { error: "Couldn't delete the files. Try again." };
  }
  const { error } = await admin.from("venue_art").delete().eq("id", artId);
  if (error) return { error: error.message };
  await logAdminAction("venue_art.delete", { type: "venue", ids: [art.venue_id] }, `Deleted ${art.style} venue art`);
  revalidatePath(PAGE);
  return {};
}
