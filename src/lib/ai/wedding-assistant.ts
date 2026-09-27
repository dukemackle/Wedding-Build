"use server";

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { ChecklistItem, RegionalCostData, Wedding } from "@/lib/supabase/types";
import { BUDGET_CATEGORIES, effectiveGuestCount } from "@/lib/budget-categories";
import { weddingCategoryEstimates } from "@/lib/estimator";
import { buildAssistantTools, type Proposal, type ProposalKind, type ToolContext } from "@/lib/ai/assistant-tools";
import { applyProposal } from "@/lib/ai/assistant-apply";

const MODEL = "claude-haiku-4-5";
const MAX_TURNS = 8;
/** Model calls per message: lookups, then proposals, then the reply. */
const MAX_ITERATIONS = 6;
/**
 * Messages per person per day. Each one is up to MAX_ITERATIONS paid model
 * calls, so this is the ceiling on what one account can spend in a day.
 */
const MAX_MESSAGES_PER_DAY = 30;
const MAX_MESSAGE_CHARS = 2000;

export type ProposalStatus = "pending" | "applied" | "skipped";

export type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
  /** Changes this reply offered, and what the couple did with each. */
  proposals?: (Proposal & { status: ProposalStatus })[];
};

type AssistantContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  weddingId: string | null;
  context: string;
  tools: ToolContext | null;
};

