import "server-only";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { createClient } from "@/lib/supabase/server";
import type {
  BudgetCustomItem,
  ChecklistItem,
  Guest,
  ItineraryEvent,
  SeatingTable,
} from "@/lib/supabase/types";
import { BUDGET_CATEGORIES } from "@/lib/budget-categories";
import { GUEST_SIDES, GUEST_TYPES } from "@/lib/guest-groups";

/**
 * The assistant's hands. Two kinds of tool:
 *
 * - Lookups (`find_guests`, `list_tasks`, ...) run straight away -- they only
 *   read, and the model needs real ids before it can point at anything.
 * - Proposals (`propose_*`) never write. Each one is checked against the
 *   wedding's own rows, turned into a card the couple sees in the chat, and
 *   only applied when they press Confirm (`applyProposal`). The model is told
 *   so, and never gets to say "done".
 *
 * Deletes are deliberately missing: a wrong "add" is one tap to undo on the
 * page, a wrong delete isn't.
 */

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type ToolContext = {
  supabase: Supabase;
  weddingId: string;
  /** Planned amount per budget category, same numbers the Budget page shows. */
  budgetPlanned: Map<string, number>;
  hiddenCategories: Set<string>;
};

const date = () => z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");
const time = () => z.string().regex(/^\d{2}:\d{2}$/, "Use 24-hour HH:MM.");
const money = () => z.number().min(0).max(10_000_000);
const text = (max: number) => z.string().trim().min(1).max(max);

export const PROPOSAL_SCHEMAS = {
  add_tasks: z.object({
    tasks: z
      .array(z.object({ title: text(200), due_date: date().optional(), notes: text(1000).optional() }))
      .min(1)
      .max(20),
  }),
  update_task: z.object({
    task_id: z.string(),
    completed: z.boolean().optional(),
    title: text(200).optional(),
    due_date: date().optional(),
  }),
  add_guests: z.object({
    guests: z
      .array(
        z.object({
          name: text(200),
          household: text(200).optional(),
          email: z.email().optional(),
          plus_one: z.boolean().optional(),
          side: z.enum(GUEST_SIDES as [string, ...string[]]).optional(),
          guest_type: z.enum(GUEST_TYPES as [string, ...string[]]).optional(),
        }),
      )
      .min(1)
      .max(30),
  }),
  update_guest: z.object({
    guest_id: z.string(),
    status: z.enum(["invited", "confirmed", "declined", "pending"]).optional(),
    plus_one: z.boolean().optional(),
    plus_one_name: text(200).optional(),
    meal: text(100).optional(),
    notes: text(1000).optional(),
  }),
  update_budget: z.object({
    category: z.string().optional(),
    custom_item_id: z.string().optional(),
    actual: money().optional(),
    paid: money().optional(),
    due_date: date().optional(),
    vendor: text(200).optional(),
  }),
  add_budget_item: z.object({
    label: text(200),
    amount: money(),
    paid: money().optional(),
    due_date: date().optional(),
  }),
  add_itinerary_events: z.object({
    events: z
      .array(
        z.object({
          event_date: date(),
          title: text(200),
          start_time: time().optional(),
          end_time: time().optional(),
          location: text(200).optional(),
          description: text(1000).optional(),
        }),
      )
      .min(1)
      .max(20),
  }),
  seat_guests: z.object({
    assignments: z
      .array(z.object({ table_id: z.string(), guest_ids: z.array(z.string()).min(1).max(30) }))
      .min(1)
      .max(40),
  }),
};

export type ProposalKind = keyof typeof PROPOSAL_SCHEMAS;
export type ProposalInput<K extends ProposalKind> = z.infer<(typeof PROPOSAL_SCHEMAS)[K]>;

/** One card in the chat: what the couple reads, and what Confirm applies. */
export type Proposal = {
  id: string;
  kind: ProposalKind;
  input: unknown;
  title: string;
  lines: string[];
};

const MAX_PROPOSALS_PER_REPLY = 8;

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;
const shortDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ---------- lookups ----------

async function loadGuests(ctx: ToolContext) {
  const { data } = await ctx.supabase
    .from("guests")
    .select("id, name, household, status, side, guest_type, plus_one, plus_one_name, meal, table_id")
    .eq("wedding_id", ctx.weddingId)
    .order("name")
    .limit(600)
    .returns<Pick<Guest, "id" | "name" | "household" | "status" | "side" | "guest_type" | "plus_one" | "plus_one_name" | "meal" | "table_id">[]>();
  return data ?? [];
}

async function loadTables(ctx: ToolContext) {
  const { data } = await ctx.supabase
    .from("seating_tables")
    .select("id, name, capacity")
    .eq("wedding_id", ctx.weddingId)
    .order("name")
    .returns<Pick<SeatingTable, "id" | "name" | "capacity">[]>();
  return data ?? [];
}

