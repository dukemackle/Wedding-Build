"use client";

import { useState, type ReactNode } from "react";
import {
  EMPTY_TEXT_STYLE,
  FONTS,
  TEXT_SIZES,
  TEXT_SLOTS,
  fontById,
  hasTextStyle,
  resolveDesign,
  type SiteDesign,
  type TextSlotId,
  type TextStyle,
} from "@/lib/site-design";
import {
  BLOCK_STYLES,
  findElement,
  phoneBoxes,
  setSectionStyle,
  stackOnPhone,
  updateElement,
  updatePhoneBox,
  type CanvasElement,
  type SiteCanvas,
} from "@/lib/site-canvas";
import type { CanvasFrames, CanvasSelection } from "./canvas-messages";
import {
  ColorPicker,
  PositionPanel,
  elementName,
  frameSize,
  roleColors,
  sectionMoves,
  sectionName,
} from "./canvas-panels";
import { AnimatePanel, PhotoPanel } from "./photo-motion-panels";

// Selection and "on" states are Royal blue (CLAUDE.md palette).
const PRESSED = "bg-[#2243B6]/10 text-[#2243B6]";

/** What the floating bar in the preview can do, run from the tool row. */
export type FrameAction = "edit" | "duplicate" | "delete" | "lock";

type SheetId = "font" | "size" | "colour" | "position" | "style" | "crop" | "frame" | "filter" | "animate";

/**
 * The phone editor's tools for whatever is picked (Editor v2, phase 3b, from
 * the mockup's Phone artboard): a row of finger-sized tools across the bottom
 * with ✓ to finish, each opening a small sheet above the row where it needs
 * more room than a tap. Covers the words clicked in phase 1, placed elements
 * and whole sections.
 */
