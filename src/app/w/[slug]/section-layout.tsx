"use client";

import type { ReactNode } from "react";
import { SiteReveal } from "@/components/site-motion";
import { useSiteDesign } from "@/components/guest-site-theme";
import { CANVAS_WIDTH, WIDE_WIDTH } from "@/lib/layout";
import { SITE_SECTIONS, type SectionId } from "@/lib/site-design";

const COLUMN = Object.fromEntries(SITE_SECTIONS.map((x) => [x.id, x.column])) as Record<
  SectionId,
  "main" | "side"
>;

/**
 * The guest site's sections, in the couple's order.
 *
 * Two arrangements. On a phone, one column in exactly their order. From lg
 * up, the things a guest acts on take the wide left column and the reference
 * material sits beside them, each column keeping the couple's order within
 * it -- a big screen holds two panels rather than one stretched stack. With
 * nothing in the sidebar, the page centres as a single column.
 *
 * Each section renders once. On a phone the column wrappers become
 * `display: contents`, so their children join one flex column and `order`
 * puts them in sequence across both.
 */
export function SectionLayout({ sections }: { sections: Record<SectionId, ReactNode> }) {
  const design = useSiteDesign();
  const shown = design.sections
    .map((x, index) => ({ ...x, index }))
    .filter((x) => !x.hidden && sections[x.id] != null);
  const main = shown.filter((x) => COLUMN[x.id] === "main");
  const side = shown.filter((x) => COLUMN[x.id] === "side");
  const hasSidebar = side.length > 0;

  const render = (list: typeof shown) =>
    list.map((x) => (
      <div key={x.id} style={{ order: x.index }}>
        <SiteReveal>{sections[x.id]}</SiteReveal>
      </div>
    ));

  return (
    <div
      className={`mx-auto flex w-full flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-10 ${
        hasSidebar
          ? `${CANVAS_WIDTH} lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start`
          : WIDE_WIDTH
      }`}
    >
      <div className="contents lg:flex lg:flex-col lg:gap-8">{render(main)}</div>
      {hasSidebar && <div className="contents lg:flex lg:flex-col lg:gap-8">{render(side)}</div>}
    </div>
  );
}
