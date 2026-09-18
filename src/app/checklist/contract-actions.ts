"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import type { ContractTask } from "@/lib/ai/contract-reader";
import { readUploadedContract } from "@/lib/ai/read-uploaded-contract";

const BUCKET = "contracts";

// Same allowlist as the budget page's uploader: anything not named here is
// refused, so a new file type can never slip in by being unanticipated.
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_CONTRACT_BYTES = 15 * 1024 * 1024;

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
 * A contract kept on the Checklist page rather than against a budget line.
 *
 * Same bucket, same row, same RLS as a budget contract -- since 0071 the
 * table simply allows a row that points at neither a category nor a custom
 * item, because a contract is worth keeping whether or not a budget line for
 * it exists yet.
 */
export async function uploadPlanningContract(formData: FormData) {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "Choose a file to upload." };
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Upload a PDF or a photo of the contract." };
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
  if (uploadError) return { error: "Could not upload that file — please try again." };

  const { data: row, error } = await supabase
    .from("budget_contracts")
    .insert({
      wedding_id: wedding.id,
      category: null,
      custom_item_id: null,
      storage_path: path,
      file_name: file.name,
      file_size: file.size,
      content_type: file.type,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !row) {
    // Don't leave the object orphaned in the bucket if the row didn't land.
    await supabase.storage.from(BUCKET).remove([path]);
    return { error: "Could not save that contract — please try again." };
  }

  // Read it now rather than waiting to be asked. Never fails the upload.
  await readUploadedContract(supabase, {
    id: row.id,
    wedding_id: wedding.id,
    storage_path: path,
    file_name: file.name,
    content_type: file.type,
  });

  revalidatePath("/checklist");
  return { success: true };
}

/**
 * Sends one contract to Claude and hands back what it read.
 *
 * Nothing is written to the checklist here. The tasks come back for the
 * couple to look at, tick and save -- Wren guessing nine deadlines into
 * someone's planning list unasked would be worse than not offering this at
 * all, and these are dates with money behind them.
 */
export async function summariseContract(
  formData: FormData,
): Promise<{ error?: string; summary?: string; tasks?: ContractTask[] }> {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const contractId = (formData.get("contract_id") as string)?.trim();
  if (!contractId) return { error: "Which contract?" };

  const { data: contract } = await supabase
    .from("budget_contracts")
    .select("id, storage_path, file_name, content_type")
    .eq("id", contractId)
    .eq("wedding_id", wedding.id)
    .maybeSingle<{ id: string; storage_path: string; file_name: string; content_type: string | null }>();

  if (!contract) return { error: "That contract is no longer here." };

  await readUploadedContract(supabase, {
    id: contract.id,
    wedding_id: wedding.id,
    storage_path: contract.storage_path,
    file_name: contract.file_name,
    content_type: contract.content_type,
  });

  const { data: after } = await supabase
    .from("budget_contracts")
    .select("summary, proposed_tasks, read_error")
    .eq("id", contract.id)
    .maybeSingle<{ summary: string | null; proposed_tasks: ContractTask[] | null; read_error: string | null }>();

  if (!after?.summary) {
    return { error: after?.read_error ?? "Could not read that contract." };
  }

  revalidatePath("/checklist");
  return { summary: after.summary, tasks: after.proposed_tasks ?? [] };
}

/** Writes the tasks the couple ticked into the checklist. */
export async function saveContractTasks(
  formData: FormData,
): Promise<{ error?: string; added?: number }> {
  const { supabase, user, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  let tasks: ContractTask[];
  try {
    tasks = JSON.parse((formData.get("tasks") as string) || "[]");
  } catch {
    return { error: "Could not read those tasks — please try again." };
  }
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { error: "Pick at least one task to add." };
  }

  const fileName = ((formData.get("file_name") as string) || "").trim();

  const rows = tasks
    .filter((task) => typeof task?.title === "string" && task.title.trim() !== "")
    .slice(0, 20)
    .map((task) => ({
      wedding_id: wedding.id,
      user_id: user.id,
      title: task.title.trim().slice(0, 200),
      // Where it came from, so a date nobody recognises can be traced back to
      // the contract that produced it.
      notes: [task.notes?.trim(), fileName ? `From ${fileName}` : null]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 1000) || null,
      due_date: task.due_date ?? null,
    }));

  if (rows.length === 0) return { error: "Pick at least one task to add." };

  const { error } = await supabase.from("checklist_items").insert(rows);
  if (error) return { error: error.message };

  // They've been dealt with -- leaving them pending would invite adding the
  // same deadlines twice.
  const contractId = (formData.get("contract_id") as string)?.trim();
  if (contractId) {
    await supabase
      .from("budget_contracts")
      .update({ proposed_tasks: null })
      .eq("id", contractId)
      .eq("wedding_id", wedding.id);
  }

  revalidatePath("/checklist");
  return { added: rows.length };
}

export async function deletePlanningContract(formData: FormData) {
  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const contractId = (formData.get("contract_id") as string)?.trim();
  if (!contractId) return { error: "Which contract?" };

  const { data: contract } = await supabase
    .from("budget_contracts")
    .select("id, storage_path")
    .eq("id", contractId)
    .eq("wedding_id", wedding.id)
    .maybeSingle<{ id: string; storage_path: string }>();

  if (!contract) return { error: "That contract is no longer here." };

  await supabase.storage.from(BUCKET).remove([contract.storage_path]);
  const { error } = await supabase
    .from("budget_contracts")
    .delete()
    .eq("id", contract.id)
    .eq("wedding_id", wedding.id);

  if (error) return { error: error.message };

  revalidatePath("/checklist");
  return { success: true };
}
