"use client";

import { useMemo } from "react";
import { FALLING, artById, type SiteDesign } from "@/lib/site-design";
import { TEMPLATES, applyTemplate, hasExtras, templateById, withExtras, type SiteTemplate } from "@/lib/site-templates";
import { PanelLabel } from "./editor-tabs";
import { SitePageThumb } from "./site-page-thumb";

/**
 * Templates: finished looks to start from (src/lib/site-templates.ts). Each
 * card is this couple's own site with the template applied, shrunk to its
 * phone layout, so what they see is what they'd get.
 */
export function TemplatesTab({
  design,
  onChange,
}: {
  design: SiteDesign;
  onChange: (patch: Partial<SiteDesign>) => void;
}) {
  const picked = templateById(design.template);
  return (
    <>
      <div className="flex flex-col gap-3">
        <PanelLabel>Templates</PanelLabel>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              design={design}
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
  design,
  selected,
  onPick,
}: {
  template: SiteTemplate;
  design: SiteDesign;
  selected: boolean;
  onPick: () => void;
}) {
  const look = useMemo(() => applyTemplate(design, template), [design, template]);
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
        <SitePageThumb design={look} />
      </span>
      <span className="block truncate border-t border-hairline px-2.5 py-2 text-[13px] font-medium text-ink">{template.name}</span>
    </button>
  );
}