async function buildContext(): Promise<AssistantContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: wedding } = await supabase
    .from("weddings")
    .select("*")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<Wedding>();

  if (!wedding) {
    return {
      supabase,
      userId: user.id,
      weddingId: null,
      context: "This couple hasn't set up their wedding details yet.",
      tools: null,
    };
  }

  const [
    { data: guests },
    { data: budgetOverrides },
    { data: customItems },
    { data: checklist },
    { data: regionalData },
  ] = await Promise.all([
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
      supabase
        .from("regional_cost_data")
        .select("*")
        .eq("state", wedding.state ?? "")
        .returns<RegionalCostData[]>(),
    ]);

  const guestRows = guests ?? [];
  const headcount = effectiveGuestCount(wedding, guestRows);
  const confirmedCount = guestRows.filter((g) => g.status === "confirmed").length;
  const pendingCount = guestRows.filter((g) => g.status === "invited" || g.status === "pending").length;

  const overrideByCategory = new Map(
    (budgetOverrides ?? []).map((row) => [row.category, row.override_value]),
  );
  // Same arithmetic as the Budget page: hidden categories don't count.
  const hidden = new Set(wedding.hidden_budget_categories);
  const estimates = weddingCategoryEstimates(regionalData ?? [], wedding, headcount);
  const categoriesTotal = BUDGET_CATEGORIES.filter((c) => !hidden.has(c.key)).reduce((sum, category) => {
    const computed = estimates.get(category.key) ?? 0;
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
    wedding.state ? `State: ${wedding.state}` : null,
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

  const budgetPlanned = new Map(
    BUDGET_CATEGORIES.map((c) => [c.key, overrideByCategory.get(c.key) ?? estimates.get(c.key) ?? 0]),
  );

  return {
    supabase,
    userId: user.id,
    weddingId: wedding.id,
    context: lines.join("\n"),
    tools: { supabase, weddingId: wedding.id, budgetPlanned, hiddenCategories: hidden },
  };
}

/** What the model sees of an earlier reply: its words, plus the cards it offered. */
function historyText(m: AssistantMessage) {
  const content = m.content.slice(0, MAX_MESSAGE_CHARS);
  if (!m.proposals?.length) return content || "(no text)";
  const cards = m.proposals.map((p) => `- ${p.title} (${p.status === "pending" ? "not confirmed yet" : p.status})`);
  return `${content}\n\n[Changes offered for confirmation:\n${cards.join("\n")}]`;
}

function systemPrompt(context: string, canAct: boolean) {
  const today = new Date().toISOString().slice(0, 10);
  const acting = canAct
    ? `

You can also make changes for them, using the tools:
- Look things up first (find_guests, list_tasks, list_budget, list_tables, list_itinerary) so you use real ids -- never invent an id.
- Then call the propose_* tools. A proposal doesn't change anything: the couple sees a card and presses Confirm. So never say a change is done -- say it's ready for them to confirm below.
- Batch related changes into one proposal (five tasks = one propose_add_tasks call).
- If a name matches more than one guest, or the request is ambiguous, ask instead of guessing.
- You can't delete anything. If they ask, tell them to do it on the page.
- Seating: keep households and plus-ones together, don't exceed a table's capacity, and follow any "keep apart" / "sit near" wishes they give. Only seat confirmed or invited guests unless told otherwise.
- Timelines: build realistic day-of schedules with buffers (hair & makeup starts 4-5 hours before the ceremony, photos, travel between locations, cocktail hour ~1 hour, dinner, toasts, first dance, send-off). Use the wedding date unless told otherwise.
- Vendor emails and messages: just write them in your reply; there's no tool for sending.`
    : "";
  return `You are Wren, a friendly, concise wedding-planning assistant inside the You Do, I Do app. Help this couple with planning questions -- budgeting advice, guest list strategy, vendor tips, timeline suggestions, etiquette, etc. Use the details below when relevant, but don't recite them back unprompted. Keep answers short and practical (a few sentences, or a short list). If asked something outside wedding planning, gently redirect.${acting}

Today is ${today}.

Their wedding so far:
${context}`;
}

type AssistantResult =
  | { ok: true; reply: string; proposals: Proposal[] }
  | { ok: false; error: string };

export async function askWeddingAssistant(history: AssistantMessage[]): Promise<AssistantResult> {
  const ctx = await buildContext();
  if (!ctx) {
    return { ok: false, error: "You need to be logged in to use the assistant." };
  }

  const trimmedHistory = history.slice(-MAX_TURNS);
  // The API needs the conversation to open on a user turn.
  while (trimmedHistory.length > 0 && trimmedHistory[0].role !== "user") trimmedHistory.shift();
  if (trimmedHistory.length === 0 || trimmedHistory[trimmedHistory.length - 1].role !== "user") {
    return { ok: false, error: "No message to respond to." };
  }

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count } = await ctx.supabase
    .from("assistant_conversations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .gte("created_at", startOfDay.toISOString());
  if ((count ?? 0) >= MAX_MESSAGES_PER_DAY) {
    return {
      ok: false,
      error: `That's ${MAX_MESSAGES_PER_DAY} messages today -- Wren needs a rest. Try again tomorrow.`,
    };
  }

  const client = new Anthropic();
  const proposals: Proposal[] = [];

  try {
    const finalMessage = await client.beta.messages.toolRunner({
      model: MODEL,
      max_tokens: 4096,
      max_iterations: MAX_ITERATIONS,
      system: systemPrompt(ctx.context, ctx.tools !== null),
      tools: ctx.tools ? buildAssistantTools(ctx.tools, proposals) : [],
      messages: trimmedHistory.map((m) => ({ role: m.role, content: historyText(m) })),
    });

    const reply = finalMessage.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n\n")
      .trim();

    if (!reply && proposals.length === 0) {
      return { ok: false, error: "The assistant didn't return a response. Try again." };
    }
    const answer = reply || "Here's what I'd change -- confirm what looks right.";

    const question = trimmedHistory[trimmedHistory.length - 1].content;
    const { error: logError } = await ctx.supabase.from("assistant_conversations").insert({
      wedding_id: ctx.weddingId,
      user_id: ctx.userId,
      question,
      answer: proposals.length
        ? `${answer}\n\n[Proposed: ${proposals.map((p) => p.title).join("; ")}]`
        : answer,
    });
    if (logError) {
      // Best-effort only -- never let a logging failure block the reply
      // the couple is actually waiting on.
      console.error("Failed to log assistant conversation:", logError.message);
    }

    return { ok: true, reply: answer, proposals };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: "The assistant isn't configured yet (missing API key)." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "The assistant is busy right now -- try again in a moment." };
    }
    console.error("Assistant request failed:", error);
    return { ok: false, error: "Something went wrong reaching the assistant." };
  }
}

/** Applies one card the couple confirmed. No model call, so it isn't capped. */
export async function applyAssistantProposal(
  kind: ProposalKind,
  input: unknown,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be logged in." };

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id")
    .or(`user_id.eq.${user.id},partner_user_id.eq.${user.id}`)
    .maybeSingle<{ id: string }>();
  if (!wedding) return { error: "Set up your wedding on the Dashboard first." };

  return applyProposal(supabase, wedding.id, kind, input);
}
