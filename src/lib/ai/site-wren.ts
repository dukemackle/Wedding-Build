import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { BG_PATTERNS, BG_TEXTURES, PALETTES, SITE_ART } from "@/lib/site-design";
import { TEMPLATES } from "@/lib/site-templates";

/**
 * Wren on the guest site editor (Editor v2, phase 5b):
 * - "Describe your ideal site": a sentence becomes a template, palette,
 *   artwork, background and motion, all picked from what the editor has.
 * - "Wren, write this": drafts the couple's story, FAQ, travel notes or a
 *   welcome line from their wedding details. A draft only -- it lands in a
 *   box for them to edit before anything is saved.
 */
const MODEL = "claude-opus-5-5";

/**
 * Wren calls per wedding per day, both kinds together: the ceiling on what
 * one couple can spend (the owner chose a daily cap, 2026-10-08).
 */
export const MAX_SITE_AI_PER_DAY = 3;

const BUSY = "Wren is busy right now — try again in a moment.";

/** Counts the call before it runs: a failed call is still a paid one. */
export async function takeSiteAllowance(weddingId: string, purpose: "design" | "write"): Promise<boolean> {
  const admin = createAdminSupabaseClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("site_ai_uses")
    .select("id", { count: "exact", head: true })
    .eq("wedding_id", weddingId)
    .gte("created_at", since);
  if ((count ?? 0) >= MAX_SITE_AI_PER_DAY) return false;
  const { error } = await admin.from("site_ai_uses").insert({ wedding_id: weddingId, purpose });
  return !error;
}

/** The couple's details, one per line, leaving out anything unknown. */
export type WeddingFacts = Record<string, string | number | null | undefined>;

function factLines(facts: WeddingFacts) {
  return (
    Object.entries(facts)
      .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
      .map(([k, v]) => `- ${k}: ${String(v).slice(0, 600)}`)
      .join("\n") || "- (nothing yet)"
  );
}

// ---------------------------------------------------------------------------
// Describe your ideal site.

const ART_IDS = SITE_ART.map((a) => a.id);

// Long lists become hints rather than hard limits in the output format, so the
// fields are plain strings and every pick is checked against its list below.
const designSchema = z.object({
  template: z.string(),
  palette: z.string(),
  art: z.string(),
  artPlacement: z.string(),
  pattern: z.string(),
  texture: z.string(),
  motion: z.string(),
  /** One sentence to the couple on why, shown under the result. */
  why: z.string(),
});

const pickOf = <T extends string>(value: string, allowed: readonly T[], fallback: T): T =>
  (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

/** A pick with every field from its list: anything else falls back to a safe choice. */
function cleanPick(raw: z.infer<typeof designSchema>) {
  return {
    template: pickOf(raw.template, TEMPLATES.map((t) => t.id), TEMPLATES[0].id),
    palette: pickOf(raw.palette, ["none", ...PALETTES.map((p) => p.id)], "none"),
    art: pickOf(raw.art, ["none", ...ART_IDS], "none"),
    artPlacement: pickOf(raw.artPlacement, ["sides", "corners"] as const, "sides"),
    pattern: pickOf(raw.pattern, BG_PATTERNS.map((p) => p.id), "none"),
    texture: pickOf(raw.texture, BG_TEXTURES.map((t) => t.id), "none"),
    motion: pickOf(raw.motion, ["none", "subtle", "lively"] as const, "subtle"),
    why: raw.why.trim().slice(0, 300),
  };
}

export type SiteDesignPick = ReturnType<typeof cleanPick>;

const DESIGN_SYSTEM = `You are Wren, a wedding planner inside the You Do, I Do app, helping a couple choose the look of their wedding website.

You pick from fixed lists only. Each option is described below; choose the combination that best matches what the couple asked for.

Templates (a starting look):
${TEMPLATES.map((t) => `- ${t.id}: ${t.name} (${t.tags.join(", ")}; theme ${t.theme})`).join("\n")}

Palettes ("none" keeps the template's own colours):
${PALETTES.map((p) => `- ${p.id}: ${p.name}`).join("\n")}

Artwork ("none" for no artwork; line pieces take the accent colour, watercolours keep their own):
${SITE_ART.map((a) => `- ${a.id}: ${a.name} (${a.group}, ${a.kind === "line" ? "line drawing" : "watercolour"})`).join("\n")}

Patterns: ${BG_PATTERNS.map((p) => p.id).join(", ")}. Textures: ${BG_TEXTURES.map((t) => t.id).join(", ")}. Motion: none, subtle, lively.

Rules:
- Match colours, mood and place to what they said. If they name colours, pick the palette closest to them.
- Keep it designed: at most one of pattern or texture unless they ask for more, and artwork that suits the template.
- "why" is one short, warm sentence to the couple about the choice, specific to what they said. No exclamation marks, no "dream", "magical" or "fairytale".`;

export async function pickSiteDesign(description: string, facts: WeddingFacts): Promise<{ error?: string; pick?: SiteDesignPick }> {
  if (!process.env.ANTHROPIC_API_KEY) return { error: "This isn't switched on yet — pick a template for now." };
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      // A short choice from lists: little thinking needed.
      output_config: { effort: "low", format: zodOutputFormat(designSchema) },
      system: DESIGN_SYSTEM,
      messages: [
        {
          role: "user",
          content: `What we know about the wedding:\n${factLines(facts)}\n\nHow the couple described their ideal site:\n${description.trim().slice(0, 600)}`,
        },
      ],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return { error: BUSY };
    return { pick: cleanPick(response.parsed_output) };
  } catch {
    return { error: BUSY };
  }
}

