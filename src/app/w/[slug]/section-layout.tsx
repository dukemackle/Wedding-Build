"use client";

import type { ReactNode } from "react";
import { SiteReveal } from "@/components/site-motion";
import { SiteSection } from "@/components/site-section";
import { useSiteDesign } from "@/components/guest-site-theme";
import { CANVAS_WIDTH, READING_WIDTH, WIDE_WIDTH } from "@/lib/layout";
import { sectionColumn, type SectionKey } from "@/lib/site-design";

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
export function SectionLayout({ sections }: { sections: Partial<Record<SectionKey, ReactNode>> }) {
  const design = useSiteDesign();
  const shown = design.sections
    .map((x, index) => ({ ...x, index }))
    .filter((x) => !x.hidden && sections[x.id] != null);
  const main = shown.filter((x) => sectionColumn(x.id) === "main");
  const side = shown.filter((x) => sectionColumn(x.id) === "side");
  const hasSidebar = side.length > 0;

  if (design.pageStyle === "storybook") return <Storybook shown={shown} sections={sections} />;

  const render = (list: typeof shown) =>
    list.map((x) => (
      <SiteSection key={x.id} sectionKey={x.id} style={{ order: x.index }}>
        <SiteReveal>{sections[x.id]}</SiteReveal>
      </SiteSection>
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

// Side sections sharing a band sit in columns on a computer; four make two
// rows of two rather than three and an orphan.
const BAND_COLUMNS = ["", "", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-2"];

/**
 * The storybook page style: each section a full-width band, every other one
 * tinted, so the page reads as chapters rather than a stack of cards (the
 * cards' own chrome is dropped in globals.css). A wide screen still gets
 * columns: reference sections in a row together share one band, side by
 * side, and the sections themselves lay out wide (the schedule's days side
 * by side, photos as a spread). The RSVP form keeps a readable width.
 */
function Storybook({
  shown,
  sections,
}: {
  shown: { id: SectionKey; index: number }[];
  sections: Partial<Record<SectionKey, ReactNode>>;
}) {
  const bands: { side: boolean; items: typeof shown }[] = [];
  for (const x of shown) {
    const side = sectionColumn(x.id) === "side";
    const last = bands.at(-1);
    if (side && last?.side) last.items.push(x);
    else bands.push({ side, items: [x] });
  }

  return (
    <div className="site-storybook flex flex-col pb-10">
      {bands.map((band, i) => (
        <section
          key={band.items[0].id}
          className={`px-4 py-14 sm:px-6 lg:px-10 lg:py-20 ${i % 2 === 1 ? "bg-[var(--site-band)]" : ""}`}
        >
          <div
            className={`mx-auto w-full ${
              band.side
                ? `${CANVAS_WIDTH} grid gap-12 ${BAND_COLUMNS[Math.min(band.items.length, 4)]}`
                : band.items[0].id === "rsvp"
                  ? READING_WIDTH
                  : WIDE_WIDTH
            }`}
          >
            {band.items.map((x) => (
              <SiteSection key={x.id} sectionKey={x.id}>
                <SiteReveal>{sections[x.id]}</SiteReveal>
              </SiteSection>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
