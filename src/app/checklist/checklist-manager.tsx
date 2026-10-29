"use client";

import { useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import { BirdCheer } from "@/components/bird-cheer";
import { BirdEmptyState } from "@/components/wren-moments";
import { CHECKLIST_PHASES } from "@/lib/checklist-template";
import type { ChecklistItem } from "@/lib/supabase/types";
import {
  addChecklistItem,
  buildWeddingPlan,
  updateChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from "./actions";
import { PageHeader, PlusIcon } from "@/components/page-header";
import {
  DueChip,
  DueLegend,
  HereBadge,
  ProgressRing,
  StageConfetti,
  StageIcon,
  StageLine,
  StageNode,
  TaskTick,
  type StageState,
} from "@/components/checklist-ui";

const inputClass =
  "rounded-md border border-hairline bg-parchment px-3 py-2 text-ink outline-none focus:border-forest";
const labelClass = "flex flex-col gap-1 text-sm text-ink";

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
    >
      <ItemFields />
      {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Adding..." : "Add task"}
        </button>
        <button type="button" onClick={onDone} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  // Ticks show the moment you click, not after the server round trip, and
  // only a tick you just made animates (not every done row on page load).
  const [completed, setOptimisticCompleted] = useOptimistic(item.completed);
  const [justTicked, setJustTicked] = useState(false);

  function handleToggle() {
    const formData = new FormData();
    formData.set("id", item.id);
    formData.set("completed", String(!item.completed));
    setJustTicked(!item.completed);
    startTransition(async () => {
      setOptimisticCompleted(!item.completed);
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

  if (isEditing) {
    return (
      <div className="border-b border-hairline py-5 last:border-b-0">
        <form action={handleSave}>
          <ItemFields item={item} />
          {error && <p className="mt-3 text-sm text-red-800">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      onMouseLeave={() => setMenuOpen(false)}
      className="group -mx-2 flex items-start gap-3 rounded-[14px] border-b border-hairline px-2 py-4 transition-colors last:border-b-0 hover:bg-parchment sm:-mx-4 sm:gap-4 sm:px-4 sm:py-5"
    >
      <TaskTick on={completed} justTicked={justTicked} onClick={handleToggle} disabled={isPending} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span
            className={`text-[17px] font-medium leading-snug sm:text-lg ${
              completed
                ? justTicked
                  ? "wren-strike text-ink/50"
                  : "text-ink/50 line-through decoration-[#FFD301] decoration-2"
                : "text-ink"
            }`}
          >
            {item.title}
          </span>
          {item.due_date && <DueChip date={item.due_date} completed={completed} />}
        </div>
        {item.notes && <p className="mt-1.5 text-[15px] leading-relaxed text-ink/70">{item.notes}</p>}
        {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      </div>
      {/* Edit and Remove fold behind one button so every row isn't shouting
          them; on a wide screen it only shows on hover or keyboard focus. */}
      <div
        className={`flex shrink-0 items-center gap-1 transition-opacity ${
          menuOpen ? "" : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
        }`}
      >
        {menuOpen ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="min-h-11 rounded-lg px-3 text-sm font-medium text-[#9a6b00] hover:bg-[#f3f1ea]"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="min-h-11 rounded-lg px-3 text-sm text-ink/70 hover:bg-[#f3f1ea]"
            >
              Remove
            </button>
          </>
        ) : (
          <button
            onClick={() => setMenuOpen(true)}
            aria-label={`Edit or remove "${item.title}"`}
            className="-mr-2 -mt-1.5 flex h-11 w-11 items-center justify-center rounded-[10px] text-ink/70 hover:bg-[#f3f1ea] hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

const cardClass = "rounded-3xl border border-hairline bg-card shadow-sm";

export function ChecklistManager({
  items,
  aside,
}: {
  items: ChecklistItem[];
  /** The contracts column, beside the plan from 1280px. */
  aside?: ReactNode;
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  const incomplete = items.filter((item) => !item.completed);
  // The header counts everything, plan and own alike -- it's the answer to
  // "how far through am I", which doesn't care where a task came from.
  const completedCount = items.length - incomplete.length;
  const { stages } = buildStages(items);
  const stagesDone = stages.filter((stage) => stage.isDone).length;

  return (
    <>
      {/* One header: the page's name, how far through they are, and Add
          task -- not a page header followed by a second "Planning checklist"
          card saying the same thing. */}
      <PageHeader
        eyebrow="Checklist"
        title="One thing"
        accent="at a time"
        photo="checklist"
        actions={
          <>
            {items.length > 0 && <ProgressRing done={completedCount} total={items.length} size={64} />}
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className={showAddForm ? "btn-secondary" : "btn-primary"}
            >
              {showAddForm ? "Close" : <><PlusIcon /> Add task</>}
            </button>
          </>
        }
      >
        {items.length > 0 ? (
          <>
            <strong className="font-semibold text-ink">
              {completedCount} of {items.length}
            </strong>{" "}
            tasks done
            {stages.length > 0 && ` · ${stagesDone} of ${stages.length} stages finished`}
          </>
        ) : (
          "What to do now, built around your date, and what can wait."
        )}
      </PageHeader>

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start xl:gap-8">
        <div className="flex w-full min-w-0 flex-col gap-4 lg:gap-6">
          {showAddForm && (
            <div className={`${cardClass} p-5 sm:p-8`}>
              <AddItemForm onDone={() => setShowAddForm(false)} />
            </div>
          )}

          {items.length === 0 ? (
            <div className={`${cardClass} p-5 sm:p-8`}>
              <BuildPlanPrompt />
            </div>
          ) : incomplete.length === 0 ? (
            <div className={`${cardClass} p-5 sm:p-8`}>
              <BirdEmptyState>
                <p className="text-base text-ink/70">All done! Everything on your checklist is complete.</p>
              </BirdEmptyState>
            </div>
          ) : (
            <PhasedList items={items} />
          )}
        </div>
        {aside && <div className="min-w-0 xl:[&>*]:mt-0">{aside}</div>}
      </div>
    </>
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
        className="btn-primary mt-5"
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

function buildStages(items: ChecklistItem[]): { stages: StageView[]; own: ChecklistItem[]; ownDone: ChecklistItem[] } {
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

  // A couple's own tasks run in due-date order. Done ones go to a drawer at
  // the bottom of their panel rather than sitting struck through in the list.
  const ownAll = byPhase.get("own") ?? [];
  const own = ownAll
    .filter((item) => !item.completed)
    .sort((a, b) => {
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return a.created_at.localeCompare(b.created_at);
    });
  const ownDone = ownAll
    .filter((item) => item.completed)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));

  return { stages, own, ownDone };
}

/** "How it looks and feels" with the last word in italic royal blue. */
function StageHeading({ title, className }: { title: string; className: string }) {
  const cut = title.lastIndexOf(" ");
  return (
    <h3 className={`font-display font-semibold leading-[1.05] text-forest ${className}`}>
      {cut > 0 ? (
        <>
          {title.slice(0, cut)} <em className="text-[#2243B6]">{title.slice(cut + 1)}</em>
        </>
      ) : (
        title
      )}
    </h3>
  );
}

function StageBar({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-[#f3f1ea]">
        <div
          className="h-2 rounded-full bg-[#2243B6] transition-[width] duration-500"
          style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
        />
      </div>
      <span className="shrink-0 font-mono-numbers text-[13px] text-ink/75">
        {done} of {total} done
      </span>
    </div>
  );
}

function OwnDoneDrawer({ items }: { items: ChecklistItem[] }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <div className="mt-4 border-t border-hairline pt-4">
      <button onClick={() => setOpen((v) => !v)} className="min-h-11 text-[15px] font-medium text-[#9a6b00] hover:underline">
        {open ? "Hide" : "Show"} completed ({items.length})
      </button>
      {open && (
        <div className="mt-1">
          {items.map((item) => (
            <ChecklistRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The plan, arranged for the screen it's on, as a journey: every stage is a
 * node on a line that fills gold behind you, and the one you're on pulses.
 *
 * A phone gets that line as one column: finished and future stages fold to a
 * single line each and the stage you're on opens in place.
 *
 * A wide screen gets the whole line down the side in its own card and the
 * stage you're on open beside it, so the arc and today's work are visible at
 * once -- a different shape, not the phone layout stretched.
 */
function PhasedList({ items }: { items: ChecklistItem[] }) {
  const { stages, own, ownDone } = buildStages(items);
  const currentKey = stages.find((stage) => stage.left > 0)?.key;
  const hasOwn = own.length + ownDone.length > 0;

  // Null means "whichever stage they're on", so the detail panel follows them
  // forward as stages complete until they deliberately click elsewhere. No
  // effect needed to keep it in sync.
  const [picked, setPicked] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // A stage that just went from "some left" to done gets the bird and a burst
  // of confetti. Compared against the last render (not in an effect) so it
  // fires exactly once.
  const doneKeys = stages.filter((stage) => stage.isDone).map((stage) => stage.key).join(",");
  const [prevDoneKeys, setPrevDoneKeys] = useState(doneKeys);
  const [cheer, setCheer] = useState<{ id: number; message: string } | null>(null);
  if (doneKeys !== prevDoneKeys) {
    const before = new Set(prevDoneKeys.split(","));
    const finished = stages.find((stage) => stage.isDone && !before.has(stage.key));
    setPrevDoneKeys(doneKeys);
    if (finished) setCheer({ id: (cheer?.id ?? 0) + 1, message: `${finished.title}: done!` });
  }

  const activeKey = picked ?? currentKey ?? stages[0]?.key;
  const active = stages.find((stage) => stage.key === activeKey);
  const stateOf = (stage: StageView): StageState =>
    stage.isDone ? "done" : stage.key === currentKey ? "here" : "todo";

  function toggle(key: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const rows = (list: ChecklistItem[]) => list.map((item) => <ChecklistRow key={item.id} item={item} />);

  return (
    <>
      {cheer && (
        <>
          <BirdCheer key={cheer.id} message={cheer.message} />
          <StageConfetti key={`c${cheer.id}`} />
        </>
      )}

      {/* --- phone and tablet: the journey as one column ----------------- */}
      <div className={`${cardClass} px-4 pb-1 pt-5 lg:hidden`}>
        <p className="mb-3.5 font-mono-numbers text-[11.5px] uppercase tracking-[0.16em] text-[#9a6b00]">
          Your journey
        </p>
        {stages.map((stage, i) => {
          const state = stateOf(stage);
          const isCurrent = state === "here";
          const isOpen = isCurrent || expanded.has(stage.key);
          const isLast = i === stages.length - 1 && !hasOwn;
          return (
            <section key={stage.key} className="relative flex items-start gap-3.5 pb-4">
              {!isLast && <StageLine done={stage.isDone} left={13.5} top={34} />}
              <StageNode state={state} num={String(i + 1)} size={30} />
              <div className="min-w-0 flex-1">
                {isCurrent ? (
                  <>
                    <HereBadge />
                    <StageHeading title={stage.title} className="mt-2 text-[28px]" />
                    <p className="mt-2 text-[15px] leading-relaxed text-ink/75">{stage.blurb}</p>
                    <div className="mt-3">
                      <StageBar done={stage.done} total={stage.items.length} />
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggle(stage.key)}
                    aria-expanded={isOpen}
                    className="flex min-h-11 w-full items-center justify-between gap-2.5 pt-0.5 text-left"
                  >
                    <span
                      className={`font-display text-[21px] font-semibold leading-tight ${
                        stage.isDone ? "text-forest/60" : "text-forest"
                      }`}
                    >
                      {stage.title}
                    </span>
                    <span className="shrink-0 font-mono-numbers text-[12.5px] text-ink/70">
                      {stage.isDone ? `${stage.done} done` : `${stage.left} to do`}
                    </span>
                  </button>
                )}
                {isOpen && (
                  <>
                    {!isCurrent && (
                      <p className="mt-1 text-[15px] leading-relaxed text-ink/70">
                        {stage.isDone ? stage.doneBlurb : stage.blurb}
                      </p>
                    )}
                    <div className="rise-stagger mt-1.5">{rows(stage.ordered)}</div>
                  </>
                )}
              </div>
            </section>
          );
        })}

        {hasOwn && (
          <section className="relative flex items-start gap-3.5 pb-4">
            <StageNode state="own" num="+" size={30} />
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => toggle("own")}
                aria-expanded={expanded.has("own")}
                className="flex min-h-11 w-full items-center justify-between gap-2.5 pt-0.5 text-left"
              >
                <span className="font-display text-[21px] font-semibold leading-tight text-forest">
                  Your own tasks
                </span>
                <span className="shrink-0 font-mono-numbers text-[12.5px] text-ink/70">
                  {own.length > 0 ? `${own.length} to do` : `${ownDone.length} done`}
                </span>
              </button>
              {expanded.has("own") && (
                <>
                  <div className="rise-stagger mt-1.5">{rows(own)}</div>
                  <OwnDoneDrawer items={ownDone} />
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {/* --- wide screens: the whole journey, plus the stage you're on --- */}
      <div className="hidden lg:grid lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <nav aria-label="Stages" className={`${cardClass} px-5 pb-4 pt-7`}>
          <p className="mb-4 pl-1 font-mono-numbers text-xs uppercase tracking-[0.16em] text-[#9a6b00]">
            Your journey
          </p>
          {stages.map((stage, i) => {
            const state = stateOf(stage);
            const isActive = stage.key === activeKey;
            const isLast = i === stages.length - 1 && !hasOwn;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => setPicked(stage.key)}
                aria-current={isActive ? "step" : undefined}
                className={`group relative flex w-full items-start gap-4 rounded-xl pb-[18px] pl-1 pr-3 pt-2.5 text-left transition-colors ${
                  isActive ? "bg-[#f3f5fc]" : "hover:bg-parchment"
                }`}
              >
                {!isLast && <StageLine done={stage.isDone} left={18.5} top={46} />}
                <StageNode state={state} num={String(i + 1)} />
                <span className="min-w-0 pt-[3px]">
                  <span
                    className={`block font-display text-[21px] font-semibold leading-[1.15] group-hover:text-[#2243B6] ${
                      stage.isDone && !isActive ? "text-forest/60" : "text-forest"
                    }`}
                  >
                    {stage.title}
                  </span>
                  <span className="mt-[3px] block font-mono-numbers text-[12.5px] text-ink/70">
                    {stage.isDone
                      ? `${stage.done} done`
                      : state === "here"
                        ? `${stage.left} left · you're here`
                        : `${stage.left} to do`}
                  </span>
                </span>
              </button>
            );
          })}

          {hasOwn && (
            <button
              type="button"
              onClick={() => setPicked("own")}
              aria-current={activeKey === "own" ? "step" : undefined}
              className={`group relative flex w-full items-start gap-4 rounded-xl pb-[18px] pl-1 pr-3 pt-2.5 text-left transition-colors ${
                activeKey === "own" ? "bg-[#f3f5fc]" : "hover:bg-parchment"
              }`}
            >
              <StageNode state="own" num="+" />
              <span className="min-w-0 pt-[3px]">
                <span className="block font-display text-[21px] font-semibold leading-[1.15] text-forest group-hover:text-[#2243B6]">
                  Your own tasks
                </span>
                <span className="mt-[3px] block font-mono-numbers text-[12.5px] text-ink/70">
                  {own.length > 0 ? `${own.length} to do` : `${ownDone.length} done`}
                </span>
              </span>
            </button>
          )}
        </nav>

        <section className={`${cardClass} min-w-0 px-10 pb-6 pt-8`}>
          {activeKey === "own" ? (
            <>
              <div className="flex items-start gap-5">
                <StageIcon phase="own" />
                <div className="min-w-0 flex-1">
                  <StageHeading title="Your own tasks" className="text-[40px]" />
                  <p className="mt-2.5 max-w-2xl text-[16.5px] leading-relaxed text-ink/75">
                    The things only your wedding has, in the order they&apos;re due.
                  </p>
                </div>
              </div>
              <div key="own" className="rise-stagger mt-5">
                {own.length > 0 ? (
                  rows(own)
                ) : (
                  <p className="py-4 text-[15px] text-ink/70">Nothing left here.</p>
                )}
              </div>
              <OwnDoneDrawer items={ownDone} />
            </>
          ) : active ? (
            <>
              <div className="flex items-start gap-5">
                <StageIcon phase={active.key} />
                <div className="min-w-0 flex-1">
                  {active.key === currentKey && (
                    <HereBadge>
                      You&apos;re here · Stage {stages.indexOf(active) + 1} of {stages.length}
                    </HereBadge>
                  )}
                  <StageHeading
                    title={active.title}
                    className={`text-[40px] ${active.key === currentKey ? "mt-2.5" : ""}`}
                  />
                  <p className="mt-2.5 max-w-2xl text-[16.5px] leading-relaxed text-ink/75">
                    {active.isDone ? active.doneBlurb : active.blurb}
                  </p>
                  <div className="mt-4">
                    <StageBar done={active.done} total={active.items.length} />
                  </div>
                </div>
              </div>
              <div key={active.key} className="rise-stagger mt-5">
                {rows(active.ordered)}
              </div>
            </>
          ) : null}
          <div className="mt-5 border-t border-hairline pt-4">
            <DueLegend />
          </div>
        </section>
      </div>
    </>
  );
}
