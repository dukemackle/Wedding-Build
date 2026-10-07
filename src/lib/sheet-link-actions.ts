"use server";

import { revalidatePath } from "next/cache";
import type { SheetLinkKind } from "@/lib/supabase/types";
import { requireEditableWedding } from "@/lib/wedding-access";
import { parseGoogleSheetUrl } from "@/lib/spreadsheet";

const PAGES: Record<SheetLinkKind, string> = { guests: "/guests", budget: "/budget" };

function kindOf(value: FormDataEntryValue | null): SheetLinkKind | null {
  return value === "guests" || value === "budget" ? value : null;
}

/**
 * Remembers a sheet for a page, replacing whichever one was linked before.
 *
 * A new link starts with an empty snapshot: until the first sync there's no
 * shared past to compare against, so that sync matches rows by name.
 */
export async function linkSheet(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const kind = kindOf(formData.get("kind"));
  const mode = formData.get("mode") === "link" ? "link" : "drive";
  const url = ((formData.get("url") as string) || "").trim() || null;
  let fileId = ((formData.get("file_id") as string) || "").trim();
  let gid = ((formData.get("gid") as string) || "0").trim();

  if (!kind) return { error: "Unknown page." };
  if (mode === "link") {
    const parsed = url ? parseGoogleSheetUrl(url) : null;
    if (!parsed) return { error: "That doesn't look like a Google Sheets URL." };
    fileId = parsed.id;
    gid = parsed.gid;
  }
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(fileId) || !/^\d+$/.test(gid)) {
    return { error: "Couldn't tell which sheet that is." };
  }

  const { error } = await supabase.from("sheet_links").upsert(
    {
      wedding_id: wedding.id,
      kind,
      mode,
      file_id: fileId,
      sheet_gid: gid,
      title: ((formData.get("title") as string) || "").trim().slice(0, 200) || null,
      url,
      snapshot: {},
      pending_snapshot: null,
      pending_token: null,
      last_synced_at: null,
      last_synced_by: null,
      last_synced_by_name: null,
      last_summary: null,
      sheet_modified_at: null,
    },
    { onConflict: "wedding_id,kind" },
  );
  if (error) return { error: error.message };

  // The "Open your spreadsheet" link elsewhere on the page follows the sheet.
  if (url) await supabase.from("weddings").update({ spreadsheet_url: url }).eq("id", wedding.id);

  revalidatePath(PAGES[kind]);
  return {};
}

export async function unlinkSheet(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const kind = kindOf(formData.get("kind"));
  if (!kind) return { error: "Unknown page." };

  const { error } = await supabase
    .from("sheet_links")
    .delete()
    .eq("wedding_id", wedding.id)
    .eq("kind", kind);
  if (error) return { error: error.message };

  revalidatePath(PAGES[kind]);
  return {};
}

/**
 * The browser's word that its write to the sheet landed.
 *
 * Only now does the snapshot move to what was written. If the write failed
 * part way, the old snapshot stays, and the next sync sees the site's
 * unsent changes as still unsent -- rather than reading the sheet's stale
 * cells as edits and undoing them.
 */
export async function confirmSheetWrite(formData: FormData): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const kind = kindOf(formData.get("kind"));
  const token = (formData.get("token") as string) || "";
  if (!kind || !token) return { error: "Unknown sync." };

  const { data: link } = await supabase
    .from("sheet_links")
    .select("id, pending_snapshot, pending_token")
    .eq("wedding_id", wedding.id)
    .eq("kind", kind)
    .maybeSingle<{ id: string; pending_snapshot: unknown; pending_token: string | null }>();
  // Someone else synced in between; theirs is the newer snapshot.
  if (!link || link.pending_token !== token) return {};

  const modified = (formData.get("modified_time") as string) || "";
  const { error } = await supabase
    .from("sheet_links")
    .update({
      snapshot: link.pending_snapshot ?? {},
      pending_snapshot: null,
      pending_token: null,
      sheet_modified_at: modified && !Number.isNaN(Date.parse(modified)) ? modified : null,
    })
    .eq("id", link.id);
  if (error) return { error: error.message };

  revalidatePath(PAGES[kind]);
  return {};
}
