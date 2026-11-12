"use client";

import { useMemo } from "react";
import { FALLING, artById, fontById, fontsHrefFor, type SiteDesign } from "@/lib/site-design";
import { TEMPLATES, applyTemplate, hasExtras, templateById, withExtras, type SiteTemplate } from "@/lib/site-templates";
import { CardSvg } from "@/components/save-the-date/card-svg";
import { templateById as cardTemplateById } from "@/lib/save-the-date/templates";
import type { CardDoc } from "@/lib/save-the-date/types";
import { siteMatches, siteMatchingCard, suiteForCard } from "@/lib/suites";
import { PanelLabel } from "./editor-tabs";
import { TemplatePicture } from "./template-picture";

/**
 * Templates: finished looks to start from (src/lib/site-templates.ts). Each
 * card is this couple's own site with the template applied, shrunk to its
 * phone layout, so what they see is what they'd get.
 */
export function TemplatesTab({
  design,
  onChange,
  matchCard,
}: {
  design: SiteDesign;
  onChange: (patch: Partial<SiteDesign>) => void;
  /** Their save the date, when it belongs to a suite. */
  matchCard?: CardDoc | null;
}) {
  const picked = templateById(design.template);
  return (
    <>
      <div className="flex flex-col gap-3">
        {matchCard && <MatchCard card={matchCard} design={design} onChange={onChange} />}
        <PanelLabel>Templates</PanelLabel>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={design.template === t.id}
              onPick={() => onChange(applyTemplate(design, t))}
            />
          ))}
        </div>
        <p className="text-[13px] leading-normal text-ink/60">
          Every template starts with your photo. Switching keeps your words, photos and anything
          you&apos;ve placed; only the look changes.
        </p>
        {picked && hasExtras(picked) && <Extras template={picked} design={design} onChange={onChange} />}
      </div>
    </>
  );
}

/**
 * "Match your save the date" (suites, 2026-11-10): one tap puts the site on
 * its suite's template in the card's colourway, fonts and decorations.
 */
function MatchCard({
  card,
  design,
  onChange,
}: {
  card: CardDoc;
  design: SiteDesign;
  onChange: (patch: Partial<SiteDesign>) => void;
}) {
  const suite = suiteForCard(card.template);
  const look = useMemo(() => siteMatchingCard(design, card), [design, card]);
  if (!suite || !look) return null;
  const matched = siteMatches(design, card);
  const t = cardTemplateById(card.template);
  const pair = t.pairings.find((p) => p.id === card.fonts) ?? t.pairings[0];
  const fonts = fontsHrefFor([pair.display, pair.script, pair.sans].map((id) => fontById(id)?.css ?? ""));
  return (
    <div className="flex items-center gap-3 rounded-xl border border-hairline bg-parchment p-3">
      <link rel="stylesheet" href={fonts} precedence="default" />
      <span className="w-12 shrink-0 overflow-hidden rounded-[5px] shadow-sm ring-1 ring-ink/10">
        <CardSvg doc={card} className="block w-full" title="Your save the date" />
      </span>
      <span className="min-w-0 flex-1 text-[13px] leading-snug text-ink/70">
        <span className="block font-medium text-ink">{matched ? "Matches your save the date" : "Match your save the date"}</span>
        {matched ? `The ${suite.name} suite, in your card's colours and lettering.` : `The ${suite.name} site in your card's colours and lettering.`}
      </span>
      {matched ? (
        <svg aria-hidden viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-[#2243B6]">
          <circle cx="10" cy="10" r="9" fill="currentColor" />
          <path d="M6 10.4l2.6 2.6L14 7.6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <button
          type="button"
          onClick={() => onChange(look)}
          className="h-9 shrink-0 rounded-lg bg-[#14203d] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2243B6]"
        >
          Match
        </button>
      )}
    </div>
  );
}

/**
 * A template's art, scene and falling extras are off until asked for (owner,
 * 2026-10-21): the photo carries the page. One tap adds them, one takes them off.
 */
function Extras({
  template,
  design,
  onChange,
}: {
  template: SiteTemplate;
  design: SiteDesign;
  onChange: (patch: Partial<SiteDesign>) => void;
}) {
  const on =
    (template.art ? design.art.id === template.art.id : true) &&
    (template.scene ? design.scene === template.scene : true) &&
    (template.falling ? design.motion.falling === template.falling : true);
  const what = [
    template.art && artById(template.art.id)?.name.toLowerCase(),
    template.scene && "a night sky",
    template.falling && `falling ${FALLING.find((f) => f.id === template.falling)?.label.toLowerCase()}`,
  ].filter(Boolean);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-parchment px-4 py-3">
      <span className="min-w-0 text-[13px] leading-snug text-ink/70">
        <span className="block font-medium text-ink">{template.name}&apos;s decorations</span>
        {what.join(", ")}
      </span>
      <button
        type="button"
        aria-pressed={on}
        onClick={() =>
          onChange(on ? { art: { id: null, placement: "sides" }, scene: null, motion: { ...design.motion, falling: "none" } } : withExtras(design, template))
        }
        className={`h-9 shrink-0 rounded-lg px-3.5 text-[13px] font-semibold transition-colors ${
          on ? "border border-hairline bg-card text-ink hover:border-ink/30" : "bg-[#14203d] text-white hover:bg-[#2243B6]"
        }`}
      >
        {on ? "Remove" : "Add them"}
      </button>
    </div>
  );
}

function TemplateCard({
  template,
  selected,
  onPick,
}: {
  template: SiteTemplate;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      title={template.blurb}
      className={`overflow-hidden rounded-xl bg-card text-left ${
        selected ? "border-2 border-[#2243B6]" : "m-px border border-hairline hover:border-ink/30"
      }`}
    >
      <span className="relative block aspect-[3/4]">
        <TemplatePicture id={template.id} upright />
      </span>
      <span className="block truncate border-t border-hairline px-2.5 py-2 text-[13px] font-medium text-ink">{template.name}</span>
    </button>
  );
}
