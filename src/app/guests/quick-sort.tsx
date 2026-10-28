"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Guest, GuestPriority, GuestSide, GuestType } from "@/lib/supabase/types";
import { GUEST_SIDES, GUEST_TYPES, GUEST_TYPE_LABELS, type SideTheme } from "@/lib/guest-groups";
import { guessGrouping, isUnsorted } from "@/lib/guest-tidy";

/**
 * One guest at a time: side, priority, group, next. Sorting 280 guests one
 * dropdown at a time is the job nobody finishes; with number keys (or big
 * buttons on a phone) and Wren's guess from the household or last name it's
 * a few minutes.
 *
 * The queue is fixed when it opens, so a guest doesn't vanish the moment
 * they're sorted and Previous still finds them.
 */

export type SortPick = { side: GuestSide | null; guest_type: GuestType | null; priority: GuestPriority };

const PRIORITY_OPTIONS: { value: GuestPriority; label: string; color: string }[] = [
  { value: "must_invite", label: "Must", color: "#2243B6" },
  { value: "would_like", label: "Would like", color: "#FFD301" },
  { value: "if_room", label: "If there's room", color: "#FFF12F" },
];

// Number keys in three runs, so no partner's initial can clash with anything.
const SIDE_KEYS = ["1", "2", "3"];
const PRIORITY_KEYS = ["4", "5", "6"];
const GROUP_KEYS = ["7", "8", "9", "0"];

