"use client";

import { useState, type ReactNode } from "react";
import {
  FONTS,
  SITE_ART,
  artById,
  resolveDesign,
  sectionColumn,
  type SiteDesign,
} from "@/lib/site-design";
import {
  BLOCK_STYLES,
  CANVAS_COLORS,
  GRID,
  SHAPES,
  addElement,
  alignPatch,
  findElement,
  moveLayer,
  newElementId,
  phoneBoxes,
  placeLayer,
  setHiddenOnPhone,
  setSectionStyle,
  stackOnPhone,
  updatePhoneBox,
  snap,
  updateElement,
  type Align,
  type CanvasColor,
  type CanvasElement,
  type PhoneBox,
  type ShapeId,
  type SiteCanvas,
} from "@/lib/site-canvas";
import type { CanvasFrames, CanvasSelection } from "./canvas-messages";
import { PanelLabel } from "./editor-tabs";

// Selection and "on" states in the editor are Royal blue (CLAUDE.md palette).
const PRESSED = "bg-[#2243B6]/10 text-[#2243B6]";

const KIND_LABELS: Record<string, string> = { serif: "Serif", sans: "Sans", script: "Script", display: "Display" };

const LINE_ART = SITE_ART.filter((a) => a.kind === "line");

/** A section's frame width and height in its own units: stored once it has elements, else as the preview measures it. */
export function frameSize(design: SiteDesign, frames: CanvasFrames, key: string) {
  const measured = frames[key];
  const w = design.canvas.sections[key]?.w ?? measured?.w ?? 1280;
  const h = measured ? (measured.h * w) / measured.w : 480;
  return { w, h };
}

/** What an element is called in Layers and the toolbar. */
export function elementName(el: CanvasElement) {
  if (el.kind === "text") return el.text.split("\n")[0].slice(0, 32) || "Text";
  if (el.kind === "art") return artById(el.art)?.name ?? "Artwork";
  if (el.kind === "shape") return SHAPES.find((s) => s.id === el.shape)?.label ?? "Shape";
  return "Photo";
}

const KIND_NAMES = { text: "Text", art: "Art", shape: "Shape", photo: "Photo" } as const;

/** The site's colours for each palette role, to draw the swatches in. */
function roleColors(design: SiteDesign): Record<string, string> {
  const { theme, accent, accent2, heading } = resolveDesign(design);
  return {
    heading,
    ink: theme.ink,
    accent,
    accent2,
    muted: theme.muted,
    surface: theme.surface,
    bg: theme.bg,
  };
}

type NewElement =
  | { kind: "text"; style: "heading" | "subheading" | "body" }
  | { kind: "shape"; shape: ShapeId }
  | { kind: "art"; art: string }
  | { kind: "photo"; src: string };

/** A new element, centred in its section and a little below the last one added. */
function buildElement(spec: NewElement, w: number, h: number, count: number): CanvasElement {
  const base = { id: newElementId(), rot: 0, locked: false, hidden: false };
  let el: CanvasElement;
  if (spec.kind === "text") {
    const t = {
      heading: { text: "Add a heading", font: "display", size: 64, w: 560, h: 80, color: "heading" as const },
      subheading: { text: "Add a subheading", font: "display", size: 32, w: 480, h: 40, color: "heading" as const },
      body: { text: "Add a little body text", font: "body", size: 18, w: 400, h: 24, color: "ink" as const },
    }[spec.style];
    el = { ...base, kind: "text", x: 0, y: 0, align: "center", bold: false, italic: false, ...t };
  } else if (spec.kind === "shape") {
    const size = { rect: [240, 160], circle: [160, 160], arch: [160, 224], line: [320, 4] }[spec.shape];
    el = { ...base, kind: "shape", shape: spec.shape, color: "accent", outline: spec.shape === "arch", x: 0, y: 0, w: size[0], h: size[1] };
  } else if (spec.kind === "art") {
    const piece = artById(spec.art);
    const ah = 240;
    const aw = piece ? Math.max(GRID, snap((ah * piece.w) / piece.h)) : ah;
    el = { ...base, kind: "art", art: spec.art, color: "accent", flip: false, x: 0, y: 0, w: aw, h: ah };
  } else {
    el = { ...base, kind: "photo", src: spec.src, alt: "", x: 0, y: 0, w: 320, h: 240 };
  }
  const nudge = (count % 6) * GRID * 2;
  return {
    ...el,
    x: snap(Math.max(0, (w - el.w) / 2)) + nudge,
    y: snap(Math.max(GRID * 3, (Math.min(h, 640) - el.h) / 2)) + nudge,
  };
}

