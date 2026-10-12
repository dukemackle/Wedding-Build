"use server";

import { revalidatePath } from "next/cache";
import { DEFAULT_SITE_DESIGN, PALETTES, type SiteDesign } from "@/lib/site-design";
import { parseSiteDesign, siteDesignSchema } from "@/lib/site-design-schema";
import { MAX_DESIGNS, STALE_DESIGN, parseWording, uniqueName, withWording, wordingOf } from "@/lib/site-designs";
import { applyTemplate, templateById } from "@/lib/site-templates";
import type { SiteDesignRow } from "@/lib/supabase/types";
import { requireEditableWedding } from "@/lib/wedding-access";

type Access = Awaited<ReturnType<typeof requireEditableWedding>>;
type Editable = Access & { wedding: NonNullable<Access["wedding"]> };

/** One of this wedding's designs, or null. */
async function loadDesign(access: Editable, id: string) {
  if (typeof id !== "string" || !id) return null;
  const { data } = await access.supabase
    .from("site_designs")
    .select("*")
    .eq("id", id)
    .eq("wedding_id", access.wedding.id)
    .maybeSingle<SiteDesignRow>();
  return data;
}

/** A design as it opens: with the shared words in its headings if it uses them. */
function opened(row: SiteDesignRow, siteWording: unknown): SiteDesign {
  const design = parseSiteDesign(row.design);
  return row.shared_wording ? withWording(design, parseWording(siteWording)) : design;
}

type Stored = { error?: string; stale?: boolean; version?: string };

/**
 * Saves one design and, when it shares its wording, the words for every
 * design that does. `version` is the updated_at the editor last saw: when
 * the row has moved on since (two partners editing at once), nothing is
 * written, so one device's stale copy can't overwrite the other's work.
 */
