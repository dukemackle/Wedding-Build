"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import { readUploadedContract } from "@/lib/ai/read-uploaded-contract";
import { BUDGET_CATEGORIES } from "@/lib/budget-categories";

const BUCKET = "contracts";

// Vendor contracts arrive as PDFs, scans, and phone photos of a signed page.
// An allowlist rather than a blocklist: anything not named here is refused,
// so a new file type can never slip in by being unanticipated.
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_CONTRACT_BYTES = 15 * 1024 * 1024;

// Signed URLs are minted per click and expire quickly. Long enough to start a
// download on a slow connection, short enough that a URL pasted into a chat or
// left in browser history stops working almost immediately.
const SIGNED_URL_TTL_SECONDS = 60;

async function requireOwnWedding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  return { supabase, user, wedding };
}

/**
 * The budget page's two row kinds are addressed differently: a category row by
 * its category key, a custom row by its budget_custom_items id. The form sends
 * whichever applies and this resolves it into the column pair the table's
 * check constraint expects.
 */
function resolveTarget(formData: FormData) {
  const category = (formData.get("category") as string)?.trim();
  const customItemId = (formData.get("custom_item_id") as string)?.trim();

  if (category && !customItemId) return { category, custom_item_id: null };
  if (customItemId && !category) return { category: null, custom_item_id: customItemId };
  return null;
}

export async function uploadContract(formData: FormData) {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding first." };

  const target = resolveTarget(formData);
  if (!target) return { error: "Could not tell which budget item this belongs to." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Upload a PDF, Word document, or photo of the contract." };
  }
  if (file.size > MAX_CONTRACT_BYTES) {
    return { error: "That file is too large — please use one under 15MB." };
  }

  // The wedding id is the first path segment because the storage policies key
  // off exactly that (storage.foldername(name))[1].
  const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const path = `${wedding.id}/${randomUUID()}${extension ? `.${extension}` : ""}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: "Could not upload that file — please try again." };
  }

  const { data: row, error } = await supabase
    .from("budget_contracts")
    .insert({
      wedding_id: wedding.id,
      ...target,
      storage_path: path,
      file_name: file.name,
      file_size: file.size,
      content_type: file.type,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !row) {
    // Don't leave the object orphaned in the bucket if the row didn't land --
    // it would count against storage forever with nothing referencing it.
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: "Could not save that contract — please try again." };
  }

  // Read it now, so a contract attached to a budget line turns up on the
  // Checklist page already summarised with its dates found.
  await readUploadedContract(supabase, {
    id: row.id,
    wedding_id: wedding.id,
    storage_path: path,
    file_name: file.name,
    content_type: file.type,
  });

  revalidatePath("/budget");
  revalidatePath("/checklist");
  revalidatePath("/bookings");
  return { success: true };
}

export async function deleteContract(formData: FormData) {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding first." };

  const id = (formData.get("id") as string)?.trim();
  if (!id) return { error: "Missing contract." };

  // Read the path back through RLS rather than trusting one from the client:
  // this both finds the object and proves the row belongs to this wedding.
  const { data: contract } = await supabase
    .from("budget_contracts")
    .select("storage_path")
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .maybeSingle<{ storage_path: string }>();

  if (!contract) return { error: "That contract is no longer there." };

  const { error } = await supabase
    .from("budget_contracts")
    .delete()
    .eq("id", id)
    .eq("wedding_id", wedding.id);

  if (error) return { error: "Could not delete that contract — please try again." };

  // Row first, file second. The other order can delete the file and then fail
  // the row, leaving a listing that points at nothing.
  await supabase.storage.from(BUCKET).remove([contract.storage_path]);

  revalidatePath("/budget");
  revalidatePath("/checklist");
  revalidatePath("/bookings");
  return { success: true };
}

/**
 * Gives an unfiled contract (one uploaded on the Checklist, which has no
 * category) a category, so it moves onto that vendor's card on Bookings and
 * onto the same line of the budget.
 *
 * Only ever files a contract that is still unfiled: one already on a budget
 * line is left where the couple put it.
 */
export async function fileContract(formData: FormData) {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding first." };

  const id = (formData.get("id") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  if (!id) return { error: "Missing contract." };
  if (!category || !BUDGET_CATEGORIES.some((c) => c.key === category)) {
    return { error: "Choose what this contract is for." };
  }

  const { data, error } = await supabase
    .from("budget_contracts")
    .update({ category })
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .is("category", null)
    .is("custom_item_id", null)
    .select("id");

  if (error) return { error: "Could not file that contract — please try again." };
  if (!data?.length) return { error: "That contract has already been filed." };

  revalidatePath("/budget");
  revalidatePath("/checklist");
  revalidatePath("/bookings");
  return { success: true };
}

/**
 * Mints a short-lived signed URL for one contract.
 *
 * The bucket is private, so there is no permanent URL to store or render --
 * every download goes through here, which re-checks ownership at the moment
 * of the click rather than relying on a link handed out earlier.
 */
export async function getContractUrl(formData: FormData) {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding first." };

  const id = (formData.get("id") as string)?.trim();
  if (!id) return { error: "Missing contract." };

  const { data: contract } = await supabase
    .from("budget_contracts")
    .select("storage_path")
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .maybeSingle<{ storage_path: string }>();

  if (!contract) return { error: "That contract is no longer there." };

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(contract.storage_path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return { error: "Could not open that contract — please try again." };

  return { url: data.signedUrl };
}