function byHouseholdThenName(a: Guest, b: Guest) {
  const ha = a.household?.trim().toLowerCase() || a.name.toLowerCase();
  const hb = b.household?.trim().toLowerCase() || b.name.toLowerCase();
  return ha.localeCompare(hb) || a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

function samePick(a: SortPick, b: SortPick) {
  return a.side === b.side && a.guest_type === b.guest_type && a.priority === b.priority;
}

const PRIORITY_LABEL: Record<GuestPriority, string> = {
  must_invite: "Must",
  would_like: "Would like",
  if_room: "If there's room",
};

export function QuickSort({
  guests,
  theme,
  onSave,
  onClose,
}: {
  guests: Guest[];
  theme: SideTheme;
  onSave: (guestId: string, pick: SortPick) => void;
  onClose: () => void;
}) {
  const [queue] = useState(() => guests.filter(isUnsorted).sort(byHouseholdThenName).map((g) => g.id));
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<string, SortPick>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const byId = new Map(guests.map((g) => [g.id, g]));
  const guestId = queue[index];
  const guest = guestId ? byId.get(guestId) : undefined;
  const finished = index >= queue.length;

  const current: SortPick | null = guest
    ? (picks[guest.id] ?? { side: guest.side, guest_type: guest.guest_type, priority: guest.priority })
    : null;
  const touched = guest ? guest.id in picks : false;
  const guess = guest ? guessGrouping(guest, guests) : null;
  const guessPick: SortPick | null =
    guess && current
      ? {
          side: guess.side ?? current.side,
          guest_type: guess.guest_type ?? current.guest_type,
          priority: guess.priority ?? current.priority,
        }
      : null;

  function describe(pick: SortPick) {
    return [
      pick.side ? theme.labels[pick.side] : null,
      PRIORITY_LABEL[pick.priority],
      pick.guest_type ? GUEST_TYPE_LABELS[pick.guest_type] : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  function set(patch: Partial<SortPick>) {
    if (!guest || !current) return;
    setPicks((all) => ({ ...all, [guest.id]: { ...current, ...patch } }));
  }

  function commitAndNext(pick: SortPick | null) {
    if (guest && pick) {
      const before: SortPick = { side: guest.side, guest_type: guest.guest_type, priority: guest.priority };
      if (!samePick(pick, before)) {
        onSave(guest.id, pick);
        setSaved((s) => new Set(s).add(guest.id));
      }
      setPicks((all) => ({ ...all, [guest.id]: pick }));
    }
    setIndex((i) => Math.min(queue.length, i + 1));
  }

  const next = () => commitAndNext(current);
  const acceptGuess = () => commitAndNext(guessPick);
  const skip = () => setIndex((i) => Math.min(queue.length, i + 1));
  const previous = () => setIndex((i) => Math.max(0, i - 1));

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") return onClose();
    if (finished) return;
    const sideAt = SIDE_KEYS.indexOf(e.key);
    const priorityAt = PRIORITY_KEYS.indexOf(e.key);
    const groupAt = GROUP_KEYS.indexOf(e.key);
    if (sideAt >= 0) set({ side: GUEST_SIDES[sideAt] });
    else if (priorityAt >= 0) set({ priority: PRIORITY_OPTIONS[priorityAt].value });
    else if (groupAt >= 0) set({ guest_type: GUEST_TYPES[groupAt] });
    else if (e.key === "Enter") {
      // Untouched with a guess: Enter takes the guess. Otherwise it keeps
      // what was picked.
      if (!touched && guessPick) acceptGuess();
      else next();
    } else if (e.key === "s" || e.key === "S" || e.key === "ArrowRight") skip();
    else if (e.key === "ArrowLeft" || e.key === "Backspace") previous();
    else return;
    e.preventDefault();
  }

  const optionClass = (on: boolean) =>
    `flex min-h-12 items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-forest transition-colors sm:px-4 ${
      on ? "border-2 border-[#2243B6] bg-[#E9EDFB]" : "border border-hairline bg-card hover:border-forest"
    }`;
  const kbd = "hidden rounded-md border border-hairline bg-card px-1.5 py-0.5 font-mono-numbers text-[11px] text-ink/60 sm:inline";
  const sectionLabel = "text-[11px] uppercase tracking-[0.1em] text-ink/55";

  const upNext = queue
    .slice(index + 1, index + 5)
    .map((id) => byId.get(id))
    .filter((g): g is Guest => Boolean(g));

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-sort-title"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-parchment outline-none"
    >
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-hairline bg-card px-4 py-3 sm:gap-6 sm:px-8 sm:py-4">
        <button type="button" onClick={onClose} className="btn-secondary !min-h-10 !px-4 text-sm">
          <span aria-hidden="true">&larr;</span> <span className="max-sm:sr-only">Back to list</span>
        </button>
        <h2 id="quick-sort-title" className="hidden font-display text-2xl font-semibold text-forest sm:block">
          Quick sort
        </h2>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0EDE6]">
            <div
              className="h-full rounded-full bg-[#2243B6] transition-[width] duration-300"
              style={{ width: `${queue.length ? (Math.min(index, queue.length) / queue.length) * 100 : 100}%` }}
            />
          </div>
          <span className="whitespace-nowrap font-mono-numbers text-xs text-ink/70 sm:text-sm">
            {Math.min(index, queue.length)} of {queue.length}
          </span>
        </div>
        <span className="hidden text-sm text-ink/55 lg:inline">Saves as you go</span>
      </div>

      {finished || !guest || !current ? (
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="font-display text-4xl font-semibold text-forest">
            {queue.length === 0 ? "Nothing left to sort" : "That's everyone"}
          </p>
          <p className="text-ink/70">
            {saved.size > 0
              ? `${saved.size} guest${saved.size === 1 ? "" : "s"} sorted. Your seating chart and filters use these now.`
              : "Every guest already has a side and a group."}
          </p>
          <button type="button" onClick={onClose} className="btn-primary">
            Back to your list
          </button>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-5xl flex-1 gap-8 p-4 sm:items-start sm:p-8">
          <div className="flex min-w-0 flex-1 flex-col gap-5 rounded-2xl border border-hairline bg-card p-5 shadow-[0_12px_40px_rgb(20_32_61/0.06)] sm:gap-6 sm:p-9">
            <div>
              <p className="font-display text-4xl font-semibold leading-none text-forest sm:text-5xl">{guest.name}</p>
              <p className="mt-2 text-sm text-ink/60">
                {[
                  [guest.city, guest.state].filter(Boolean).join(", "),
                  guest.household ? `Household: ${guest.household}` : null,
                  guest.plus_one ? "Bringing a plus-one" : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "No address or household yet"}
              </p>
            </div>

            {guess && guessPick && (
              <div className="flex flex-col gap-3 rounded-xl bg-wren-soft p-4 text-sm text-forest sm:flex-row sm:items-center">
                <p className="flex-1 leading-relaxed">
                  <b>Wren&rsquo;s guess:</b> {describe(guessPick)}{" "}
                  <span className="text-ink/70">({guess.reason})</span>
                </p>
                <button
                  type="button"
                  onClick={acceptGuess}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-forest px-4 font-semibold text-parchment hover:bg-forest/90"
                >
                  Looks right
                  {!touched && <kbd className="hidden font-mono-numbers text-[11px] opacity-75 sm:inline">Enter</kbd>}
                </button>
              </div>
            )}

            <fieldset className="flex flex-col gap-2">
              <legend className={sectionLabel}>Side</legend>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
                {GUEST_SIDES.map((side, i) => (
                  <button
                    key={side}
                    type="button"
                    aria-pressed={current.side === side}
                    onClick={() => set({ side })}
                    className={optionClass(current.side === side)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: theme.colors[side] }} />
                      <span className="leading-tight">
                        <span className="sm:hidden">{side === "both" ? "Both" : theme.labels[side].replace(/’s side$|'s side$/, "")}</span>
                        <span className="max-sm:hidden">{theme.labels[side]}</span>
                      </span>
                    </span>
                    <kbd className={kbd}>{SIDE_KEYS[i]}</kbd>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className={sectionLabel}>Priority</legend>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
                {PRIORITY_OPTIONS.map((option, i) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={current.priority === option.value}
                    onClick={() => set({ priority: option.value })}
                    className={optionClass(current.priority === option.value)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-[3px] shadow-[inset_0_0_0_1px_rgb(20_32_61/0.15)]"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="leading-tight">{option.label}</span>
                    </span>
                    <kbd className={kbd}>{PRIORITY_KEYS[i]}</kbd>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className={sectionLabel}>Group</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {GUEST_TYPES.map((type, i) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={current.guest_type === type}
                    onClick={() => set({ guest_type: type })}
                    className={optionClass(current.guest_type === type)}
                  >
                    <span>{GUEST_TYPE_LABELS[type]}</span>
                    <kbd className={kbd}>{GROUP_KEYS[i]}</kbd>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-4 sm:pt-5">
              <button
                type="button"
                onClick={previous}
                disabled={index === 0}
                aria-label="Previous guest"
                className="min-h-11 whitespace-nowrap px-1 text-sm text-ink/70 hover:text-forest disabled:opacity-40"
              >
                &larr;<span className="max-sm:hidden"> Previous</span>
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={skip} className="btn-secondary">
                  Skip <kbd className={kbd}>S</kbd>
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-forest px-5 font-semibold text-parchment hover:bg-forest/90"
                >
                  Next guest <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          </div>

          <aside className="hidden w-72 shrink-0 flex-col gap-3 lg:flex" aria-label="Up next">
            <p className={sectionLabel}>Up next</p>
            {upNext.map((g) => {
              const nextGuess = guessGrouping(g, guests);
              return (
                <div key={g.id} className="rounded-xl border border-hairline bg-card px-4 py-3">
                  <p className="font-medium text-forest">{g.name}</p>
                  <p className="text-xs text-ink/60">
                    {nextGuess ? `Guess: ${[nextGuess.side ? theme.labels[nextGuess.side] : null, nextGuess.guest_type ? GUEST_TYPE_LABELS[nextGuess.guest_type] : null].filter(Boolean).join(" · ")}` : "No guess yet"}
                  </p>
                </div>
              );
            })}
            <p className="mt-3 text-sm leading-relaxed text-ink/60">
              Keys: <b className="text-forest">1&ndash;3</b> side, <b className="text-forest">4&ndash;6</b> priority,{" "}
              <b className="text-forest">7&ndash;0</b> group, <b className="text-forest">Enter</b> next,{" "}
              <b className="text-forest">&larr;</b> back, <b className="text-forest">Esc</b> to stop.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
