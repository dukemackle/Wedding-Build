"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { MAX_PLAN_M, MIN_PLAN_M, cleanOutline, feetToMetres } from "@/lib/venue-plans";

function refresh(venueId: string) {
  revalidatePath(`/admin/venues/${venueId}/plans`);
  revalidatePath("/venues/[id]", "page");
}

/** A new event space on the venue, for a plan to be drawn in. */
export async function addSpace(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const venueId = formData.get("venue_id") as string;
  const name = ((formData.get("name") as string) || "").trim();
  if (!name) return { error: "Give the space a name." };
  const setting = ((formData.get("setting") as string) || "").trim() || null;

  const admin = createAdminSupabaseClient();
  const { count } = await admin.from("venue_spaces").select("id", { count: "exact", head: true }).eq("venue_id", venueId);
  const { error } = await admin
    .from("venue_spaces")
    .insert({ venue_id: venueId, name, setting, sort_order: count ?? 0 });
  if (error) return { error: error.message };

  await logAdminAction("venue_space_added", { type: "venue", ids: [venueId] }, `Added space "${name}"`);
  refresh(venueId);
  return {};
}

export async function deleteSpace(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const venueId = formData.get("venue_id") as string;
  const spaceId = formData.get("space_id") as string;
  const admin = createAdminSupabaseClient();
  // Couples' copies keep their size and outline; only the link back clears.
  const { error } = await admin.from("venue_spaces").delete().eq("id", spaceId).eq("venue_id", venueId);
  if (error) return { error: error.message };
  await logAdminAction("venue_space_deleted", { type: "venue", ids: [venueId] }, "Deleted a space");
  refresh(venueId);
  return {};
}

/** Saves a space's size (typed in feet) and outline (sent in metres). */
export async function savePlan(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const venueId = formData.get("venue_id") as string;
  const spaceId = formData.get("space_id") as string;
  const width_m = feetToMetres(Number(formData.get("width_ft")));
  const length_m = feetToMetres(Number(formData.get("length_ft")));
  if (!(width_m >= MIN_PLAN_M && width_m <= MAX_PLAN_M && length_m >= MIN_PLAN_M && length_m <= MAX_PLAN_M)) {
    return { error: "Each side needs to be between 10 and 390 feet." };
  }
  let outlineRaw: unknown = null;
  try {
    outlineRaw = JSON.parse((formData.get("outline") as string) || "null");
  } catch {
    return { error: "The outline didn't come through. Try again." };
  }
  const outline = cleanOutline(outlineRaw, width_m, length_m);
  const published = formData.get("published") === "1";

  const admin = createAdminSupabaseClient();
  const { data: space } = await admin
    .from("venue_spaces")
    .select("id")
    .eq("id", spaceId)
    .eq("venue_id", venueId)
    .maybeSingle();
  if (!space) return { error: "That space is gone. Refresh the page." };

  const { error } = await admin.from("venue_space_plans").upsert({
    space_id: spaceId,
    venue_id: venueId,
    width_m,
    length_m,
    outline,
    published,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };

  await logAdminAction(
    "venue_plan_saved",
    { type: "venue", ids: [venueId] },
    `${published ? "Published" : "Saved"} a floor plan`,
  );
  refresh(venueId);
  return {};
}

export async function deletePlan(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const venueId = formData.get("venue_id") as string;
  const spaceId = formData.get("space_id") as string;
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("venue_space_plans").delete().eq("space_id", spaceId).eq("venue_id", venueId);
  if (error) return { error: error.message };
  await logAdminAction("venue_plan_deleted", { type: "venue", ids: [venueId] }, "Deleted a floor plan");
  refresh(venueId);
  return {};
}
