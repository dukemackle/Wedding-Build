import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import { BUDGET_CATEGORIES, computeCategoryValue, effectiveGuestCount } from "./budget-categories";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Called when a couple marks a vendor (or, later, a venue) as booked --
// upserts the matching budget line so it shows a real quote and the
// booked vendor/venue's photo/contact, instead of staying on the
// placeholder estimate. Never overwrites an existing override_value
// with nothing: if the caller doesn't have a dollar amount yet (e.g.
// status just flipped to "booked" before an amount is entered), the
// couple's existing number (or lack of one) is left alone.
export async function syncBudgetLineFromBooking(
  supabase: SupabaseServerClient,
  wedding: Wedding,
  params: {
    categoryKey: string;
    purchasedFrom: string;
    vendorId?: string | null;
    venueId?: string | null;
    overrideAmount?: number | null;
  },
): Promise<{ error?: string }> {
  const category = BUDGET_CATEGORIES.find((c) => c.key === params.categoryKey);
  if (!category) return {};

  const { data: guests } = await supabase
    .from("guests")
    .select("status, plus_one")
    .eq("wedding_id", wedding.id);

  const guestCount = effectiveGuestCount(wedding, guests ?? []);
  const computed = computeCategoryValue(
    category,
    guestCount,
    wedding.region,
    wedding.season,
    wedding.style_tier,
  );

  const { data: existing } = await supabase
    .from("budget_line_items")
    .select("override_value")
    .eq("wedding_id", wedding.id)
    .eq("category", params.categoryKey)
    .maybeSingle<{ override_value: number | null }>();

  const { error } = await supabase.from("budget_line_items").upsert(
    {
      wedding_id: wedding.id,
      user_id: wedding.user_id,
      category: params.categoryKey,
      label: category.label,
      base_value: computed,
      override_value: params.overrideAmount ?? existing?.override_value ?? null,
      purchased_from: params.purchasedFrom,
      vendor_id: params.vendorId ?? null,
      venue_id: params.venueId ?? null,
    },
    { onConflict: "wedding_id,category" },
  );

  return error ? { error: error.message } : {};
}
