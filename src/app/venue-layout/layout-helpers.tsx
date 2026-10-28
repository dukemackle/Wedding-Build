"use client";

import { useMemo, useState, useTransition } from "react";
import type { Guest, SeatingTable } from "@/lib/supabase/types";
import { CANVAS_HEIGHT, CANVAS_WIDTH, tableFootprint } from "@/lib/venue-layout-geometry";
import { LAYOUT_TEMPLATES, buildTemplate, type LayoutTemplateId, type TemplateLayout } from "@/lib/layout-templates";
import { planSeating } from "@/lib/auto-seat";
import { assignGuestsTable } from "@/app/seating/actions";
import { WrenBirdIcon } from "@/components/icons";
import { applyLayoutTemplate, seatTheRest } from "./template-actions";

/** A small drawing of a template, from the same geometry that gets saved. */
function TemplateThumb({ layout }: { layout: TemplateLayout }) {
  return (
    <svg
      viewBox={`0 0 ${CANVAS_WIDTH} ${layout.height}`}
      className="block h-auto max-h-56 w-full rounded-md border border-hairline bg-parchment"
      aria-hidden
    >
      {layout.items.map((i, n) =>
        i.type === "dance_floor" ? (
          <rect key={n} x={i.x} y={i.y} width={i.width} height={i.height} rx={8} fill="#2243B6" opacity={0.16} stroke="#2243B6" strokeOpacity={0.5} strokeWidth={4} />
        ) : (
          <rect key={n} x={i.x} y={i.y} width={i.width} height={i.height} rx={6} fill="#14203d" opacity={0.12} />
        ),
      )}
      {layout.tables.map((t, n) => {
        const { width, height } = tableFootprint({ shape: t.shape, capacity: t.capacity, width: t.width, height: t.height });
        const couple = n === 0;
        const fill = couple ? "#2243B6" : "#FFD301";
        return t.shape === "round" ? (
          <ellipse key={n} cx={t.x + width / 2} cy={t.y + height / 2} rx={width / 2} ry={height / 2} fill={fill} stroke="#14203d" strokeOpacity={0.35} strokeWidth={4} />
        ) : (
          <rect key={n} x={t.x} y={t.y} width={width} height={height} rx={8} fill={fill} stroke="#14203d" strokeOpacity={0.35} strokeWidth={4} />
        );
      })}
    </svg>
  );
}

/**
 * "Start from a layout": three ready-made rooms sized to the guest list.
 * Inline on an empty plan, and behind the Layouts button once there's
 * something to replace or add to.
 */
