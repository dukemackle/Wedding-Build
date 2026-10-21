"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { WeddingInvite, WeddingRole } from "@/lib/supabase/types";
import { STATE_TO_REGION } from "@/lib/budget-categories";
import { seasonOf } from "@/lib/wedding-options";
import { requireEditableWedding, VIEW_ONLY_ERROR } from "@/lib/wedding-access";
import { seedStandardPlan } from "@/lib/seed-plan";
import { MAX_DASHBOARD_PHOTOS } from "@/lib/dashboard-photos";
import type { Wedding } from "@/lib/supabase/types";
import { logError } from "@/lib/error-log";
import { trackEvent } from "@/lib/events";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Whole days from one YYYY-MM-DD to another. */
function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

function addDays(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

async function shiftSchedule(
  supabase: Awaited<ReturnType<typeof requireEditableWedding>>["supabase"],
  weddingId: string,
  days: number,
): Promise<{ error?: string }> {
  if (!days) return {};
  const { data: events, error } = await supabase
    .from("itinerary_events")
    .select("id, event_date")
    .eq("wedding_id", weddingId)
    .returns<{ id: string; event_date: string }[]>();
  if (error) return { error: error.message };
  for (const e of events ?? []) {
    const { error: moveError } = await supabase
      .from("itinerary_events")
      .update({ event_date: addDays(e.event_date, days) })
      .eq("id", e.id)
      .eq("wedding_id", weddingId);
    if (moveError) return { error: moveError.message };
  }
  return {};
}

export async function saveWedding(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding: existing, noWedding } = await requireEditableWedding();

  // A view-only member has a wedding but can't change it.
  if (!existing && noWedding === VIEW_ONLY_ERROR) {
    return { error: noWedding };
  }

  const guestCountOverrideRaw = formData.get("guest_count_override") as string;
  const state = (formData.get("state") as string) || null;
  const weddingDate = (formData.get("wedding_date") as string) || null;

  // A typo'd year (2026 for 2027) would show "Married N days ago". Allow
  // yesterday for time zones, and an unchanged date so a wedding that has
  // happened can still be edited afterwards.
  if (weddingDate && weddingDate !== existing?.wedding_date) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (weddingDate < yesterday) {
      return { error: "That wedding date is in the past. Check the year?" };
    }
  }

  const rsvpDeadline = (formData.get("rsvp_deadline") as string) || null;
  if (rsvpDeadline && weddingDate && rsvpDeadline >= weddingDate) {
    return { error: "Your RSVP deadline is on or after the wedding date. Pick a day before it." };
  }

  const details = {
    partner_a_name: formData.get("partner_a_name") as string,
    partner_b_name: formData.get("partner_b_name") as string,
    wedding_date: weddingDate,
    state,
    // The couple only ever picks a state -- region still drives the
    // budget-multiplier math under the hood, so it's derived here
    // automatically instead of being its own separate question.
    region: (state && STATE_TO_REGION[state]) ?? null,
    // The date decides the season once there is one, so the two can't
    // disagree; the picker only matters while the date is still open.
    season: (weddingDate && seasonOf(weddingDate)) || (formData.get("season") as string) || null,
    style_tier: (formData.get("style_tier") as string) || null,
    venue_type: (formData.get("venue_type") as string) || null,
    guest_count_override: guestCountOverrideRaw
      ? Number(guestCountOverrideRaw)
      : null,
    rsvp_deadline: rsvpDeadline,
    updated_at: new Date().toISOString(),
  };

  // Someone invited onto a wedding edits that wedding, not a new one of their
  // own -- an upsert keyed on their user_id would quietly create a second
  // wedding for them.
  const { data: saved, error } = existing
    ? await supabase.from("weddings").update(details).eq("id", existing.id).select().maybeSingle<Wedding>()
    : await supabase
        .from("weddings")
        .upsert({ user_id: user.id, ...details }, { onConflict: "user_id" })
        .select()
        .maybeSingle<Wedding>();

  if (error) {
    // Raw Postgres text ("new row violates row-level security policy...")
    // means nothing to a couple; keep it in the logs.
    console.error("saveWedding failed", error);
    await logError("planning", "saveWedding", error);
    return { error: "We couldn't save your wedding details. Please try again in a moment." };
  }
  if (!existing && saved) trackEvent("wedding_created", { weddingId: saved.id, userId: user.id });

  // A moved wedding moves its weekend: every schedule event shifts by the same
  // number of days (the form's "Move my schedule too", on by default), so the
  // rehearsal stays the night before and guests don't see the old dates.
  const oldDate = existing?.wedding_date;
  if (saved && oldDate && weddingDate && oldDate !== weddingDate && formData.get("shift_schedule") === "on") {
    const shifted = await shiftSchedule(supabase, saved.id, daysBetween(oldDate, weddingDate));
    if (shifted.error) console.error("shiftSchedule failed", shifted.error);
  }

  // The date is what the standard checklist counts back from, so it arrives
  // with the date. A failure here shouldn't undo a good save; the checklist
  // page tries again.
  if (saved?.wedding_date && !saved.plan_seeded_at) {
    const seeded = await seedStandardPlan(supabase, saved, user.id);
    if (seeded.error) console.error("seedStandardPlan failed", seeded.error);
    revalidatePath("/checklist");
  }

  revalidatePath("/dashboard");
  return {};
}

