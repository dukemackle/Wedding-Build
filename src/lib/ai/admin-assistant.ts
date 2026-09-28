"use server";

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { isAdminEmail } from "@/lib/admin";
import { buildAdminTools, type Lookup } from "@/lib/ai/admin-assistant-tools";

/** Same model as the couple-facing Wren: these are lookups, not hard reasoning. */
const MODEL = "claude-haiku-4-5";
const MAX_TURNS = 10;
/** Model calls per question: a few lookups, then the answer. */
const MAX_ITERATIONS = 8;
/** Questions per admin per day -- the ceiling on what this page can spend. */
const MAX_ADMIN_QUESTIONS_PER_DAY = 50;
const MAX_MESSAGE_CHARS = 2000;

export type AdminAssistantMessage = { role: "user" | "assistant"; content: string; lookups?: Lookup[] };

type Result =
  | { ok: true; reply: string; lookups: Lookup[]; usedToday: number }
  | { ok: false; error: string };

function systemPrompt() {
  const today = new Date().toISOString().slice(0, 10);
  return `You are Wren, answering the owner of You Do, I Do (a wedding-planning app, pre-launch) about their own data in the admin panel. Use the query tool to look things up -- never guess a number. Prefer count_by for "how many" questions instead of pulling every row.

Answer briefly: lead with the number or the finding, then the detail. Use a small markdown table when listing several rows (keep it to about 10 rows and say how many more there are). Only give one or two sentences of interpretation, and only where it's useful. Say plainly if the data can't answer the question.

Couples have admin pages at /admin/couples/<wedding id>; when you list couples, link their names like [Name](/admin/couples/<id>). Venues and vendors have no per-row admin page, so don't link them.

Today is ${today}.`;
}

async function usedToday(admin: ReturnType<typeof createAdminSupabaseClient>, userId: string) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count, error } = await admin
    .from("admin_assistant_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());
  // Before the migration runs the table is missing; don't lock the page for that.
  if (error) console.error("admin_assistant_log count failed:", error.message);
  return count ?? 0;
}

/** For the counter under the box. Only async exports are allowed in this file, hence a call. */
export async function getAdminQuestionAllowance(): Promise<{ used: number; cap: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cap = MAX_ADMIN_QUESTIONS_PER_DAY;
  if (!user || !isAdminEmail(user.email)) return { used: 0, cap };
  return { used: await usedToday(createAdminSupabaseClient(), user.id), cap };
}

export async function askAdminAssistant(history: AdminAssistantMessage[]): Promise<Result> {
  // Server actions can be called directly, so this re-checks rather than
  // trusting the layout's gate.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return { ok: false, error: "Admins only." };

  const trimmed = history.slice(-MAX_TURNS);
  while (trimmed.length > 0 && trimmed[0].role !== "user") trimmed.shift();
  const question = trimmed.at(-1);
  if (!question || question.role !== "user" || !question.content.trim()) {
    return { ok: false, error: "No question to answer." };
  }

  const admin = createAdminSupabaseClient();
  const used = await usedToday(admin, user.id);
  if (used >= MAX_ADMIN_QUESTIONS_PER_DAY) {
    return { ok: false, error: `That's ${MAX_ADMIN_QUESTIONS_PER_DAY} questions today. Try again tomorrow.` };
  }

  const { data: testWeddings } = await admin
    .from("weddings")
    .select("id")
    .eq("is_test", true)
    .returns<{ id: string }[]>();
  const lookups: Lookup[] = [];
  const client = new Anthropic();

  try {
    const finalMessage = await client.beta.messages.toolRunner({
      model: MODEL,
      max_tokens: 4096,
      max_iterations: MAX_ITERATIONS,
      system: systemPrompt(),
      tools: buildAdminTools({ admin, testWeddingIds: (testWeddings ?? []).map((w) => w.id), lookups }),
      messages: trimmed.map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) || "(no text)" })),
    });

    const reply = finalMessage.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n\n")
      .trim();
    if (!reply) return { ok: false, error: "Wren didn't come back with an answer. Try rephrasing." };

    const { error: logError } = await admin.from("admin_assistant_log").insert({
      user_id: user.id,
      question: question.content.slice(0, MAX_MESSAGE_CHARS),
      answer: reply,
    });
    if (logError) console.error("Failed to log admin question:", logError.message);

    return { ok: true, reply, lookups, usedToday: used + 1 };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "The assistant isn't configured (missing API key)." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "The assistant is busy -- try again in a moment." };
    }
    console.error("Admin assistant request failed:", error);
    return { ok: false, error: "Something went wrong reaching the assistant." };
  }
}
