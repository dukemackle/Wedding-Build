"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MAX_SET_ITEMS, MIN_SET_ITEMS } from "@/lib/marketplace";
import { postListingEvent } from "@/lib/marketplace-server";
import type { MarketListing, MarketListingStatus } from "@/lib/supabase/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/marketplace/sets/new");
  return { supabase, user };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * The set's fields and items from the form, checked against the seller's own
 * listings: live, one kind (all for sale or all for rent), and not in
 * another set.
 */
async function readSet(supabase: Supabase, userId: string, formData: FormData, setId: string | null) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rawPrice = String(formData.get("price") ?? "").replace(/[$,\s]/g, "");
  const ids = [...new Set(formData.getAll("listing_ids").map(String))];

  if (title.length < 3) return { error: "Give the set a name." };
  if (title.length > 80) return { error: "Keep the name under 80 characters." };
  if (description.length > 2000) return { error: "Keep the description under 2,000 characters." };
  if (!/^\d+(\.\d{1,2})?$/.test(rawPrice)) return { error: "Enter a price for the whole set, like 420." };
  const price_cents = Math.round(Number(rawPrice) * 100);
  if (price_cents > 10000000) return { error: "That price is higher than we allow." };
  if (ids.length < MIN_SET_ITEMS) return { error: `Pick at least ${MIN_SET_ITEMS} things for the set.` };
  if (ids.length > MAX_SET_ITEMS) return { error: `A set can hold up to ${MAX_SET_ITEMS} things.` };

  const { data: items } = await supabase
    .from("market_listings")
    .select("id, status, listing_type, set_id")
    .eq("seller_id", userId)
    .in("id", ids)
    .returns<Pick<MarketListing, "id" | "status" | "listing_type" | "set_id">[]>();
  const live = (items ?? []).filter((l) => l.status === "active" || l.status === "pending");
  if (live.length !== ids.length) return { error: "One of those isn't yours, or has sold. Refresh and pick again." };
  if (live.some((l) => l.set_id && l.set_id !== setId)) return { error: "One of those is already in another set." };
  const types = new Set(live.map((l) => l.listing_type));
  if (types.size > 1) return { error: "A set is all for sale or all for rent, not both." };

  return {
    fields: { title, description: description || null, price_cents, listing_type: live[0].listing_type },
    ids,
  };
}

export async function createSet(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  const read = await readSet(supabase, user.id, formData, null);
  if (!read.fields) return { error: read.error };

  const { data: set, error } = await supabase
    .from("market_sets")
    .insert({ ...read.fields, seller_id: user.id })
    .select("id")
    .single<{ id: string }>();
  if (error || !set) return { error: "Couldn't make the set — please try again." };

  const { error: linkError } = await supabase
    .from("market_listings")
    .update({ set_id: set.id })
    .eq("seller_id", user.id)
    .in("id", read.ids);
  if (linkError) {
    await supabase.from("market_sets").delete().eq("id", set.id);
    return { error: "Couldn't make the set — please try again." };
  }

  revalidatePath("/marketplace");
  redirect(`/marketplace/sets/${set.id}`);
}

export async function updateSet(id: string, formData: FormData): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  const read = await readSet(supabase, user.id, formData, id);
  if (!read.fields) return { error: read.error };

  const { data: updated, error } = await supabase
    .from("market_sets")
    .update({ ...read.fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !updated) return { error: "Couldn't save the set — please try again." };

  // Out with what was unticked, in with what was ticked.
  const [{ error: outError }, { error: inError }] = await Promise.all([
    supabase
      .from("market_listings")
      .update({ set_id: null })
      .eq("seller_id", user.id)
      .eq("set_id", id)
      .not("id", "in", `(${read.ids.join(",")})`),
    supabase.from("market_listings").update({ set_id: id }).eq("seller_id", user.id).in("id", read.ids),
  ]);
  if (outError || inError) return { error: "Couldn't save the set — please try again." };

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/sets/${id}`);
  redirect(`/marketplace/sets/${id}`);
}

/**
 * Pending, sold or available again. Selling the set sells everything in it,
 * and tells anyone who asked about one of its items.
 */
export async function setSetStatus(
  id: string,
  status: Exclude<MarketListingStatus, "removed">,
): Promise<{ error?: string }> {
  if (!["active", "pending", "sold"].includes(status)) return { error: "Unknown status." };
  const { supabase, user } = await requireUser();
  const { data: updated, error } = await supabase
    .from("market_sets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !updated) return { error: "Couldn't update the set — please try again." };

  if (status === "sold") {
    const { data: sold } = await supabase
      .from("market_listings")
      .update({ status: "sold", updated_at: new Date().toISOString() })
      .eq("seller_id", user.id)
      .eq("set_id", id)
      .in("status", ["active", "pending"])
      .select("id")
      .returns<{ id: string }[]>();
    await Promise.all((sold ?? []).map((l) => postListingEvent(l.id, user.id, "Sold as part of a set")));
  }

  revalidatePath("/marketplace");
  revalidatePath(`/marketplace/sets/${id}`);
  return {};
}

/** Takes the set down; its items stay listed one by one. */
export async function deleteSet(id: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();
  const { data: deleted } = await supabase
    .from("market_sets")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id")
    .maybeSingle();
  if (!deleted) return { error: "Couldn't remove the set — please try again." };
  revalidatePath("/marketplace");
  redirect("/marketplace?view=selling");
}
