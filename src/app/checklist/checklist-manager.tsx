"use client";

import { useRef, useState, useTransition } from "react";
import type { ChecklistItem } from "@/lib/supabase/types";
import {
  addChecklistItem,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from "./actions";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

function formatDueDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dateStr}T00:00:00`) < today;
}

function ItemFields({ item }: { item?: ChecklistItem }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className={`${labelClass} sm:col-span-2`}>
        Task
        <input
          name="title"
          required
          placeholder="e.g. Book the venue, Send invitations"
          defaultValue={item?.title ?? ""}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Due date
        <input type="date" name="due_date" defaultValue={item?.due_date ?? ""} className={inputClass} />
      </label>
      <label className={`${labelClass} sm:col-span-2`}>
        Notes
        <textarea
          name="notes"
          rows={2}
          placeholder="Optional"
          defaultValue={item?.notes ?? ""}
          className={inputClass}
        />
      </label>
    </div>
  );
}

function AddItemForm({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await addChecklistItem(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        formRef.current?.reset();
        onDone();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="mb-4 rounded-lg border border-hairline bg-parchment p-4"
    >
      <ItemFields />
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {isPending ? "Adding..." : "Add task"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const formData = new FormData();
    formData.set("id", item.id);
    formData.set("completed", String(!item.completed));
    startTransition(async () => {
      const result = await toggleChecklistItem(formData);
      if (result?.error) setError(result.error);
    });
  }

  function handleSave(formData: FormData) {
    formData.set("id", item.id);
    startTransition(async () => {
      const result = await updateChecklistItem(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setIsEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Remove "${item.title}" from the checklist?`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", item.id);
      const result = await deleteChecklistItem(formData);
      if (result?.error) setError(result.error);
    });
  }

  const overdue = !item.completed && item.due_date && isOverdue(item.due_date);

  if (isEditing) {
    return (
      <div className="border-b border-hairline py-4 last:border-b-0">
        <form action={handleSave}>
          <ItemFields item={item} />
          {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-md border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:border-forest"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 border-b border-hairline py-4 last:border-b-0">
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={item.completed ? "Mark as not done" : "Mark as done"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          item.completed
            ? "border-forest bg-forest text-parchment"
            : "border-hairline hover:border-forest"
        }`}
      >
        {item.completed && (
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={item.completed ? "text-ink/50 line-through" : "text-ink"}>
            {item.title}
          </span>
          {item.due_date && (
            <span
              className={`rounded-full border px-2 py-0.5 text-xs ${
                overdue
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-hairline text-ink/60"
              }`}
            >
              {overdue ? "Overdue: " : "Due "}
              {formatDueDate(item.due_date)}
            </span>
          )}
        </div>
        {item.notes && <p className="mt-1 text-sm text-ink/70">{item.notes}</p>}
        {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button onClick={() => setIsEditing(true)} className="text-xs text-brass hover:underline">
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-ink/50 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export function ChecklistManager({ items }: { items: ChecklistItem[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const incomplete = items
    .filter((item) => !item.completed)
    .sort((a, b) => {
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return a.created_at.localeCompare(b.created_at);
    });
  const completed = items
    .filter((item) => item.completed)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));

  const pct = items.length > 0 ? (completed.length / items.length) * 100 : 0;

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <span className="font-display text-2xl font-semibold text-forest">
            Planning checklist
          </span>
          <p className="mt-1 text-sm text-ink/70">
            {items.length > 0
              ? `${completed.length} of ${items.length} tasks done`
              : "Track everything you need to do before the big day."}
          </p>
          {items.length > 0 && (
            <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-forest/10">
              <div
                className="h-2 rounded-full bg-forest transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-full bg-forest px-4 py-1.5 font-mono-numbers text-sm text-parchment transition-colors hover:bg-forest/90"
        >
          {showAddForm ? "Close" : "+ Add task"}
        </button>
      </div>

      {showAddForm && <AddItemForm onDone={() => setShowAddForm(false)} />}

      {incomplete.length === 0 && completed.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">
          No tasks yet — add your first one above.
        </p>
      ) : incomplete.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">
          All done! 🎉 Everything on your checklist is complete.
        </p>
      ) : (
        incomplete.map((item) => <ChecklistRow key={item.id} item={item} />)
      )}

      {completed.length > 0 && (
        <div className="mt-6 border-t border-hairline pt-4">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-sm text-brass hover:underline"
          >
            {showCompleted ? "Hide" : "Show"} completed ({completed.length})
          </button>
          {showCompleted && (
            <div className="mt-2">
              {completed.map((item) => (
                <ChecklistRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
