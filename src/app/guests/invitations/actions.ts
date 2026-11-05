"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isInvitationTemplate } from "@/lib/save-the-date/invitations";
import { STALE_CARD, cardDocSchema, parseCardDoc } from "@/lib/save-the-date/schema";
import { MAX_INVITATIONS, templateById } from "@/lib/save-the-date/templates";
import { requireEditableWedding } from "@/lib/wedding-access";
import { invitationContent, newInvitation, type InvitationRow } from "./load";

const LIST = "/guests/invitations";

/**
 * Autosaves one invitation (via /api/invitation). `version` is the updated_at
 * the editor last saw; a row that has moved on since isn't overwritten.
 */
export async function saveInvitation(id: string, doc: unknown, version: string | null): Promise<{ error?: string; stale?: boolean; version?: string }> {
  const parsed = cardDocSchema.safeParse(doc);
  if (!parsed.success || !id || !isInvitationTemplate(parsed.data.template)) return { error: "That invitation couldn't be saved." };
  if (!version) return { error: STALE_CARD, stale: true };

  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { data, error } = await supabase
    .from("invitations")
    .update({ doc: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .eq("updated_at", version)
    .select("updated_at")
    .maybeSingle<{ updated_at: string }>();
  if (error) return { error: error.message };
  if (!data) return { error: STALE_CARD, stale: true };
  revalidatePath(LIST);
  return { version: data.updated_at };
}

/**
 * A new invitation on a design, carrying the words of their latest one (or,
 * for the first, their wedding details), then into the studio.
 */
export async function createInvitation(template: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { data: rows } = await supabase
    .from("invitations")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("updated_at", { ascending: false })
    .returns<InvitationRow[]>();
  const list = rows ?? [];
  if (list.length >= MAX_INVITATIONS) return { error: `You can keep ${MAX_INVITATIONS} designs. Delete one to start another.` };

  const latest = list.map((r) => parseCardDoc(r.doc)).find(Boolean) ?? null;
  const fresh = newInvitation(template, latest?.content ?? (await invitationContent(supabase, wedding)));
  const doc = latest ? { ...fresh, back: latest.back ?? fresh.back } : fresh;

  const { data, error } = await supabase
    .from("invitations")
    .insert({ wedding_id: wedding.id, doc, name: templateById(doc.template).name, chosen: !list.some((r) => r.chosen) })
    .select("id")
    .single<{ id: string }>();
  if (error) return { error: error.message };
  revalidatePath(LIST);
  redirect(`${LIST}/edit/${data.id}`);
}

export async function deleteInvitation(id: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const { data: gone, error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id)
    .eq("wedding_id", wedding.id)
    .select("chosen")
    .maybeSingle<{ chosen: boolean }>();
  if (error) return { error: error.message };
  // The next newest becomes the one they're using.
  if (gone?.chosen) {
    const { data: next } = await supabase
      .from("invitations")
      .select("id")
      .eq("wedding_id", wedding.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string }>();
    if (next) await supabase.from("invitations").update({ chosen: true }).eq("id", next.id);
  }
  revalidatePath(LIST);
  return {};
}
