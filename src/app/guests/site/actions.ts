"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Wedding } from "@/lib/supabase/types";
import { siteDesignSchema } from "@/lib/site-design";

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
    .or(`user_id.eq.${user.id},member_ids.cs.{${user.id}}`)
    .maybeSingle<Wedding>();

  return { supabase, wedding };
}

/** Every change in the editor lands here. Guests see none of it until Publish. */
export async function saveSiteDraft(design: unknown): Promise<{ error?: string }> {
  const parsed = siteDesignSchema.safeParse(design);
  if (!parsed.success) return { error: "That design couldn't be saved." };

  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

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

  const { supabase, wedding } = await requireOwnWedding();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  const { error } = await supabase
    .from("weddings")
    .update({ site_design_draft: parsed.data, site_design: parsed.data })
    .eq("id", wedding.id);

  if (error) return { error: error.message };
  revalidatePath("/guests/site");
  if (wedding.public_slug) revalidatePath(`/w/${wedding.public_slug}`);
  return {};
}
