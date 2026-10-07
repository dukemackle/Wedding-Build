"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { WeddingInvite, WeddingRole } from "@/lib/supabase/types";
import { STATE_TO_REGION } from "@/lib/budget-categories";
import { requireEditableWedding, VIEW_ONLY_ERROR } from "@/lib/wedding-access";
import { seedStandardPlan } from "@/lib/seed-plan";
import { MAX_DASHBOARD_PHOTOS } from "@/lib/dashboard-photos";
import type { Wedding } from "@/lib/supabase/types";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Meteorological seasons, matching the SEASONS picker. */
function seasonOf(date: string) {
  const month = Number(date.slice(5, 7));
  if (!month) return null;
  if (month <= 2 || month === 12) return "Winter";
  if (month <= 5) return "Spring";
  if (month <= 8) return "Summer";
  return "Fall";
}

export async function saveWedding(formData: FormData): Promise<{ error?: string }> {
  const { supabase, user, wedding: existing, noWedding } = await requireEditableWedding();

  // A view-only member has a wedding but can't change it.
  if (!existing && noWedding === VIEW_ONLY_ERROR) {
    return { error: noWedding };
  }

  const guestCountOverrideRaw = formData.get("guest_count_override") as string;
  const state = formData.get("state") as string;
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

  const details = {
    partner_a_name: formData.get("partner_a_name") as string,
    partner_b_name: formData.get("partner_b_name") as string,
    wedding_date: weddingDate,
    state,
    // The couple only ever picks a state -- region still drives the
    // budget-multiplier math under the hood, so it's derived here
    // automatically instead of being its own separate question.
    region: STATE_TO_REGION[state] ?? null,
    // The date decides the season once there is one, so the two can't
    // disagree; the picker only matters while the date is still open.
    season: (weddingDate && seasonOf(weddingDate)) || (formData.get("season") as string),
    style_tier: formData.get("style_tier") as string,
    venue_type: formData.get("venue_type") as string,
    guest_count_override: guestCountOverrideRaw
      ? Number(guestCountOverrideRaw)
      : null,
    rsvp_deadline: (formData.get("rsvp_deadline") as string) || null,
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
    return { error: "We couldn't save your wedding details. Please try again in a moment." };
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
