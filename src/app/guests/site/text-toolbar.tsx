"use client";

import type { ReactNode } from "react";
import {
  FONTS,
  TEXT_SIZES,
  TEXT_SLOTS,
  EMPTY_TEXT_STYLE,
  hasTextStyle,
  resolveDesign,
  type SiteDesign,
  type TextSlotId,
  type TextStyle,
} from "@/lib/site-design";

const KIND_LABELS: Record<string, string> = {
  serif: "Serif",
  sans: "Sans",
  script: "Script",
  display: "Display",
};

/**
 * The bar over the preview when the couple clicks words on their site: font,
 * size, colour, bold, italic and alignment for just those words.
 */
export function TextToolbar({
  slot,
  design,
  onChange,
  onDone,
}: {
  slot: TextSlotId;
  design: SiteDesign;
  onChange: (patch: Partial<TextStyle> | null) => void;
  onDone: () => void;
}) {
  const info = TEXT_SLOTS.find((s) => s.id === slot);
  const own = design.text[slot] ?? EMPTY_TEXT_STYLE;
  const { theme, accent, accent2, heading } = resolveDesign(design);
  const colors = [...new Set([heading, theme.ink, accent, accent2, theme.bg, "#ffffff"].map((c) => c.toLowerCase()))];
  const size = own.size ?? 1;
  const step = TEXT_SIZES.findIndex((s) => s >= size - 0.001);
  const kinds = [...new Set(FONTS.map((f) => f.kind))];

  return (
    <div
      role="toolbar"
      aria-label={`${info?.label ?? "Text"} style`}
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-hairline bg-card p-1.5 shadow-lg"
    >
      <span className="hidden whitespace-nowrap px-2 text-[13px] font-semibold text-ink xl:inline">{info?.label}</span>

      <select
        aria-label="Font"
        value={own.font ?? ""}
        onChange={(e) => onChange({ font: (e.target.value || null) as TextStyle["font"] })}
        className="h-9 w-40 shrink-0 rounded-lg border border-hairline bg-card px-2 text-[13px] text-ink"
      >
        <option value="">Theme font</option>
        {kinds.map((kind) => (
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
        <ToolButton
          label="Smaller"
          disabled={step <= 0}
          onClick={() => onChange({ size: TEXT_SIZES[Math.max(0, step - 1)] })}
        >
          −
        </ToolButton>
        <span className="w-11 text-center text-[13px] tabular-nums text-ink">{Math.round(size * 100)}%</span>
        <ToolButton
          label="Bigger"
          disabled={step >= TEXT_SIZES.length - 1}
          onClick={() => onChange({ size: TEXT_SIZES[Math.min(TEXT_SIZES.length - 1, step + 1)] })}
        >
          +
        </ToolButton>
      </div>

      <div className="flex shrink-0 items-center gap-1 px-1" role="group" aria-label="Colour">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Colour ${c}`}
            aria-pressed={own.color?.toLowerCase() === c}
            onClick={() => onChange({ color: c })}
            className={`h-7 w-7 rounded-full border border-ink/20 ${
              own.color?.toLowerCase() === c ? "outline outline-2 outline-offset-2 outline-[#2243B6]" : ""
            }`}
            style={{ background: c }}
          />
        ))}
        <label className="relative h-7 w-7 cursor-pointer overflow-hidden rounded-full border border-ink/20 bg-[conic-gradient(#FFD301,#2243B6,#00BFFE,#5AE4FF,#FFF12F,#FFD301)]">
          <span className="sr-only">Custom colour</span>
          <input
            type="color"
            value={own.color ?? heading}
            onChange={(e) => onChange({ color: e.target.value })}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>

      <ToolButton label="Bold" pressed={own.bold === true} onClick={() => onChange({ bold: own.bold !== true })}>
        <span className="font-bold">B</span>
      </ToolButton>
      <ToolButton label="Italic" pressed={own.italic === true} onClick={() => onChange({ italic: own.italic !== true })}>
        <span className="font-serif italic">I</span>
      </ToolButton>

      <div className="flex shrink-0" role="group" aria-label="Alignment">
        {(["left", "center", "right"] as const).map((a) => (
          <ToolButton key={a} label={`Align ${a}`} pressed={own.align === a} onClick={() => onChange({ align: a })}>
            <AlignIcon align={a} />
          </ToolButton>
        ))}
      </div>

      {hasTextStyle(own) && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="h-9 shrink-0 rounded-lg px-2.5 text-[13px] text-ink/70 hover:bg-ink/[0.05] hover:text-ink"
        >
          Reset
        </button>
      )}

      <span className="hidden whitespace-nowrap px-2 text-xs text-ink/60 2xl:inline">
        {info?.words ? "Click the words to retype them" : "Change these in your wedding details"}
      </span>

      <button
        type="button"
        onClick={onDone}
        aria-label="Done"
        // Stays in view while the rest of the bar scrolls sideways on a phone.
        className="sticky right-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2243B6] text-white shadow-[-8px_0_8px_var(--color-card)] hover:bg-[#2243B6]/90"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
          <path d="M5 12l5 5 9-10" />
        </svg>
      </button>
    </div>
  );
}

function ToolButton({
  label,
  pressed,
  disabled,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[15px] text-ink transition-colors disabled:opacity-30 ${
        pressed ? "bg-[#2243B6]/10 text-[#2243B6]" : "hover:bg-ink/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function AlignIcon({ align }: { align: "left" | "center" | "right" }) {
  const lines = { left: ["M4 6h16", "M4 12h10", "M4 18h13"], center: ["M4 6h16", "M7 12h10", "M5.5 18h13"], right: ["M4 6h16", "M10 12h10", "M7 18h13"] }[align];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {lines.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
