import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { BudgetCustomItem, ChecklistItem, Guest } from "@/lib/supabase/types";
import { addChecklistItem, toggleChecklistItem, updateChecklistItem } from "@/app/checklist/actions";
import { addGuest, updateGuest } from "@/app/guests/actions";
import { addBudgetCustomItem, updateBudgetCustomItem, updateBudgetLineItem } from "@/app/budget/actions";
import { addItineraryEvent } from "@/app/itinerary/actions";
import { assignGuestsTable } from "@/app/seating/actions";
import { PROPOSAL_SCHEMAS, type ProposalInput, type ProposalKind } from "@/lib/ai/assistant-tools";

/**
 * Applies a change the couple confirmed in the chat.
 *
 * Goes through the same server actions the pages use, so validation,
 * ownership checks and cache revalidation stay in one place. The page
 * actions replace a whole row from a form, so partial edits are merged onto
 * the current row first -- otherwise "mark the florist paid" would wipe the
 * florist's due date and notes.
 */

type Supabase = Awaited<ReturnType<typeof createClient>>;
type Result = { error?: string };

function form(fields: Record<string, string | number | boolean | null | undefined | string[]>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === false) continue;
    if (Array.isArray(value)) value.forEach((v) => fd.append(key, v));
    else fd.set(key, value === true ? "on" : String(value));
  }
  return fd;
}

/** Runs each write in turn and stops at the first failure. */
async function each<T>(items: T[], write: (item: T) => Promise<Result>): Promise<Result> {
  for (const item of items) {
    const result = await write(item);
    if (result.error) return result;
  }
  return {};
}

export async function applyProposal(
  supabase: Supabase,
  weddingId: string,
  kind: ProposalKind,
  rawInput: unknown,
): Promise<Result> {
  const parsed = PROPOSAL_SCHEMAS[kind].safeParse(rawInput);
  if (!parsed.success) return { error: "That change isn't valid any more." };

  switch (kind) {
    case "add_tasks": {
      const { tasks } = parsed.data as ProposalInput<"add_tasks">;
      return each(tasks, (t) => addChecklistItem(form(t)));
    }

    case "update_task": {
      const i = parsed.data as ProposalInput<"update_task">;
      const { data: task } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("id", i.task_id)
        .eq("wedding_id", weddingId)
        .maybeSingle<ChecklistItem>();
      if (!task) return { error: "That task no longer exists." };
      if (i.title || i.due_date) {
        const result = await updateChecklistItem(
          form({ id: task.id, title: i.title ?? task.title, notes: task.notes, due_date: i.due_date ?? task.due_date }),
        );
        if (result.error) return result;
      }
      if (i.completed !== undefined) {
        return toggleChecklistItem(form({ id: task.id, completed: String(i.completed) }));
      }
      return {};
    }

    case "add_guests": {
      const { guests } = parsed.data as ProposalInput<"add_guests">;
      return each(guests, (g) => addGuest(form({ ...g, status: "invited", priority: "must_invite" })));
    }

    case "update_guest": {
      const i = parsed.data as ProposalInput<"update_guest">;
      const { data: g } = await supabase
        .from("guests")
        .select("*")
        .eq("id", i.guest_id)
        .eq("wedding_id", weddingId)
        .maybeSingle<Guest>();
      if (!g) return { error: "That guest no longer exists." };
      return updateGuest(
        form({
          id: g.id,
          name: g.name,
          household: g.household,
          email: g.email,
          plus_one: i.plus_one ?? g.plus_one,
          plus_one_name: i.plus_one_name ?? g.plus_one_name,
          status: i.status ?? g.status,
          priority: g.priority,
          side: g.side,
          guest_type: g.guest_type,
          meal: i.meal ?? g.meal,
          notes: i.notes ?? g.notes,
          gift_description: g.gift_description,
        }),
      );
    }

    case "update_budget": {
      const i = parsed.data as ProposalInput<"update_budget">;
      if (i.custom_item_id) {
        const { data: item } = await supabase
          .from("budget_custom_items")
          .select("*")
          .eq("id", i.custom_item_id)
          .eq("wedding_id", weddingId)
          .maybeSingle<BudgetCustomItem>();
        if (!item) return { error: "That budget item no longer exists." };
        return updateBudgetCustomItem(
          form({
            id: item.id,
            label: item.label,
            amount: i.actual ?? item.amount,
            paid_amount: i.paid ?? item.paid_amount,
            purchased_from: i.vendor ?? item.purchased_from,
            paid_by: item.paid_by,
            due_date: i.due_date ?? item.due_date,
            notes: item.notes,
          }),
        );
      }
      const { data: row } = await supabase
        .from("budget_line_items")
        .select("override_value, paid_amount, purchased_from, paid_by, due_date, notes")
        .eq("wedding_id", weddingId)
        .eq("category", i.category ?? "")
        .maybeSingle<{
          override_value: number | null;
          paid_amount: number | null;
          purchased_from: string | null;
          paid_by: string | null;
          due_date: string | null;
          notes: string | null;
        }>();
      return updateBudgetLineItem(
        form({
          category: i.category,
          override_value: i.actual ?? row?.override_value,
          paid_amount: i.paid ?? row?.paid_amount,
          purchased_from: i.vendor ?? row?.purchased_from,
          paid_by: row?.paid_by,
          due_date: i.due_date ?? row?.due_date,
          notes: row?.notes,
        }),
      );
    }

    case "add_budget_item": {
      const i = parsed.data as ProposalInput<"add_budget_item">;
      return addBudgetCustomItem(form({ label: i.label, amount: i.amount, paid_amount: i.paid, due_date: i.due_date }));
    }

    case "add_itinerary_events": {
      const { events } = parsed.data as ProposalInput<"add_itinerary_events">;
      return each(events, (e) => addItineraryEvent(form(e)));
    }

    case "seat_guests": {
      const { assignments } = parsed.data as ProposalInput<"seat_guests">;
      return each(assignments, (a) => assignGuestsTable(form({ table_id: a.table_id, guest_id: a.guest_ids })));
    }
  }
}