export function LayoutTemplatePicker({
  guestSeats,
  roomId,
  hasContent,
  seatedPeople,
  onDone,
}: {
  guestSeats: number;
  roomId?: string;
  hasContent: boolean;
  seatedPeople: number;
  onDone?: () => void;
}) {
  const layouts = useMemo(
    () => LAYOUT_TEMPLATES.map((spec) => ({ spec, layout: buildTemplate(spec.id, guestSeats) })),
    [guestSeats],
  );
  const [picked, setPicked] = useState<LayoutTemplateId>("classic");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply(replace: boolean) {
    if (replace && seatedPeople > 0 && !confirm(`Replace the plan? The ${seatedPeople} guests already seated will go back to "Guests to seat".`)) {
      return;
    }
    const formData = new FormData();
    formData.set("template", picked);
    formData.set("replace", replace ? "1" : "0");
    if (roomId) formData.set("room_id", roomId);
    startTransition(async () => {
      const result = await applyLayoutTemplate(formData);
      if (result?.error) setError(result.error);
      else onDone?.();
    });
  }

  return (
    <section className="mb-6 rounded-lg border border-hairline bg-card p-5 sm:p-6">
      <h3 className="font-display text-xl font-semibold text-forest">Start from a layout</h3>
      <p className="mt-1 text-sm text-ink/70">
        {guestSeats > 0
          ? `Sized for your ${guestSeats} guests, with a few spare seats. Everything stays movable afterwards.`
          : "Sized for 40 guests until your guest list is in. Everything stays movable afterwards."}
      </p>
      <div role="radiogroup" aria-label="Layout" className="mt-4 grid gap-4 md:grid-cols-3">
        {layouts.map(({ spec, layout }) => {
          const guestTables = layout.tables.length - 1;
          const selected = picked === spec.id;
          return (
            <button
              key={spec.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setPicked(spec.id)}
              className={`rounded-lg border bg-card p-3 text-left transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brass/40 ${
                selected ? "border-brass shadow-md ring-2 ring-brass" : "border-hairline hover:shadow-sm"
              }`}
            >
              <TemplateThumb layout={layout} />
              <span className="mt-3 block font-medium text-forest">{spec.name}</span>
              <span className="mt-0.5 block text-xs text-ink/60">{spec.blurb}</span>
              <span className="mt-2 block font-mono-numbers text-xs text-ink/70">
                {guestTables} tables of {layout.tables[1]?.capacity ?? 0} · {layout.seats} seats
              </span>
              {layout.height > CANVAS_HEIGHT && (
                <span className="mt-1 block text-xs text-ink/70">
                  A big one, so the room runs longer to fit every table.
                </span>
              )}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {hasContent ? (
          <>
            <button type="button" className="btn-primary" disabled={isPending} onClick={() => apply(true)}>
              {isPending ? "Setting the room..." : "Replace my plan"}
            </button>
            <button type="button" className="btn-secondary" disabled={isPending} onClick={() => apply(false)}>
              Add alongside
            </button>
          </>
        ) : (
          <button type="button" className="btn-primary" disabled={isPending} onClick={() => apply(false)}>
            {isPending ? "Setting the room..." : "Use this layout"}
          </button>
        )}
        {onDone && (
          <button type="button" className="text-sm text-ink/60 underline-offset-2 hover:underline" onClick={onDone}>
            Cancel
          </button>
        )}
      </div>
    </section>
  );
}

function people(g: Pick<Guest, "plus_one">) {
  return 1 + (g.plus_one ? 1 : 0);
}

/**
 * Wren's "Seat the rest": shows the plan first (which households go where),
 * then seats them in one go, with Undo straight after.
 */
export function SeatTheRest({ guests, tables }: { guests: Guest[]; tables: SeatingTable[] }) {
  const [open, setOpen] = useState(false);
  const [undoIds, setUndoIds] = useState<string[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const plan = useMemo(() => (open ? planSeating(guests, tables) : null), [open, guests, tables]);
  const unseated = guests.filter((g) => !g.table_id);

  const byId = useMemo(() => new Map(guests.map((g) => [g.id, g])), [guests]);
  const tableName = useMemo(() => new Map(tables.map((t) => [t.id, t.name])), [tables]);

  function confirmSeat() {
    startTransition(async () => {
      const result = await seatTheRest();
      if (result.error) setError(result.error);
      setUndoIds(result.seatedIds ?? []);
      setOpen(false);
    });
  }

  function undo() {
    if (!undoIds?.length) return;
    const formData = new FormData();
    for (const id of undoIds) formData.append("guest_id", id);
    formData.set("table_id", "");
    startTransition(async () => {
      await assignGuestsTable(formData);
      setUndoIds(null);
    });
  }

  if (undoIds && !open) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-wren/30 bg-wren-soft px-4 py-3 text-sm text-ink">
        <span className="flex items-center gap-2">
          <WrenBirdIcon className="h-5 w-5 shrink-0 text-wren-deep" />
          {error ? `Some seats didn't save. ${error}` : `Seated ${undoIds.length} guests. Drag anyone to swap.`}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {undoIds.length > 0 && (
            <button type="button" onClick={undo} disabled={isPending} className="font-medium text-wren-deep underline-offset-2 hover:underline">
              Undo
            </button>
          )}
          <button type="button" onClick={() => setUndoIds(null)} aria-label="Dismiss" className="text-ink/50 hover:text-ink">
            ×
          </button>
        </span>
      </div>
    );
  }

  if (unseated.length === 0) return null;

  if (!open || !plan) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-4 py-3 text-sm font-medium text-parchment shadow-sm transition-colors hover:bg-forest/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-wren/40"
      >
        <WrenBirdIcon className="h-5 w-5 text-wren" />
        Seat the rest with Wren
      </button>
    );
  }

  const usedTables = plan.assignments.length;
  return (
    <div className="rounded-lg border border-hairline bg-card">
      <div className="flex items-start gap-3 rounded-t-lg bg-forest px-4 py-3 text-parchment">
        <WrenBirdIcon className="mt-0.5 h-5 w-5 shrink-0 text-wren" />
        <div>
          <p className="font-medium">
            {plan.seatedPeople > 0
              ? `I can seat ${plan.seatedPeople} guests at ${usedTables} table${usedTables === 1 ? "" : "s"}.`
              : "There's no free seat to put anyone in."}
          </p>
          <p className="mt-0.5 text-xs text-parchment/75">
            Households together, plus-ones beside their guest, each side and each circle grouped. Nobody already seated moves.
          </p>
        </div>
      </div>
      <ol className="max-h-72 divide-y divide-hairline overflow-y-auto px-4 text-sm">
        {plan.assignments.map(({ tableId, guestIds }) => {
          const names = guestIds.map((id) => byId.get(id)).filter((g): g is Guest => !!g);
          const count = names.reduce((s, g) => s + people(g), 0);
          return (
            <li key={tableId} className="py-2">
              <span className="font-medium text-forest">{tableName.get(tableId)}</span>
              <span className="ml-2 font-mono-numbers text-xs text-ink/50">+{count}</span>
              <span className="block truncate text-xs text-ink/60">{names.map((g) => g.name).join(", ")}</span>
            </li>
          );
        })}
      </ol>
      {plan.leftoverPeople > 0 && (
        <p className="border-t border-hairline px-4 py-2 text-xs text-ink/70">
          {plan.leftoverPeople} won&apos;t fit yet. Add a table or two and run this again for them.
        </p>
      )}
      <div className="flex items-center gap-3 border-t border-hairline px-4 py-3">
        <button type="button" className="btn-primary" disabled={isPending || plan.seatedPeople === 0} onClick={confirmSeat}>
          {isPending ? "Seating..." : "Seat them"}
        </button>
        <button type="button" className="text-sm text-ink/60 underline-offset-2 hover:underline" onClick={() => setOpen(false)}>
          Not now
        </button>
      </div>
    </div>
  );
}