async function loadTasks(ctx: ToolContext) {
  const { data } = await ctx.supabase
    .from("checklist_items")
    .select("id, title, due_date, completed")
    .eq("wedding_id", ctx.weddingId)
    .order("due_date", { nullsFirst: false })
    .returns<Pick<ChecklistItem, "id" | "title" | "due_date" | "completed">[]>();
  return data ?? [];
}

async function loadCustomItems(ctx: ToolContext) {
  const { data } = await ctx.supabase
    .from("budget_custom_items")
    .select("id, label, amount, paid_amount, due_date, purchased_from")
    .eq("wedding_id", ctx.weddingId)
    .returns<Pick<BudgetCustomItem, "id" | "label" | "amount" | "paid_amount" | "due_date" | "purchased_from">[]>();
  return data ?? [];
}

function guestLine(
  g: Awaited<ReturnType<typeof loadGuests>>[number],
  tableNames: Map<string, string>,
) {
  return [
    g.id,
    g.name,
    g.household ? `household: ${g.household}` : null,
    g.status,
    g.side ? `side: ${g.side}` : null,
    g.guest_type,
    g.plus_one ? `+1${g.plus_one_name ? ` (${g.plus_one_name})` : ""}` : null,
    g.meal ? `meal: ${g.meal}` : null,
    g.table_id ? `table: ${tableNames.get(g.table_id) ?? "?"}` : "unseated",
  ]
    .filter(Boolean)
    .join(" | ");
}

// ---------- proposal checks ----------
// Each returns the card text, or an error string the model sees and can fix.

type Checked = { title: string; lines: string[] } | { error: string };

async function checkProposal<K extends ProposalKind>(
  ctx: ToolContext,
  kind: K,
  input: ProposalInput<K>,
): Promise<Checked> {
  switch (kind) {
    case "add_tasks": {
      const { tasks } = input as ProposalInput<"add_tasks">;
      return {
        title: `Add ${tasks.length} checklist task${tasks.length === 1 ? "" : "s"}`,
        lines: tasks.map((t) => (t.due_date ? `${t.title} -- due ${shortDate(t.due_date)}` : t.title)),
      };
    }
    case "update_task": {
      const i = input as ProposalInput<"update_task">;
      const task = (await loadTasks(ctx)).find((t) => t.id === i.task_id);
      if (!task) return { error: "No task with that id. Call list_tasks first." };
      const lines = [
        i.completed !== undefined ? (i.completed ? "Mark as done" : "Mark as not done") : null,
        i.title ? `Rename to "${i.title}"` : null,
        i.due_date ? `Due ${shortDate(i.due_date)}` : null,
      ].filter((l): l is string => Boolean(l));
      if (lines.length === 0) return { error: "Nothing to change." };
      return { title: `Update task: ${task.title}`, lines };
    }
    case "add_guests": {
      const { guests } = input as ProposalInput<"add_guests">;
      return {
        title: `Add ${guests.length} guest${guests.length === 1 ? "" : "s"}`,
        lines: guests.map((g) => [g.name, g.plus_one ? "+1" : null, g.household].filter(Boolean).join(" · ")),
      };
    }
    case "update_guest": {
      const i = input as ProposalInput<"update_guest">;
      const guest = (await loadGuests(ctx)).find((g) => g.id === i.guest_id);
      if (!guest) return { error: "No guest with that id. Call find_guests first." };
      const lines = [
        i.status ? `RSVP: ${i.status}` : null,
        i.plus_one !== undefined ? (i.plus_one ? "Gets a plus-one" : "No plus-one") : null,
        i.plus_one_name ? `Plus-one: ${i.plus_one_name}` : null,
        i.meal ? `Meal: ${i.meal}` : null,
        i.notes ? `Note: ${i.notes}` : null,
      ].filter((l): l is string => Boolean(l));
      if (lines.length === 0) return { error: "Nothing to change." };
      return { title: `Update ${guest.name}`, lines };
    }
    case "update_budget": {
      const i = input as ProposalInput<"update_budget">;
      let label: string;
      if (i.custom_item_id) {
        const item = (await loadCustomItems(ctx)).find((c) => c.id === i.custom_item_id);
        if (!item) return { error: "No custom budget item with that id. Call list_budget first." };
        label = item.label;
      } else {
        const category = BUDGET_CATEGORIES.find((c) => c.key === i.category);
        if (!category) return { error: "Unknown category key. Call list_budget first." };
        label = category.label;
      }
      const lines = [
        i.actual !== undefined ? `Actual cost: ${usd(i.actual)}` : null,
        i.paid !== undefined ? `Paid so far: ${usd(i.paid)}` : null,
        i.due_date ? `Payment due ${shortDate(i.due_date)}` : null,
        i.vendor ? `Vendor: ${i.vendor}` : null,
      ].filter((l): l is string => Boolean(l));
      if (lines.length === 0) return { error: "Nothing to change." };
      return { title: `Budget: ${label}`, lines };
    }
    case "add_budget_item": {
      const i = input as ProposalInput<"add_budget_item">;
      return {
        title: `Add budget item: ${i.label}`,
        lines: [
          `Cost: ${usd(i.amount)}`,
          i.paid !== undefined ? `Paid so far: ${usd(i.paid)}` : null,
          i.due_date ? `Payment due ${shortDate(i.due_date)}` : null,
        ].filter((l): l is string => Boolean(l)),
      };
    }
    case "add_itinerary_events": {
      const { events } = input as ProposalInput<"add_itinerary_events">;
      return {
        title: `Add ${events.length} itinerary event${events.length === 1 ? "" : "s"}`,
        lines: events.map((e) =>
          [shortDate(e.event_date), e.start_time && `${e.start_time}${e.end_time ? `–${e.end_time}` : ""}`, e.title]
            .filter(Boolean)
            .join(" · "),
        ),
      };
    }
    case "seat_guests": {
      const { assignments } = input as ProposalInput<"seat_guests">;
      const [guests, tables] = await Promise.all([loadGuests(ctx), loadTables(ctx)]);
      const guestNames = new Map(guests.map((g) => [g.id, g.name]));
      const tableById = new Map(tables.map((t) => [t.id, t]));
      const lines: string[] = [];
      let seated = 0;
      for (const a of assignments) {
        const table = tableById.get(a.table_id);
        if (!table) return { error: `No table with id ${a.table_id}. Call list_tables first.` };
        const unknown = a.guest_ids.filter((id) => !guestNames.has(id));
        if (unknown.length > 0) return { error: `Unknown guest ids: ${unknown.join(", ")}. Call find_guests first.` };
        seated += a.guest_ids.length;
        lines.push(`${table.name}: ${a.guest_ids.map((id) => guestNames.get(id)).join(", ")}`);
      }
      return { title: `Seat ${seated} guest${seated === 1 ? "" : "s"}`, lines };
    }
  }
  return { error: "Unknown change." };
}

