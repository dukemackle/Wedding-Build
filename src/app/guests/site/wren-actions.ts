"use server";

import { revalidatePath } from "next/cache";
import {
  MAX_SITE_AI_PER_DAY,
  WRITE_KINDS,
  draftSiteCopy,
  pickSiteDesign,
  takeSiteAllowance,
  type DraftCopy,
  type SiteDesignPick,
  type WeddingFacts,
  type WriteKind,
} from "@/lib/ai/site-wren";
import type { SiteBlock } from "@/lib/supabase/types";
import { requireEditableWedding } from "@/lib/wedding-access";

const USED_UP = `That's today's ${MAX_SITE_AI_PER_DAY} goes with Wren used — pick by hand for now, or try again tomorrow.`;

type Editable = Awaited<ReturnType<typeof requireEditableWedding>>;

/** What Wren may use: the couple's own details, nothing about their guests. */
async function factsFor({ supabase, wedding }: Editable, full: boolean): Promise<WeddingFacts> {
  if (!wedding) return {};
  const { data: venue } = wedding.venue_id
    ? await supabase.from("venues").select("name, city, state").eq("id", wedding.venue_id).maybeSingle<{ name: string | null; city: string | null; state: string | null }>()
    : { data: null };
  const facts: WeddingFacts = {
    "Couple": [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & "),
    "Wedding date": wedding.wedding_date,
    "Venue": venue?.name,
    "Place": [venue?.city, venue?.state].filter(Boolean).join(", ") || wedding.region,
  };
  if (!full) return facts;

  const [{ data: stays }, { data: events }] = await Promise.all([
    supabase.from("wedding_accommodations").select("name, notes").eq("wedding_id", wedding.id).limit(6),
    supabase
      .from("itinerary_events")
      .select("title, event_date, start_time, location, invite_only")
      .eq("wedding_id", wedding.id)
      .order("event_date", { ascending: true })
      .limit(12),
  ]);
  return {
    ...facts,
    "RSVP by": wedding.rsvp_deadline,
    "Dress code": wedding.dress_code,
    "Travel notes so far": wedding.travel_notes,
    "Places to stay": (stays ?? []).map((s) => [s.name, s.notes].filter(Boolean).join(" — ")).join("; "),
    // Invite-only events stay out: guests shouldn't learn of them from the site.
    "Schedule": (events ?? [])
      .filter((e) => !e.invite_only)
      .map((e) => [e.title, e.event_date, e.start_time, e.location].filter(Boolean).join(", "))
      .join("; "),
  };
}

/** "Describe your ideal site": Wren's pick, for the editor to apply as a draft change. */
export async function designWithWren(description: string): Promise<{ error?: string; pick?: SiteDesignPick }> {
  if (typeof description !== "string" || description.trim().length < 3) {
    return { error: "Tell Wren a little about the look you want first." };
  }
  const access = await requireEditableWedding();
  if (!access.wedding) return { error: access.noWedding };
  if (!(await takeSiteAllowance(access.wedding.id, "design"))) return { error: USED_UP };
  return pickSiteDesign(description, await factsFor(access, false));
}

/** "Wren, write this": a draft for the couple to edit. Nothing is saved yet. */
export async function writeWithWren(kind: WriteKind, notes: string): Promise<{ error?: string; draft?: DraftCopy }> {
  if (!WRITE_KINDS.includes(kind)) return { error: "Pick what Wren should write." };
  const access = await requireEditableWedding();
  if (!access.wedding) return { error: access.noWedding };
  if (!(await takeSiteAllowance(access.wedding.id, "write"))) return { error: USED_UP };
  return draftSiteCopy(kind, typeof notes === "string" ? notes : "", await factsFor(access, true));
}

function revalidateSite(slug: string | null) {
  revalidatePath("/guests/site");
  if (slug) revalidatePath(`/w/${slug}`);
}

/** Saves a story draft as a new story block; the editor adds it to the page. */
export async function saveStoryDraft(heading: string, body: string): Promise<{ error?: string; block?: SiteBlock }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const words = String(body ?? "").trim().slice(0, 5000);
  if (!words) return { error: "There's nothing to save yet." };
  const { data, error } = await supabase
    .from("site_blocks")
    .insert({ wedding_id: wedding.id, kind: "story", heading: String(heading ?? "").trim().slice(0, 200) || null, body: words })
    .select("*")
    .single<SiteBlock>();
  if (error) return { error: "Couldn't save that — try again." };
  revalidateSite(wedding.public_slug);
  return { block: data };
}

/** Adds the kept FAQ drafts after any the couple already has. */
export async function saveFaqDrafts(faqs: { question: string; answer: string }[]): Promise<{ error?: string; added?: number }> {
  const { supabase, user, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const rows = (Array.isArray(faqs) ? faqs : [])
    .map((f) => ({ question: String(f?.question ?? "").trim().slice(0, 200), answer: String(f?.answer ?? "").trim().slice(0, 1000) }))
    .filter((f) => f.question && f.answer)
    .slice(0, 8);
  if (!rows.length) return { error: "There's nothing to save yet." };
  const { count } = await supabase.from("wedding_faqs").select("id", { count: "exact", head: true }).eq("wedding_id", wedding.id);
  const { error } = await supabase
    .from("wedding_faqs")
    .insert(rows.map((r, i) => ({ ...r, wedding_id: wedding.id, user_id: user.id, sort_order: (count ?? 0) + i })));
  if (error) return { error: "Couldn't save those — try again." };
  revalidateSite(wedding.public_slug);
  return { added: rows.length };
}

/** Replaces the travel notes with the edited draft. */
export async function saveTravelDraft(text: string): Promise<{ error?: string }> {
  const { supabase, wedding, noWedding } = await requireEditableWedding();
  if (!wedding) return { error: noWedding };
  const notes = String(text ?? "").trim().slice(0, 3000);
  if (!notes) return { error: "There's nothing to save yet." };
  const { error } = await supabase.from("weddings").update({ travel_notes: notes }).eq("id", wedding.id);
  if (error) return { error: "Couldn't save that — try again." };
  revalidateSite(wedding.public_slug);
  return {};
}
