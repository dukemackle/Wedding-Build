"use client";

import { useState } from "react";
import { artById, resolveDesign, type SiteDesign } from "@/lib/site-design";
import { TEMPLATES, TEMPLATE_TAGS, applyTemplate, type SiteTemplate, type TemplateTag } from "@/lib/site-templates";
import { PanelLabel } from "./editor-tabs";

/**
 * Templates: finished looks to start from (src/lib/site-templates.ts). Each
 * card is drawn from the template applied to this couple's own design, in
 * their names, so what they see is what they'd get.
 */
export function TemplatesTab({
  design,
  names,
  onChange,
}: {
  design: SiteDesign;
  names: [string, string];
  onChange: (patch: Partial<SiteDesign>) => void;
}) {
  const [tag, setTag] = useState<TemplateTag | null>(null);
  const shown = TEMPLATES.filter((t) => !tag || t.tags.includes(tag));
  return (
    <>
      <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 lg:-mx-6 lg:px-6">
        {[null, ...TEMPLATE_TAGS].map((t) => (
          <button
            key={t ?? "all"}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(t)}
            className={`h-8 shrink-0 rounded-full px-3 text-[13px] ${
              tag === t ? "bg-forest text-parchment" : "border border-hairline bg-card text-ink/75 hover:text-ink"
            }`}
          >
            {t ?? "All"}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <PanelLabel>Templates</PanelLabel>
        <div className="grid grid-cols-2 gap-3">
          {shown.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              design={design}
              names={names}
              selected={design.template === t.id}
              onPick={() => onChange(applyTemplate(design, t))}
            />
          ))}
        </div>
        <p className="text-[13px] leading-normal text-ink/60">
          Switching templates keeps your words, photos and anything you&apos;ve placed. Only the look changes,
          and you can keep changing it from here.
        </p>
      </div>
    </>
  );
}

function TemplateCard({
  template,
  design,
  names,
  selected,
  onPick,
}: {
  template: SiteTemplate;
  design: SiteDesign;
  names: [string, string];
  selected: boolean;
  onPick: () => void;
}) {
  const look = applyTemplate(design, template);
  const { theme, accent, heading, onAccent } = resolveDesign(look);
  const art = artById(look.art.id);
  const a = names[0]?.trim() || "Alex";
  const b = names[1]?.trim() || "Sam";
  const sprig = (mirror: boolean) =>
    art && (
      <span
        aria-hidden="true"
        className={`absolute top-2 h-[70%] w-[22%] ${mirror ? "right-1" : "left-1"}`}
        style={{
          transform: mirror ? "scaleX(-1)" : undefined,
          ...(art.kind === "line"
            ? {
                background: accent,
                WebkitMaskImage: `url(${art.src})`,
                maskImage: `url(${art.src})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "top",
                maskPosition: "top",
              }
            : { backgroundImage: `url(${art.src})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "top" }),
        }}
      />
    );
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      className={`overflow-hidden rounded-xl bg-card text-left ${
        selected ? "border-2 border-[#2243B6]" : "m-px border border-hairline hover:border-ink/30"
      }`}
    >
      <span
        className="relative flex h-[120px] flex-col items-center justify-center gap-1.5 overflow-hidden px-3 text-center"
        style={{ background: theme.bg, color: theme.ink }}
      >
        {sprig(false)}
        {sprig(true)}
        <span
          className="relative max-w-full truncate text-[22px] leading-tight"
          style={{
            fontFamily: theme.display,
            color: heading,
            fontStyle: theme.italicNames ? "italic" : "normal",
            fontWeight: theme.nameWeight,
          }}
        >
          {a} &amp; {b}
        </span>
        <span
          className="relative px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
          style={{ background: accent, color: onAccent, borderRadius: theme.radius, fontFamily: theme.body }}
        >
          RSVP
        </span>
      </span>
      <span className="flex items-center justify-between gap-2 border-t border-hairline px-2.5 py-2">
        <span className="truncate text-[13px] font-medium text-ink">{template.name}</span>
        <span className="shrink-0 text-[11px] text-ink/50">{template.tags[0]}</span>
      </span>
    </button>
  );
}