// ---------------------------------------------------------------------------
// Wren, write this.

export const WRITE_KINDS = ["story", "faq", "travel", "welcome"] as const;
export type WriteKind = (typeof WRITE_KINDS)[number];

const BRIEFS: Record<Exclude<WriteKind, "faq">, string> = {
  story:
    "Their story for the website, in the couple's own voice (\"we\"): two or three short paragraphs, 90-160 words, about how they met and what's ahead. Use only what their notes say about their story; if the notes are thin, keep it short rather than inventing.",
  travel:
    "Travel notes for guests: getting there, parking, where to stay and anything to know on the day, as short plain paragraphs or lines, 60-140 words, in the couple's voice (\"we\").",
  welcome: "One welcoming line for the top of the website, in the couple's voice, at most 14 words.",
};

const WRITE_SYSTEM = `You are Wren, a wedding planner inside the You Do, I Do app, drafting words for a couple's wedding website. The couple will edit the draft before guests see it, and it is published under their names, so write as them.

Rules:
- Warm and specific, never florid: no "dream", "magical", "fairytale", "happily ever after", no emoji, at most one exclamation mark.
- Use only the details given. Never invent a date, place, time, name, price or fact. Leave out what isn't known rather than guessing.
- No placeholders like [Name] or TBD.
- Reply with the words only: no heading, no quotes, no preamble.`;

const faqSchema = z.object({
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
});

export type DraftCopy = { text?: string; faqs?: { question: string; answer: string }[] };

export async function draftSiteCopy(kind: WriteKind, notes: string, facts: WeddingFacts): Promise<{ error?: string; draft?: DraftCopy }> {
  if (!process.env.ANTHROPIC_API_KEY) return { error: "This isn't switched on yet — write it yourself for now." };
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const known = `What we know about the wedding:\n${factLines(facts)}\n\nThe couple's notes:\n${notes.trim().slice(0, 1500) || "(none)"}`;
  try {
    if (kind === "faq") {
      const response = await client.messages.parse({
        model: MODEL,
        max_tokens: 6000,
        output_config: { effort: "low", format: zodOutputFormat(faqSchema) },
        system: WRITE_SYSTEM,
        messages: [
          {
            role: "user",
            content: `Write 4 to 6 questions guests usually ask (dress code, plus-ones, kids, parking, gifts, RSVP timing), each with a short answer in the couple's voice that uses only the details given. Skip any question the details can't answer.\n\n${known}`,
          },
        ],
      });
      const faqs = response.parsed_output?.faqs
        .map((f) => ({ question: f.question.trim().slice(0, 200), answer: f.answer.trim().slice(0, 1000) }))
        .filter((f) => f.question && f.answer)
        .slice(0, 8);
      if (response.stop_reason === "refusal" || !faqs?.length) return { error: BUSY };
      return { draft: { faqs } };
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: "low" },
      system: WRITE_SYSTEM,
      messages: [{ role: "user", content: `Write: ${BRIEFS[kind]}\n\n${known}` }],
    });
    if (response.stop_reason === "refusal") return { error: BUSY };
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .replace(/^["“]|["”]$/g, "");
    if (!text) return { error: BUSY };
    return { draft: { text: text.slice(0, kind === "welcome" ? 200 : 3000) } };
  } catch {
    return { error: BUSY };
  }
}
