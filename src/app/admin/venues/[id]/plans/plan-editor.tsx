"use client";

import { useRef, useState, useTransition } from "react";
import type { VenueSpace, VenueSpacePlan } from "@/lib/supabase/types";
import { FEET_PER_METRE, metresToFeet, planAreaSqFt } from "@/lib/venue-plans";
import { buttonClass } from "../../../_listing/listing-ui";
import { addSpace, deletePlan, deleteSpace, savePlan } from "./actions";

const inputClass =
  "w-full rounded-md border border-hairline bg-parchment px-3 py-2 text-sm text-ink outline-none focus:border-forest";

type Pt = [number, number];

const box = (w: number, l: number): Pt[] => [
  [0, 0],
  [w, 0],
  [w, l],
  [0, l],
];

/** Corners in whole feet, the unit the owner draws in. */
function startingCorners(plan: VenueSpacePlan | null, w: number, l: number): Pt[] {
  if (!plan?.outline) return box(w, l);
  return plan.outline.map(([x, y]) => [metresToFeet(x), metresToFeet(y)]);
}

function send(action: (fd: FormData) => Promise<{ error?: string }>, fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return action(fd);
}

export function SpacePlanEditor({
  venueId,
  space,
  plan,
}: {
  venueId: string;
  space: VenueSpace;
  plan: VenueSpacePlan | null;
}) {
  const initialW = plan ? metresToFeet(plan.width_m) : 60;
  const initialL = plan ? metresToFeet(plan.length_m) : 40;
  const [widthFt, setWidthFt] = useState(initialW);
  const [lengthFt, setLengthFt] = useState(initialL);
  const [corners, setCorners] = useState<Pt[]>(() => startingCorners(plan, initialW, initialL));
  const [selected, setSelected] = useState<number | null>(null);
  const [published, setPublished] = useState(plan?.published ?? false);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [isPending, startTransition] = useTransition();
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<number | null>(null);

  const isBox =
    corners.length === 4 &&
    corners.every(([x, y]) => (x === 0 || x === widthFt) && (y === 0 || y === lengthFt));

  function change(next: Pt[]) {
    setCorners(next);
    setDirty(true);
    setMessage(null);
  }

  // A plain rectangle follows the typed size; a drawn shape keeps its corners,
  // pulled inside the new box.
  function resize(w: number, l: number) {
    const wasBox = isBox;
    setWidthFt(w);
    setLengthFt(l);
    if (!(w > 0 && l > 0)) return;
    change(wasBox ? box(w, l) : corners.map(([x, y]) => [Math.min(x, w), Math.min(y, l)]));
  }

  function toFeetPoint(e: React.PointerEvent): Pt | null {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return [
      Math.round(Math.min(Math.max(p.x, 0), widthFt)),
      Math.round(Math.min(Math.max(p.y, 0), lengthFt)),
    ];
  }

  function addCornerAfter(i: number) {
    const [x1, y1] = corners[i];
    const [x2, y2] = corners[(i + 1) % corners.length];
    const next = [...corners];
    next.splice(i + 1, 0, [Math.round((x1 + x2) / 2), Math.round((y1 + y2) / 2)]);
    change(next);
    setSelected(i + 1);
  }

  function removeSelected() {
    if (selected == null || corners.length <= 3) return;
    change(corners.filter((_, i) => i !== selected));
    setSelected(null);
  }

  function save() {
    startTransition(async () => {
      const result = await send(savePlan, {
        venue_id: venueId,
        space_id: space.id,
        width_ft: String(widthFt),
        length_ft: String(lengthFt),
        outline: JSON.stringify(isBox ? null : corners.map(([x, y]) => [x / FEET_PER_METRE, y / FEET_PER_METRE])),
        published: published ? "1" : "0",
      });
      setMessage(result.error ?? (published ? "Saved and live on the listing." : "Saved as a draft."));
      if (!result.error) setDirty(false);
    });
  }

  const pad = Math.max(widthFt, lengthFt) * 0.06;
  const grid: number[] = [];
  for (let g = 10; g < Math.max(widthFt, lengthFt); g += 10) grid.push(g);
  const area = planAreaSqFt({
    width_m: widthFt / FEET_PER_METRE,
    length_m: lengthFt / FEET_PER_METRE,
    outline: isBox ? null : corners.map(([x, y]) => [x / FEET_PER_METRE, y / FEET_PER_METRE]),
  });
  // Handles stay the same size on screen whatever the room's size.
  const handle = Math.max(widthFt, lengthFt) / 60;

  return (
    <section className="rounded-lg border border-hairline bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-forest">{space.name}</h2>
        <span className="text-xs uppercase tracking-wide text-ink/50">
          {[space.setting, plan ? (plan.published ? "Published" : "Draft") : "No plan yet"].filter(Boolean).join(" · ")}
        </span>
      </div>

      {/* Wide screen: the drawing beside its controls. Phone: drawing, then controls. */}
      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-md border border-hairline bg-parchment p-2">
          <svg
            ref={svgRef}
            viewBox={`${-pad} ${-pad} ${widthFt + pad * 2} ${lengthFt + pad * 2}`}
            className="block max-h-[60vh] w-full touch-none select-none"
            onPointerMove={(e) => {
              if (dragRef.current == null) return;
              const p = toFeetPoint(e);
              if (!p) return;
              const i = dragRef.current;
              change(corners.map((c, j) => (j === i ? p : c)));
            }}
            onPointerUp={() => (dragRef.current = null)}
            onPointerLeave={() => (dragRef.current = null)}
          >
            <rect x={0} y={0} width={widthFt} height={lengthFt} fill="#fff" stroke="#14203d" strokeOpacity={0.15} strokeWidth={handle * 0.15} strokeDasharray={`${handle} ${handle}`} />
            {grid.map((g) => (
              <g key={g} stroke="#14203d" strokeOpacity={0.07} strokeWidth={handle * 0.12}>
                {g < widthFt && <line x1={g} y1={0} x2={g} y2={lengthFt} />}
                {g < lengthFt && <line x1={0} y1={g} x2={widthFt} y2={g} />}
              </g>
            ))}
            <polygon
              points={corners.map((c) => c.join(",")).join(" ")}
              fill="#5AE4FF"
              fillOpacity={0.22}
              stroke="#2243B6"
              strokeWidth={handle * 0.45}
              strokeLinejoin="round"
            />
            {corners.map(([x1, y1], i) => {
              const [x2, y2] = corners[(i + 1) % corners.length];
              const len = Math.round(Math.hypot(x2 - x1, y2 - y1));
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              return (
                <g key={`edge-${i}`}>
                  <text
                    x={mx}
                    y={my - handle * 1.4}
                    textAnchor="middle"
                    fontSize={handle * 1.5}
                    fill="#14203d"
                    fillOpacity={0.7}
                    style={{ fontFamily: "var(--font-mono-numbers)" }}
                  >
                    {len} ft
                  </text>
                  <g
                    role="button"
                    aria-label="Add a corner here"
                    className="cursor-pointer"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      addCornerAfter(i);
                    }}
                  >
                    <circle cx={mx} cy={my} r={handle * 0.9} fill="#fff" stroke="#2243B6" strokeWidth={handle * 0.15} />
                    <path
                      d={`M${mx - handle * 0.45} ${my}h${handle * 0.9}M${mx} ${my - handle * 0.45}v${handle * 0.9}`}
                      stroke="#2243B6"
                      strokeWidth={handle * 0.18}
                    />
                  </g>
                </g>
              );
            })}
            {corners.map(([x, y], i) => (
              <circle
                key={`corner-${i}`}
                cx={x}
                cy={y}
                r={handle * (selected === i ? 1.3 : 1.05)}
                fill={selected === i ? "#FFD301" : "#2243B6"}
                stroke="#fff"
                strokeWidth={handle * 0.25}
                className="cursor-grab"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId);
                  dragRef.current = i;
                  setSelected(i);
                }}
              />
            ))}
          </svg>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-ink">
              Width (ft)
              <input
                type="number"
                min={10}
                max={390}
                value={widthFt || ""}
                onChange={(e) => resize(Number(e.target.value), lengthFt)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1 text-ink">
              Length (ft)
              <input
                type="number"
                min={10}
                max={390}
                value={lengthFt || ""}
                onChange={(e) => resize(widthFt, Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>
          <p className="font-mono-numbers text-xs text-ink/60">
            {area.toLocaleString()} sq ft · {corners.length} corners
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={removeSelected}
              disabled={selected == null || corners.length <= 3}
              className={buttonClass}
            >
              Remove corner
            </button>
            <button type="button" onClick={() => change(box(widthFt, lengthFt))} disabled={isBox} className={buttonClass}>
              Back to rectangle
            </button>
          </div>
          <label className="mt-1 flex items-center gap-2 text-ink">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => {
                setPublished(e.target.checked);
                setDirty(true);
              }}
            />
            Published: couples can design here
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={save} disabled={isPending || (!dirty && Boolean(plan))} className="btn-primary">
              {isPending ? "Saving…" : "Save plan"}
            </button>
            {plan && (
              <button
                type="button"
                className={buttonClass}
                disabled={isPending}
                onClick={() => {
                  if (!confirm(`Delete the floor plan for "${space.name}"? Couples' copies stay as they are.`)) return;
                  startTransition(async () => {
                    const r = await send(deletePlan, { venue_id: venueId, space_id: space.id });
                    if (r.error) setMessage(r.error);
                  });
                }}
              >
                Delete plan
              </button>
            )}
          </div>
          {message && <p className="text-xs text-ink/70">{message}</p>}
          <button
            type="button"
            className="mt-auto self-start text-xs text-red-700 hover:underline"
            disabled={isPending}
            onClick={() => {
              if (!confirm(`Delete the space "${space.name}" from this venue, plan and all?`)) return;
              startTransition(async () => {
                const r = await send(deleteSpace, { venue_id: venueId, space_id: space.id });
                if (r.error) setMessage(r.error);
              });
            }}
          >
            Delete space
          </button>
        </div>
      </div>
    </section>
  );
}

export function AddSpaceForm({ venueId }: { venueId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          fd.set("venue_id", venueId);
          const r = await addSpace(fd);
          setError(r.error ?? null);
          if (!r.error) formRef.current?.reset();
        })
      }
      className="flex flex-col gap-3 rounded-lg border border-dashed border-hairline p-5 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1 text-sm text-ink">
        New space
        <input name="name" required placeholder="The Grand Ballroom" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink sm:w-44">
        Setting
        <select name="setting" defaultValue="" className={inputClass}>
          <option value="">—</option>
          <option value="Indoor">Indoor</option>
          <option value="Outdoor">Outdoor</option>
          <option value="Covered outdoor">Covered outdoor</option>
        </select>
      </label>
      <button type="submit" disabled={isPending} className="btn-secondary">
        {isPending ? "Adding…" : "Add space"}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
