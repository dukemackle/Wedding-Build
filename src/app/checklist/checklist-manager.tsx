"use client";

import { useRef, useState, useTransition } from "react";
import { CHECKLIST_PHASES } from "@/lib/checklist-template";
import type { ChecklistItem } from "@/lib/supabase/types";
import {
  addChecklistItem,
  buildWeddingPlan,
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
  // Completed plan tasks stay inside their stage, struck through, so ticking
  // one doesn't make it disappear. Only a couple's own tasks end up in the
  // drawer at the bottom.
  const completedOwn = items
    .filter((item) => item.completed && !item.phase)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));
  // The header counts everything, plan and own alike -- it's the answer to
  // "how far through am I", which doesn't care where a task came from.
  const completedCount = items.length - incomplete.length;

  const pct = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="w-full rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <span className="font-display text-2xl font-semibold text-forest">
            Planning checklist
          </span>
          <p className="mt-1 text-sm text-ink/70">
            {items.length > 0
              ? `${completedCount} of ${items.length} tasks done`
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

      {items.length === 0 ? (
        <BuildPlanPrompt />
      ) : incomplete.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink/50">
          All done! 🎉 Everything on your checklist is complete.
        </p>
      ) : (
        <PhasedList items={items} />
      )}

      {completedOwn.length > 0 && (
        <div className="mt-6 border-t border-hairline pt-4">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="text-sm text-brass hover:underline"
          >
            {showCompleted ? "Hide" : "Show"} completed ({completedOwn.length})
          </button>
          {showCompleted && (
            <div className="mt-2">
              {completedOwn.map((item) => (
                <ChecklistRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * What an empty checklist offers instead of a blank page.
 *
 * The blank page was the whole problem: "add your first one above" assumes the
 * couple knows what the first one is, which is exactly what nobody planning a
 * first wedding knows.
 */
function BuildPlanPrompt() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="py-8 text-center">
      <p className="mx-auto max-w-md text-sm text-ink/70">
        Wren can lay out your whole wedding in the order it needs to happen — dated back from
        your day, and skipping anything you&apos;ve already done.
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs text-ink/55">
        It starts with three decisions and asks you to ignore everything else until
        they&apos;re settled. You can edit or delete any of it.
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(undefined);
          startTransition(async () => {
            const result = await buildWeddingPlan();
            if (result.error) setError(result.error);
          });
        }}
        className="mt-5 rounded-full bg-forest px-6 py-2.5 font-medium text-parchment transition-colors hover:bg-forest/90 disabled:opacity-50"
      >
        {isPending ? "Building your plan…" : "Build my plan"}
      </button>
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
    </div>
  );
}

/**
 * Everything needed to draw one stage, worked out once.
 *
 * Both arrangements below need the same facts -- how many tasks are left, is
 * this the stage they're on, what order the rows go in -- so they're computed
 * here rather than twice, slightly differently, in two places that then drift.
 */
type StageView = {
  key: string;
  title: string;
  blurb: string;
  doneBlurb: string;
  items: ChecklistItem[];
  /** Incomplete first; a ticked task sinks rather than disappearing. */
  ordered: ChecklistItem[];
  left: number;
  done: number;
  isDone: boolean;
};

function buildStages(items: ChecklistItem[]): { stages: StageView[]; own: ChecklistItem[] } {
  const byPhase = new Map<string, ChecklistItem[]>();
  for (const item of items) {
    const key = item.phase ?? "own";
    const bucket = byPhase.get(key);
    if (bucket) bucket.push(item);
    else byPhase.set(key, [item]);
  }

  const stages = CHECKLIST_PHASES.filter((phase) => byPhase.has(phase.key)).map((phase) => {
    const phaseItems = byPhase.get(phase.key) ?? [];
    const left = phaseItems.filter((item) => !item.completed).length;
    return {
      key: phase.key,
      title: phase.title,
      blurb: phase.blurb,
      doneBlurb: phase.doneBlurb,
      items: phaseItems,
      ordered: [
        ...phaseItems.filter((item) => !item.completed),
        ...phaseItems.filter((item) => item.completed),
      ],
      left,
      done: phaseItems.length - left,
      isDone: left === 0,
    };
  });

  return { stages, own: (byPhase.get("own") ?? []).filter((item) => !item.completed) };
}

/**
 * The plan, arranged for the screen it's on.
 *
 * A phone gets an accordion: one column, one stage open, the rest folded away,
 * because that is all 375px can hold without becoming a scroll.
 *
 * A wide screen gets something a phone cannot have -- every stage of the
 * wedding listed down the side with its progress, and the stage you're on open
 * beside it. The whole arc and today's work visible at once. That's the
 * difference between a desktop layout and a mobile one stretched: not more
 * whitespace, a different shape.
 */
function PhasedList({ items }: { items: ChecklistItem[] }) {
  const { stages, own } = buildStages(items);
  const currentKey = stages.find((stage) => stage.left > 0)?.key;

  // Null means "whichever stage they're on", so the detail panel follows them
  // forward as stages complete until they deliberately click elsewhere. No
  // effect needed to keep it in sync.
  const [picked, setPicked] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const activeKey = picked ?? currentKey ?? stages[0]?.key;
  const active = stages.find((stage) => stage.key === activeKey);

  function toggle(key: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <>
      {/* --- phone and tablet: accordion ------------------------------- */}
      <div className="flex flex-col gap-3 lg:hidden">
        {stages.map((stage) => {
          const isCurrent = stage.key === currentKey;
          const isOpen = isCurrent || expanded.has(stage.key);
          return (
            <section
              key={stage.key}
              className={
                isCurrent
                  ? "rounded-md border border-forest/30 bg-parchment p-4"
                  : stage.isDone
                    ? "rounded-md border border-hairline bg-parchment/40 p-4"
                    : "rounded-md border border-hairline p-4"
              }
            >
              <button
                type="button"
                onClick={() => !isCurrent && toggle(stage.key)}
                className="flex w-full items-baseline justify-between gap-3 text-left"
              >
                <span className="min-w-0">
                  {isCurrent && (
                    <span className="font-mono-numbers text-[10px] uppercase tracking-[0.18em] text-brass">
                      You&apos;re here
                    </span>
                  )}
                  <span
                    className={`flex items-baseline gap-2 font-display text-xl font-semibold ${
                      stage.isDone ? "text-forest/60" : "text-forest"
                    }`}
                  >
                    {stage.isDone && <Tick />}
                    {stage.title}
                  </span>
                </span>
                <span className="shrink-0 font-mono-numbers text-xs text-ink/50">
                  {isCurrent
                    ? `${stage.left} left`
                    : stage.isDone
                      ? `${stage.done} done`
                      : isOpen
                        ? "Hide"
                        : `${stage.left}`}
                </span>
              </button>

              {stage.isDone && <p className="mt-1 text-sm text-ink/60">{stage.doneBlurb}</p>}

              {isOpen && (
                <>
                  {!stage.isDone && <p className="mt-1 text-sm text-ink/65">{stage.blurb}</p>}
                  <div className="mt-2">
                    {stage.ordered.map((item) => (
                      <ChecklistRow key={item.id} item={item} />
                    ))}
                  </div>
                </>
              )}
            </section>
          );
        })}

        {own.length > 0 && (
          <section className="rounded-md border border-hairline p-4">
            <span className="block font-display text-xl font-semibold text-forest">
              Your own tasks
            </span>
            <div className="mt-2">
              {own.map((item) => (
                <ChecklistRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* --- wide screens: the whole arc, plus the stage you're on ------ */}
      <div className="hidden lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
        <nav className="flex flex-col gap-0.5 border-r border-hairline pr-5">
          {stages.map((stage) => {
            const isActive = stage.key === activeKey;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => setPicked(stage.key)}
                className={`rounded-md px-3 py-2 text-left transition-colors ${
                  isActive ? "bg-forest/10" : "hover:bg-parchment"
                }`}
              >
                <span
                  className={`flex items-center gap-1.5 font-display text-base ${
                    isActive
                      ? "font-semibold text-forest"
                      : stage.isDone
                        ? "text-forest/55"
                        : "text-ink/75"
                  }`}
                >
                  {stage.isDone && <Tick />}
                  {stage.title}
                </span>
                <span className="mt-0.5 block font-mono-numbers text-[11px] text-ink/45">
                  {stage.isDone
                    ? `${stage.done} done`
                    : stage.key === currentKey
                      ? `${stage.left} left · you're here`
                      : `${stage.left} to do`}
                </span>
              </button>
            );
          })}

          {own.length > 0 && (
            <button
              type="button"
              onClick={() => setPicked("own")}
              className={`mt-2 rounded-md border-t border-hairline px-3 pb-2 pt-3 text-left ${
                activeKey === "own" ? "bg-forest/10" : "hover:bg-parchment"
              }`}
            >
              <span className="font-display text-base text-ink/75">Your own tasks</span>
              <span className="mt-0.5 block font-mono-numbers text-[11px] text-ink/45">
                {own.length} to do
              </span>
            </button>
          )}
        </nav>

        <div className="min-w-0">
          {activeKey === "own" ? (
            <>
              <h3 className="font-display text-2xl font-semibold text-forest">Your own tasks</h3>
              <div className="mt-3">
                {own.map((item) => (
                  <ChecklistRow key={item.id} item={item} />
                ))}
              </div>
            </>
          ) : active ? (
            <>
              {active.key === currentKey && (
                <span className="font-mono-numbers text-[10px] uppercase tracking-[0.18em] text-brass">
                  You&apos;re here
                </span>
              )}
              <h3
                className={`flex items-center gap-2 font-display text-2xl font-semibold ${
                  active.isDone ? "text-forest/60" : "text-forest"
                }`}
              >
                {active.isDone && <Tick />}
                {active.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-ink/65">
                {active.isDone ? active.doneBlurb : active.blurb}
              </p>
              <div className="mt-3">
                {active.ordered.map((item) => (
                  <ChecklistRow key={item.id} item={item} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

function Tick() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 self-center text-forest"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
