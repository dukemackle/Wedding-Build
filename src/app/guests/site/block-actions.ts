"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SiteBlock, Wedding } from "@/lib/supabase/types";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const KINDS = ["photo", "story", "quote"] as const;

async function requireOwnWedding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();
  return { supabase, wedding };
}

function revalidate(slug: string | null) {
  revalidatePath("/guests/site");
  if (slug) revalidatePath(`/w/${slug}`);
}

function text(formData: FormData, key: string, max: number) {
  const raw = ((formData.get(key) as string | null) ?? "").trim();
  return raw ? raw.slice(0, max) : null;
}

/**
 * A new, empty block. The editor then puts it in the draft's section list;
 * guests see it once the couple publishes.
 */
export async function createSiteBlock(kind: string): Promise<{ error?: string; block?: SiteBlock }> {
  if (!KINDS.includes(kind as (typeof KINDS)[number])) return { error: "Unknown kind of section." };
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const { data, error } = await supabase
    .from("site_blocks")
    .insert({ wedding_id: wedding.id, kind })
    .select("*")
    .single<SiteBlock>();
  if (error) return { error: error.message };

  revalidate(wedding.public_slug);
  return { block: data };
}

/** Saves a block's words, and its photo when one is chosen. */
export async function updateSiteBlock(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };
  const id = formData.get("id") as string;

  const patch: Partial<SiteBlock> = {
    heading: text(formData, "heading", 200),
    body: text(formData, "body", 5000),
    attribution: text(formData, "attribution", 200),
    updated_at: new Date().toISOString(),
  };

  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    if (!photo.type.startsWith("image/")) return { error: "Photos must be image files." };
    if (photo.size > MAX_PHOTO_BYTES) return { error: "That photo is too large — please use one under 5MB." };
    const extension = photo.name.includes(".") ? photo.name.split(".").pop() : undefined;
    const path = `${wedding.id}/blocks/${randomUUID()}${extension ? `.${extension}` : ""}`;
    const { error: uploadError } = await supabase.storage
      .from("wedding-photos")
      .upload(path, photo, { contentType: photo.type });
    if (uploadError) return { error: "Could not upload your photo — please try again." };
    patch.photo_url = supabase.storage.from("wedding-photos").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase
    .from("site_blocks")
    .update(patch)
    .eq("id", id)
    .eq("wedding_id", wedding.id);
  if (error) return { error: error.message };

  revalidate(wedding.public_slug);
  return {};
}

/**
 * Deletes the block. Its entry in the draft is removed by the editor; one
 * left in the published design is skipped when the page renders.
 */
export async function deleteSiteBlock(id: string): Promise<{ error?: string }> {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const { error } = await supabase.from("site_blocks").delete().eq("id", id).eq("wedding_id", wedding.id);
  if (error) return { error: error.message };

  revalidate(wedding.public_slug);
  return {};
}
