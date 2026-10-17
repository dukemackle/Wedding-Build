"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pinForTown, STATE_ABBR } from "@/lib/listing-pin";
import {
  MARKET_CATEGORIES,
  MARKET_CONDITIONS,
  MAX_MARKET_PHOTOS,
  isOwnMarketPhoto,
} from "@/lib/marketplace";
import type { MarketListing, MarketListingStatus } from "@/lib/supabase/types";

function str(formData: FormData, key: string): string {
  return ((formData.get(key) as string) ?? "").trim();
}

/** "$1,250.50" or "1250.5" to cents; null when it isn't a price. */
function parsePrice(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (cleaned === "") return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100);
}

type ListingFields = Pick<
  MarketListing,
  | "seller_name"
  | "title"
  | "description"
  | "category"
  | "condition"
  | "price_cents"
  | "quantity"
  | "city"
  | "state"
  | "photo_urls"
>;

function readListing(formData: FormData, sellerId: string): { fields?: ListingFields; error?: string } {
  const seller_name = str(formData, "seller_name");
  const title = str(formData, "title");
  const description = str(formData, "description");
  const category = str(formData, "category");
  const condition = str(formData, "condition");
  const city = str(formData, "city");
  const stateName = str(formData, "state");
  const free = formData.get("free") === "on";
  const price_cents = free ? 0 : parsePrice(str(formData, "price"));
  const quantity = Number(str(formData, "quantity") || "1");
  const photo_urls = formData.getAll("photo_urls").map(String).filter(Boolean);

  if (!seller_name) return { error: "Add the first name buyers will see." };
  if (title.length < 3) return { error: "Give the listing a title." };
  if (title.length > 80) return { error: "Keep the title under 80 characters." };
  if (description.length > 2000) return { error: "Keep the description under 2,000 characters." };
  if (!MARKET_CATEGORIES.some((c) => c.value === category)) return { error: "Choose a category." };
  if (!MARKET_CONDITIONS.some((c) => c.value === condition)) return { error: "Choose a condition." };
  if (price_cents === null) return { error: "Enter a price like 40 or 12.50, or tick Free." };
  if (price_cents > 10000000) return { error: "That price is higher than we allow." };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
    return { error: "Quantity should be a whole number from 1 up." };
  }
  if (!city) return { error: "Add the town buyers would pick up from." };
  const state = STATE_ABBR[stateName];
  if (!state) return { error: "Choose a state." };
  if (photo_urls.length === 0) return { error: "Add at least one photo." };
  if (photo_urls.length > MAX_MARKET_PHOTOS) return { error: `Up to ${MAX_MARKET_PHOTOS} photos.` };
  if (!photo_urls.every((url) => isOwnMarketPhoto(url, sellerId))) {
    return { error: "One of the photos didn't upload properly. Remove it and add it again." };
  }

  return {
    fields: {
      seller_name: seller_name.slice(0, 40),
      title,
      description: description || null,
      category,
      condition,
      price_cents,
      quantity,
      city: city.slice(0, 80),
      state,
      photo_urls,
    },
  };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/marketplace");
  return { supabase, user };
}

export async function createListing(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  const { fields, error } = readListing(formData, user.id);
  if (!fields) return { error };

  // The town's centre, so the listing lands on the map without anyone's
  // address. A town the Census doesn't know just stays off the map.
  const pin = await pinForTown(fields.city, fields.state);

  const { data, error: insertError } = await supabase
    .from("market_listings")
    .insert({ ...fields, seller_id: user.id, latitude: pin?.latitude ?? null, longitude: pin?.longitude ?? null })
    .select("id")
    .single<{ id: string }>();
  if (insertError || !data) return { error: "Couldn't post your listing — please try again." };

  revalidatePath("/marketplace");
  redirect(`/marketplace/${data.id}`);
}

export async function updateListing(id: string, formData: FormData): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  const { fields, error } = readListing(formData, user.id);
  if (!fields) return { error };

  const { data: current } = await supabase
    .from("market_listings")
    .select("city, state, latitude, longitude, photo_urls")
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle<Pick<MarketListing, "city" | "state" | "latitude" | "longitude" | "photo_urls">>();
  if (!current) return { error: "That listing isn't yours to edit." };

  const moved = current.city !== fields.city || current.state !== fields.state;
  const pin = moved ? await pinForTown(fields.city, fields.state) : current;

  const { error: updateError } = await supabase
    .from("market_listings")
    .update({
      ...fields,
      latitude: pin?.latitude ?? null,
      longitude: pin?.longitude ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("seller_id", user.id);
  if (updateError) return { error: "Couldn't save your changes — please try again." };

  await removePhotos(
    supabase,
    user.id,
    current.photo_urls.filter((url) => !fields.photo_urls.includes(url)),
  );

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${id}`);
  redirect(`/marketplace/${id}`);
}

export async function setListingStatus(
  id: string,
  status: Exclude<MarketListingStatus, "removed">,
): Promise<{ error?: string }> {
  if (!["active", "pending", "sold"].includes(status)) return { error: "Unknown status." };
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("market_listings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("seller_id", user.id);
  if (error) return { error: "Couldn't update the listing — please try again." };
  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${id}`);
  return {};
}

export async function deleteListing(id: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  const { data: listing } = await supabase
    .from("market_listings")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("photo_urls")
    .maybeSingle<Pick<MarketListing, "photo_urls">>();
  if (!listing) return { error: "Couldn't delete the listing — please try again." };

  await removePhotos(supabase, user.id, listing.photo_urls);
  revalidatePath("/marketplace");
  redirect("/marketplace");
}

export async function toggleSave(listingId: string, save: boolean): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  const { error } = save
    ? await supabase
        .from("market_saves")
        .upsert({ user_id: user.id, listing_id: listingId }, { ignoreDuplicates: true })
    : await supabase.from("market_saves").delete().eq("user_id", user.id).eq("listing_id", listingId);
  if (error) return { error: "Couldn't update your saved items." };
  revalidatePath("/marketplace");
  return {};
}

/**
 * Photos dropped from a listing, or a deleted listing's photos. Best effort:
 * a file left behind costs a little storage, not a broken listing.
 */
async function removePhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sellerId: string,
  urls: string[],
) {
  const marker = "/storage/v1/object/public/market-photos/";
  const paths = urls
    .filter((url) => isOwnMarketPhoto(url, sellerId))
    .map((url) => decodeURIComponent(url.slice(url.indexOf(marker) + marker.length)));
  if (paths.length > 0) await supabase.storage.from("market-photos").remove(paths);
}
