"use client";

import { useState, type ReactNode } from "react";
import { FONTS } from "@/lib/site-design";
import { layerText } from "@/lib/save-the-date/format";
import { cardPalette } from "@/lib/save-the-date/templates";
import type { CardContent, CardDoc, Layer, LayerOverride, TextLayer } from "@/lib/save-the-date/types";
import { ART } from "./art";

/** Layers whose words are one of the couple's details: retyping them edits the detail, so every layer showing it agrees. */
const DETAIL: Partial<Record<TextLayer["bind"], keyof CardContent>> = {
  headline: "headline",
  nameA: "nameA",
  nameB: "nameB",
  place: "place",
  note: "note",
};

const SCALE = { min: 0.4, max: 2.2 };
const TRACK = { min: -0.05, max: 0.6, step: 0.02 };

/**
 * The bar for whatever is picked on the card: retype, font, size, colour,
 * bold, italic, capitals, letter spacing, centring, hide and reset. Docked
 * over the card on a desktop and over the tool bar on a phone.
 */
export function CardToolbar({
  doc,
  layer,
  editing,
  setEditing,
  override,
  setContent,
  centre,
  onDone,
}: {
  doc: CardDoc;
  layer: Layer;
  editing: boolean;
  setEditing: (on: boolean) => void;
  override: (o: LayerOverride | null, key?: string) => void;
  setContent: (c: Partial<CardContent>, key: string) => void;
  /** Slides the layer so it sits centred left to right. */
  centre: () => void;
  onDone: () => void;
}) {
  const palette = cardPalette(doc);
  const o = doc.overrides[layer.id] ?? {};
  const isText = layer.kind === "text";
  const colourable = layer.kind === "text" || (layer.kind === "art" && ART[layer.art]?.kind !== "image");
  const colours = [...new Set([palette.ink, palette.accent, palette.muted, palette.onPhoto, palette.paper, "#ffffff"].map((c) => c.toLowerCase()))];
  const scale = o.scale ?? 1;
  const set = (patch: Partial<LayerOverride>, key?: string) => override({ ...o, ...patch }, key);

  if (editing && isText) return <WordsEditor doc={doc} layer={layer} o={o} set={set} setContent={setContent} onDone={() => setEditing(false)} />;

  const tracking = isText ? (o.tracking ?? layer.tracking ?? 0) : 0;
  const bold = isText ? (o.bold ?? (layer.weight ?? 400) >= 600) : false;
  const italic = isText ? (o.italic ?? layer.italic ?? false) : false;
  const upper = isText ? (o.upper ?? layer.upper ?? false) : false;

  return (
    <div role="toolbar" aria-label={`${layer.label} style`} className={bar}>
      {isText && (
        <button type="button" onClick={() => setEditing(true)} className="h-9 shrink-0 rounded-lg px-2 text-[13px] font-medium text-[#2243B6] hover:bg-[#2243B6]/[0.07]">
          Edit words
        </button>
      )}

      {isText && (
        <select
          aria-label="Font"
          value={o.font ?? ""}
          onChange={(e) => set({ font: e.target.value || undefined })}
          className="h-9 w-28 shrink-0 rounded-lg border border-hairline bg-white px-2 text-[13px] text-ink"
        >
          <option value="">Design&apos;s font</option>
          {(["serif", "script", "sans"] as const).map((kind) => (
            <optgroup key={kind} label={kind === "serif" ? "Serif" : kind === "script" ? "Script" : "Sans serif"}>
              {FONTS.filter((f) => f.kind === kind).map((f) => (
                <option key={f.id} value={f.id} style={{ fontFamily: f.css }}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      )}

      <Stepper
        label="Size"
        value={`${Math.round(scale * 100)}%`}
        down={scale > SCALE.min + 0.001 ? () => set({ scale: Math.max(SCALE.min, +(scale / 1.1).toFixed(3)) }, `scale-${layer.id}`) : undefined}
        up={scale < SCALE.max - 0.001 ? () => set({ scale: Math.min(SCALE.max, +(scale * 1.1).toFixed(3)) }, `scale-${layer.id}`) : undefined}
      />

      {colourable && (
        <div className="flex shrink-0 items-center gap-1 px-1" role="group" aria-label="Colour">
          {colours.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              aria-pressed={o.color?.toLowerCase() === c}
              onClick={() => set({ color: c })}
              className={`h-6 w-6 shrink-0 rounded-full border border-ink/20 ${o.color?.toLowerCase() === c ? "outline outline-2 outline-offset-2 outline-[#2243B6]" : ""}`}
              style={{ background: c }}
            />
          ))}
          <label className="relative h-6 w-6 shrink-0 cursor-pointer overflow-hidden rounded-full border border-ink/20 bg-[conic-gradient(#FFD301,#2243B6,#00BFFE,#5AE4FF,#FFF12F,#FFD301)]">
            <span className="sr-only">Any colour</span>
            <input
              type="color"
              value={o.color ?? palette.ink}
              onChange={(e) => set({ color: e.target.value }, `color-${layer.id}`)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      )}

      {isText && (
        <>
          <ToolButton label="Bold" pressed={bold} onClick={() => set({ bold: !bold })}>
            <span className="font-bold">B</span>
          </ToolButton>
          <ToolButton label="Italic" pressed={italic} onClick={() => set({ italic: !italic })}>
            <span className="font-serif italic">I</span>
          </ToolButton>
          <ToolButton label="All capitals" pressed={upper} onClick={() => set({ upper: !upper })}>
            <span className="text-[13px] font-medium">AA</span>
          </ToolButton>
          <Stepper
            label="Letter spacing"
            value={<SpacingIcon />}
            down={tracking > TRACK.min + 0.001 ? () => set({ tracking: Math.max(TRACK.min, +(tracking - TRACK.step).toFixed(3)) }, `track-${layer.id}`) : undefined}
            up={tracking < TRACK.max - 0.001 ? () => set({ tracking: Math.min(TRACK.max, +(tracking + TRACK.step).toFixed(3)) }, `track-${layer.id}`) : undefined}
          />
        </>
      )}

      <MoreMenu
        items={[
          ...(layer.kind !== "photo" ? [{ label: "Centre on the card", run: centre }] : []),
          { label: "Hide", run: () => set({ hidden: true }) },
          ...(Object.keys(o).length > 0 ? [{ label: "Reset to the design", run: () => override(null) }] : []),
        ]}
      />

      <DoneButton onClick={onDone} />
    </div>
  );
}

/** Retyping one layer's words, in place of the style controls. */
function WordsEditor({
  doc,
  layer,
  o,
  set,
  setContent,
  onDone,
}: {
  doc: CardDoc;
  layer: TextLayer;
  o: LayerOverride;
  set: (patch: Partial<LayerOverride>, key?: string) => void;
  setContent: (c: Partial<CardContent>, key: string) => void;
  onDone: () => void;
}) {
  const field = o.text === undefined ? DETAIL[layer.bind] : undefined;
  const shown = field ? String(doc.content[field] ?? "") : (o.text ?? layerText(layer, doc.content));
  const [value, setValue] = useState(shown);
  const max = field === "place" ? 140 : field === "note" ? 120 : field === "headline" ? 80 : field ? 60 : 200;
  const change = (v: string) => {
    setValue(v);
    if (field) setContent({ [field]: v }, `words-${layer.id}`);
    else set({ text: v }, `words-${layer.id}`);
  };
  return (
    <div role="toolbar" aria-label={`Edit ${layer.label}`} className={bar}>
      <span className="hidden whitespace-nowrap px-2 text-[13px] font-semibold text-ink sm:inline">{layer.label}</span>
      <textarea
        autoFocus
        rows={Math.min(3, Math.max(1, value.split("\n").length))}
        value={value}
        maxLength={max}
        onChange={(e) => change(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
            e.preventDefault();
            onDone();
          }
        }}
        aria-label={`Words for ${layer.label}`}
        className="min-w-0 flex-1 resize-none rounded-lg border border-hairline bg-white px-3 py-1.5 text-[15px] leading-snug text-ink focus:border-[#2243B6] focus:outline-none sm:w-72"
      />
      {o.text !== undefined && (
        <button type="button" onClick={() => set({ text: undefined })} className="h-9 shrink-0 rounded-lg px-2.5 text-[13px] text-ink/70 hover:bg-ink/[0.05]">
          Undo wording
        </button>
      )}
      <span className="hidden whitespace-nowrap px-1 text-xs text-ink/55 2xl:inline">Shift+Enter for a new line</span>
      <DoneButton onClick={onDone} />
    </div>
  );
}

/** Centre, hide and reset, behind one button so the bar fits above the card. */
function MoreMenu({ items }: { items: { label: string; run: () => void }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <ToolButton label="More" pressed={open} onClick={() => setOpen(!open)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </ToolButton>
      {open && (
        <div role="menu" className="fixed z-50 mt-1 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-hairline bg-white py-1 text-left shadow-xl max-lg:bottom-[140px] max-lg:right-3 max-lg:translate-x-0">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                it.run();
              }}
              className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-ink/5"
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const bar = "mx-auto flex w-max max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-hairline bg-white p-1.5 shadow-lg";

function Stepper({ label, value, down, up }: { label: string; value: ReactNode; down?: () => void; up?: () => void }) {
  return (
    <div className="flex h-9 shrink-0 items-center rounded-lg border border-hairline" role="group" aria-label={label}>
      <ToolButton label={`${label}: less`} disabled={!down} onClick={() => down?.()}>
        −
      </ToolButton>
      <span className="flex w-10 justify-center text-center text-[13px] tabular-nums text-ink" title={label}>
        {value}
      </span>
      <ToolButton label={`${label}: more`} disabled={!up} onClick={() => up?.()}>
        +
      </ToolButton>
    </div>
  );
}

function ToolButton({ label, pressed, disabled, onClick, children }: { label: string; pressed?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-8 shrink-0 items-center justify-center rounded-lg text-[15px] text-ink transition-colors disabled:opacity-30 ${
        pressed ? "bg-[#2243B6]/10 text-[#2243B6]" : "hover:bg-ink/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function DoneButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Done"
      // Stays in view while the rest of the bar scrolls sideways on a phone.
      className="sticky right-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2243B6] text-white shadow-[-8px_0_8px_#fff] hover:bg-[#2243B6]/90"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <path d="M5 12l5 5 9-10" />
      </svg>
    </button>
  );
}

function SpacingIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 2v14M20 2v14M8 9h8M10 7l-2 2 2 2M14 7l2 2-2 2" />
    </svg>
  );
}
