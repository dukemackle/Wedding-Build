"use client";

import { useRef, useState, type ReactNode } from "react";
import { resolveDesign, type SiteDesign } from "@/lib/site-design";
import {
  ANIMATIONS,
  PHOTO_FILTERS,
  PHOTO_FRAMES,
  findElement,
  updateElement,
  type AnimationId,
  type CanvasElement,
  type SiteCanvas,
} from "@/lib/site-canvas";
import type { CanvasSelection } from "./canvas-messages";
import { PanelLabel } from "./editor-tabs";

const ON = "border-2 border-[#2243B6] bg-[#2243B6]/[0.06]";
const OFF = "m-px border border-hairline bg-card hover:border-ink/30";

/**
 * Where a photo stays in view when it's cropped: tap or drag on the photo.
 * The same picker sets the banner photo's focus point and a placed photo's.
 */
export function FocusPicker({
  src,
  fx,
  fy,
  ratio,
  filter,
  onChange,
}: {
  src: string;
  fx: number;
  fy: number;
  /** The frame's width over its height, so the picker shows what's kept. */
  ratio?: number;
  filter?: string;
  onChange: (fx: number, fy: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  // The photo's own shape, to show which part a frame of `ratio` keeps.
  const [natural, setNatural] = useState<number | null>(null);
  function place(clientX: number, clientY: number) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)));
    onChange(x, y);
  }
  return (
    <div className="flex flex-col gap-2">
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label="Focus point"
        aria-valuenow={fx}
        aria-valuetext={`${fx}% across, ${fy}% down`}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          place(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging.current && place(e.clientX, e.clientY)}
        onPointerUp={() => (dragging.current = false)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 2;
          const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
          const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
          if (!dx && !dy) return;
          e.preventDefault();
          onChange(Math.min(100, Math.max(0, fx + dx)), Math.min(100, Math.max(0, fy + dy)));
        }}
        className="relative cursor-crosshair touch-none overflow-hidden rounded-xl border border-hairline bg-ink/[0.04] outline-none focus-visible:ring-2 focus-visible:ring-[#2243B6]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- the couple's own photo, shown whole */}
        <img
          src={src}
          alt=""
          draggable={false}
          onLoad={(e) => setNatural(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight || null)}
          className="block w-full select-none"
          style={{ filter }}
        />
        {ratio && natural && <KeptArea fx={fx} fy={fy} ratio={ratio} natural={natural} />}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_#2243B6]"
          style={{ left: `${fx}%`, top: `${fy}%` }}
        />
      </div>
      <p className="text-[13px] leading-normal text-ink/60">
        Tap the part that matters most, a face, say. It stays in view however the photo is cropped.
      </p>
    </div>
  );
}

/** A soft outline of the part of the photo a frame of this shape keeps, around the focus point. */
function KeptArea({ fx, fy, ratio, natural }: { fx: number; fy: number; ratio: number; natural: number }) {
  // object-fit: cover keeps the full height or width, whichever runs out first.
  const wide = ratio > natural;
  const w = wide ? 100 : (ratio / natural) * 100;
  const h = wide ? (natural / ratio) * 100 : 100;
  const left = (100 - w) * (fx / 100);
  const top = (100 - h) * (fy / 100);
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute rounded-sm border-2 border-dashed border-white/90 shadow-[0_0_0_9999px_rgb(20_32_61/0.35)]"
      style={{ left: `${left}%`, top: `${top}%`, width: `${w}%`, height: `${h}%` }}
    />
  );
}

/**
 * Photo: crop (focus point and zoom), frame, filter and words for screen
 * readers, for a placed photo. `only` shows one part, for the phone's sheets.
 */
