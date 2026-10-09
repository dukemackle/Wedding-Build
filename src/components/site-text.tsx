"use client";

import dynamic from "next/dynamic";
import type { CSSProperties, ReactNode } from "react";
import { useSiteDesign, useTextEditing } from "@/components/guest-site-theme";
import { TEXT_SLOTS, textSlotCss, type TextSlotId } from "@/lib/site-design";

// The editing version is a separate chunk, fetched only in the editor's preview.
const EditableSiteText = dynamic(() => import("./site-text-edit").then((m) => m.EditableSiteText));

/**
 * Words on the guest site that the couple can restyle -- and, for headings
 * and the invitation line, retype -- by clicking them in the editor's preview.
 * On the live site it just applies whatever they chose; the clicking and
 * typing live in site-text-edit.tsx, which guests never load.
 *
 * `children` is the usual wording, used until the couple types their own.
 */
export function SiteText({
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
  const { editable } = useTextEditing();
  const own = design.text[slot];
  const words = TEXT_SLOTS.find((s) => s.id === slot)?.words ?? false;
  const text = words && own?.text ? own.text : null;
  const css = { ...style, ...textSlotCss(own) } as CSSProperties;
  const inner = own?.size ? { fontSize: `${own.size}em` } : undefined;

  if (editable) {
    return (
      <EditableSiteText slot={slot} as={Tag} className={className} style={style}>
        {children}
      </EditableSiteText>
    );
  }

  return (
    <Tag className={className} style={css}>
      <span style={inner}>{text ?? children}</span>
    </Tag>
  );
}
