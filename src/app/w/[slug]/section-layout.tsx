"use client";

import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import { isLibraryPhoto } from "@/lib/photo-credit";
import { SiteReveal } from "@/components/site-motion";
import { SiteSection } from "@/components/site-section";
import { useSiteDesign } from "@/components/guest-site-theme";
import { CANVAS_WIDTH, READING_WIDTH, STANDARD_WIDTH, WIDE_WIDTH } from "@/lib/layout";
import { SITE_SECTIONS, sectionColumn, type SectionKey } from "@/lib/site-design";

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
export function SectionLayout({
  sections,
  photos = [],
}: {
  sections: Partial<Record<SectionKey, ReactNode>>;
  /** The gallery's photos, for the photo-led page's full-bleed breaks. */
  photos?: string[];
}) {
  const design = useSiteDesign();
  const shown = design.sections
    .map((x, index) => ({ ...x, index }))
    .filter((x) => !x.hidden && sections[x.id] != null);
  const main = shown.filter((x) => sectionColumn(x.id) === "main");
  const side = shown.filter((x) => sectionColumn(x.id) === "side");
  const hasSidebar = side.length > 0;

  if (design.pageStyle === "storybook") return <Storybook shown={shown} sections={sections} />;
  if (design.pageStyle === "postcard") return <Storybook shown={shown} sections={sections} postcard />;
  if (design.pageStyle === "invitation") return <Invitation shown={shown} sections={sections} />;
  if (design.pageStyle === "magazine") return <Magazine shown={shown} sections={sections} />;
  if (design.pageStyle === "evening") return <Ruled shown={shown} sections={sections} look="evening" />;
  if (design.pageStyle === "homestead") return <Ruled shown={shown} sections={sections} look="homestead" />;
  if (design.pageStyle === "ledger") return <Ledger shown={shown} sections={sections} />;
  if (design.pageStyle === "photo") return <PhotoLed shown={shown} sections={sections} photos={photos} />;

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
 * by side, photos as a spread). The RSVP card keeps a readable width; its
 * band and photo-split layouts need the room. The Background panel's
 * divider shapes the tinted bands' edges (globals.css).
 */