export function PhotoPanel({
  design,
  selection,
  onCanvas,
  only,
}: {
  design: SiteDesign;
  selection: CanvasSelection;
  onCanvas: (canvas: SiteCanvas) => void;
  only?: "crop" | "frame" | "filter";
}) {
  const el = selection?.id ? findElement(design.canvas, selection.section, selection.id) : null;
  if (!el || el.kind !== "photo" || !selection) {
    return <p className="text-sm text-ink/70">Pick a photo on your site to crop, frame or filter it.</p>;
  }
  const set = (patch: Partial<CanvasElement>) => onCanvas(updateElement(design.canvas, selection.section, el.id, patch));
  const filter = PHOTO_FILTERS.find((f) => f.id === el.filter)?.css;
  const { accent } = resolveDesign(design);
  const show = (part: "crop" | "frame" | "filter") => !only || only === part;

  return (
    <>
      {show("crop") && (
        <div className="flex flex-col gap-3">
          {!only && <PanelLabel>Crop</PanelLabel>}
          <FocusPicker src={el.src} fx={el.fx} fy={el.fy} ratio={el.w / el.h} filter={filter} onChange={(fx, fy) => set({ fx, fy })} />
          <label className="flex items-center gap-3 text-[13px] text-ink/70">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={el.zoom}
              onChange={(e) => set({ zoom: Number(e.target.value) })}
              className="flex-1 accent-[#2243B6]"
            />
            <span className="w-10 text-right tabular-nums">{Math.round(el.zoom * 100)}%</span>
          </label>
        </div>
      )}

      {show("frame") && (
        <div className="flex flex-col gap-3">
          {!only && <PanelLabel>Frame</PanelLabel>}
          <div className="grid grid-cols-3 gap-2">
            {PHOTO_FRAMES.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={el.frame === f.id}
                onClick={() => set({ frame: f.id })}
                className={`flex h-20 flex-col items-center justify-center gap-1.5 rounded-xl text-[11px] text-ink/70 ${el.frame === f.id ? ON : OFF}`}
              >
                <FrameIcon frame={f.id} accent={accent} />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {show("filter") && (
        <div className="flex flex-col gap-3">
          {!only && <PanelLabel>Filter</PanelLabel>}
          <div className="grid grid-cols-3 gap-2">
            {PHOTO_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={el.filter === f.id}
                onClick={() => set({ filter: f.id })}
                className={`flex flex-col gap-1 overflow-hidden rounded-xl pb-1.5 text-[11px] text-ink/70 ${el.filter === f.id ? ON : OFF}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a small sample of the couple's photo */}
                <img src={el.src} alt="" loading="lazy" className="aspect-square w-full object-cover" style={{ filter: f.css, objectPosition: `${el.fx}% ${el.fy}%` }} />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!only && (
        <label className="flex flex-col gap-2">
          <PanelLabel>Describe it</PanelLabel>
          <input
            defaultValue={el.alt}
            key={el.id}
            maxLength={200}
            placeholder="Us on the pier at sunset"
            onBlur={(e) => e.target.value !== el.alt && set({ alt: e.target.value })}
            className="h-11 rounded-lg border border-hairline bg-card px-3 text-[15px] text-ink placeholder:text-ink/45"
          />
          <span className="text-[13px] leading-normal text-ink/60">Read out to guests who use a screen reader.</span>
        </label>
      )}
    </>
  );
}

function FrameIcon({ frame, accent }: { frame: string; accent: string }) {
  const fill = { background: "color-mix(in srgb, currentColor 22%, transparent)" };
  if (frame === "circle") return <span className="h-9 w-9 rounded-full" style={fill} />;
  if (frame === "arch") return <span className="h-10 w-8 rounded-t-full" style={fill} />;
  if (frame === "rounded") return <span className="h-8 w-10 rounded-md" style={fill} />;
  if (frame === "polaroid")
    return (
      <span className="border border-ink/15 bg-white px-1 pb-2.5 pt-1 shadow-sm">
        <span className="block h-6 w-8" style={fill} />
      </span>
    );
  if (frame === "border")
    return (
      <span className="p-0.5" style={{ border: `1.5px solid ${accent}` }}>
        <span className="block h-7 w-9" style={fill} />
      </span>
    );
  return <span className="h-8 w-10" style={fill} />;
}

/**
 * Animate: how a placed element arrives as guests scroll to it. Played in
 * the preview on each change so the couple sees it.
 */
export function AnimatePanel({
  design,
  selection,
  onCanvas,
}: {
  design: SiteDesign;
  selection: CanvasSelection;
  onCanvas: (canvas: SiteCanvas) => void;
}) {
  const key = selection?.section ?? "";
  const el = selection?.id ? findElement(design.canvas, key, selection.id) : null;
  const section = design.canvas.sections[key];
  if (!el || !section) {
    return <p className="text-sm text-ink/70">Pick text, art, a shape or a photo on your site to animate it.</p>;
  }
  const setAll = (anim: AnimationId) =>
    onCanvas({
      ...design.canvas,
      sections: { ...design.canvas.sections, [key]: { ...section, elements: section.elements.map((x) => ({ ...x, anim })) } },
    });

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {ANIMATIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={el.anim === a.id}
            onClick={() => onCanvas(updateElement(design.canvas, key, el.id, { anim: a.id }))}
            className={`group flex h-[84px] flex-col items-center justify-center gap-1 rounded-xl ${el.anim === a.id ? ON : OFF}`}
          >
            <AnimSample anim={a.id}>Aa</AnimSample>
            <span className="text-[12px] text-ink/70">{a.label}</span>
          </button>
        ))}
      </div>
      <p className="text-[13px] leading-normal text-ink/60">
        Plays once as guests scroll to it. Guests who turn motion off see it still.
      </p>
      <div className="flex flex-col gap-2">
        {el.anim !== "none" && (
          <button
            type="button"
            onClick={() => setAll(el.anim)}
            className="h-11 rounded-xl border border-hairline bg-card text-sm font-medium text-ink hover:border-ink/30"
          >
            Use on the whole section
          </button>
        )}
        {section.elements.some((x) => x.anim !== "none") && (
          <button
            type="button"
            onClick={() => setAll("none")}
            className="h-11 rounded-xl text-sm text-ink/70 underline underline-offset-2 hover:text-ink"
          >
            Remove all animations in this section
          </button>
        )}
      </div>
    </>
  );
}

/** "Aa" that plays the animation when its card is hovered. */
function AnimSample({ anim, children }: { anim: AnimationId; children: ReactNode }) {
  const name = anim === "none" ? undefined : `el-${anim}`;
  return (
    <span
      className="font-display text-[22px] leading-none text-ink [animation-duration:0.9s] [animation-fill-mode:both] group-hover:[animation-name:var(--sample)] motion-reduce:!animate-none"
      style={{ ["--sample" as string]: name }}
    >
      {children}
    </span>
  );
}