/**
 * Which of the two photos is being set.
 *
 * The hero photo is the wide banner on the public wedding site; the profile
 * photo is the tight crop beside the couple's names on the dashboard. Same
 * upload path, different column, and edited in different places -- each beside
 * the thing it actually appears on.
 */
export type WeddingPhotoKind = "hero" | "profile";

const PHOTO_COLUMN: Record<WeddingPhotoKind, "hero_photo_url" | "profile_photo_url"> = {
  hero: "hero_photo_url",
  profile: "profile_photo_url",
};

function photoKindFromForm(formData: FormData): WeddingPhotoKind {
  return formData.get("kind") === "profile" ? "profile" : "hero";
}

/**
 * A banner the couple uploaded or removed has no library photographer to
 * credit. Separate from the photo's own update so a database without
 * migration 0132 still saves the photo.
 */
async function clearHeroCredit(
  supabase: Awaited<ReturnType<typeof requireEditableWedding>>["supabase"],
  weddingId: string,
) {
  await supabase.from("weddings").update({ hero_photo_credit: null }).eq("id", weddingId);
}

export async function uploadWeddingPhoto(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const photo = formData.get("photo") as File | null;
  if (!photo || photo.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (!photo.type.startsWith("image/")) {
    return { error: "Photo must be an image file." };
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return { error: "Photo is too large — please use one under 5MB." };
  }

  const extension = photo.name.includes(".") ? photo.name.split(".").pop() : undefined;
  const path = `${wedding.id}/${randomUUID()}${extension ? `.${extension}` : ""}`;

  const { error: uploadError } = await supabase.storage
    .from("wedding-photos")
    .upload(path, photo, { contentType: photo.type });

  if (uploadError) {
    return { error: "Could not upload your photo — please try again." };
  }

  const photoUrl = supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;

  const { error } = await supabase
    .from("weddings")
    .update({ [PHOTO_COLUMN[photoKindFromForm(formData)]]: photoUrl })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  if (photoKindFromForm(formData) === "hero") await clearHeroCredit(supabase, wedding.id);

  revalidatePath("/dashboard");
  revalidatePath("/guests");
  return {};
}

export async function removeWeddingPhoto(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const { error } = await supabase
    .from("weddings")
    .update({ [PHOTO_COLUMN[photoKindFromForm(formData)]]: null })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  if (photoKindFromForm(formData) === "hero") await clearHeroCredit(supabase, wedding.id);

  revalidatePath("/dashboard");
  revalidatePath("/guests");
  return {};
}

/**
 * Adds one photo to the set shown behind the dashboard. Called once per file
 * when several are picked at once, so each upload stays under the 5MB cap.
 */
export async function addDashboardPhoto(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const current = wedding.dashboard_photo_urls ?? [];
  if (current.length >= MAX_DASHBOARD_PHOTOS) {
    return { error: `You can show up to ${MAX_DASHBOARD_PHOTOS} photos. Remove one to add another.` };
  }

  const photo = formData.get("photo") as File | null;
  if (!photo || photo.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (!photo.type.startsWith("image/")) {
    return { error: "Photo must be an image file." };
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return { error: "Photo is too large — please use one under 5MB." };
  }

  const extension = photo.name.includes(".") ? photo.name.split(".").pop() : undefined;
  const path = `${wedding.id}/${randomUUID()}${extension ? `.${extension}` : ""}`;

  const { error: uploadError } = await supabase.storage
    .from("wedding-photos")
    .upload(path, photo, { contentType: photo.type });

  if (uploadError) {
    return { error: "Could not upload your photo — please try again." };
  }

  const photoUrl = supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;

  const { error } = await supabase
    .from("weddings")
    .update({ dashboard_photo_urls: [...current, photoUrl] })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

/** Sets where a dashboard photo is centred when cropped, as x/y percentages. */
export async function setDashboardPhotoFocus(
  photoUrl: string,
  x: number,
  y: number,
): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }
  if (!(wedding.dashboard_photo_urls ?? []).includes(photoUrl)) {
    return { error: "That photo isn't on your dashboard any more." };
  }

  const clamp = (n: number) => (Number.isFinite(n) ? Math.round(Math.min(100, Math.max(0, n))) : 50);
  const { error } = await supabase
    .from("weddings")
    .update({
      dashboard_photo_focus: { ...(wedding.dashboard_photo_focus ?? {}), [photoUrl]: [clamp(x), clamp(y)] },
    })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function removeDashboardPhoto(photoUrl: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();

  if (!wedding) {
    return { error: noWedding };
  }

  const { error } = await supabase
    .from("weddings")
    .update({
      dashboard_photo_urls: (wedding.dashboard_photo_urls ?? []).filter((url) => url !== photoUrl),
      dashboard_photo_focus: Object.fromEntries(
        Object.entries(wedding.dashboard_photo_focus ?? {}).filter(([url]) => url !== photoUrl),
      ),
    })
    .eq("id", wedding.id);

  if (error) {
    return { error: error.message };
  }

  // Free the storage too. Only files in this wedding's own folder, and a
  // failure here just leaves an orphaned file, so it isn't reported.
  const marker = "/wedding-photos/";
  const path = photoUrl.slice(photoUrl.indexOf(marker) + marker.length);
  if (photoUrl.includes(marker) && path.startsWith(`${wedding.id}/`)) {
    await supabase.storage.from("wedding-photos").remove([path]);
  }

  revalidatePath("/dashboard");
  return {};
}

// Only the wedding's creator decides who else is on it -- editors get full
// read/write on everything else, but inviting, changing roles and removing
// people stays with whoever set the wedding up, same as the delete policy on
// the weddings row itself. RLS on wedding_members/wedding_invites enforces
// the same rule; the checks here are for a readable error.
async function requireWeddingOwner() {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) {
    return { error: noWedding } as const;
  }
  if (wedding.user_id !== user.id) {
    return { error: "Only the wedding owner can change who's planning." } as const;
  }
  return { supabase, wedding } as const;
}

function parseRole(role: string): WeddingRole {
  return role === "view" ? "view" : "edit";
}

export async function createPlanningInvite(
  role: string,
): Promise<{ error?: string; invite?: WeddingInvite }> {
  const owner = await requireWeddingOwner();
  if ("error" in owner) return { error: owner.error };

  const { data, error } = await owner.supabase
    .from("wedding_invites")
    .insert({ wedding_id: owner.wedding.id, role: parseRole(role) })
    .select("*")
    .single<WeddingInvite>();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { invite: data };
}

export async function cancelPlanningInvite(token: string): Promise<{ error?: string }> {
  const owner = await requireWeddingOwner();
  if ("error" in owner) return { error: owner.error };

  const { error } = await owner.supabase
    .from("wedding_invites")
    .delete()
    .eq("token", token)
    .eq("wedding_id", owner.wedding.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function setPlannerRole(userId: string, role: string): Promise<{ error?: string }> {
  const owner = await requireWeddingOwner();
  if ("error" in owner) return { error: owner.error };

  const { error } = await owner.supabase
    .from("wedding_members")
    .update({ role: parseRole(role) })
    .eq("wedding_id", owner.wedding.id)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function removePlanner(userId: string): Promise<{ error?: string }> {
  const owner = await requireWeddingOwner();
  if ("error" in owner) return { error: owner.error };

  const { error } = await owner.supabase
    .from("wedding_members")
    .delete()
    .eq("wedding_id", owner.wedding.id)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}
