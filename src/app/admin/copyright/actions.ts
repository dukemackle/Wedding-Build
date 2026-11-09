"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/admin-audit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { NOTICE_STATUSES, type NoticeStatus } from "./statuses";

const text = (formData: FormData, key: string, max: number) =>
  ((formData.get(key) as string) || "").trim().slice(0, max);

/** Logs a copyright notice as it arrives. Taking the content down is done where it lives. */
export async function addCopyrightNotice(formData: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const complainant = text(formData, "complainant", 300);
  const work = text(formData, "work", 1000);
  const contentUrl = text(formData, "content_url", 1000);
  const uploaderEmail = text(formData, "uploader_email", 200).toLowerCase() || null;
  const receivedAt = text(formData, "received_at", 10) || new Date().toISOString().slice(0, 10);
  const notes = text(formData, "notes", 2000) || null;
  if (!complainant || !work || !contentUrl) return { error: "Fill in who sent it, the work and the content's link." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(receivedAt)) return { error: "Received date isn't a date." };

  const { data, error } = await createAdminSupabaseClient()
    .from("copyright_notices")
    .insert({ complainant, work, content_url: contentUrl, uploader_email: uploaderEmail, received_at: receivedAt, notes })
    .select("id")
    .single<{ id: string }>();
  if (error) return { error: error.message };
  await logAdminAction("copyright.add", { type: "copyright_notice", ids: [data.id] }, "Logged a copyright notice");
  revalidatePath("/admin/copyright");
  return {};
}

export async function setCopyrightNoticeStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as NoticeStatus;
  if (!id || !NOTICE_STATUSES.some((s) => s.value === status)) return;

  const { error } = await createAdminSupabaseClient()
    .from("copyright_notices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logAdminAction("copyright.status", { type: "copyright_notice", ids: [id] }, `Marked a copyright notice ${status}`);
  revalidatePath("/admin/copyright");
}
