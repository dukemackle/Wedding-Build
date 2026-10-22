"use server";

import { revalidatePath } from "next/cache";
import { requireEditableWedding } from "@/lib/wedding-access";
import { MAX_GALLERY_PHOTOS } from "@/lib/guest-site";
import { creditLinks } from "@/lib/photo-credit";
import { claimPhoto, searchPhotos, type LibraryPhoto } from "@/lib/unsplash";

/**
 * The free photo library (src/lib/unsplash.ts) for the banner panel. Only
 * someone who can edit a wedding can search, so the key's hourly allowance
 * isn't open to the world.
 */
export async function searchPhotoLibrary(
  query: string,
  page = 1,
): Promise<{ photos?: LibraryPhoto[]; totalPages?: number; error?: string }> {
  const { wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const q = query.trim().slice(0, 80);
  if (!q) return { photos: [], totalPages: 0 };
  const found = await searchPhotos(q, Math.max(1, Math.min(50, Math.floor(page))));
  if (!found) return { error: "The photo library isn't answering right now. Try again in a minute." };
  return found;
}

/** Makes a library photo the banner, with its photographer saved for the credit. */
export async function setLibraryBanner(photoId: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const photo = await claimPhoto(photoId);
  if (!photo) return { error: "That photo couldn't be loaded. Try another one." };

  // The credit goes in with the photo: Unsplash asks that it's never shown
  // without its photographer's name. Without migration 0132 there's nowhere
  // to keep the name, so the photo isn't used either.
  const { error } = await supabase
    .from("weddings")
    .update({ hero_photo_url: photo.url, hero_photo_credit: photo.credit })
    .eq("id", wedding.id);
  if (error) return { error: "Couldn't save that photo. Please try again." };

  revalidatePath("/dashboard");
  revalidatePath("/guests");
  return {};
}

/**
 * Adds a library photo to the gallery, its photographer saved in
 * wedding_photo_credits (0133) for the credits line at the foot of the site.
 */
export async function addLibraryGalleryPhoto(photoId: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { count } = await supabase
    .from("wedding_gallery_photos")
    .select("id", { count: "exact", head: true })
    .eq("wedding_id", wedding.id);
  const existing = count ?? 0;
  if (existing >= MAX_GALLERY_PHOTOS) {
    return { error: `The gallery holds ${MAX_GALLERY_PHOTOS} photos — remove one to add another.` };
  }

  const photo = await claimPhoto(photoId);
  if (!photo) return { error: "That photo couldn't be loaded. Try another one." };

  // Credit first: a gallery photo is never shown without its photographer.
  const { error: creditError } = await supabase.from("wedding_photo_credits").upsert({
    wedding_id: wedding.id,
    photo_url: photo.url,
    photographer: photo.credit.name,
    profile_url: creditLinks(photo.credit).photographer,
  });
  if (creditError) return { error: "Couldn't save that photo. Please try again." };

  const { error } = await supabase
    .from("wedding_gallery_photos")
    .insert({ wedding_id: wedding.id, photo_url: photo.url, sort_order: existing });
  if (error) return { error: "Couldn't save that photo. Please try again." };

  revalidatePath("/guests");
  if (wedding.public_slug) revalidatePath(`/w/${wedding.public_slug}`);
  return {};
}
