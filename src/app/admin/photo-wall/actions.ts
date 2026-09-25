"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

const BUCKET = "guest-photos";

// The couple approves their own wall; this is the backstop for something they
// missed or never looked at. Hiding is reversible from the couple's side,
// deleting also removes the file from storage.

async function revalidateWall(weddingId: string) {
  const admin = createAdminSupabaseClient();
  const { data: wedding } = await admin
    .from("weddings")
    .select("public_slug")
    .eq("id", weddingId)
    .maybeSingle<{ public_slug: string | null }>();
  revalidatePath("/admin/photo-wall");
  if (wedding?.public_slug) revalidatePath(`/w/${wedding.public_slug}`);
}

export async function hideGuestPost(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const postId = formData.get("post_id") as string;
  if (!postId) return { error: "Missing post id." };

  const admin = createAdminSupabaseClient();
  const { data: post, error } = await admin
    .from("guest_posts")
    .update({ status: "hidden" })
    .eq("id", postId)
    .select("wedding_id")
    .maybeSingle<{ wedding_id: string }>();

  if (error) return { error: error.message };
  if (post) await revalidateWall(post.wedding_id);
  return {};
}

export async function deleteGuestPostAsAdmin(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const postId = formData.get("post_id") as string;
  if (!postId) return { error: "Missing post id." };

  const admin = createAdminSupabaseClient();
  const { data: post, error } = await admin
    .from("guest_posts")
    .delete()
    .eq("id", postId)
    .select("wedding_id, photo_url")
    .maybeSingle<{ wedding_id: string; photo_url: string | null }>();

  if (error) return { error: error.message };
  if (!post) return {};

  // photo_url is the public URL; the storage path is whatever follows the
  // bucket name in it (`<wedding_id>/<uuid>.<ext>`).
  const marker = `/${BUCKET}/`;
  const at = post.photo_url?.indexOf(marker) ?? -1;
  if (post.photo_url && at !== -1) {
    await admin.storage.from(BUCKET).remove([post.photo_url.slice(at + marker.length)]);
  }

  await revalidateWall(post.wedding_id);
  return {};
}