function Storybook({
  shown,
  sections,
  postcard = false,
}: {
  shown: { id: SectionKey; index: number }[];
  sections: Partial<Record<SectionKey, ReactNode>>;
  /** The postcard page style: the same bands, bolder, always with an edge. */
  postcard?: boolean;
}) {
  const { layouts } = useSiteDesign();
  const bands: { side: boolean; items: typeof shown }[] = [];
  for (const x of shown) {
    const side = sectionColumn(x.id) === "side";
    const last = bands.at(-1);
    // Postcards want the room: on that page each section is a band of its own.
    if (side && last?.side && !postcard) last.items.push(x);
    else bands.push({ side, items: [x] });
  }

  const picked = useSiteDesign().background.divider;
  // A postcard page always has an edge between its bands: a wave unless they picked another.
  const divider = postcard && picked === "none" ? "wave" : picked;
  return (
    <div
      className={`site-storybook ${postcard ? "site-postcard" : ""} flex flex-col pb-10`}
      data-divider={divider !== "none" ? divider : undefined}
    >
      {bands.map((band, i) => (
        <section
          key={band.items[0].id}
          className={`px-4 py-14 sm:px-6 lg:px-10 lg:py-20 ${i % 2 === 1 ? "site-band bg-[var(--site-band)]" : ""}`}
        >
          <div
            className={`mx-auto w-full ${
              band.side && !postcard
                ? `${CANVAS_WIDTH} grid gap-12 ${BAND_COLUMNS[Math.min(band.items.length, 4)]}`
                : band.items[0].id === "rsvp" && layouts.rsvp === "card"
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

type Shown = { id: SectionKey; index: number }[];

/** What a section is called, for the magazine's running labels; a custom block has its own heading. */
function sectionName(id: SectionKey) {
  return SITE_SECTIONS.find((x) => x.id === id)?.name ?? null;
}

/**
 * The invitation page style: one centred column on paper, in the couple's
 * exact order on a computer as on a phone, each section set like a panel of
 * a printed invitation suite (globals.css) with a small flourish between
 * them. A wide screen gets room around the column, not a second column:
 * the point of this look is that it reads top to bottom like a card.
 */
function Invitation({ shown, sections }: { shown: Shown; sections: Partial<Record<SectionKey, ReactNode>> }) {
  return (
    <div className={`site-invitation mx-auto flex w-full ${STANDARD_WIDTH} flex-col px-4 pb-20 sm:px-6`}>
      {shown.map((x, i) => (
        <Fragment key={x.id}>
          {i > 0 && (
            <div className="flex items-center justify-center gap-3 py-10 text-[var(--site-accent)] sm:py-14" aria-hidden="true">
              <span className="h-px w-16 bg-current opacity-40" />
              <span className="h-2 w-2 rotate-45 border border-current" />
              <span className="h-px w-16 bg-current opacity-40" />
            </div>
          )}
          <SiteSection sectionKey={x.id}>
            <SiteReveal>{sections[x.id]}</SiteReveal>
          </SiteSection>
        </Fragment>
      ))}
    </div>
  );
}

/**
 * The magazine page style: a contents line at the top, then each section a
 * numbered row under a heavy rule, its number and name in the margin and the
 * section beside it on a computer (above it on a phone). The numbers are the
 * page's real order, so the contents can link to them.
 */
function Magazine({ shown, sections }: { shown: Shown; sections: Partial<Record<SectionKey, ReactNode>> }) {
  const anchor = (id: SectionKey) => `no-${id.replace(/[^a-z0-9-]/gi, "-")}`;
  const number = (i: number) => String(i + 1).padStart(2, "0");
  return (
    <div className={`site-magazine mx-auto w-full ${CANVAS_WIDTH} px-4 pb-20 sm:px-6 lg:px-16`}>
      <nav aria-label="Contents" className="flex flex-wrap gap-x-8 gap-y-2 border-y border-ink py-3">
        {shown.map((x, i) => (
          <a key={x.id} href={`#${anchor(x.id)}`} className="font-mono-numbers text-xs uppercase tracking-[0.16em] text-ink hover:text-[var(--site-accent)]">
            <span className="text-[var(--site-accent)]">{number(i)}</span>
            {sectionName(x.id) ? <>&nbsp;&nbsp;{sectionName(x.id)}</> : null}
          </a>
        ))}
      </nav>
      {shown.map((x, i) => (
        <section
          key={x.id}
          id={anchor(x.id)}
          className="mt-16 scroll-mt-6 border-t-2 border-ink pt-5 lg:mt-24 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12"
        >
          <p className="font-mono-numbers text-xs uppercase tracking-[0.16em] text-[var(--site-accent)]">
            {number(i)}
            {sectionName(x.id) ? <> &mdash; {sectionName(x.id)}</> : null}
          </p>
          <SiteSection sectionKey={x.id} className="mt-4 min-w-0 lg:mt-0">
            <SiteReveal>{sections[x.id]}</SiteReveal>
          </SiteSection>
        </section>
      ))}
    </div>
  );
}

/**
 * The evening and homestead page styles: one column in the couple's order,
 * no cards, each section parted from the last by a rule -- a fine line in the
 * accent for evening, a dashed one for homestead. A wide screen gets wide
 * sections (the schedule's days side by side), not a second column; how each
 * is dressed is in globals.css (.site-evening, .site-homestead).
 */
function Ruled({
  shown,
  sections,
  look,
}: {
  shown: Shown;
  sections: Partial<Record<SectionKey, ReactNode>>;
  look: "evening" | "homestead";
}) {
  return (
    <div className={`site-${look} mx-auto flex w-full ${WIDE_WIDTH} flex-col px-4 pb-20 sm:px-6 lg:px-10`}>
      {shown.map((x, i) => (
        <section key={x.id} className={`site-rule py-14 lg:py-20 ${i === 0 ? "pt-4 lg:pt-6" : ""}`}>
          <SiteSection sectionKey={x.id}>
            <SiteReveal>{sections[x.id]}</SiteReveal>
          </SiteSection>
        </section>
      ))}
    </div>
  );
}

/**
 * The minimal page style: each section under a hairline, its name small in a
 * left column and the section beside it on a computer (above it on a phone).
 * Like the magazine, without the numbers or the weight.
 */
function Ledger({ shown, sections }: { shown: Shown; sections: Partial<Record<SectionKey, ReactNode>> }) {
  return (
    <div className={`site-ledger mx-auto w-full ${CANVAS_WIDTH} px-5 pb-20 sm:px-8 lg:px-12`}>
      {shown.map((x) => (
        <section
          key={x.id}
          className="border-t border-hairline py-12 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 lg:py-16"
        >
          <p className="font-mono-numbers text-[11px] uppercase tracking-[0.2em] text-ink/60">{sectionName(x.id) ?? ""}</p>
          <SiteSection sectionKey={x.id} className="mt-3 min-w-0 lg:mt-0">
            <SiteReveal>{sections[x.id]}</SiteReveal>
          </SiteSection>
        </section>
      ))}
    </div>
  );
}

/**
 * The photo-led page style: wide sections with their headings set large and
 * to the left, and after every second one a photo of the couple's across the
 * full width, taken from the end of their gallery so it isn't the one the
 * Photos section opens on. No photos, no breaks.
 */
function PhotoLed({
  shown,
  sections,
  photos,
}: {
  shown: Shown;
  sections: Partial<Record<SectionKey, ReactNode>>;
  photos: string[];
}) {
  const breaks = [...photos].reverse();
  return (
    <div className="site-photo-led flex flex-col pb-16">
      {shown.map((x, i) => {
        const photo = i % 2 === 1 && i < shown.length - 1 ? breaks[(i - 1) / 2] : undefined;
        return (
          <Fragment key={x.id}>
            <section className="px-5 py-14 sm:px-10 lg:px-14 lg:py-24">
              <div className={`mx-auto w-full ${CANVAS_WIDTH}`}>
                <SiteSection sectionKey={x.id}>
                  <SiteReveal>{sections[x.id]}</SiteReveal>
                </SiteSection>
              </div>
            </section>
            {photo && (
              <div className="site-hero-photo relative h-[calc(var(--site-vh,1vh)*46)] min-h-[280px] w-full overflow-hidden bg-[var(--site-photo)] lg:h-[calc(var(--site-vh,1vh)*70)]" aria-hidden="true">
                <Image src={photo} unoptimized={isLibraryPhoto(photo)} alt="" fill sizes="100vw" className="object-cover" />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
