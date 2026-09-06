"use server";

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { ChecklistItem, Wedding } from "@/lib/supabase/types";
import { BUDGET_CATEGORIES, computeCategoryValue, effectiveGuestCount } from "@/lib/budget-categories";

const MODEL = "claude-haiku-4-5";
const MAX_TURNS = 8;

export type AssistantMessage = { role: "user" | "assistant"; content: string };

async function buildContext(): Promise<{ userId: string; context: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return { userId: user.id, context: "This couple hasn't set up their wedding details yet." };
  }

  const [{ data: guests }, { data: budgetOverrides }, { data: customItems }, { data: checklist }] =
    await Promise.all([
      supabase.from("guests").select("status, plus_one").eq("wedding_id", wedding.id),
      supabase
        .from("budget_line_items")
        .select("category, override_value")
        .eq("wedding_id", wedding.id),
      supabase.from("budget_custom_items").select("amount").eq("wedding_id", wedding.id),
      supabase
        .from("checklist_items")
        .select("*")
        .eq("wedding_id", wedding.id)
        .returns<ChecklistItem[]>(),
    ]);

  const guestRows = guests ?? [];
  const headcount = effectiveGuestCount(wedding, guestRows);
  const confirmedCount = guestRows.filter((g) => g.status === "confirmed").length;
  const pendingCount = guestRows.filter((g) => g.status === "invited" || g.status === "pending").length;

  const overrideByCategory = new Map(
    (budgetOverrides ?? []).map((row) => [row.category, row.override_value]),
  );
  const categoriesTotal = BUDGET_CATEGORIES.reduce((sum, category) => {
    const computed = computeCategoryValue(
      category,
      headcount,
      wedding.region,
      wedding.season,
      wedding.style_tier,
    );
    return sum + (overrideByCategory.get(category.key) ?? computed);
  }, 0);
  const customTotal = (customItems ?? []).reduce((sum, item) => sum + item.amount, 0);
  const budgetTotal = categoriesTotal + customTotal;

  const incompleteTasks = (checklist ?? []).filter((item) => !item.completed);

  const daysToWedding = wedding.wedding_date
    ? Math.ceil((new Date(`${wedding.wedding_date}T00:00:00`).getTime() - Date.now()) / 86_400_000)
    : null;

  const names = [wedding.partner_a_name, wedding.partner_b_name].filter(Boolean).join(" & ") || "the couple";

  const lines = [
    `Couple: ${names}`,
    wedding.wedding_date
      ? `Wedding date: ${wedding.wedding_date}${daysToWedding !== null ? ` (${daysToWedding >= 0 ? `${daysToWedding} days away` : "already happened"})` : ""}`
      : "Wedding date: not set yet",
    wedding.region ? `Region: ${wedding.region}` : null,
    wedding.style_tier ? `Style: ${wedding.style_tier}` : null,
    `Guests: ${headcount} expected (${confirmedCount} confirmed, ${pendingCount} awaiting response)`,
    `Estimated total budget: about $${budgetTotal.toLocaleString()}`,
    incompleteTasks.length > 0
      ? `Open checklist items (${incompleteTasks.length}): ${incompleteTasks
          .slice(0, 8)
          .map((t) => t.title)
          .join(", ")}`
      : "Checklist: all caught up",
  ].filter((line): line is string => Boolean(line));

  return { userId: user.id, context: lines.join("\n") };
}

export async function askWeddingAssistant(
  history: AssistantMessage[],
): Promise<{ ok: true; reply: string } | { ok: false; error: string }> {
  const ctx = await buildContext();
  if (!ctx) {
    return { ok: false, error: "You need to be logged in to use the assistant." };
  }

  const trimmedHistory = history.slice(-MAX_TURNS);
  if (trimmedHistory.length === 0 || trimmedHistory[trimmedHistory.length - 1].role !== "user") {
    return { ok: false, error: "No message to respond to." };
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `You are a friendly, concise wedding-planning assistant inside "The Wedding Ledger" app. Help this couple with planning questions -- budgeting advice, guest list strategy, vendor tips, timeline suggestions, etiquette, etc. Use the details below when relevant, but don't recite them back unprompted. Keep answers short and practical (a few sentences, or a short list). If asked something outside wedding planning, gently redirect.\n\nTheir wedding so far:\n${ctx.context}`,
      messages: trimmedHistory.map((m) => ({ role: m.role, content: m.content })),
    });

    const text = response.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") {
      return { ok: false, error: "The assistant didn't return a response. Try again." };
    }
    return { ok: true, reply: text.text };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "The assistant isn't configured yet (missing API key)." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "The assistant is busy right now -- try again in a moment." };
    }
    return { ok: false, error: "Something went wrong reaching the assistant." };
  }
}
