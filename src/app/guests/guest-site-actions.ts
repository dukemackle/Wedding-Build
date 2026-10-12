"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { MAX_GALLERY_PHOTOS } from "@/lib/guest-site";
import { requireEditableWedding } from "@/lib/wedding-access";

function str(formData: FormData, key: string): string | null {
  const raw = (formData.get(key) as string)?.trim();
  return raw || null;
}

// Both sections render on the public guest site, so revalidate it too --
// otherwise the couple saves a change and their guests keep seeing the
// cached old page.
function revalidateGuestSite(slug: string | null) {
  revalidatePath("/guests");
  if (slug) revalidatePath(`/w/${slug}`);
}

export async function updateGuestSiteDetails(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const { error } = await supabase
    .from("weddings")
    .update({
      dress_code: str(formData, "dress_code"),
      travel_notes: str(formData, "travel_notes"),
    })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function addWeddingFaq(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const question = str(formData, "question");
  const answer = str(formData, "answer");
  if (!question || !answer) {
    return { error: "A question and an answer are both required." };
  }

  const { error } = await supabase.from("wedding_faqs").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    question,
    answer,
    sort_order: Number(formData.get("sort_order")) || 0,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function deleteWeddingFaq(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const { error } = await supabase
    .from("wedding_faqs")
    .delete()
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function addAccommodation(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const name = str(formData, "name");
  if (!name) {
    return { error: "Give the hotel or stay a name." };
  }

  const { error } = await supabase.from("wedding_accommodations").insert({
    wedding_id: wedding.id,
    user_id: user.id,
    name,
    address: str(formData, "address"),
    booking_url: str(formData, "booking_url"),
    notes: str(formData, "notes"),
    sort_order: Number(formData.get("sort_order")) || 0,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function deleteAccommodation(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const { error } = await supabase
    .from("wedding_accommodations")
    .delete()
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

// ---------------------------------------------------------------------------
// The couple's gallery
// ---------------------------------------------------------------------------

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Adds one or more photos to the gallery on the guest site.
 *
 * Several at once because a gallery is filled in a sitting, not one photo a
 * day. Capped at twelve: past that the section stops being "a few pictures
 * of us" and becomes a camera roll guests scroll past to reach the RSVP.
 */
export async function addGalleryPhotos(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const photos = (formData.getAll("photos") as File[]).filter((p) => p && p.size > 0);
  if (photos.length === 0) {
    return { error: "Choose at least one photo." };
  }
  if (photos.some((p) => !p.type.startsWith("image/"))) {
    return { error: "Photos must be image files." };
  }
  if (photos.some((p) => p.size > MAX_PHOTO_BYTES)) {
    return { error: "One of those is too large — please use photos under 5MB each." };
  }

  const { count } = await supabase
    .from("wedding_gallery_photos")
    .select("id", { count: "exact", head: true })
    .eq("wedding_id", wedding.id);
  const existing = count ?? 0;
  if (existing + photos.length > MAX_GALLERY_PHOTOS) {
    const room = Math.max(0, MAX_GALLERY_PHOTOS - existing);
    return {
      error:
        room === 0
          ? `The gallery holds ${MAX_GALLERY_PHOTOS} photos — remove one to add another.`
          : `The gallery holds ${MAX_GALLERY_PHOTOS} photos — there's room for ${room} more.`,
    };
  }

  const rows: { wedding_id: string; photo_url: string; sort_order: number }[] = [];
  for (const [i, photo] of photos.entries()) {
    const extension = photo.name.includes(".") ? photo.name.split(".").pop() : undefined;
    const path = `${wedding.id}/gallery/${randomUUID()}${extension ? `.${extension}` : ""}`;
    const { error: uploadError } = await supabase.storage
      .from("wedding-photos")
      .upload(path, photo, { contentType: photo.type });
    if (uploadError) {
      return { error: "Could not upload your photos — please try again." };
    }
    rows.push({
      wedding_id: wedding.id,
      photo_url: supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl,
      sort_order: existing + i,
    });
  }

  const { error } = await supabase.from("wedding_gallery_photos").insert(rows);
  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function removeGalleryPhoto(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const { error } = await supabase
    .from("wedding_gallery_photos")
    .delete()
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

// ---------------------------------------------------------------------------
// Guest posts: approve, hide, delete
// ---------------------------------------------------------------------------

export async function setGuestPostStatus(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const status = formData.get("status") as string;
  if (status !== "approved" && status !== "hidden") {
    return { error: "Unknown status." };
  }

  const { error } = await supabase
    .from("guest_posts")
    .update({ status })
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

export async function deleteGuestPost(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const { error } = await supabase
    .from("guest_posts")
    .delete()
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidateGuestSite(wedding.public_slug);
  return {};
}

/** Puts a password on the guest site, or (left empty) takes it off. */
export async function setSitePassword(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const password = (formData.get("password") as string | null) ?? "";
  if (password && (password.length < 4 || password.length > 64)) {
    return { error: "Use 4 to 64 characters." };
  }

  const { error } = await supabase.rpc("set_guest_site_password", {
    target_wedding: wedding.id,
    new_password: password || null,
  });
  if (error) return { error: "Could not save the password — please try again." };

  revalidatePath("/guests/site", "layout");
  if (wedding.public_slug) revalidatePath(`/w/${wedding.public_slug}`, "layout");
  return {};
}

/** A wedding party member's guest-site line and whether they're shown. */
export async function updatePartySiteDetails(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const patch: { site_blurb?: string | null; on_site?: boolean } = {};
  if (formData.has("site_blurb")) {
    const blurb = str(formData, "site_blurb");
    if (blurb && blurb.length > 280) return { error: "Keep it under 280 characters." };
    patch.site_blurb = blurb;
  }
  if (formData.has("on_site")) patch.on_site = formData.get("on_site") === "true";

  const { error } = await supabase
    .from("attire_party_members")
    .update(patch)
    .eq("id", formData.get("id") as string)
    .eq("wedding_id", wedding.id);
  if (error) return { error: "Could not save — please try again." };

  revalidateGuestSite(wedding.public_slug);
  revalidatePath("/guests/site", "layout");
  return {};
}

/** Sets (or, with no file, removes) a wedding party member's photo. */
export async function setPartyPhoto(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const id = formData.get("id") as string;
  const photo = formData.get("photo") as File | null;
  let photoUrl: string | null = null;

  if (photo && photo.size > 0) {
    if (!photo.type.startsWith("image/")) return { error: "Photos must be image files." };
    if (photo.size > MAX_PHOTO_BYTES) return { error: "Please use a photo under 5MB." };
    const extension = photo.name.includes(".") ? photo.name.split(".").pop() : undefined;
    const path = `${wedding.id}/party/${randomUUID()}${extension ? `.${extension}` : ""}`;
    const { error: uploadError } = await supabase.storage
      .from("wedding-photos")
      .upload(path, photo, { contentType: photo.type });
    if (uploadError) return { error: "Could not upload the photo — please try again." };
    photoUrl = supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase
    .from("attire_party_members")
    .update({ photo_url: photoUrl })
    .eq("id", id)
    .eq("wedding_id", wedding.id);
  if (error) return { error: "Could not save the photo — please try again." };

  revalidateGuestSite(wedding.public_slug);
  revalidatePath("/guests/site", "layout");
  return {};
}