/**
 * Elements: text, shapes, the site's line art and the couple's photos, added
 * to the picked section (or the top of the page). Art takes the accent, so it
 * matches whatever palette the site has.
 */
export function ElementsTab({
  design,
  frames,
  selection,
  photos,
  onCanvas,
  onSelect,
}: {
  design: SiteDesign;
  frames: CanvasFrames;
  selection: CanvasSelection;
  photos: string[];
  onCanvas: (canvas: SiteCanvas) => void;
  onSelect: (selection: CanvasSelection) => void;
}) {
  const targets = Object.entries(frames);
  const picked = selection && frames[selection.section] ? selection.section : null;
  const [chosen, setChosen] = useState<string | null>(null);
  const target = picked ?? (chosen && frames[chosen] ? chosen : "hero");
  const colors = roleColors(design);

  function add(spec: NewElement) {
    const { w, h } = frameSize(design, frames, target);
    const count = design.canvas.sections[target]?.elements.length ?? 0;
    const el = buildElement(spec, w, h, count);
    onCanvas(addElement(design.canvas, target, w, el));
    onSelect({ section: target, id: el.id });
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <PanelLabel>Add to</PanelLabel>
        <select
          value={target}
          onChange={(e) => {
            setChosen(e.target.value);
            onSelect({ section: e.target.value, id: null });
          }}
          className="h-10 rounded-lg border border-hairline bg-card px-3 text-sm text-ink"
        >
          {(targets.length ? targets : [["hero", { label: "Top of the page" }] as const]).map(([key, f]) => (
            <option key={key} value={key}>
              {f.label}
            </option>
          ))}
        </select>
        <p className="text-[13px] leading-normal text-ink/60">
          Drag anything into place on your site. It snaps to an 8px grid and lines up with the
          section&apos;s centre and edges; hold Alt to place it freely. On a phone, guests see
          what you add stacked under the section.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <PanelLabel>Text</PanelLabel>
        <AddCard onClick={() => add({ kind: "text", style: "heading" })}>
          <span className="text-2xl" style={{ fontFamily: resolveDesign(design).theme.display, color: colors.heading }}>
            Add a heading
          </span>
        </AddCard>
        <AddCard onClick={() => add({ kind: "text", style: "subheading" })}>
          <span className="text-lg" style={{ fontFamily: resolveDesign(design).theme.display, color: colors.heading }}>
            Add a subheading
          </span>
        </AddCard>
        <AddCard onClick={() => add({ kind: "text", style: "body" })}>
          <span className="text-sm" style={{ fontFamily: resolveDesign(design).theme.body, color: colors.ink }}>
            Add a little body text
          </span>
        </AddCard>
      </div>

      <div className="flex flex-col gap-2">
        <PanelLabel>Shapes</PanelLabel>
        <div className="grid grid-cols-4 gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.label}
              title={s.label}
              onClick={() => add({ kind: "shape", shape: s.id })}
              className="flex aspect-square items-center justify-center rounded-xl border border-hairline bg-card hover:border-ink/30"
            >
              <ShapeIcon shape={s.id} color={colors.accent} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <PanelLabel>Line art</PanelLabel>
        <div className="grid grid-cols-4 gap-2">
          {LINE_ART.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-label={a.name}
              title={a.name}
              onClick={() => add({ kind: "art", art: a.id })}
              className="flex aspect-square items-center justify-center rounded-xl border border-hairline bg-card p-2 hover:border-ink/30"
            >
              <span
                aria-hidden="true"
                className="h-full w-full"
                style={{
                  background: colors.accent,
                  WebkitMaskImage: `url(${a.src})`,
                  maskImage: `url(${a.src})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            </button>
          ))}
        </div>
        <p className="text-[13px] leading-normal text-ink/60">Drawn in your accent colour, so it changes with your palette.</p>
      </div>

      {photos.length > 0 && (
        <div className="flex flex-col gap-2">
          <PanelLabel>Your photos</PanelLabel>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((src) => (
              <button
                key={src}
                type="button"
                aria-label="Add this photo"
                onClick={() => add({ kind: "photo", src })}
                className="aspect-square overflow-hidden rounded-xl border border-hairline bg-card hover:border-ink/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a thumbnail of the couple's own upload */}
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function AddCard({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 items-center rounded-xl border border-hairline bg-card px-4 py-2 text-left hover:border-ink/30"
    >
      {children}
    </button>
  );
}

function ShapeIcon({ shape, color }: { shape: ShapeId; color: string }) {
  const style = { background: color };
  if (shape === "circle") return <span className="h-8 w-8 rounded-full" style={style} />;
  if (shape === "arch") return <span className="h-10 w-7 rounded-t-full border-2" style={{ borderColor: color }} />;
  if (shape === "line") return <span className="h-[3px] w-10 rounded-full" style={style} />;
  return <span className="h-7 w-10" style={style} />;
}

/**
 * Position: Arrange (layer order, lining up with the section, exact size and
 * place) and Layers (every element in the section, front first, to drag into
 * order, lock or hide).
 */
export function PositionPanel({
  design,
  frames,
  phoneFrames,
  device,
  selection,
  onCanvas,
  onSelect,
  onClose,
}: {
  design: SiteDesign;
  frames: CanvasFrames;
  phoneFrames: CanvasFrames;
  /** Which preview is showing: Phone arranges the phone layout. */
  device: "desktop" | "phone";
  selection: CanvasSelection;
  onCanvas: (canvas: SiteCanvas) => void;
  onSelect: (selection: CanvasSelection) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"arrange" | "layers">("arrange");
  const key = selection?.section ?? "hero";
  const el = selection?.id ? findElement(design.canvas, key, selection.id) : null;
  const canvas = design.canvas;
  const section = canvas.sections[key];
  const phone = device === "phone";
  const stacked = phone && section?.phone.mode !== "free";
  const { w, h } = phone && section ? phoneSize(section.phone.w, phoneFrames, key) : frameSize(design, frames, key);
  // The box being arranged: the element's own, or its place in the phone layout.
  const box: PhoneBox | null = !el
    ? null
    : phone
      ? stacked || !section
        ? null
        : (phoneBoxes(section).get(el.id) ?? null)
      : { x: el.x, y: el.y, w: el.w, h: el.h, rot: el.rot, size: el.kind === "text" ? el.size : null };
  function setBox(patch: Partial<PhoneBox>) {
    if (!el) return;
    if (phone) {
      onCanvas(updatePhoneBox(canvas, key, el.id, patch));
      return;
    }
    const { size, ...rest } = patch;
    onCanvas(updateElement(canvas, key, el.id, { ...rest, ...(el.kind === "text" && size ? { size } : {}) } as Partial<CanvasElement>));
  }
  function resizeTo(size: { w?: number; h?: number }) {
    if (!el || !box) return;
    // Art and photos keep their shape; shapes and text take the exact size.
    const keep = el.kind === "art" || el.kind === "photo";
    const ratio = box.w / box.h;
    const nw = size.w ?? (keep && size.h ? Math.round(size.h * ratio) : box.w);
    const nh = size.h ?? (keep && size.w ? Math.round(size.w / ratio) : box.h);
    setBox({ w: Math.max(GRID, nw), h: Math.max(1, nh) });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-forest">Position</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Position"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/70 hover:bg-ink/[0.05] hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div role="tablist" aria-label="Position" className="-mt-2 flex border-b border-hairline">
        {(["arrange", "layers"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`h-10 flex-1 text-[13px] font-semibold ${
              tab === t ? "text-[#2243B6] shadow-[inset_0_-2px_#2243B6]" : "text-ink/60 hover:text-ink"
            }`}
          >
            {t === "arrange" ? "Arrange" : "Layers"}
          </button>
        ))}
      </div>

      {phone && (
        <div className="flex items-start justify-between gap-3 rounded-xl bg-[#2243B6]/[0.06] p-3">
          <p className="text-[13px] leading-normal text-ink/80">
            {stacked
              ? "Phone layout: stacked under the section automatically. Drag anything in the phone preview to place it by hand."
              : "Phone layout: placed by hand. Changes here only affect phones."}
          </p>
          {!stacked && (
            <button
              type="button"
              onClick={() => onCanvas(stackOnPhone(canvas, key))}
              className="h-8 shrink-0 rounded-lg border border-hairline bg-card px-2.5 text-[13px] text-ink hover:border-ink/30"
            >
              Back to stacked
            </button>
          )}
        </div>
      )}

      {tab === "arrange" ? (
        el ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["forward", "Forward"],
                  ["backward", "Backward"],
                  ["front", "To front"],
                  ["back", "To back"],
                ] as const
              ).map(([move, label]) => (
                <PanelButton key={move} onClick={() => onCanvas(moveLayer(canvas, key, el.id, move))}>
                  {label}
                </PanelButton>
              ))}
            </div>
            {box ? (
              <>
                <div className="flex flex-col gap-2">
                  <PanelLabel>Align to section</PanelLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        ["top", "Top"],
                        ["middle", "Middle"],
                        ["bottom", "Bottom"],
                        ["left", "Left"],
                        ["centre", "Centre"],
                        ["right", "Right"],
                      ] as [Align, string][]
                    ).map(([align, label]) => (
                      <PanelButton key={align} disabled={el.locked} onClick={() => setBox(alignBox(box, align, w, h))}>
                        {label}
                      </PanelButton>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <PanelLabel>Size and place</PanelLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <NumberField label="Width" value={box.w} min={GRID} disabled={el.locked} onCommit={(v) => resizeTo({ w: v })} />
                    {el.kind === "text" ? (
                      <NumberField label="Size" value={box.size ?? 16} min={6} max={400} disabled={el.locked} onCommit={(v) => setBox({ size: v })} />
                    ) : (
                      <NumberField label="Height" value={box.h} min={1} disabled={el.locked} onCommit={(v) => resizeTo({ h: v })} />
                    )}
                    <NumberField label="Rotate" value={box.rot} min={-180} max={180} suffix="°" disabled={el.locked} onCommit={(v) => setBox({ rot: v })} />
                    <NumberField label="X" value={box.x} disabled={el.locked} onCommit={(v) => setBox({ x: v })} />
                    <NumberField label="Y" value={box.y} disabled={el.locked} onCommit={(v) => setBox({ y: v })} />
                  </div>
                  <p className="text-[13px] leading-normal text-ink/60">
                    {el.locked
                      ? "This is locked. Unlock it in Layers or on its bar to move it."
                      : "Dragging snaps to an 8px grid. Hold Alt to place freely."}
                  </p>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-ink/70">Pick text, art or a shape on your site to arrange it.</p>
        )
      ) : (
        <Layers design={design} sectionKey={key} selection={selection} label={frames[key]?.label} phone={phone} onCanvas={onCanvas} onSelect={onSelect} />
      )}
    </>
  );
}

/** Where a box goes to line up with its section (`w`, `h` are the section's size in the same units). */
function alignBox(box: { w: number; h: number }, align: Align, w: number, h: number) {
  return alignPatch(box as CanvasElement, align, w, h) as Partial<PhoneBox>;
}

/** A section's phone size in its phone layout's units. */
function phoneSize(pw: number, phoneFrames: CanvasFrames, key: string) {
  const measured = phoneFrames[key];
  return { w: pw, h: measured ? (measured.h * pw) / measured.w : 640 };
}

function Layers({
  design,
  sectionKey,
  selection,
  label,
  phone,
  onCanvas,
  onSelect,
}: {
  design: SiteDesign;
  sectionKey: string;
  selection: CanvasSelection;
  label?: string;
  /** Hide and show act on the phone layout only. */
  phone: boolean;
  onCanvas: (canvas: SiteCanvas) => void;
  onSelect: (selection: CanvasSelection) => void;
}) {
  const elements = design.canvas.sections[sectionKey]?.elements ?? [];
  const offPhone = design.canvas.sections[sectionKey]?.phone.hidden ?? [];
  // Front first, as they stack on the page.
  const rows = [...elements].reverse();
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<number | null>(null);

  if (!rows.length) {
    return (
      <p className="text-sm text-ink/70">
        Nothing added to {label ? `“${label}”` : "this section"} yet. Add text, shapes or art from Elements.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[13px] text-ink/60">
        {label ?? "This section"} · front to back. Drag to reorder.{phone ? " Hiding here only hides it on phones." : ""}
      </p>
      {rows.map((el, row) => {
        const on = selection?.id === el.id;
        const hidden = phone ? el.hidden || offPhone.includes(el.id) : el.hidden;
        return (
          <div
            key={el.id}
            draggable
            onDragStart={(e) => {
              setDragging(el.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              setDragging(null);
              setOver(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(row);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragging) onCanvas(placeLayer(design.canvas, sectionKey, dragging, elements.length - 1 - row));
              setDragging(null);
              setOver(null);
            }}
            className={`flex h-11 items-center gap-2 rounded-lg px-2 ${on ? "bg-[#2243B6]/10" : "border border-hairline bg-card"} ${
              over === row && dragging !== el.id ? "shadow-[inset_0_2px_#00BFFE]" : ""
            } ${dragging === el.id ? "opacity-50" : ""}`}
          >
            <span aria-hidden="true" className="cursor-grab text-ink/40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                {[6, 12, 18].flatMap((y) => [9, 15].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" />))}
              </svg>
            </span>
            <button
              type="button"
              onClick={() => onSelect({ section: sectionKey, id: el.id })}
              className={`min-w-0 flex-1 truncate text-left text-[13px] ${hidden ? "text-ink/40 line-through" : on ? "font-semibold text-[#2243B6]" : "text-ink"}`}
            >
              {elementName(el)}
            </button>
            <span className="text-xs text-ink/50">{KIND_NAMES[el.kind]}</span>
            <IconToggle
              label={el.locked ? "Unlock" : "Lock"}
              on={el.locked}
              onClick={() => onCanvas(updateElement(design.canvas, sectionKey, el.id, { locked: !el.locked }))}
            >
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d={el.locked ? "M8 11V8a4 4 0 0 1 8 0v3" : "M8 11V8a4 4 0 0 1 7.5-2"} />
            </IconToggle>
            <IconToggle
              label={phone ? (hidden ? "Show on phones" : "Hide on phones") : hidden ? "Show" : "Hide"}
              on={hidden}
              onClick={() =>
                onCanvas(
                  phone && !el.hidden
                    ? setHiddenOnPhone(design.canvas, sectionKey, el.id, !hidden)
                    : updateElement(design.canvas, sectionKey, el.id, { hidden: !el.hidden }),
                )
              }
            >
              {hidden ? (
                <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.6 3.2M6.6 6.6A16.6 16.6 0 0 0 3 12s4 6 9 6a9.4 9.4 0 0 0 4.4-1.1" />
              ) : (
                <>
                  <path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z" />
                  <circle cx="12" cy="12" r="2.5" />
                </>
              )}
            </IconToggle>
          </div>
        );
      })}
    </div>
  );
}

function IconToggle({ label, on, onClick, children }: { label: string; on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={on}
      onClick={onClick}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${on ? PRESSED : "text-ink/60 hover:bg-ink/[0.05] hover:text-ink"}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

function PanelButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-10 rounded-lg border border-hairline bg-card text-[13px] text-ink hover:border-ink/30 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function NumberField({
  label,
  value,
  min = -4000,
  max = 8000,
  suffix,
  disabled,
  onCommit,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  suffix?: string;
  disabled?: boolean;
  onCommit: (value: number) => void;
}) {
  // Typed freely, saved on Enter or leaving the field; a new value from a drag replaces it.
  const [draft, setDraft] = useState<{ from: number; text: string } | null>(null);
  const text = draft && draft.from === value ? draft.text : String(Math.round(value));
  function save() {
    const n = Math.round(Number(text));
    setDraft(null);
    if (Number.isFinite(n) && n !== Math.round(value)) onCommit(Math.max(min, Math.min(max, n)));
  }
  return (
    <label className="flex flex-col gap-1 text-xs text-ink/60">
      {label}
      <span className="flex h-10 items-center rounded-lg border border-hairline bg-card px-2.5 focus-within:border-[#2243B6]">
        <input
          inputMode="numeric"
          value={text}
          disabled={disabled}
          onChange={(e) => setDraft({ from: value, text: e.target.value })}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
          className="w-full min-w-0 bg-transparent text-sm tabular-nums text-ink outline-none disabled:opacity-50"
        />
        {suffix && <span className="text-ink/50">{suffix}</span>}
      </span>
    </label>
  );
}

/**
 * The bar over the preview while something placed is picked: its style
 * (words, colour, outline, flip) or, for a whole section, its card style and
 * place in the page.
 */
export function CanvasToolbar({
  design,
  selection,
  frames,
  device,
  onCanvas,
  onDesign,
  onPosition,
  onDone,
}: {
  design: SiteDesign;
  selection: NonNullable<CanvasSelection>;
  frames: CanvasFrames;
  phoneFrames: CanvasFrames;
  /** Which preview is showing: on Phone, size and stacking act on the phone layout. */
  device: "desktop" | "phone";
  onCanvas: (canvas: SiteCanvas) => void;
  onDesign: (patch: Partial<SiteDesign>) => void;
  onPosition: () => void;
  onDone: () => void;
}) {
  const key = selection.section;
  const canvas = design.canvas;
  const el = selection.id ? findElement(canvas, key, selection.id) : null;
  const colors = roleColors(design);
  const set = (patch: Partial<CanvasElement>) => el && onCanvas(updateElement(canvas, key, el.id, patch));
  const section = canvas.sections[key];
  const phoneFree = device === "phone" && section?.phone.mode === "free";
  // Text size: a hand-placed phone layout keeps its own; otherwise the words' size everywhere.
  const phoneSizeOf = phoneFree && el && section ? (phoneBoxes(section).get(el.id)?.size ?? null) : null;
  const textSize = el?.kind === "text" ? (phoneSizeOf ?? el.size) : 0;
  const setSize = (size: number) =>
    el && (phoneSizeOf !== null ? onCanvas(updatePhoneBox(canvas, key, el.id, { size })) : set({ size }));

  let body: ReactNode;
  if (el) {
    const swatches = (
      <ColorPicker
        value={"color" in el ? el.color : null}
        colors={colors}
        roles={el.kind === "text" ? ["heading", "ink", "accent", "accent2", "muted", "bg"] : ["accent", "accent2", "heading", "ink", "surface", "bg"]}
        onPick={(color) => set({ color } as Partial<CanvasElement>)}
      />
    );
    body =
      el.kind === "text" ? (
        <>
          <select
            aria-label="Font"
            value={el.font}
            onChange={(e) => set({ font: e.target.value })}
            className="h-9 w-40 shrink-0 rounded-lg border border-hairline bg-card px-2 text-[13px] text-ink"
          >
            <option value="display">Heading font</option>
            <option value="body">Body font</option>
            {[...new Set(FONTS.map((f) => f.kind))].map((kind) => (
              <optgroup key={kind} label={KIND_LABELS[kind] ?? kind}>
                {FONTS.filter((f) => f.kind === kind).map((f) => (
                  <option key={f.id} value={f.id} style={{ fontFamily: f.css }}>
                    {f.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="flex h-9 shrink-0 items-center rounded-lg border border-hairline">
            <BarButton label="Smaller" onClick={() => setSize(Math.max(6, Math.round(textSize / 1.125)))}>
              −
            </BarButton>
            <span className="w-10 text-center text-[13px] tabular-nums text-ink">{textSize}</span>
            <BarButton label="Bigger" onClick={() => setSize(Math.min(400, Math.round(textSize * 1.125)))}>
              +
            </BarButton>
          </div>
          {swatches}
          <BarButton label="Bold" pressed={el.bold} onClick={() => set({ bold: !el.bold })}>
            <span className="font-bold">B</span>
          </BarButton>
          <BarButton label="Italic" pressed={el.italic} onClick={() => set({ italic: !el.italic })}>
            <span className="font-serif italic">I</span>
          </BarButton>
          {(["left", "center", "right"] as const).map((a) => (
            <BarButton key={a} label={`Align ${a}`} pressed={el.align === a} onClick={() => set({ align: a })}>
              <AlignIcon align={a} />
            </BarButton>
          ))}
        </>
      ) : el.kind === "art" ? (
        <>
          <span className="whitespace-nowrap px-2 text-[13px] font-semibold text-ink">{elementName(el)}</span>
          {swatches}
          <TextButton pressed={el.flip} onClick={() => set({ flip: !el.flip })}>
            Flip
          </TextButton>
        </>
      ) : el.kind === "shape" ? (
        <>
          <span className="whitespace-nowrap px-2 text-[13px] font-semibold text-ink">{elementName(el)}</span>
          {swatches}
          {el.shape !== "line" && (
            <TextButton pressed={el.outline} onClick={() => set({ outline: !el.outline })}>
              Outline
            </TextButton>
          )}
        </>
      ) : (
        <span className="whitespace-nowrap px-2 text-[13px] font-semibold text-ink">Photo</span>
      );
  } else {
    const style = canvas.sections[key]?.style ?? "card";
    const list = design.sections;
    const at = list.findIndex((x) => x.id === key);
    // Up and down move within the section's column, as the page lays it out.
    const sameColumn = (i: number) => list[i] && sectionColumn(list[i].id) === sectionColumn(key as never);
    const prev = at > 0 ? [...list.keys()].slice(0, at).reverse().find(sameColumn) : undefined;
    const next = at >= 0 ? [...list.keys()].slice(at + 1).find(sameColumn) : undefined;
    const swap = (other: number | undefined) => {
      if (other === undefined) return;
      const order = [...list];
      [order[at], order[other]] = [order[other], order[at]];
      onDesign({ sections: order });
    };
    const { w } = frameSize(design, frames, key);
    body = (
      <>
        <span className="whitespace-nowrap px-2 text-[13px] font-semibold text-ink">
          {key === "hero" ? "Top of the page" : (frames[key]?.label ?? sectionName(key))}
        </span>
        <div className="flex shrink-0 rounded-lg border border-hairline p-0.5" role="group" aria-label="Section style">
          {BLOCK_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={style === s.id}
              onClick={() => onCanvas(setSectionStyle(canvas, key, w, s.id === "card" ? null : s.id))}
              className={`h-8 rounded-md px-2.5 text-[13px] ${style === s.id ? PRESSED : "text-ink hover:bg-ink/[0.05]"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {phoneFree && (
          <TextButton onClick={() => onCanvas(stackOnPhone(canvas, key))}>Stack on phones</TextButton>
        )}
        {key !== "hero" && (
          <>
            <TextButton disabled={prev === undefined} onClick={() => swap(prev)}>
              Move up
            </TextButton>
            <TextButton disabled={next === undefined} onClick={() => swap(next)}>
              Move down
            </TextButton>
            <TextButton
              onClick={() => {
                onDesign({ sections: list.map((x) => (x.id === key ? { ...x, hidden: true } : x)) });
                onDone();
              }}
            >
              Hide
            </TextButton>
          </>
        )}
      </>
    );
  }

  return (
    <div
      role="toolbar"
      aria-label="Selection"
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-hairline bg-card p-1.5 shadow-lg"
    >
      {body}
      {el && (
        <>
          <span className="mx-1 h-6 w-px shrink-0 bg-hairline" />
          <TextButton onClick={onPosition}>Position</TextButton>
        </>
      )}
      <button
        type="button"
        onClick={onDone}
        aria-label="Done"
        className="sticky right-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2243B6] text-white shadow-[-8px_0_8px_var(--color-card)] hover:bg-[#2243B6]/90"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12l5 5 9-10" />
        </svg>
      </button>
    </div>
  );
}

function sectionName(key: string) {
  return (
    {
      rsvp: "RSVP",
      photos: "Photos",
      weekend: "The weekend",
      wall: "Photo wall",
      guests: "Who's coming",
      travel: "Travel & stays",
      faq: "FAQ",
      registry: "Registry",
    }[key] ?? "Your block"
  );
}

function ColorPicker({
  value,
  colors,
  roles,
  onPick,
}: {
  value: CanvasColor | null;
  colors: Record<string, string>;
  roles: string[];
  onPick: (color: CanvasColor) => void;
}) {
  const custom = value && value.startsWith("#") ? value : null;
  return (
    <div className="flex shrink-0 items-center gap-1 px-1" role="group" aria-label="Colour">
      {roles.map((role) => {
        const info = CANVAS_COLORS.find((c) => c.id === role)!;
        return (
          <button
            key={role}
            type="button"
            aria-label={info.label}
            title={info.label}
            aria-pressed={value === role}
            onClick={() => onPick(info.id)}
            className={`h-7 w-7 rounded-full border border-ink/20 ${value === role ? "outline outline-2 outline-offset-2 outline-[#2243B6]" : ""}`}
            style={{ background: colors[role] }}
          />
        );
      })}
      <label
        title="Your own colour"
        className={`relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-ink/20 bg-[conic-gradient(#FFD301,#2243B6,#00BFFE,#5AE4FF,#FFF12F,#FFD301)] ${
          custom ? "outline outline-2 outline-offset-2 outline-[#2243B6]" : ""
        }`}
      >
        <span className="sr-only">Your own colour</span>
        <input
          type="color"
          value={custom ?? colors.accent}
          onChange={(e) => onPick(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}

function BarButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[15px] text-ink transition-colors ${
        pressed ? PRESSED : "hover:bg-ink/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function TextButton({
  pressed,
  disabled,
  onClick,
  children,
}: {
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`h-9 shrink-0 whitespace-nowrap rounded-lg px-2.5 text-[13px] disabled:opacity-30 ${
        pressed ? PRESSED : "text-ink hover:bg-ink/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function AlignIcon({ align }: { align: "left" | "center" | "right" }) {
  const lines = {
    left: ["M4 6h16", "M4 12h10", "M4 18h13"],
    center: ["M4 6h16", "M7 12h10", "M5.5 18h13"],
    right: ["M4 6h16", "M10 12h10", "M7 18h13"],
  }[align];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {lines.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
