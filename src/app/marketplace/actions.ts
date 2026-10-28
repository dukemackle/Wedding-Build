"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pinForTown, STATE_ABBR } from "@/lib/listing-pin";
import {
  MARKET_CATEGORIES,
  MARKET_CONDITIONS,
  MAX_MARKET_PHOTOS,
  PICKUP_OPTIONS,
  formatPrice,
  isOwnMarketPhoto,
  MARKET_COLORS,
  sellerBadgeFor,
} from "@/lib/marketplace";
import { announcePriceDrop, postListingEvent } from "@/lib/marketplace-server";
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
  | "listing_type"
  | "pickup_options"
  | "negotiable"
  | "color_families"
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
  const listing_type = formData.get("listing_type") === "rent" ? "rent" : "sale";
  const pickup_options = formData
    .getAll("pickup_options")
    .map(String)
    .filter((o) => PICKUP_OPTIONS.some((p) => p.value === o));
  const negotiable = formData.get("negotiable") === "on";
  const color_families = [
    ...new Set(formData.getAll("color_families").map(String).filter((c) => MARKET_COLORS.some((m) => m.id === c))),
  ];

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
  if (pickup_options.length === 0) return { error: "Choose at least one way to get it to the buyer." };
  if (color_families.length > 3) return { error: "Pick up to three colours." };
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
      listing_type,
      pickup_options,
      negotiable,
      color_families,
    },
  };
}

/**
 * "Married Oct 2026" from the seller's own wedding, when they ticked the box;
 * null otherwise. Worked out here rather than taken from the form, so it
 * can't claim a wedding that isn't theirs.
 */
async function sellerBadge(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  formData: FormData,
): Promise<string | null> {
  if (formData.get("show_badge") !== "on") return null;
  const { data } = await supabase
    .from("weddings")
    .select("wedding_date")
    .or(`user_id.eq.${userId},member_ids.cs.{${userId}}`)
    .maybeSingle<{ wedding_date: string | null }>();
  return data?.wedding_date ? sellerBadgeFor(data.wedding_date) : null;
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
  const [pin, seller_badge] = await Promise.all([
    pinForTown(fields.city, fields.state),
    sellerBadge(supabase, user.id, formData),
  ]);

  // From "Pass it on": the budget line it came from, so it isn't offered again.
  const source = str(formData, "source_budget_item");
  const source_budget_item = /^([a-z_]{2,40}|[0-9a-f-]{36})$/.test(source) ? source : null;

  const { data, error: insertError } = await supabase
    .from("market_listings")
    .insert({
      ...fields,
      source_budget_item,
      seller_badge,
      seller_id: user.id,
      latitude: pin?.latitude ?? null,
      longitude: pin?.longitude ?? null,
    })
    .select("id")
    .single<{ id: string }>();
  if (insertError || !data) return { error: "Couldn't post your listing — please try again." };

  revalidatePath("/marketplace");
  // "List my wedding" goes straight on to the next thing.
  if (source_budget_item && formData.get("pass") === "1") {
    const skip = str(formData, "pass_skip");
    redirect(`/marketplace/new?pass=1${skip ? `&skip=${encodeURIComponent(skip)}` : ""}&listed=${data.id}`);
  }
  redirect(`/marketplace/${data.id}`);
}

export async function updateListing(id: string, formData: FormData): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  const { fields, error } = readListing(formData, user.id);
  if (!fields) return { error };

  const { data: current } = await supabase
    .from("market_listings")
    .select("title, city, state, latitude, longitude, photo_urls, price_cents, original_price_cents, listing_type")
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle<
      Pick<
        MarketListing,
        | "title"
        | "city"
        | "state"
        | "latitude"
        | "longitude"
        | "photo_urls"
        | "price_cents"
        | "original_price_cents"
        | "listing_type"
      >
    >();
  if (!current) return { error: "That listing isn't yours to edit." };

  const moved = current.city !== fields.city || current.state !== fields.state;
  const pin = moved ? await pinForTown(fields.city, fields.state) : current;

  // A lower price keeps the first "was" price for the strike-through; going
  // back up to it or past it drops the strike-through.
  const dropped = fields.price_cents > 0 && fields.price_cents < current.price_cents;
  const wasPrice = current.original_price_cents ?? current.price_cents;
  const original_price_cents = fields.price_cents > 0 && fields.price_cents < wasPrice ? wasPrice : null;

  const { error: updateError } = await supabase
    .from("market_listings")
    .update({
      ...fields,
      seller_badge: await sellerBadge(supabase, user.id, formData),
      original_price_cents,
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

  if (dropped) {
    await announcePriceDrop(id, user.id, fields.title, formatPrice(fields.price_cents, fields.listing_type));
  }

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
  const { data: updated, error } = await supabase
    .from("market_listings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !updated) return { error: "Couldn't update the listing — please try again." };
  await postListingEvent(
    id,
    user.id,
    status === "sold" ? "Marked as sold" : status === "pending" ? "Marked as pending" : "Marked as available again",
  );
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

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Marks a rental as out from one day to another, both included. RLS keeps
 * it to the seller's own rentals; the exclusion constraint (0147) refuses
 * dates that overlap a booking already there.
 */
export async function addRentalBooking(listingId: string, startsOn: string, endsOn: string): Promise<{ error?: string }> {
  if (!DATE.test(startsOn) || !DATE.test(endsOn)) return { error: "Pick the dates it's out." };
  if (endsOn < startsOn) return { error: "The return date is before the pickup date." };
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("market_rental_bookings")
    .insert({ listing_id: listingId, starts_on: startsOn, ends_on: endsOn });
  if (error?.code === "23P01") return { error: "Those dates overlap a booking you've already marked." };
  if (error?.code === "23514") return { error: "A booking can be up to 60 days." };
  if (error) return { error: "Couldn't save those dates — please try again." };
  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
  return {};
}

export async function removeRentalBooking(listingId: string, bookingId: string): Promise<{ error?: string }> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("market_rental_bookings")
    .delete()
    .eq("id", bookingId)
    .eq("listing_id", listingId)
    .select("id");
  if (error || !data?.length) return { error: "Couldn't free up those dates — please try again." };
  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/${listingId}`);
  return {};
}
