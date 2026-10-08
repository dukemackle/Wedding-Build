"use server";

import { revalidatePath } from "next/cache";
import { siteDesignSchema } from "@/lib/site-design-schema";
import { requireEditableWedding } from "@/lib/wedding-access";

/** Every change in the editor lands here. Guests see none of it until Publish. */
export async function saveSiteDraft(design: unknown): Promise<{ error?: string }> {
  const parsed = siteDesignSchema.safeParse(design);
  if (!parsed.success) return { error: "That design couldn't be saved." };

  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { error } = await supabase
    .from("weddings")
    .update({ site_design_draft: parsed.data })
    .eq("id", wedding.id);

  if (error) return { error: error.message };
  return {};
}

/**
 * Publish is a copy: the draft becomes what guests see. Takes the editor's
 * current design rather than re-reading the draft, so a save still in flight
 * can't publish the design from one click earlier.
 */
export async function publishSiteDesign(design: unknown): Promise<{ error?: string }> {
  const parsed = siteDesignSchema.safeParse(design);
  if (!parsed.success) return { error: "That design couldn't be published." };

  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };

  const { error } = await supabase
    .from("weddings")
    .update({ site_design_draft: parsed.data, site_design: parsed.data })
    .eq("id", wedding.id);

  if (error) return { error: error.message };
  revalidatePath("/guests/site");
  if (wedding.public_slug) revalidatePath(`/w/${wedding.public_slug}`);
  return {};
}
