"use client";

import { useState, useTransition } from "react";
import { toggleChecklistItem } from "@/app/checklist/actions";
import type { ChecklistItem } from "@/lib/supabase/types";
import { DashboardPanel } from "./dashboard-panel";

const DAY = 1000 * 60 * 60 * 24;

function daysFromToday(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${dateStr}T00:00:00`).getTime() - today.getTime()) / DAY);
}

function dueLabel(dateStr: string) {
  const days = daysFromToday(dateStr);
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} late`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 14) return `In ${days} days`;
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function TaskRow({ item, onToggle }: { item: ChecklistItem; onToggle: () => void }) {
  const late = item.due_date !== null && daysFromToday(item.due_date) < 0;
  return (
    <li className="group flex break-inside-avoid items-center gap-3 border-b border-hairline py-3 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-label={item.completed ? `Mark "${item.title}" not done` : `Mark "${item.title}" done`}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          item.completed
            ? "border-forest bg-forest text-parchment"
            : "border-hairline text-transparent hover:border-forest hover:text-forest/40"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span
        className={`min-w-0 flex-1 ${item.completed ? "text-ink/40 line-through" : "text-ink"}`}
      >
        {item.title}
      </span>
      {item.due_date && (
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono-numbers text-xs ${
            late && !item.completed ? "bg-brass/15 text-brass" : "text-ink/50"
          }`}
        >
          {dueLabel(item.due_date)}
        </span>
      )}
    </li>
  );
}

/**
 * What to do next, ticked off right here.
 *
 * Late tasks lead and carry a brass badge, so they can't be buried below
 * the week's routine ones. Ticking one leaves it struck through until the
 * next visit rather than whisking it away, so a mis-tap is visible and
 * undoable.
 */
export function ThisWeek({ items }: { items: ChecklistItem[] }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();

  const withLocal = items.map((item) =>
    item.id in done ? { ...item, completed: done[item.id] } : item,
  );
  const open = items
    .filter((item) => !item.completed)
    .sort((a, b) => {
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return a.created_at.localeCompare(b.created_at);
    })
    .map((item) => withLocal.find((w) => w.id === item.id)!);

  const late = open.filter((item) => item.due_date && daysFromToday(item.due_date) < 0);
  // Already sorted by date, so anything late is at the front -- no separate
  // column for it, which left a mostly empty half beside one overdue task.
  const shown = open.slice(0, 8);

  function toggle(item: ChecklistItem) {
    const next = !item.completed;
    setDone((prev) => ({ ...prev, [item.id]: next }));
    const form = new FormData();
    form.set("id", item.id);
    form.set("completed", String(next));
    startTransition(async () => {
      const result = await toggleChecklistItem(form);
      if (result?.error) setDone((prev) => ({ ...prev, [item.id]: !next }));
    });
  }

  const title = late.length > 0 ? "Catch up, then keep going" : "What to do next";

  return (
    <DashboardPanel
      eyebrow="Your next steps"
      title={title}
      action={{ href: "/checklist", label: "Full checklist" }}
    >
      {items.length === 0 ? (
        <p className="text-sm text-ink/60">
          No plan yet — Wren can build a month-by-month checklist for your date on the Checklist
          page.
        </p>
      ) : open.length === 0 ? (
        <p className="text-sm text-ink/60">All caught up. Nothing left on the list 🎉</p>
      ) : (
        <>
          {late.length > 0 && (
            <p className="font-mono-numbers text-[10px] uppercase tracking-[0.2em] text-brass">
              {late.length} overdue
            </p>
          )}
          <ul className="mt-1 xl:columns-2 xl:gap-x-10">
            {shown.map((item) => (
              <TaskRow key={item.id} item={item} onToggle={() => toggle(item)} />
            ))}
          </ul>
        </>
      )}
    </DashboardPanel>
  );
}
