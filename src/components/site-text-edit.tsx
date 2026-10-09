"use client";

import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { TEXT_EDIT_MESSAGE, useSiteDesign, useTextEditing } from "@/components/guest-site-theme";
import { TEXT_SLOTS, textSlotCss, type TextSlotId } from "@/lib/site-design";

/**
 * SiteText in the editor's preview: click to pick, and type to retype
 * headings and the invitation line. Loaded only there (site-text.tsx loads
 * it on demand), so guests never download it.
 */
export function EditableSiteText({
  slot,
  as: Tag = "h2",
  className = "",
  style,
  children,
}: {
  slot: TextSlotId;
  as?: "h1" | "h2" | "p";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const design = useSiteDesign();
  const { selected, select } = useTextEditing();
  const own = design.text[slot];
  const words = TEXT_SLOTS.find((s) => s.id === slot)?.words ?? false;
  const text = words && own?.text ? own.text : null;
  const isSelected = selected === slot;
  const typing = isSelected && words;
  const ref = useRef<HTMLSpanElement>(null);
  const before = useRef("");

  const css = { ...style, ...textSlotCss(own) } as CSSProperties;
  const inner = own?.size ? { fontSize: `${own.size}em` } : undefined;

  function save() {
    const typed = ref.current?.innerText.replace(/\s+/g, " ").trim() ?? "";
    if (typed === before.current) return;
    if (!typed && !text) {
      // Already the usual words, so nothing re-renders: put them back by hand.
      if (ref.current) ref.current.innerText = before.current;
      return;
    }
    // Clearing the words brings the usual ones back.
    window.parent?.postMessage({ type: TEXT_EDIT_MESSAGE, slot, text: typed }, window.location.origin);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      (event.currentTarget as HTMLElement).blur();
    }
  }

  return (
    <Tag
      data-site-text={slot}
      className={`${className} cursor-text rounded-sm outline-offset-4 ${
        isSelected ? "outline outline-2 outline-[#2243B6]" : "hover:outline hover:outline-2 hover:outline-dashed hover:outline-[#2243B6]/60"
      }`}
      style={css}
      onClick={() => {
        if (!isSelected) select(slot);
      }}
    >
      <span
        // A new key when the saved words change, so React never fights the
        // browser over a text node the couple has just typed into.
        key={text ?? ""}
        ref={ref}
        style={{ ...inner, outline: "none" }}
        contentEditable={typing ? "plaintext-only" : undefined}
        suppressContentEditableWarning
        spellCheck={typing}
        onFocus={typing ? () => (before.current = ref.current?.innerText.trim() ?? "") : undefined}
        onBlur={typing ? save : undefined}
        onKeyDown={typing ? onKeyDown : undefined}
      >
        {text ?? children}
      </span>
    </Tag>
  );
}