export function PhoneTools({
  design,
  device,
  frames,
  phoneFrames,
  canvasSel,
  textSlot,
  onCanvas,
  onDesign,
  onText,
  onFrameAction,
  onSelect,
  onDone,
}: {
  design: SiteDesign;
  device: "desktop" | "phone";
  frames: CanvasFrames;
  phoneFrames: CanvasFrames;
  canvasSel: CanvasSelection;
  textSlot: TextSlotId | null;
  onCanvas: (canvas: SiteCanvas) => void;
  onDesign: (patch: Partial<SiteDesign>) => void;
  onText: (slot: TextSlotId, patch: Partial<TextStyle> | null) => void;
  onFrameAction: (action: FrameAction) => void;
  onSelect: (selection: CanvasSelection) => void;
  onDone: () => void;
}) {
  // A new pick starts with its sheet closed.
  const pickKey = textSlot ?? (canvasSel ? `${canvasSel.section}/${canvasSel.id ?? ""}` : "");
  const [sheet, setSheet] = useState<{ for: string; id: SheetId } | null>(null);
  const open = sheet?.for === pickKey ? sheet.id : null;
  const toggle = (id: SheetId) => setSheet(open === id ? null : { for: pickKey, id });

  const canvas = design.canvas;
  const colors = roleColors(design);
  const key = canvasSel?.section ?? "";
  const el = canvasSel?.id ? findElement(canvas, key, canvasSel.id) : null;
  const section = canvas.sections[key];
  const phoneFree = device === "phone" && section?.phone.mode === "free";

  let label = "";
  let tools: ReactNode = null;
  let body: ReactNode = null;
  let title = "";

  if (textSlot) {
    // Phase 1's words: the same choices as the computer's text toolbar.
    const own = design.text[textSlot] ?? EMPTY_TEXT_STYLE;
    const info = TEXT_SLOTS.find((s) => s.id === textSlot);
    const { theme, accent, accent2, heading } = resolveDesign(design);
    const hexes = [...new Set([heading, theme.ink, accent, accent2, theme.bg, "#ffffff"].map((c) => c.toLowerCase()))];
    const size = own.size ?? 1;
    const step = TEXT_SIZES.findIndex((s) => s >= size - 0.001);
    const set = (patch: Partial<TextStyle> | null) => onText(textSlot, patch);
    label = info?.label ?? "Text";
    tools = (
      <>
        <Tool label="Font" glyph="Ff" on={open === "font"} onClick={() => toggle("font")} face={fontById(own.font)?.css} />
        <Tool label="Size" glyph="aA" on={open === "size"} onClick={() => toggle("size")} />
        <Tool label="Colour" on={open === "colour"} onClick={() => toggle("colour")}>
          <span className="h-5 w-5 rounded-full border border-ink/20" style={{ background: own.color ?? heading }} />
        </Tool>
        <Tool label="Bold" glyph="B" on={own.bold === true} onClick={() => set({ bold: own.bold !== true })} bold />
        <Tool label="Italic" glyph="I" on={own.italic === true} onClick={() => set({ italic: own.italic !== true })} italic />
        <AlignTool value={own.align ?? "center"} onChange={(align) => set({ align })} />
        {hasTextStyle(own) && <Tool label="Reset" icon="reset" onClick={() => set(null)} />}
      </>
    );
    if (open === "font") {
      title = "Font";
      body = (
        <FontCards
          sample={info?.words === false ? "Our names" : "Our day"}
          options={[{ id: "", label: "Theme font", css: theme.display }, ...FONTS.map((f) => ({ id: f.id, label: f.label, css: f.css }))]}
          value={own.font ?? ""}
          onPick={(id) => set({ font: (id || null) as TextStyle["font"] })}
        />
      );
    } else if (open === "size") {
      title = "Size";
      body = (
        <Stepper
          value={`${Math.round(size * 100)}%`}
          onLess={step > 0 ? () => set({ size: TEXT_SIZES[step - 1] }) : undefined}
          onMore={step < TEXT_SIZES.length - 1 ? () => set({ size: TEXT_SIZES[step + 1] }) : undefined}
        />
      );
    } else if (open === "colour") {
      title = "Colour";
      body = (
        <div className="flex flex-wrap gap-3 px-1">
          {hexes.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              aria-pressed={own.color?.toLowerCase() === c}
              onClick={() => set({ color: c })}
              className={`h-11 w-11 rounded-full border border-ink/20 ${
                own.color?.toLowerCase() === c ? "outline outline-2 outline-offset-2 outline-[#2243B6]" : ""
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
      );
    }
  } else if (el) {
    const set = (patch: Partial<CanvasElement>) => onCanvas(updateElement(canvas, key, el.id, patch));
    // A hand-placed phone layout keeps its own text size.
    const phoneSize = phoneFree && section && el.kind === "text" ? (phoneBoxes(section).get(el.id)?.size ?? null) : null;
    const textSize = el.kind === "text" ? (phoneSize ?? el.size) : 0;
    const setSize = (size: number) =>
      phoneSize !== null ? onCanvas(updatePhoneBox(canvas, key, el.id, { size })) : set({ size } as Partial<CanvasElement>);
    label = elementName(el);
    const common = (
      <>
        <Tool label="Animate" icon="motion" on={open === "animate" || el.anim !== "none"} onClick={() => toggle("animate")} />
        <Tool label="Position" icon="position" on={open === "position"} onClick={() => toggle("position")} />
        <Tool label={el.locked ? "Unlock" : "Lock"} icon={el.locked ? "locked" : "lock"} on={el.locked} onClick={() => onFrameAction("lock")} />
        <Tool label="Copy" icon="copy" onClick={() => onFrameAction("duplicate")} />
        <Tool label="Delete" icon="delete" onClick={() => onFrameAction("delete")} />
      </>
    );
    const colour = "color" in el && (
      <Tool label="Colour" on={open === "colour"} onClick={() => toggle("colour")}>
        <span className="h-5 w-5 rounded-full border border-ink/20" style={{ background: el.color.startsWith("#") ? el.color : colors[el.color] }} />
      </Tool>
    );
    tools =
      el.kind === "text" ? (
        <>
          {!el.locked && <Tool label="Edit" glyph="Aa" onClick={() => onFrameAction("edit")} />}
          <Tool label="Font" glyph="Ff" on={open === "font"} onClick={() => toggle("font")} />
          <Tool label="Size" glyph="aA" on={open === "size"} onClick={() => toggle("size")} />
          {colour}
          <Tool label="Bold" glyph="B" on={el.bold} onClick={() => set({ bold: !el.bold })} bold />
          <Tool label="Italic" glyph="I" on={el.italic} onClick={() => set({ italic: !el.italic })} italic />
          <AlignTool value={el.align} onChange={(align) => set({ align })} />
          {common}
        </>
      ) : (
        <>
          {colour}
          {el.kind === "art" && <Tool label="Flip" icon="flip" on={el.flip} onClick={() => set({ flip: !el.flip })} />}
          {el.kind === "photo" && (
            <>
              <Tool label="Crop" icon="crop" on={open === "crop"} onClick={() => toggle("crop")} />
              <Tool label="Frame" icon="frame" on={open === "frame"} onClick={() => toggle("frame")} />
              <Tool label="Filter" icon="filter" on={open === "filter"} onClick={() => toggle("filter")} />
            </>
          )}
          {el.kind === "shape" && el.shape !== "line" && (
            <Tool label="Outline" icon="outline" on={el.outline} onClick={() => set({ outline: !el.outline })} />
          )}
          {common}
        </>
      );
    if (open === "font" && el.kind === "text") {
      const { theme } = resolveDesign(design);
      title = "Font";
      body = (
        <FontCards
          sample={el.text.split("\n")[0].slice(0, 16) || "Aa"}
          options={[
            { id: "display", label: "Heading font", css: theme.display },
            { id: "body", label: "Body font", css: theme.body },
            ...FONTS.map((f) => ({ id: f.id, label: f.label, css: f.css })),
          ]}
          value={el.font}
          onPick={(font) => set({ font })}
        />
      );
    } else if (open === "size" && el.kind === "text") {
      title = phoneSize !== null ? "Size on phones" : "Size";
      body = (
        <Stepper
          value={String(textSize)}
          onLess={() => setSize(Math.max(6, Math.round(textSize / 1.125)))}
          onMore={() => setSize(Math.min(400, Math.round(textSize * 1.125)))}
        />
      );
    } else if (open === "colour" && "color" in el) {
      title = "Colour";
      body = (
        <ColorPicker
          big
          value={el.color}
          colors={colors}
          roles={el.kind === "text" ? ["heading", "ink", "accent", "accent2", "muted", "bg"] : ["accent", "accent2", "heading", "ink", "surface", "bg"]}
          onPick={(color) => set({ color } as Partial<CanvasElement>)}
        />
      );
    } else if (open === "crop" || open === "frame" || open === "filter") {
      title = { crop: "Crop", frame: "Frame", filter: "Filter" }[open];
      body = (
        <div className="flex flex-col gap-4">
          <PhotoPanel design={design} selection={canvasSel} onCanvas={onCanvas} only={open} />
        </div>
      );
    } else if (open === "animate") {
      title = "Animate";
      body = (
        <div className="flex flex-col gap-4">
          <AnimatePanel design={design} selection={canvasSel} onCanvas={onCanvas} />
        </div>
      );
    } else if (open === "position") {
      body = (
        <PositionPanel
          design={design}
          frames={frames}
          phoneFrames={phoneFrames}
          device={device}
          selection={canvasSel}
          onCanvas={onCanvas}
          onSelect={onSelect}
          onClose={() => setSheet(null)}
        />
      );
    }
  } else if (canvasSel) {
    // A whole section: its card style, its place in the page, and hiding it.
    const moves = sectionMoves(design, key);
    const style = section?.style ?? "card";
    label = key === "hero" ? "Top of the page" : (frames[key]?.label ?? phoneFrames[key]?.label ?? sectionName(key));
    tools = (
      <>
        <Tool label="Style" icon="style" on={open === "style"} onClick={() => toggle("style")} />
        {key !== "hero" && (
          <>
            <Tool label="Move up" icon="up" disabled={!moves.up} onClick={() => moves.up && onDesign({ sections: moves.up })} />
            <Tool label="Move down" icon="down" disabled={!moves.down} onClick={() => moves.down && onDesign({ sections: moves.down })} />
            <Tool
              label="Hide"
              icon="hide"
              onClick={() => {
                onDesign({ sections: design.sections.map((x) => (x.id === key ? { ...x, hidden: true } : x)) });
                onDone();
              }}
            />
          </>
        )}
        {phoneFree && <Tool label="Restack" icon="stack" onClick={() => onCanvas(stackOnPhone(canvas, key))} />}
      </>
    );
    if (open === "style") {
      const { w } = frameSize(design, frames, key);
      title = "Section style";
      body = (
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={style === s.id}
              onClick={() => onCanvas(setSectionStyle(canvas, key, w, s.id === "card" ? null : s.id))}
              className={`h-12 rounded-xl text-sm ${style === s.id ? `border-2 border-[#2243B6] ${PRESSED}` : "border border-hairline bg-card text-ink"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      );
    }
  }

  return (
    <>
      {body && (
        <Sheet title={title} bare={open === "position"} onClose={() => setSheet(null)}>
          {body}
        </Sheet>
      )}
      <div className="flex h-full items-start">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <p className="truncate px-4 pt-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/50">{label}</p>
          <div role="toolbar" aria-label={label} className="flex gap-0.5 px-2 pb-2">
            {tools}
          </div>
        </div>
        <button
          type="button"
          onClick={onDone}
          aria-label="Done"
          className="mr-3 mt-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-card text-[#14203d] shadow-[0_2px_12px_rgb(20_32_61/0.2)]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </button>
      </div>
    </>
  );
}

/** A slide-up sheet sitting on the bottom bar, with ✓ to put it away. */
export function Sheet({
  title,
  bare = false,
  onClose,
  children,
}: {
  title: string;
  /** The content brings its own heading (the Position panel). */
  bare?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="absolute inset-x-0 bottom-full z-30 flex max-h-[min(70dvh,560px)] flex-col rounded-t-2xl bg-card shadow-[0_-6px_24px_rgb(20_32_61/0.16)]">
      <span aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-hairline" />
      {!bare && (
        <div className="flex shrink-0 items-center justify-between px-4 pb-1 pt-1">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Done"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[#2243B6]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10" />
            </svg>
          </button>
        </div>
      )}
      <div className={`min-h-0 flex-1 overflow-y-auto px-4 pb-5 ${bare ? "flex flex-col gap-5 pt-2" : "pt-1"}`}>{children}</div>
    </div>
  );
}

/** One finger-sized tool: a glyph (or picture) over its name. */
/** Stroke icons for the tools that aren't letters. */
const ICONS = {
  position: ["M4 4h7v7H4z", "M13 13h7v7h-7z", "M13 4h7v7h-7z", "M4 13h7v7H4z"],
  lock: ["M5 11h14v9H5z", "M8 11V8a4 4 0 0 1 7.5-2"],
  locked: ["M5 11h14v9H5z", "M8 11V8a4 4 0 0 1 8 0v3"],
  copy: ["M8 8h12v12H8z", "M16 8V4H4v12h4"],
  delete: ["M4 7h16", "M10 11v6M14 11v6", "M6 7l1 13h10l1-13", "M9 7V4h6v3"],
  flip: ["M12 3v18", "M8 7l-5 5 5 5V7z", "M16 7l5 5-5 5V7z"],
  outline: ["M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"],
  style: ["M4 5h16v14H4z", "M4 9h16"],
  up: ["M12 19V5", "M6 11l6-6 6 6"],
  down: ["M12 5v14", "M6 13l6 6 6-6"],
  hide: ["M3 3l18 18", "M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-2.6 3.2", "M6.6 6.6A16.6 16.6 0 0 0 3 12s4 6 9 6a9.4 9.4 0 0 0 4.4-1.1"],
  stack: ["M5 6h14", "M5 12h14", "M5 18h14"],
  reset: ["M4 12a8 8 0 1 0 2.3-5.6", "M4 4v4h4"],
  theme: ["M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.2-1.6-.4-1 .2-2.4 1.6-2.4H17a4 4 0 0 0 4-4c0-5-4-10-9-10z", "M7.5 11.5h.01", "M10 7.5h.01", "M14.5 7.5h.01"],
  styleTab: ["M4 19L9.5 5h1L16 19", "M6.5 14h7", "M17 19v-6", "M20 19v-4"],
  motion: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"],
  sections: ["M4 5h16v4H4z", "M4 11h16v4H4z", "M4 17h10"],
  templates: ["M4 4h7v9H4z", "M13 4h7v5h-7z", "M13 11h7v9h-7z", "M4 15h7v5H4z"],
  crop: ["M6 2v14a2 2 0 0 0 2 2h14", "M2 6h14a2 2 0 0 1 2 2v14"],
  frame: ["M4 4h16v16H4z", "M8 8h8v8H8z"],
  filter: ["M9 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10z", "M15 10a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"],
  colour: ["M12 3.5c3 3.6 6 7 6 10.5a6 6 0 0 1-12 0c0-3.5 3-6.9 6-10.5z"],
  fonts: ["M4 7V5h10v2", "M9 5v14", "M7 19h4", "M14 12v-1h6v1", "M17 11v8", "M16 19h2"],
  background: ["M4 4h16v16H4z", "M4 15l5-5 4 4 3-3 4 4", "M15.5 8.5h.01"],
  elements: ["M4 14h7v7H4z", "M17.5 3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z", "M14 21l3.5-7 3.5 7z"],
} as const;

export function Tool({
  label,
  icon,
  glyph,
  face,
  on = false,
  bold,
  italic,
  disabled,
  onClick,
  children,
}: {
  label: string;
  icon?: keyof typeof ICONS;
  glyph?: string;
  face?: string;
  on?: boolean;
  bold?: boolean;
  italic?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-16 w-[68px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium disabled:opacity-30 ${
        on ? PRESSED : "text-[#14203d]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-[22px] items-center text-lg leading-none ${bold ? "font-bold" : "font-semibold"} ${italic ? "font-serif italic" : ""}`}
        style={face ? { fontFamily: face } : undefined}
      >
        {children ??
          (icon ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[icon].map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
          ) : (
            glyph
          ))}
      </span>
      {label}
    </button>
  );
}

function AlignTool({
  value,
  onChange,
}: {
  value: "left" | "center" | "right";
  onChange: (align: "left" | "center" | "right") => void;
}) {
  const next = ({ left: "center", center: "right", right: "left" } as const)[value];
  const lines = {
    left: ["M4 6h16", "M4 12h10", "M4 18h13"],
    center: ["M4 6h16", "M7 12h10", "M5.5 18h13"],
    right: ["M4 6h16", "M10 12h10", "M7 18h13"],
  }[value];
  return (
    <Tool label="Align" onClick={() => onChange(next)}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {lines.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </Tool>
  );
}

function FontCards({
  sample,
  options,
  value,
  onPick,
}: {
  sample: string;
  options: { id: string; label: string; css: string }[];
  value: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
      {options.map((f) => (
        <button
          key={f.id || "theme"}
          type="button"
          aria-pressed={value === f.id}
          onClick={() => onPick(f.id)}
          className={`flex h-24 w-[132px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl px-2 ${
            value === f.id ? "border-2 border-[#2243B6] bg-[#2243B6]/[0.06]" : "border border-hairline bg-card"
          }`}
        >
          <span className="max-w-full truncate text-[22px] leading-tight text-[#14203d]" style={{ fontFamily: f.css }}>
            {sample}
          </span>
          <span className="max-w-full truncate text-[11px] font-medium text-ink/60">{f.label}</span>
        </button>
      ))}
    </div>
  );
}

function Stepper({ value, onLess, onMore }: { value: string; onLess?: () => void; onMore?: () => void }) {
  const button = "flex h-12 w-12 items-center justify-center rounded-xl border border-hairline bg-card text-xl text-ink disabled:opacity-30";
  return (
    <div className="flex items-center justify-center gap-5 py-2">
      <button type="button" aria-label="Smaller" disabled={!onLess} onClick={onLess} className={button}>
        −
      </button>
      <span className="w-16 text-center text-lg tabular-nums text-ink">{value}</span>
      <button type="button" aria-label="Bigger" disabled={!onMore} onClick={onMore} className={button}>
        +
      </button>
    </div>
  );
}
