"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction, plural } from "@/lib/admin-audit";
import { leadKey } from "@/lib/leads";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { kindOf, unlinkedLines, type LeadKind } from "./load";

/** Sends a lead to research for the next batch, or dismisses it. */
export async function decideLead(lead: {
  kind: LeadKind;
  key: string;
  name: string;
  category: string | null;
  state: string | null;
  status: "research" | "dismissed";
}): Promise<{ error?: string }> {
  await requireAdmin();
  const { error } = await createAdminSupabaseClient()
    .from("listing_leads")
    .upsert({
      kind: lead.kind,
      name_key: lead.key,
      name: lead.name,
      category: lead.category,
      state: lead.state,
      status: lead.status,
      decided_at: new Date().toISOString(),
    });
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
  await logAdminAction("lead.decide", { type: "listing_lead", ids: [lead.key] }, `${lead.status === "research" ? "Sent to research" : "Dismissed"}: ${lead.name}`);
  return {};
}

/** Points every couple's budget line naming this lead at the listing it means. */
export async function linkLead(kind: LeadKind, key: string, listingId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const ids = (await unlinkedLines())
    .filter((l) => kindOf(l) === kind && leadKey(l.purchased_from) === key)
    .map((l) => l.id);
  if (!ids.length) return { error: "Those budget lines are already linked or gone." };
  const { error } = await createAdminSupabaseClient()
    .from("budget_line_items")
    .update(kind === "venue" ? { venue_id: listingId } : { vendor_id: listingId })
    .in("id", ids);
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
  await logAdminAction("lead.link", { type: kind, ids: [listingId] }, `Linked ${plural(ids.length, "budget line")} to a listing`);
  return {};
}
