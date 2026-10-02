"use server";

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

const MODEL = "claude-haiku-4-5";
const DAYS = 30;
/** Most recent questions sent; keeps one run to a few cents. */
const MAX_QUESTIONS = 400;
const MAX_QUESTION_CHARS = 300;

export type ThemeKind = "faq" | "gap" | "wren";

export type ChatTheme = {
  title: string;
  count: number;
  kind: ThemeKind;
  /** What couples are after, in Wren's words, never a couple's own. */
  summary: string;
  /** A paraphrased, name-free example question. */
  example: string;
};

type Result =
  | { ok: true; themes: ChatTheme[]; questionCount: number }
  | { ok: false; error: string };

const SYSTEM = `You group questions couples asked Wren, the planning assistant in You Do, I Do (a wedding-planning app), into themes for the app's owner.

Return 3 to 10 themes, largest first. For each:
- title: a short label, e.g. "Tipping vendors".
- count: how many of the questions fit it (a question counts once).
- kind: "gap" if couples want something the app can't do, "wren" if Wren's answers are likely to be weak or it can't see the data it needs, otherwise "faq" (a common question worth a help page or a ready answer).
- summary: one sentence on what couples are after.
- example: one representative question, paraphrased. Never include a person's name, a place more specific than a city, or anything that identifies a couple or guest.

Skip greetings and one-off questions that fit no theme.`;

const THEMES_TOOL: Anthropic.Tool = {
  name: "report_themes",
  description: "Report the themes found in the questions.",
  input_schema: {
    type: "object",
    properties: {
      themes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            count: { type: "integer" },
            kind: { type: "string", enum: ["faq", "gap", "wren"] },
            summary: { type: "string" },
            example: { type: "string" },
          },
          required: ["title", "count", "kind", "summary", "example"],
        },
      },
    },
    required: ["themes"],
  },
};

/** Clusters the last 30 days of Wren questions. Run on demand, so it costs nothing until clicked. */
export async function summarizeChatThemes(): Promise<Result> {
  await requireAdmin();
  const admin = createAdminSupabaseClient();

  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: rows, error }, { data: testWeddings }] = await Promise.all([
    admin
      .from("assistant_conversations")
      .select("question, wedding_id")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(MAX_QUESTIONS)
      .returns<{ question: string; wedding_id: string | null }[]>(),
    admin.from("weddings").select("id").eq("is_test", true).returns<{ id: string }[]>(),
  ]);
  if (error) return { ok: false, error: error.message };

  const testIds = new Set((testWeddings ?? []).map((w) => w.id));
  const questions = (rows ?? [])
    .filter((r) => !r.wedding_id || !testIds.has(r.wedding_id))
    .map((r) => r.question.trim().slice(0, MAX_QUESTION_CHARS))
    .filter(Boolean);
  if (questions.length === 0) return { ok: true, themes: [], questionCount: 0 };

  try {
    const message = await new Anthropic().messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM,
      tools: [THEMES_TOOL],
      tool_choice: { type: "tool", name: THEMES_TOOL.name },
      messages: [
        {
          role: "user",
          content: `${questions.length} questions from the last ${DAYS} days, one per line:\n\n${questions
            .map((q) => `- ${q.replace(/\s+/g, " ")}`)
            .join("\n")}`,
        },
      ],
    });
    const call = message.content.find((block) => block.type === "tool_use");
    const themes = (call?.input as { themes?: ChatTheme[] } | undefined)?.themes;
    if (!Array.isArray(themes)) return { ok: false, error: "Wren didn't return any themes. Try again." };
    return { ok: true, themes: themes.sort((a, b) => b.count - a.count), questionCount: questions.length };
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "The assistant isn't configured (missing API key)." };
    }
    if (err instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "The assistant is busy -- try again in a moment." };
    }
    console.error("Chat themes request failed:", err);
    return { ok: false, error: "Something went wrong reaching the assistant." };
  }
}
