import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SiteDesign } from "@/lib/site-design";
import { parseSiteDesign } from "@/lib/site-design-schema";
import { parseWording, withWording } from "@/lib/site-designs";
import { STARTER_DESIGN } from "@/lib/site-templates";
import type { SiteDesignRow, Wedding } from "@/lib/supabase/types";

export type DesignSummary = {
  id: string;
  name: string;
  sharedWording: boolean;
  updatedAt: string;
  live: boolean;
  /** As it opens: with the shared words in its headings if it uses them. */
  design: SiteDesign;
};

/**
 * What Your designs and the template gallery both show: the couple's designs
 * (live first, then most recently edited), the design templates are applied
 * over, and whether the couple has a photo yet.
 */
export async function loadSiteDesigns() {
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
  if (!wedding) return { user, wedding: null } as const;

  const { data: rows } = await supabase
    .from("site_designs")
    .select("*")
    .eq("wedding_id", wedding.id)
    .order("updated_at", { ascending: false })
    .returns<SiteDesignRow[]>();

  const wording = parseWording(wedding.site_wording);
  const designs: DesignSummary[] = (rows ?? []).map((row) => {
    const stored = parseSiteDesign(row.design);
    return {
      id: row.id,
      name: row.name,
      sharedWording: row.shared_wording,
      updatedAt: row.updated_at,
      live: row.id === wedding.live_design_id,
      design: row.shared_wording ? withWording(stored, wording) : stored,
    };
  });
  designs.sort((a, b) => Number(b.live) - Number(a.live));

  const headersList = await headers();
  const host = headersList.get("host");
  const origin = host ? `${host.startsWith("localhost") ? "http" : "https"}://${host}` : "";

  return {
    user,
    wedding,
    designs,
    /** Templates go over this, so a new design keeps the couple's sections and words. */
    base: withWording(designs[0]?.design ?? STARTER_DESIGN, wording),
    photoUrl: wedding.hero_photo_url?.startsWith("https://") ? wedding.hero_photo_url : null,
    liveUrl: wedding.public_slug ? `${origin}/w/${wedding.public_slug}` : null,
  } as const;
}