// ---------- tool list ----------

const PROPOSE_NOTE =
  " This does NOT change anything: it shows the couple a card they confirm or skip.";

const PROPOSAL_DESCRIPTIONS: Record<ProposalKind, string> = {
  add_tasks: "Propose adding checklist tasks. Dates are YYYY-MM-DD.",
  update_task: "Propose changing one existing checklist task (mark done/not done, rename, set due date). Needs a task_id from list_tasks.",
  add_guests: "Propose adding guests to the guest list. side is 'a' (first partner), 'b' (second partner) or 'both'.",
  update_guest: "Propose changing one existing guest: RSVP status, plus-one, meal, notes. Needs a guest_id from find_guests.",
  update_budget: "Propose changing one budget line: either a category (key from list_budget) or a custom item (custom_item_id from list_budget). 'actual' is the real/contracted cost, 'paid' is the running total paid so far (not a single payment -- add to the existing paid amount yourself).",
  add_budget_item: "Propose adding a custom budget line that isn't one of the standard categories.",
  add_itinerary_events: "Propose adding events to the wedding itinerary / day-of timeline. Times are 24-hour HH:MM.",
  seat_guests: "Propose seating guests at tables. Needs table ids from list_tables and guest ids from find_guests. Moves a guest if they're already seated elsewhere. Respect table capacity.",
};