async function store(access: Editable, id: string, design: SiteDesign, version: string | null): Promise<Stored> {
  // The words as this design had them, so shared wording is only written
  // when this save changed it -- not overwritten by a partner's unrelated save.
  const before = await loadDesign(access, id);
  let query = access.supabase
    .from("site_designs")
    .update({ design, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("wedding_id", access.wedding.id);
  if (version) query = query.eq("updated_at", version);
  const { data, error } = await query
    .select("shared_wording, updated_at")
    .maybeSingle<{ shared_wording: boolean; updated_at: string }>();
  if (error) return { error: error.message };
  if (!data) {
    if (before && version) return { error: STALE_DESIGN, stale: true };
    return { error: "That design was deleted. Head back to Your designs." };
  }
  const wordsChanged =
    !before || JSON.stringify(wordingOf(parseSiteDesign(before.design))) !== JSON.stringify(wordingOf(design));
  if (data.shared_wording && wordsChanged) {
    const { error: wordingError } = await access.supabase
      .from("weddings")
      .update({ site_wording: wordingOf(design) })
      .eq("id", access.wedding.id);
    if (wordingError) return { error: wordingError.message, version: data.updated_at };
  }
  return { version: data.updated_at };
}

function revalidate(slug: string | null) {
  revalidatePath("/guests/site", "layout");
  if (slug) revalidatePath(`/w/${slug}`);
}

/** Every change in the editor lands here. Guests see none of it until it's published. */
export async function saveSiteDraft(designId: string, design: unknown, version: string | null): Promise<Stored> {
  const parsed = siteDesignSchema.safeParse(design);
  if (!parsed.success) return { error: "That design couldn't be saved." };

  const access = await requireEditableWedding();
  if (!access.wedding) return { error: access.noWedding };
  return store(access as Editable, designId, parsed.data, typeof version === "string" ? version : null);
}

/**
 * Publish is a copy: this design becomes what guests see, and the live one.
 * Takes the editor's current design rather than re-reading it, so a save
 * still in flight can't publish the design from one click earlier.
 */
export async function publishSiteDesign(designId: string, design: unknown, version: string | null): Promise<Stored> {
  const parsed = siteDesignSchema.safeParse(design);
  if (!parsed.success) return { error: "That design couldn't be published." };

  const access = await requireEditableWedding();
  if (!access.wedding) return { error: access.noWedding };
  const saved = await store(access as Editable, designId, parsed.data, typeof version === "string" ? version : null);
  if (saved.error) return saved;

  const { error } = await access.supabase
    .from("weddings")
    .update({ site_design: parsed.data, live_design_id: designId })
    .eq("id", access.wedding.id);
  // The design did save, so the editor still needs its new version.
  if (error) return { error: error.message, version: saved.version };
  revalidate(access.wedding.public_slug);
  return { version: saved.version };
}

/** "Make this the live site" from Your designs. */
export async function makeDesignLive(designId: string): Promise<{ error?: string }> {
  const access = await requireEditableWedding();
  if (!access.wedding) return { error: access.noWedding };
  const row = await loadDesign(access as Editable, designId);
  if (!row) return { error: "That design couldn't be found." };

  const { error } = await access.supabase
    .from("weddings")
    .update({ site_design: opened(row, access.wedding.site_wording), live_design_id: row.id })
    .eq("id", access.wedding.id);
  if (error) return { error: error.message };
  revalidate(access.wedding.public_slug);
  return {};
}

/**
 * A new design: from a template (and one of its colour options), or a copy
 * of an existing design. A template is applied over the live design, so the
 * new one keeps the couple's sections and anything they've placed.
 */
export async function createDesign(from: {
  template?: string;
  palette?: string | null;
  copyOf?: string;
}): Promise<{ error?: string; id?: string }> {
  const access = await requireEditableWedding();
  if (!access.wedding) return { error: access.noWedding };
  const wedding = access.wedding;

  const { data: rows } = await access.supabase
    .from("site_designs")
    .select("id, name, design, shared_wording, updated_at")
    .eq("wedding_id", wedding.id)
    .order("updated_at", { ascending: false })
    .returns<SiteDesignRow[]>();
  const all = rows ?? [];
  if (all.length >= MAX_DESIGNS) {
    return { error: `You can keep up to ${MAX_DESIGNS} designs. Delete one to make room.` };
  }

  let name: string;
  let design: SiteDesign;
  let shared = true;
  if (from.copyOf) {
    const source = all.find((r) => r.id === from.copyOf);
    if (!source) return { error: "That design couldn't be found." };
    name = `${source.name.slice(0, 54)} copy`;
    shared = source.shared_wording;
    design = opened(source, wedding.site_wording);
  } else {
    const template = templateById(from.template);
    if (!template) return { error: "Pick a template first." };
    const base = all.find((r) => r.id === wedding.live_design_id) ?? all[0];
    const look = applyTemplate(base ? opened(base, wedding.site_wording) : DEFAULT_SITE_DESIGN, template);
    const palette = PALETTES.find((p) => p.id === from.palette);
    design = palette
      ? { ...look, accent: palette.accent, colors: { bg: palette.bg, ink: palette.ink, heading: palette.heading } }
      : look;
    // A first design has no words of its own yet; it starts from the shared ones.
    design = withWording(design, parseWording(wedding.site_wording));
    name = template.name;
  }

  const { data, error } = await access.supabase
    .from("site_designs")
    .insert({
      wedding_id: wedding.id,
      name: uniqueName(name, all.map((r) => r.name)),
      design,
      shared_wording: shared,
    })
    .select("id")
    .single<{ id: string }>();
  if (error) return { error: error.message };
  revalidatePath("/guests/site");
  return { id: data.id };
}

export async function renameDesign(designId: string, name: string): Promise<{ error?: string }> {
  const trimmed = typeof name === "string" ? name.trim().slice(0, 60) : "";
  if (!trimmed) return { error: "Give it a name." };
  const access = await requireEditableWedding();
  if (!access.wedding) return { error: access.noWedding };
  const { error } = await access.supabase
    .from("site_designs")
    .update({ name: trimmed })
    .eq("id", designId)
    .eq("wedding_id", access.wedding.id);
  if (error) return { error: error.message };
  revalidatePath("/guests/site", "layout");
  return {};
}

/** The live design can't be deleted: guests would be looking at nothing to edit. */
export async function deleteDesign(designId: string): Promise<{ error?: string }> {
  const access = await requireEditableWedding();
  if (!access.wedding) return { error: access.noWedding };
  if (access.wedding.live_design_id === designId) {
    return { error: "This is the one guests see. Make another design live first." };
  }
  const { error } = await access.supabase
    .from("site_designs")
    .delete()
    .eq("id", designId)
    .eq("wedding_id", access.wedding.id);
  if (error) return { error: error.message };
  revalidatePath("/guests/site");
  return {};
}

/**
 * The "Use my shared wording" switch. Either way the design ends up holding
 * the shared words: turned off, it keeps a copy of them to change on its own;
 * turned on, its own words give way to the shared ones.
 */
export async function setSharedWording(designId: string, on: boolean): Promise<{ error?: string }> {
  const access = await requireEditableWedding();
  if (!access.wedding) return { error: access.noWedding };
  const row = await loadDesign(access as Editable, designId);
  if (!row) return { error: "That design couldn't be found." };

  const design = withWording(parseSiteDesign(row.design), parseWording(access.wedding.site_wording));
  const { error } = await access.supabase
    .from("site_designs")
    .update({ design, shared_wording: Boolean(on), updated_at: new Date().toISOString() })
    .eq("id", row.id);
  if (error) return { error: error.message };
  revalidatePath("/guests/site", "layout");
  return {};
}
