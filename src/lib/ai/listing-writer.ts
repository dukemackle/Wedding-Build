import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { takeReadAllowance } from "@/lib/ai/listing-reader";

/**
 * "Help me write this": turns a venue's few words ("ocean views, 200 guests,
 * modern") into the one-liner or About text on their listing. A draft only --
 * it lands in the box for them to edit, and the admin still reviews it.
 */
const MODEL = "claude-haiku-4-5";

/** Drafts per listing per day. Each is a small, cheap call. */
export const MAX_WRITES_PER_DAY = 20;

export type WriteField = "description" | "about";

const SHAPES: Record<WriteField, { max: number; brief: string }> = {
  description: {
    max: 200,
    brief: "ONE sentence, at most 160 characters, that a couple reads on a search card. No name at the start.",
  },
  about: {
    max: 3000,
    brief: "Two or three short paragraphs (120-220 words) for the listing's About section, in the venue's own voice (\"we\").",
  },
};

const SYSTEM = `You write wedding venue listings for You Do, I Do, a wedding-planning site.

Rules:
- Use only the facts given. Never invent a view, a capacity, a price, an award or a feature.
- Plain, warm and specific. No "nestled", "breathtaking", "dream wedding", "look no further", or exclamation marks.
- Write for engaged couples deciding whether to visit.
- Reply with the text only: no quotes, no heading, no preamble.`;

export async function writeListingCopy({
  listingId,
  field,
  facts,
  notes,
}: {
  listingId: string;
  field: WriteField;
  /** What the form already knows: name, town, capacity, type... */
  facts: Record<string, string | number | null | undefined>;
  /** What they typed into "What makes your venue special?" */
  notes: string;
}): Promise<{ error?: string; text?: string }> {
  if (!process.env.ANTHROPIC_API_KEY) return { error: "This isn't switched on yet -- write it yourself for now." };
  const shape = SHAPES[field];
  const known = Object.entries(facts)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(([k, v]) => `- ${k}: ${String(v).slice(0, 300)}`)
    .join("\n");
  if (!notes.trim() && !known) return { error: "Tell us a little about the venue first." };
  if (!(await takeReadAllowance("venue", listingId, "write", MAX_WRITES_PER_DAY))) {
    return { error: "That's today's drafts used up -- edit the last one, or try again tomorrow." };
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Write: ${shape.brief}\n\nWhat we know about the venue:\n${known || "- (nothing yet)"}\n\nIn the venue's own words:\n${notes.trim().slice(0, 1000) || "(nothing)"}`,
        },
      ],
    });
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim()
      .replace(/^["“]|["”]$/g, "");
    if (!text) return { error: "Couldn't write that just now -- please try again." };
    return { text: text.slice(0, shape.max) };
  } catch {
    return { error: "Couldn't write that just now -- please try again in a minute." };
  }
}