export function buildAssistantTools(ctx: ToolContext, proposals: Proposal[]) {
  const lookups = [
    betaZodTool({
      name: "find_guests",
      description:
        "Look up guests. With a query, returns guests whose name or household contains it; without one, returns the whole list. Each line: id | name | household | RSVP status | side | type | plus-one | meal | table.",
      inputSchema: z.object({ query: z.string().optional() }),
      run: async ({ query }) => {
        const [guests, tables] = await Promise.all([loadGuests(ctx), loadTables(ctx)]);
        const tableNames = new Map(tables.map((t) => [t.id, t.name]));
        const q = query?.trim().toLowerCase();
        const matches = q
          ? guests.filter((g) => g.name.toLowerCase().includes(q) || g.household?.toLowerCase().includes(q))
          : guests;
        if (matches.length === 0) return q ? `No guests match "${query}".` : "The guest list is empty.";
        return matches.map((g) => guestLine(g, tableNames)).join("\n");
      },
    }),
    betaZodTool({
      name: "list_tasks",
      description: "List checklist tasks: id | title | due date | done.",
      inputSchema: z.object({ include_completed: z.boolean().optional() }),
      run: async ({ include_completed }) => {
        const tasks = (await loadTasks(ctx)).filter((t) => include_completed || !t.completed);
        if (tasks.length === 0) return "No tasks.";
        return tasks
          .map((t) => [t.id, t.title, t.due_date ? `due ${t.due_date}` : "no due date", t.completed ? "done" : "open"].join(" | "))
          .join("\n");
      },
    }),
    betaZodTool({
      name: "list_budget",
      description:
        "List the budget: standard categories (key | label | planned or actual cost | paid | due | vendor) and custom items (id | label | cost | paid | due | vendor).",
      inputSchema: z.object({}),
      run: async () => {
        const [{ data: rows }, custom] = await Promise.all([
          ctx.supabase
            .from("budget_line_items")
            .select("category, override_value, paid_amount, due_date, purchased_from")
            .eq("wedding_id", ctx.weddingId)
            .returns<{ category: string; override_value: number | null; paid_amount: number | null; due_date: string | null; purchased_from: string | null }[]>(),
          loadCustomItems(ctx),
        ]);
        const byKey = new Map((rows ?? []).map((r) => [r.category, r]));
        const categoryLines = BUDGET_CATEGORIES.filter((c) => !ctx.hiddenCategories.has(c.key)).map((c) => {
          const row = byKey.get(c.key);
          const cost = row?.override_value != null ? `actual ${usd(row.override_value)}` : `estimate ${usd(ctx.budgetPlanned.get(c.key) ?? 0)}`;
          return [c.key, c.label, cost, `paid ${usd(row?.paid_amount ?? 0)}`, row?.due_date ? `due ${row.due_date}` : null, row?.purchased_from]
            .filter(Boolean)
            .join(" | ");
        });
        const customLines = custom.map((c) =>
          [c.id, c.label, usd(c.amount), `paid ${usd(c.paid_amount ?? 0)}`, c.due_date ? `due ${c.due_date}` : null, c.purchased_from]
            .filter(Boolean)
            .join(" | "),
        );
        return `Categories:\n${categoryLines.join("\n")}\n\nCustom items:\n${customLines.join("\n") || "none"}`;
      },
    }),
    betaZodTool({
      name: "list_tables",
      description: "List seating tables: id | name | capacity | how many guests are seated there now.",
      inputSchema: z.object({}),
      run: async () => {
        const [tables, guests] = await Promise.all([loadTables(ctx), loadGuests(ctx)]);
        if (tables.length === 0) return "No tables yet -- the couple adds them on the Venue Layout page.";
        return tables
          .map((t) => {
            const seated = guests.filter((g) => g.table_id === t.id).length;
            return [t.id, t.name, t.capacity ? `capacity ${t.capacity}` : "no capacity set", `${seated} seated`].join(" | ");
          })
          .join("\n");
      },
    }),
    betaZodTool({
      name: "list_itinerary",
      description: "List the itinerary events already planned: date | time | title | location.",
      inputSchema: z.object({}),
      run: async () => {
        const { data } = await ctx.supabase
          .from("itinerary_events")
          .select("event_date, start_time, end_time, title, location")
          .eq("wedding_id", ctx.weddingId)
          .order("event_date")
          .order("start_time", { nullsFirst: true })
          .returns<Pick<ItineraryEvent, "event_date" | "start_time" | "end_time" | "title" | "location">[]>();
        if (!data || data.length === 0) return "No itinerary events yet.";
        return data
          .map((e) =>
            [e.event_date, e.start_time ? `${e.start_time.slice(0, 5)}${e.end_time ? `-${e.end_time.slice(0, 5)}` : ""}` : "no time", e.title, e.location]
              .filter(Boolean)
              .join(" | "),
          )
          .join("\n");
      },
    }),
  ];

  const proposers = (Object.keys(PROPOSAL_SCHEMAS) as ProposalKind[]).map((kind) =>
    betaZodTool({
      name: `propose_${kind}`,
      description: PROPOSAL_DESCRIPTIONS[kind] + PROPOSE_NOTE,
      inputSchema: PROPOSAL_SCHEMAS[kind],
      run: async (input) => {
        if (proposals.length >= MAX_PROPOSALS_PER_REPLY) {
          return `That's ${MAX_PROPOSALS_PER_REPLY} changes for one reply -- stop proposing and tell the couple to confirm these first.`;
        }
        const checked = await checkProposal(ctx, kind, input as ProposalInput<typeof kind>);
        if ("error" in checked) return `Not proposed: ${checked.error}`;
        proposals.push({ id: crypto.randomUUID(), kind, input, ...checked });
        return "Shown to the couple as a card to confirm. Nothing has changed yet.";
      },
    }),
  );

  return [...lookups, ...proposers];
}
