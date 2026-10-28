"use client";

import { useMemo, useState, useTransition } from "react";
import type { Guest, SeatingTable } from "@/lib/supabase/types";
import { CANVAS_HEIGHT, CANVAS_WIDTH, ROW_PITCH, tableFootprint, toFeet } from "@/lib/venue-layout-geometry";
import { LAYOUT_TEMPLATES, buildTemplate, type TemplateItem, type TemplateLayout } from "@/lib/layout-templates";
import { AISLE, CEREMONY_TEMPLATES, buildCeremony } from "@/lib/ceremony-templates";
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
      {layout.items.map((i, n) => (
        <g key={n} transform={i.rotation ? `rotate(${i.rotation} ${i.x + i.width / 2} ${i.y + i.height / 2})` : undefined}>
          <ThumbItem item={i} />
        </g>
      ))}
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

function ThumbItem({ item: i }: { item: TemplateItem }) {
  if (i.type === "dance_floor") {
    return <rect x={i.x} y={i.y} width={i.width} height={i.height} rx={8} fill="#2243B6" opacity={0.16} stroke="#2243B6" strokeOpacity={0.5} strokeWidth={4} />;
  }
  if (i.type === "chairs") {
    // One strip per row; the reserved front row in Royal blue.
    const rows = Math.max(1, Math.round(i.height / ROW_PITCH));
    const fill = i.label ? "#2243B6" : "#FFD301";
    return (
      <>
        {Array.from({ length: rows }, (_, r) => (
          <rect key={r} x={i.x} y={i.y + r * ROW_PITCH + 6} width={i.width} height={ROW_PITCH - 14} rx={6} fill={fill} stroke="#14203d" strokeOpacity={0.3} strokeWidth={3} />
        ))}
      </>
    );
  }
  if (i.type === "stage") {
    return <rect x={i.x} y={i.y} width={i.width} height={i.height} rx={i.height / 2} fill="#2243B6" />;
  }
  return <rect x={i.x} y={i.y} width={i.width} height={i.height} rx={6} fill="#14203d" opacity={0.12} />;
}

/**
 * "Start from a layout": three ready-made rooms sized to the guest list.
 * Inline on an empty plan, and behind the Layouts button once there's
 * something to replace or add to.
 */
export function LayoutTemplatePicker({
  guestSeats,
  roomId,
  phaseId,
  hasContent,
  seatedPeople,
  ceremony = false,
  onDone,
}: {
  guestSeats: number;
  /** The ceremony gets rows of chairs and an aisle instead of dinner tables. */
  ceremony?: boolean;
  roomId?: string;
  phaseId?: string;
  hasContent: boolean;
  seatedPeople: number;
  onDone?: () => void;
}) {
  const [unity, setUnity] = useState(false);
  const layouts = useMemo(
    () =>
      ceremony
        ? CEREMONY_TEMPLATES.map((spec) => {
            const layout = buildCeremony(spec.id, guestSeats, { unity });
            return {
              spec,
              layout,
              summary: `${layout.rows} rows of ${layout.perRow} · ${layout.seats} chairs`,
              size: `About ${toFeet(layout.extent.width)} × ${toFeet(layout.extent.height)} ft, ${toFeet(AISLE)} ft aisle${spec.id === "two_aisles" ? "s" : ""}`,
            };
          })
        : LAYOUT_TEMPLATES.map((spec) => {
            const layout = buildTemplate(spec.id, guestSeats);
            return {
              spec,
              layout,
              summary: `${layout.tables.length - 1} tables of ${layout.tables[1]?.capacity ?? 0} · ${layout.seats} seats`,
              size: null,
            };
          }),
    [guestSeats, ceremony, unity],
  );
  const [picked, setPicked] = useState<string>(layouts[0].spec.id);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function apply(replace: boolean) {
    if (replace && seatedPeople > 0 && !confirm(`Replace the plan? The ${seatedPeople} guests already seated will go back to "Guests to seat".`)) {
      return;
    }
    const formData = new FormData();
    formData.set("template", picked);
    formData.set("replace", replace ? "1" : "0");
    if (ceremony && unity) formData.set("unity", "1");
    if (roomId) formData.set("room_id", roomId);
    if (phaseId) formData.set("phase_id", phaseId);
    startTransition(async () => {
      const result = await applyLayoutTemplate(formData);
      if (result?.error) setError(result.error);
      else onDone?.();
    });
  }

  return (
    <section className="mb-6 rounded-lg border border-hairline bg-card p-5 sm:p-6">
      <h3 className="font-display text-xl font-semibold text-forest">
        {ceremony ? "Start from a ceremony layout" : "Start from a layout"}
      </h3>
      <p className="mt-1 text-sm text-ink/70">
        {guestSeats > 0
          ? `Sized for your ${guestSeats} guests, with a few spare seats. Everything stays movable afterwards.`
          : "Sized for 40 guests until your guest list is in. Everything stays movable afterwards."}
        {ceremony && " The front row each side is saved for family."}
      </p>
      <div role="radiogroup" aria-label="Layout" className="mt-4 grid gap-4 md:grid-cols-3">
        {layouts.map(({ spec, layout, summary, size }) => {
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
              <span className="mt-2 block font-mono-numbers text-xs text-ink/70">{summary}</span>
              {size && <span className="mt-0.5 block text-xs text-ink/60">{size}</span>}
              {layout.height > CANVAS_HEIGHT && (
                <span className="mt-1 block text-xs text-ink/70">
                  {ceremony ? "A big one, so the rows run further back." : "A big one, so the room runs longer to fit every table."}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {ceremony && (
        <label className="mt-4 flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={unity} onChange={(e) => setUnity(e.target.checked)} className="h-4 w-4 accent-brass" />
          Add a unity table in front of the arch (for a candle, sand or wine ceremony)
        </label>
      )}
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
export function SeatTheRest({
  guests,
  tables,
  phaseId,
}: {
  guests: Guest[];
  tables: SeatingTable[];
  phaseId?: string | null;
}) {
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
      const result = await seatTheRest(phaseId);
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
