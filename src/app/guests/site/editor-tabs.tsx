"use client";

import Link from "next/link";
import { useRef, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { createSiteBlock, deleteSiteBlock } from "./block-actions";
import { ChevronDownIcon } from "@/components/icons";
import type { SiteBlock } from "@/lib/supabase/types";
import { SiteOrnament } from "@/components/site-ornament";
import { Shape } from "@/components/site-motion";
import { MonogramFontError, downloadMonogram } from "@/lib/monogram-download";
import { PHOTO_FRAMES } from "@/lib/site-canvas";
import { FrameIcon } from "./photo-motion-panels";
import { SceneThumb } from "@/components/site-scene";
import {
  ART_HEROES,
  ART_PLACEMENTS,
  ORNAMENT_GROUP,
  SITE_ART,
  HERO_LAYOUTS,
  ORNAMENTS,
  PAGE_STYLES,
  PHOTO_HEROES,
  SCENES,
  SCENE_TIMES,
  sceneById,
  MOTION_PRESETS,
  OPENINGS,
  FALLING,
  motionPreset,
  type Motion,
  SECTION_LAYOUTS,
  SITE_SECTIONS,
  type LayoutSection,
  resolveDesign,
  themeById,
  fontById,
  monogramDate,
  MONOGRAM_DATES,
  MONOGRAM_FONTS,
  ENVELOPE_LINERS,
  NO_BACKGROUND,
  SEALS,
  backgroundLayers,
  WORD_ORNAMENTS,
  type HeroLayoutId,
  blockIdOf,
  blockKey,
  sectionColumn,
  type SectionKey,
  type SiteDesign,
  type SceneId,
} from "@/lib/site-design";

export type SectionInfo = {
  /** For custom blocks; built-in sections use their fixed name. */
  name?: string;
  status: string;
  /** Something the couple should fix before sharing, shown in amber. */
  warn?: boolean;
  /** The section's content editor, opened from its row. */
  editor?: ReactNode;
  /** Where its content is edited, when that's elsewhere in Wren. */
  link?: { href: string; label: string };
  /** The section has layouts to pick from (SECTION_LAYOUTS). */
  layout?: LayoutSection;
};

export type ChecklistItem = { label: string; done: boolean; href?: string; action?: string };

type Change = (patch: Partial<SiteDesign>) => void;

const NAMES = Object.fromEntries(SITE_SECTIONS.map((x) => [x.id, x.name])) as Record<string, string>;

export function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/60">{children}</p>
  );
}

const SELECTED = "border-2 border-forest";
const UNSELECTED = "m-px border border-hairline hover:border-ink/30";

/** Page artwork: every piece but the Elements tab's dividers and ornaments. */
const PAGE_ART = SITE_ART.filter((a) => a.group !== ORNAMENT_GROUP);

/** How many of each picker shows before "See all". */
const PREVIEW = { monogram: 4, art: 5, scene: 3 } as const;

/**
 * The first `n` of a list, with the selected item swapped in at the end when
 * it would otherwise be hidden, so the preview row always shows the pick
 * without tiles jumping around when you click one that's already visible.
 */
function previewOf<T>(items: readonly T[], n: number, isOn: (x: T) => boolean): T[] {
  const head = items.slice(0, n);
  if (head.some(isOn)) return head;
  const on = items.find(isOn);
  return on ? [...head.slice(0, n - 1), on] : head;
}

/** A section label with "See all N →" (or "Show fewer") on the right. */
function PickerHead({ label, count, open, onToggle }: { label: string; count: number; open: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <PanelLabel>{label}</PanelLabel>
      <button type="button" aria-expanded={open} onClick={onToggle} className="text-[13px] font-medium text-forest hover:underline">
        {open ? "Show fewer" : `See all ${count} →`}
      </button>
    </div>
  );
}

const CHIP_ON = "bg-forest text-parchment";
const CHIP_OFF = "border border-hairline bg-card text-ink/75 hover:border-ink/30";

export function StyleTab({
  design,
  onChange,
  hasPhoto,
  names,
  weddingDate,
  children,
}: {
  design: SiteDesign;
  onChange: Change;
  hasPhoto: boolean;
  /** The couple's names, so the monograms show their own initials. */
  names: [string, string];
  weddingDate: string | null;
  /** Extra content placed under Top of the page (the banner photo). */
  children?: ReactNode;
}) {
  const { theme, accent, onAccent } = resolveDesign(design);
  const initials: [string, string] = design.monogram.swap ? [names[1], names[0]] : names;
  const needsPhoto = PHOTO_HEROES.includes(design.hero);
  const [allMonograms, setAllMonograms] = useState(false);
  const monograms = allMonograms ? ORNAMENTS : previewOf(ORNAMENTS, PREVIEW.monogram, (o) => o.id === design.ornament);

  return (
    <>
      <div className="flex flex-col gap-3">
        <PanelLabel>Top of the page</PanelLabel>
        <div className="grid grid-cols-3 gap-2.5">
          {HERO_LAYOUTS.map((h) => {
            const selected = design.hero === h.id;
            return (
              <button
                key={h.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ hero: h.id })}
                className={`flex flex-col overflow-hidden rounded-xl bg-card text-left ${selected ? SELECTED : UNSELECTED}`}
                title={h.help}
              >
                <HeroThumb layout={h.id} bg={theme.bg} surface={theme.surface} photo={theme.photo} ink={theme.ink} accent={accent} />
                <span className="border-t border-hairline px-2 py-1.5 text-[12px] font-medium text-ink">{h.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[13px] leading-normal text-ink/60">
          {hasPhoto || !needsPhoto
            ? HERO_LAYOUTS.find((h) => h.id === design.hero)?.help
            : "Until you add a banner photo (Sections › Photos), this shows an illustration of your scene in your colours."}
        </p>
      </div>

      {children}

      <NamesStyle design={design} onChange={onChange} script={resolveDesign(design).scriptNames} />

      <div className="flex flex-col gap-2">
        <label htmlFor="site-notice" className="text-[13px] font-medium text-ink">
          Announcement
        </label>
        <input
          id="site-notice"
          type="text"
          maxLength={160}
          value={design.notice ?? ""}
          onChange={(e) => onChange({ notice: e.target.value || null })}
          placeholder="New date: Saturday 5 December, in Tucson"
          className="h-11 rounded-xl border border-hairline bg-card px-3 text-[15px] text-ink placeholder:text-ink/45"
        />
        <p className="text-[13px] leading-normal text-ink/60">
          A line across the very top of your site, for a changed date or venue or a last call for RSVPs. Leave it empty
          for none.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PickerHead label="Monogram" count={ORNAMENTS.length} open={allMonograms} onToggle={() => setAllMonograms((x) => !x)} />
        <div
          className="grid grid-cols-4 gap-2"
          style={
            {
              "--site-accent": accent,
              "--site-on-accent": onAccent,
              "--font-display": theme.display,
              ...(design.monogram.font ? { "--font-monogram": fontById(design.monogram.font)?.css } : {}),
            } as React.CSSProperties
          }
        >
          {monograms.map((o) => {
            const selected = design.ornament === o.id;
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ ornament: o.id })}
                className={`flex flex-col items-center overflow-hidden rounded-xl text-left ${selected ? SELECTED : UNSELECTED}`}
                style={{ background: theme.bg }}
              >
                <span className="flex h-[72px] w-full items-center justify-center overflow-hidden">
                  {o.id === "none" ? (
                    <span className="text-[11px]" style={{ color: theme.muted }}>
                      —
                    </span>
                  ) : (
                    <span className={`block origin-center ${o.id === "rule" ? "scale-[0.8]" : "scale-[0.58]"}`}>
                      <SiteOrnament kind={o.id} first={initials[0]} second={initials[1]} />
                    </span>
                  )}
                </span>
                <span className="w-full border-t border-hairline bg-card px-1 py-1 text-center text-[11px] font-medium text-ink">
                  {o.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {design.ornament !== "none" && !WORD_ORNAMENTS.includes(design.ornament) && (
        <MonogramLetters design={design} onChange={onChange} names={names} initials={initials} weddingDate={weddingDate} />
      )}

      <div className="flex flex-col gap-3">
        <PanelLabel>Page style</PanelLabel>
        <Pills
          label="Page style"
          options={PAGE_STYLES.map((x) => [x.id, x.label] as const)}
          value={design.pageStyle}
          onPick={(v) => onChange({ pageStyle: v })}
        />
        <p className="text-[13px] leading-normal text-ink/60">
          {PAGE_STYLES.find((x) => x.id === design.pageStyle)?.help}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PanelLabel>Photo frames</PanelLabel>
        <div role="group" aria-label="Photo frames" className="grid grid-cols-4 gap-2">
          {([[null, "Auto"], ...PHOTO_FRAMES.map((f) => [f.id, f.label] as const)] as const).map(([id, label]) => (
            <button
              key={id ?? "auto"}
              type="button"
              aria-pressed={design.photoFrame === id}
              onClick={() => onChange({ photoFrame: id })}
              className={`flex h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl text-[11px] text-ink/70 ${
                design.photoFrame === id
                  ? "border-2 border-[#2243B6] bg-[#2243B6]/[0.06]"
                  : "m-px border border-hairline bg-card hover:border-ink/30"
              }`}
            >
              {id ? <FrameIcon frame={id} accent={resolveDesign(design).accent} /> : <span className="text-base leading-none text-ink/50">✦</span>}
              {label}
            </button>
          ))}
        </div>
        <p className="text-[13px] leading-normal text-ink/60">
          For the Spread photo layout, photo sections and your wedding party. Auto keeps the page style&rsquo;s own.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PanelLabel>The occasion</PanelLabel>
        <Pills
          label="The occasion"
          options={[
            ["wedding", "Wedding"],
            ["renewal", "Vow renewal"],
          ]}
          value={design.occasion.kind}
          onPick={(v) => onChange({ occasion: { ...design.occasion, kind: v } })}
        />
        {design.occasion.kind === "renewal" && (
          <label className="flex flex-col gap-1.5 text-[13px] text-ink/75">
            When you first married
            <input
              id="occasion-since"
              type="date"
              value={design.occasion.since ?? ""}
              onChange={(e) => onChange({ occasion: { ...design.occasion, since: e.target.value || null } })}
              className="h-11 rounded-lg border border-hairline bg-card px-3 text-[15px] text-ink"
            />
          </label>
        )}
        <p className="text-[13px] leading-normal text-ink/60">
          {design.occasion.kind === "renewal"
            ? "The top of the page says you're renewing your vows, with the years since you married."
            : "Planning a vow renewal? Switch this and the wording follows."}
        </p>
      </div>
    </>
  );
}

/**
 * The one piece of artwork that frames the top of the page, at either side or
 * in the corners. Lives at the top of Elements, above the pieces you place
 * yourself, since it's the same library.
 */
export function PageArtworkSection({
  design,
  onChange,
  hasPhoto,
}: {
  design: SiteDesign;
  onChange: Change;
  hasPhoto: boolean;
}) {
  const { theme, accent } = resolveDesign(design);
  const [all, setAll] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
  const groups = [...new Set(PAGE_ART.map((a) => a.group))];
  const pieces = all
    ? group
      ? PAGE_ART.filter((a) => a.group === group)
      : PAGE_ART
    : previewOf(PAGE_ART, PREVIEW.art, (a) => a.id === design.art.id);

  return (
    <div className="flex flex-col gap-3">
      <PickerHead label="Page artwork" count={PAGE_ART.length} open={all} onToggle={() => setAll((x) => !x)} />
      <p className="-mt-1 text-[13px] leading-normal text-ink/60">One piece framing your names at the top. To place pieces anywhere, use the library below.</p>
      {all && (
        <div role="group" aria-label="Artwork groups" className="flex flex-wrap gap-1.5">
          {[null, ...groups].map((g) => (
            <button
              key={g ?? "all"}
              type="button"
              aria-pressed={group === g}
              onClick={() => setGroup(g)}
              className={`h-8 rounded-full px-3 text-[13px] ${group === g ? CHIP_ON : CHIP_OFF}`}
            >
              {g ?? "All"}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {!(all && group) && (
          <button
            type="button"
            aria-pressed={design.art.id === null}
            onClick={() => onChange({ art: { ...design.art, id: null } })}
            className={`flex flex-col overflow-hidden rounded-xl text-left ${design.art.id === null ? SELECTED : UNSELECTED}`}
            style={{ background: theme.bg }}
          >
            <span className="flex h-[84px] items-center justify-center text-[11px]" style={{ color: theme.muted }}>
              —
            </span>
            <span className="w-full border-t border-hairline bg-card px-2 py-1 text-[11px] font-medium text-ink">None</span>
          </button>
        )}
        {pieces.map((a) => {
          const on = design.art.id === a.id;
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={on}
              title={`${a.group} · ${a.kind === "line" ? "drawn in your accent colour" : "watercolour"}`}
              onClick={() => onChange({ art: { ...design.art, id: a.id } })}
              className={`flex flex-col overflow-hidden rounded-xl text-left ${on ? SELECTED : UNSELECTED}`}
              style={{ background: theme.bg }}
            >
              <span className="relative block h-[84px] w-full p-2">
                {a.kind === "line" ? (
                  <span
                    className="block h-full w-full"
                    style={{
                      background: accent,
                      WebkitMaskImage: `url(${a.src})`,
                      maskImage: `url(${a.src})`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                    }}
                  />
                ) : (
                  <span
                    className="block h-full w-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${a.src})` }}
                  />
                )}
              </span>
              <span className="w-full truncate border-t border-hairline bg-card px-2 py-1 text-[11px] font-medium text-ink">
                {a.name}
              </span>
            </button>
          );
        })}
      </div>
      {design.art.id && (
        <div className="flex gap-1.5">
          {ART_PLACEMENTS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={design.art.placement === p.id}
              onClick={() => onChange({ art: { ...design.art, placement: p.id } })}
              className={`h-8 rounded-full px-3 text-[13px] ${
                design.art.placement === p.id ? "bg-forest text-parchment" : "border border-hairline bg-card text-ink/75"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      {design.art.id && !ART_HEROES.includes(design.hero) && hasPhoto && (
        <p className="rounded-md bg-[#FFD301]/20 px-3 py-2 text-[13px] leading-normal text-[#14203d]">
          Your artwork is hidden: this top shows your photo instead. Pick Text only, Monogram,
          Framed or Poster under Style › Top of the page to show it.
        </p>
      )}
    </div>
  );
}

/** The scene groups in Background › Scene, by where each one sits. */
const SCENE_GROUPS = [
  { place: "band", label: "Landscapes", hint: "Under your names" },
  { place: "strip", label: "Strips", hint: "Across the top" },
  { place: "surround", label: "Frames", hint: "Around your names", note: "Frames show on tops without a photo." },
] as const;

/** The drawn scene behind the names: a landscape, a strip or a frame. Lives in Background. */
export function SceneSection({ design, onChange }: { design: SiteDesign; onChange: Change }) {
  const { theme, accent, accent2 } = resolveDesign(design);
  const base = themeById(design.theme);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  // The tiles draw in the site's own colours, not the editor's.
  const vars = {
    "--site-accent": accent,
    "--site-accent-2": accent2,
    "--color-ink": theme.ink,
    "--color-parchment": theme.bg,
    "--color-card": theme.surface,
  } as CSSProperties;
  const own = base.scene ?? "none";

  const tile = (id: SiteDesign["scene"], draw: SceneId, label: string) => {
    const on = design.scene === id;
    return (
      <button
        key={id ?? "theme"}
        type="button"
        aria-pressed={on}
        onClick={() => onChange({ scene: id })}
        className="flex flex-col items-center gap-1 text-center text-[11px] leading-tight text-ink/70"
      >
        <span
          className={`relative block aspect-[3/2] w-full overflow-hidden rounded-xl ${on ? "border-2 border-forest" : "m-px border border-hairline hover:border-ink/30"}`}
          style={vars}
        >
          <SceneThumb scene={draw} time={design.sceneTime} />
        </span>
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <PanelLabel>Scene</PanelLabel>
      <p className="-mt-1 text-[13px] leading-normal text-ink/60">
        Drawn in your colours: a landscape under your names, a strip across the top, or a frame around them.
      </p>
      <div role="group" aria-label="Scene" className="grid grid-cols-3 gap-2">
        {tile(null, own, own === "none" ? "Theme's own" : `Theme's own (${sceneById(own).label})`)}
        {tile("none", "none", "None")}
      </div>
      {sceneById(design.scene ?? own).place === "band" && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium text-ink">
            Time of day <span className="font-normal text-ink/50">· The sky and light over your landscape</span>
          </p>
          <div role="group" aria-label="Time of day" className="grid grid-cols-5 gap-2">
            {SCENE_TIMES.map((x) => {
              const on = design.sceneTime === x.id;
              return (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ sceneTime: x.id })}
                  className="flex flex-col items-center gap-1 text-center text-[11px] leading-tight text-ink/70"
                >
                  <span
                    className={`block h-9 w-full rounded-lg ${on ? "border-2 border-forest" : "m-px border border-hairline hover:border-ink/30"}`}
                    style={{ background: `linear-gradient(180deg, ${x.swatch[0]}, ${x.swatch[1]})` }}
                  />
                  {x.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {SCENE_GROUPS.map((g) => {
        const items = SCENES.filter((x) => x.place === g.place);
        const all = open[g.place];
        const shown = all ? items : previewOf(items, PREVIEW.scene, (x) => x.id === design.scene);
        return (
          <div key={g.place} className="mt-1 flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-medium text-ink">
                {g.label} <span className="font-normal text-ink/50">· {g.hint}</span>
              </p>
              <button
                type="button"
                aria-expanded={all}
                onClick={() => setOpen((o) => ({ ...o, [g.place]: !all }))}
                className="shrink-0 text-[13px] font-medium text-forest hover:underline"
              >
                {all ? "Show fewer" : `See all ${items.length} →`}
              </button>
            </div>
            <div role="group" aria-label={g.label} className="grid grid-cols-3 gap-2">
              {shown.map((x) => tile(x.id, x.id, x.label))}
            </div>
            {"note" in g && <p className="text-[12px] leading-normal text-ink/50">{g.note}</p>}
          </div>
        );
      })}
    </div>
  );
}


/** A small drawing of each hero layout, in the current theme's colours. */
function HeroThumb({
  layout,
  bg,
  surface,
  photo,
  ink,
  accent,
}: {
  layout: HeroLayoutId;
  bg: string;
  surface: string;
  photo: string;
  ink: string;
  accent: string;
}) {
  const lines = (
    <>
      <span className="block h-1.5 w-10 rounded-full" style={{ background: ink }} />
      <span className="mt-1 block h-1 w-6 rounded-full opacity-60" style={{ background: ink }} />
    </>
  );
  return (
    <span className="relative block h-[72px]" style={{ background: bg }} aria-hidden="true">
      {layout === "full" && (
        <>
          <span className="absolute inset-x-0 top-0 h-[44px]" style={{ background: photo }} />
          <span
            className="absolute left-1/2 top-[30px] flex w-[62%] -translate-x-1/2 flex-col items-center rounded-sm py-2"
            style={{ background: surface }}
          >
            {lines}
          </span>
        </>
      )}
      {layout === "split" && (
        <>
          <span className="absolute inset-y-0 left-0 w-1/2" style={{ background: photo }} />
          <span className="absolute inset-y-0 right-0 flex w-1/2 flex-col items-center justify-center">{lines}</span>
        </>
      )}
      {layout === "framed" && (
        <span className="flex h-full flex-col items-center justify-center gap-1.5">
          <span
            className="block h-[34px] w-[26px] rounded-t-full border p-[2px]"
            style={{ borderColor: accent }}
          >
            <span className="block h-full w-full rounded-t-full" style={{ background: photo }} />
          </span>
          <span className="flex flex-col items-center">{lines}</span>
        </span>
      )}
      {layout === "collage" && (
        <span className="absolute inset-0 flex items-center gap-2 px-2">
          <span className="relative block h-[48px] w-[46%]">
            <span className="absolute inset-[4px_6px_4px_4px]" style={{ background: photo }} />
            <span className="absolute bottom-0 right-0 h-[20px] w-[16px] rotate-6 border-2" style={{ background: photo, borderColor: surface }} />
            <span className="absolute left-0 top-0 h-[16px] w-[13px] -rotate-6 border-2" style={{ background: photo, borderColor: surface }} />
          </span>
          <span className="flex flex-1 flex-col items-center">{lines}</span>
        </span>
      )}
      {layout === "slideshow" && (
        <span className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: photo }}>
          <span className="block h-1.5 w-10 rounded-full bg-white" />
          <span className="mt-1 block h-1 w-6 rounded-full bg-white/70" />
          <span className="absolute bottom-1.5 flex gap-1">
            {[1, 0.5, 0.5].map((o, i) => <span key={i} className="block h-1 w-1 rounded-full bg-white" style={{ opacity: o }} />)}
          </span>
        </span>
      )}
      {layout === "invitation" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-[58px] w-[46%] flex-col items-center justify-center gap-[3px] shadow-sm" style={{ background: surface, outline: `1px solid ${accent}`, outlineOffset: "-3px" }}>
            <span className="block h-[2px] w-6 rounded-full opacity-50" style={{ background: ink }} />
            <span className="block h-1.5 w-9 rounded-full" style={{ background: ink }} />
            <span className="block h-[2px] w-7 rounded-full opacity-50" style={{ background: ink }} />
            <span className="block h-[2px] w-5 rounded-full opacity-50" style={{ background: ink }} />
          </span>
        </span>
      )}
      {layout === "monogram" && (
        <span className="absolute inset-[6px] flex flex-col items-center justify-center gap-1.5 border" style={{ borderColor: accent }}>
          <span className="block h-[22px] w-[18px] rounded-full border" style={{ borderColor: accent }} />
          <span className="flex flex-col items-center">{lines}</span>
        </span>
      )}
      {layout === "card" && (
        <span className="absolute inset-0 flex items-center justify-center" style={{ background: accent }}>
          <span className="flex w-[64%] flex-col items-center border-2 py-2.5" style={{ background: surface, borderColor: surface, outline: `1px solid ${accent}`, outlineOffset: "-4px" }}>
            {lines}
          </span>
        </span>
      )}
      {layout === "poster" && (
        <span className="flex h-full flex-col items-center justify-center gap-1">
          <span className="block h-3.5 w-[72%] rounded-sm" style={{ background: ink }} />
          <span className="block h-3.5 w-[56%] rounded-sm" style={{ background: ink }} />
        </span>
      )}
      {layout === "text" && (
        <span className="flex h-full flex-col items-center justify-center">
          <span className="block h-2 w-14 rounded-full" style={{ background: ink }} />
          <span className="mt-1.5 block h-1 w-8 rounded-full opacity-60" style={{ background: ink }} />
        </span>
      )}
    </span>
  );
}

export function SectionsTab({
  design,
  onChange,
  sitePanel,
  info,
  checklist,
}: {
  design: SiteDesign;
  onChange: Change;
  sitePanel: ReactNode;
  info: Partial<Record<SectionKey, SectionInfo>>;
  checklist: ChecklistItem[];
}) {
  const [open, setOpen] = useState<SectionKey | null>(null);
  const [adding, startAdding] = useTransition();
  const [blockError, setBlockError] = useState<string | null>(null);
  // A block deleted elsewhere (or one just added, before the page refreshes
  // with its details) has no row info; it's left off the list.
  const sections = design.sections.filter((x) => info[x.id]);

  function add(kind: SiteBlock["kind"]) {
    setBlockError(null);
    startAdding(async () => {
      const result = await createSiteBlock(kind).catch(() => ({ error: "Couldn't add it — check your connection.", block: undefined }));
      if (result.error || !result.block) {
        setBlockError(result.error ?? "Couldn't add it.");
        return;
      }
      // New blocks go first, where they're easy to find; drag to move them.
      const key = blockKey(result.block.id);
      onChange({ sections: [{ id: key, hidden: false }, ...design.sections] });
      setOpen(key);
    });
  }

  function remove(key: SectionKey) {
    const id = blockIdOf(key);
    if (!id || !confirm("Delete this section? Its words and photo will be gone.")) return;
    startAdding(async () => {
      const result = await deleteSiteBlock(id).catch(() => ({ error: "Couldn't delete it — check your connection." }));
      if (result.error) {
        setBlockError(result.error);
        return;
      }
      onChange({ sections: design.sections.filter((x) => x.id !== key) });
    });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= sections.length || from === to) return;
    // Positions are in the visible list; map them back onto the full one.
    const fromKey = sections[from].id;
    const toKey = sections[to].id;
    const next = design.sections.filter((x) => x.id !== fromKey);
    const at = next.findIndex((x) => x.id === toKey) + (to > from ? 1 : 0);
    next.splice(at, 0, design.sections.find((x) => x.id === fromKey)!);
    onChange({ sections: next });
  }

  function toggle(id: SectionKey) {
    onChange({ sections: design.sections.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x)) });
  }

  return (
    <>
      {sitePanel}
      <Checklist items={checklist} />

      <div className="flex flex-col gap-2">
        <PanelLabel>Sections</PanelLabel>
        <p className="text-[13px] leading-normal text-ink/60">
          Drag to reorder. On a computer, sections keep this order within their column —
          what guests act on on the left, the details beside it.
        </p>
        <p className="text-[13px] leading-normal text-ink/60">
          Order and show/hide wait for Publish. What you write or upload inside a
          section saves straight to your site.
        </p>
        <SortableList
          ids={sections.map((x) => x.id)}
          names={Object.fromEntries(sections.map((x) => [x.id, info[x.id]?.name ?? NAMES[x.id]]))}
          onMove={move}
          renderRow={(id, handle) => {
            const section = sections.find((x) => x.id === id)!;
            const row = info[id]!;
            const name = row.name ?? NAMES[id];
            const isBlock = blockIdOf(id) !== null;
            const shown = !section.hidden;
            const expandable = Boolean(row.editor || row.link || row.layout);
            return (
              <div className="rounded-xl border border-hairline bg-card">
                <div className="flex items-center gap-2 py-2.5 pl-1.5 pr-3">
                  {handle}
                  <button
                    type="button"
                    onClick={() => expandable && setOpen(open === id ? null : id)}
                    aria-expanded={expandable ? open === id : undefined}
                    className={`flex min-w-0 flex-1 items-center gap-2 text-left ${expandable ? "" : "cursor-default"}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[15px] font-medium ${shown ? "text-ink" : "text-ink/45"}`}>
                        {name}
                        <span className="ml-2 text-[11px] font-normal text-ink/40">
                          {sectionColumn(id) === "main" ? "Main" : "Side"}
                        </span>
                      </span>
                      <span
                        className={`block truncate text-xs ${
                          !shown ? "text-ink/50" : row.warn ? "text-[#8a5a00]" : "text-ink/60"
                        }`}
                      >
                        {shown ? row.status : "Hidden from guests"}
                      </span>
                    </span>
                    {expandable && (
                      <ChevronDownIcon
                        className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${open === id ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  <Switch on={shown} label={`Show ${name}`} onToggle={() => toggle(id)} />
                </div>
                {open === id && expandable && (
                  <div className="border-t border-hairline px-4 pb-5 pt-4">
                    {row.layout && (
                      <LayoutPicker
                        section={row.layout}
                        value={design.layouts[row.layout]}
                        auto={
                          row.layout === "weekend"
                            ? design.pageStyle === "storybook" ? "timeline" : "cards"
                            : row.layout === "photos"
                              ? design.pageStyle === "storybook" ? "scrapbook" : "spread"
                              : null
                        }
                        onPick={(id) => onChange({ layouts: { ...design.layouts, [row.layout!]: id } })}
                      />
                    )}
                    {row.link && (
                      <Link href={row.link.href} className="text-sm font-medium text-forest underline">
                        {row.link.label}
                      </Link>
                    )}
                    {row.editor}
                    {isBlock && (
                      <button
                        type="button"
                        onClick={() => remove(id)}
                        disabled={adding}
                        className="mt-4 text-sm text-red-700 underline disabled:opacity-60"
                      >
                        Delete this section
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <PanelLabel>Add a section</PanelLabel>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["story", "Story", "A few paragraphs"],
              ["photo", "Photo", "One big picture"],
              ["quote", "Quote", "A line you love"],
              ["video", "Video", "YouTube or Vimeo"],
              ["link", "Link", "A button to anywhere"],
            ] as const
          ).map(([kind, label, help]) => (
            <button
              key={kind}
              type="button"
              onClick={() => add(kind)}
              disabled={adding}
              className="flex flex-col items-start rounded-xl border border-dashed border-ink/30 bg-card px-3 py-2.5 text-left hover:border-forest disabled:opacity-60"
            >
              <span className="text-sm font-medium text-ink">+ {label}</span>
              <span className="text-[11px] text-ink/60">{help}</span>
            </button>
          ))}
        </div>
        {blockError && <p className="text-sm text-red-700">{blockError}</p>}
        <p className="text-[13px] leading-normal text-ink/60">
          Guests see a new section once it has something in it and you publish.
        </p>
      </div>
    </>
  );
}

/**
 * The layouts for one section, each a small drawing of its arrangement. The
 * schedule's unpicked state shows the page style's choice as picked.
 */
function LayoutPicker({
  section,
  value,
  auto,
  onPick,
}: {
  section: LayoutSection;
  value: string | null;
  auto: string | null;
  onPick: (id: string) => void;
}) {
  const current = value ?? auto;
  return (
    <div className="mb-4 flex flex-col gap-2">
      <span className="text-[13px] font-medium text-ink">Layout</span>
      <div className="grid grid-cols-3 gap-2">
        {SECTION_LAYOUTS[section].map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => onPick(x.id)}
            aria-pressed={current === x.id}
            title={x.help}
            className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs ${
              current === x.id ? "border-[#2243B6] bg-[#2243B6]/5 font-medium text-ink" : "border-hairline text-ink/70 hover:border-ink/40"
            }`}
          >
            <LayoutThumb section={section} id={x.id} />
            {x.label}
          </button>
        ))}
      </div>
      {section === "photos" && (
        <p className="text-[12px] leading-normal text-ink/60">How your gallery photos sit on the page.</p>
      )}
      {section === "story" && (
        <p className="text-[12px] leading-normal text-ink/60">
          For every Story section. Leave a blank line between paragraphs; start one with a year
          (&ldquo;2019 · How we met&rdquo;) for the timeline. Photos come from your Photos section.
        </p>
      )}
    </div>
  );
}

function LayoutThumb({ section, id }: { section: LayoutSection; id: string }) {
  const line = (w: string, key?: number) => <span key={key} className="block h-[3px] rounded-full bg-ink/35" style={{ width: w }} />;
  const photo = (cls: string) => <span className={`block bg-[#dde2d0] ${cls}`} />;
  const box = "flex h-12 w-full items-center justify-center gap-1.5 overflow-hidden rounded bg-parchment p-1.5";
  const key = `${section}:${id}`;
  if (key === "story:editorial")
    return <span className={`${box} flex-col !gap-1`}>{photo("h-3.5 w-full rounded-sm")}{line("70%")}{line("70%")}{line("50%")}</span>;
  if (key === "story:timeline" || key === "weekend:timeline")
    return (
      <span className={box}>
        <span className="flex flex-1 flex-col items-end gap-1">{line("80%")}{line("60%")}</span>
        <span className="block h-full w-px bg-[var(--site-accent,#4f6f45)]" />
        <span className="flex flex-1 flex-col gap-1">{line("60%")}{line("80%")}</span>
      </span>
    );
  if (key === "story:alternating")
    return (
      <span className={`${box} flex-col !gap-1`}>
        <span className="flex w-full items-center gap-1">{photo("h-4 w-1/2 rounded-t-full")}{line("40%")}</span>
        <span className="flex w-full items-center justify-end gap-1">{line("40%")}{photo("h-4 w-1/2 rounded-t-full")}</span>
      </span>
    );
  if (key === "rsvp:card")
    return <span className={box}><span className="flex h-full w-3/5 flex-col items-center justify-center gap-1 rounded-sm bg-white shadow-sm">{line("60%")}{line("40%")}</span></span>;
  if (key === "rsvp:band")
    return (
      <span className={box}>
        <span className="flex h-full w-full items-center gap-1 rounded-sm bg-[#4f6f45] px-1">
          <span className="flex flex-1 flex-col gap-1"><span className="block h-[3px] w-3/4 rounded-full bg-white/80" /></span>
          <span className="block h-5 w-1/2 rounded-sm bg-white" />
        </span>
      </span>
    );
  if (key === "rsvp:split")
    return <span className={`${box} !gap-0 !p-0`}>{photo("h-full w-1/2")}<span className="flex h-full w-1/2 flex-col justify-center gap-1 bg-white px-1">{line("80%")}{line("60%")}</span></span>;
  if (key === "photos:spread")
    return <span className={`${box} !grid grid-cols-3 grid-rows-2 !gap-0.5`}>{photo("col-span-2 row-span-2 h-full rounded-sm")}{photo("h-full rounded-sm")}{photo("h-full rounded-sm")}</span>;
  if (key === "photos:masonry")
    return (
      <span className={`${box} !items-start`}>
        {[["h-5", "h-3"], ["h-3", "h-5"], ["h-6", "h-2"]].map((col, i) => (
          <span key={i} className="flex flex-1 flex-col gap-0.5">{col.map((h, j) => <span key={j}>{photo(`${h} w-full rounded-sm`)}</span>)}</span>
        ))}
      </span>
    );
  if (key === "photos:filmstrip")
    return (
      <span className={box}>
        <span className="flex h-7 w-full items-center gap-0.5 border-y-[3px] border-dotted border-[#f4f1ea] bg-[#262421] px-0.5 outline outline-2 outline-[#262421]">
          {[0, 1, 2].map((i) => <span key={i} className="block h-4 flex-1 bg-[#dde2d0]" />)}
        </span>
      </span>
    );
  if (key === "photos:scrapbook")
    return (
      <span className={box}>
        {["-rotate-6", "rotate-3", "-rotate-2"].map((r, i) => (
          <span key={i} className={`block bg-white p-0.5 pb-1.5 shadow-sm ${r}`}>{photo("h-4 w-4")}</span>
        ))}
      </span>
    );
  if (key === "photos:line")
    return (
      <span className={`${box} relative !items-start pt-2`}>
        <svg className="absolute inset-x-1 top-1 h-3 w-[calc(100%-0.5rem)]" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 1 Q50 12 100 1" fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
        {["-rotate-3 mt-1", "rotate-2 mt-2.5", "-rotate-2 mt-1"].map((r, i) => (
          <span key={i} className={`block bg-white p-0.5 pb-1.5 shadow-sm ${r}`}>{photo("h-4 w-4")}</span>
        ))}
      </span>
    );
  if (key === "weekend:cards")
    return <span className={box}>{[0, 1, 2].map((i) => <span key={i} className="flex h-full flex-1 flex-col gap-1 rounded-sm bg-white p-1 shadow-sm">{line("80%")}{line("60%")}</span>)}</span>;
  return <span className={`${box} flex-col !items-stretch !gap-1.5`}>{[0, 1, 2].map((i) => <span key={i} className="flex gap-1">{line("25%")}{line("45%")}</span>)}</span>;
}

function Checklist({ items }: { items: ChecklistItem[] }) {
  const left = items.filter((x) => !x.done);
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-hairline bg-parchment p-4">
      <div className="flex items-baseline justify-between gap-3">
        <PanelLabel>Before you share</PanelLabel>
        <span className="text-xs text-ink/60">
          {items.length - left.length} of {items.length} done
        </span>
      </div>
      {left.length === 0 ? (
        <p className="text-sm text-ink/70">All set — your site is ready to send.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((x) => (
            <li key={x.label} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  x.done ? "bg-forest text-parchment" : "border border-ink/30"
                }`}
                aria-hidden="true"
              >
                {x.done && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                )}
              </span>
              <span className={`flex-1 ${x.done ? "text-ink/50 line-through" : "text-ink"}`}>
                {x.label}
                {!x.done && x.href && (
                  <>
                    {" "}
                    <Link href={x.href} className="whitespace-nowrap text-forest underline">
                      {x.action ?? "Fix"}
                    </Link>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        on ? "justify-end bg-forest" : "justify-start bg-ink/25"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-card shadow-sm" />
    </button>
  );
}

/**
 * A list reordered by dragging a handle -- pointer events rather than HTML
 * drag-and-drop, which doesn't work with a finger. The handle also takes
 * arrow keys, so reordering doesn't need a mouse at all.
 */
function SortableList({
  ids,
  onMove,
  renderRow,
  names,
}: {
  ids: SectionKey[];
  onMove: (from: number, to: number) => void;
  renderRow: (id: SectionKey, handle: ReactNode) => ReactNode;
  /** Labels for the handles' screen-reader names. */
  names: Partial<Record<SectionKey, string>>;
}) {
  const rowRefs = useRef(new Map<SectionKey, HTMLLIElement>());
  const [dragging, setDragging] = useState<{ id: SectionKey; offset: number } | null>(null);
  const start = useRef({ y: 0, index: 0 });

  function targetIndex(clientY: number, from: number) {
    // The slot whose midpoint the pointer has passed.
    let to = from;
    ids.forEach((id, i) => {
      const el = rowRefs.current.get(id);
      if (!el || i === from) return;
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      if (i < from && clientY < mid) to = Math.min(to, i);
      if (i > from && clientY > mid) to = Math.max(to, i);
    });
    return to;
  }

  return (
    <ul className="flex flex-col gap-2">
      {ids.map((id, index) => {
        const isDragging = dragging?.id === id;
        const handle = (
          <button
            type="button"
            aria-label={`Move ${names[id] ?? "section"} (use arrow keys)`}
            className="flex h-10 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-ink/40 hover:text-ink active:cursor-grabbing"
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                onMove(index, index - 1);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                onMove(index, index + 1);
              }
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              start.current = { y: e.clientY, index };
              setDragging({ id, offset: 0 });
            }}
            onPointerMove={(e) => {
              if (!isDragging) return;
              const to = targetIndex(e.clientY, index);
              if (to !== index) {
                // Move now, and re-base the offset so the row stays under the finger.
                const el = rowRefs.current.get(ids[to]);
                const shift = el ? el.getBoundingClientRect().top - rowRefs.current.get(id)!.getBoundingClientRect().top : 0;
                start.current = { y: start.current.y + shift, index: to };
                onMove(index, to);
              }
              setDragging({ id, offset: e.clientY - start.current.y });
            }}
            onPointerUp={() => setDragging(null)}
            onPointerCancel={() => setDragging(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="9" cy="6" r="1.6" />
              <circle cx="15" cy="6" r="1.6" />
              <circle cx="9" cy="12" r="1.6" />
              <circle cx="15" cy="12" r="1.6" />
              <circle cx="9" cy="18" r="1.6" />
              <circle cx="15" cy="18" r="1.6" />
            </svg>
          </button>
        );
        return (
          <li
            key={id}
            ref={(el) => {
              if (el) rowRefs.current.set(id, el);
              else rowRefs.current.delete(id);
            }}
            className={isDragging ? "relative z-10 shadow-lg" : ""}
            style={isDragging ? { transform: `translateY(${dragging.offset}px)` } : undefined}
          >
            {renderRow(id, handle)}
          </li>
        );
      })}
    </ul>
  );
}

function Pills<T extends string>({
  options,
  value,
  onPick,
  label,
}: {
  options: readonly (readonly [T, string])[];
  value: T | null;
  onPick: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onPick(v)}
          className={`h-10 flex-1 whitespace-nowrap rounded-full px-3 text-sm ${
            value === v ? "bg-forest font-semibold text-parchment" : "border border-hairline bg-card text-ink hover:border-ink/30"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

/** How the names at the top are joined and set (Style › Your names). */
function NamesStyle({ design, onChange, script }: { design: SiteDesign; onChange: Change; script: boolean }) {
  const set = (patch: Partial<SiteDesign["names"]>) => onChange({ names: { ...design.names, ...patch } });
  return (
    <div className="flex flex-col gap-3">
      <PanelLabel>Your names</PanelLabel>
      <Pills
        label="Joined by"
        options={[
          ["&", "Ana & Sam"],
          ["and", "Ana and Sam"],
        ]}
        value={design.names.joiner}
        onPick={(joiner) => set({ joiner })}
      />
      <Pills
        label="Arrangement"
        options={[
          ["line", "One line"],
          ["stacked", "Stacked"],
        ]}
        value={design.names.stacked ? "stacked" : "line"}
        onPick={(v) => set({ stacked: v === "stacked" })}
      />
      <Pills
        label="Letters"
        options={[
          ["typed", "As typed"],
          ["capitals", "CAPITALS"],
        ]}
        value={design.names.capitals ? "capitals" : "typed"}
        onPick={(v) => set({ capitals: v === "capitals" })}
      />
      {design.names.capitals && script && (
        <p className="-mt-1 text-[13px] leading-normal text-ink/60">
          Your names are in a script font, which doesn&apos;t work in capitals, so they stay as typed.
        </p>
      )}
    </div>
  );
}

const EXTRAS = [
  { key: "shimmer", label: "Gold shimmer on your names", help: "A sweep of gold once the page opens" },
  { key: "confetti", label: "Celebration on RSVP", help: "A burst when a guest says yes, in your falling shape" },
] as const;

export function MotionTab({
  design,
  onChange,
  onReplay,
  onTryConfetti,
}: {
  design: SiteDesign;
  onChange: Change;
  onReplay: () => void;
  onTryConfetti: () => void;
}) {
  const motion = design.motion;
  const preset = motionPreset(motion);
  const set = (patch: Partial<Motion>) => onChange({ motion: { ...motion, ...patch } });

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <PanelLabel>Overall</PanelLabel>
          <span className="text-xs text-ink/60">
            {preset === "custom" ? "Custom" : "Pick one, then fine-tune below"}
          </span>
        </div>
        <Pills
          label="Overall motion"
          options={[
            ["none", "None"],
            ["subtle", "Subtle"],
            ["lively", "Lively"],
          ]}
          value={preset === "custom" ? null : preset}
          onPick={(p) => onChange({ motion: { ...MOTION_PRESETS[p], speed: motion.speed } })}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <PanelLabel>When the page opens</PanelLabel>
        {OPENINGS.map((o) => {
          const selected = motion.opening === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={selected}
              onClick={() => set({ opening: o.id })}
              className={`rounded-xl bg-card px-4 py-3 text-left ${selected ? SELECTED : UNSELECTED}`}
            >
              <span className="block text-[15px] font-medium text-ink">{o.label}</span>
              <span className="block text-xs text-ink/60">{o.help}</span>
            </button>
          );
        })}
        {motion.opening === "envelope" && <EnvelopeOptions design={design} onChange={onChange} />}
      </div>

      <div className="flex flex-col gap-2.5">
        <PanelLabel>As guests scroll</PanelLabel>
        <Pills
          label="As guests scroll"
          options={[
            ["none", "None"],
            ["fade", "Fade up"],
            ["slide", "Slide in"],
            ["zoom", "Zoom"],
          ]}
          value={motion.scroll}
          onPick={(v) => set({ scroll: v })}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <PanelLabel>Main photo</PanelLabel>
        <Pills
          label="Main photo"
          options={[
            ["still", "Still"],
            ["zoom", "Slow zoom"],
            ["pan", "Slow pan"],
          ]}
          value={motion.photo}
          onPick={(v) => set({ photo: v })}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <PanelLabel>Falling over the page</PanelLabel>
        <div role="group" aria-label="Falling over the page" className="grid grid-cols-3 gap-2 lg:grid-cols-5">
          {FALLING.map((f) => {
            const selected = motion.falling === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={selected}
                onClick={() => set({ falling: f.id })}
                className={`flex flex-col items-center gap-1.5 rounded-xl bg-card px-1 py-2.5 ${selected ? SELECTED : UNSELECTED}`}
              >
                <span
                  className="flex h-7 items-center justify-center gap-1 text-forest"
                  style={{ "--site-accent": "var(--color-forest)" } as CSSProperties}
                  aria-hidden="true"
                >
                  {f.id === "none" ? (
                    <span className="text-sm text-ink/40">—</span>
                  ) : (
                    <>
                      <Shape kind={f.id} i={1} size={18} />
                      <Shape kind={f.id} i={0} size={14} />
                    </>
                  )}
                </span>
                <span className="text-center text-xs leading-tight text-ink">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <PanelLabel>Countdown</PanelLabel>
        <Pills
          label="Countdown"
          options={[
            ["off", "Days only"],
            ["tick", "Ticking"],
            ["board", "Flip board"],
          ]}
          value={!motion.ticking ? "off" : motion.flipboard ? "board" : "tick"}
          onPick={(v) => set({ ticking: v !== "off", flipboard: v === "board" })}
        />
      </div>

      <div className="flex flex-col gap-1">
        <PanelLabel>Extras</PanelLabel>
        {EXTRAS.map((x) => (
          <div key={x.key} className="flex items-center gap-3 border-b border-hairline py-3 last:border-b-0">
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] text-ink">{x.label}</span>
              <span className="block text-xs text-ink/60">
                {x.help}
                {x.key === "confetti" && motion.confetti && (
                  <>
                    {" · "}
                    <button type="button" onClick={onTryConfetti} className="text-forest underline">
                      Try it
                    </button>
                  </>
                )}
              </span>
            </span>
            <Switch on={motion[x.key]} label={x.label} onToggle={() => set({ [x.key]: !motion[x.key] })} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        <PanelLabel>Speed</PanelLabel>
        <Pills
          label="Speed"
          options={[
            ["slow", "Slow"],
            ["normal", "Normal"],
            ["fast", "Fast"],
          ]}
          value={motion.speed}
          onPick={(v) => set({ speed: v })}
        />
      </div>

      <p className="text-[13px] leading-normal text-ink/60">
        Guests who&apos;ve asked their phone or computer for less motion always get the still
        version.{" "}
        <button type="button" onClick={onReplay} className="text-forest underline">
          Replay in the preview
        </button>
      </p>
    </>
  );
}

/**
 * The monogram's letters (Style › Monogram): their face, which initial comes
 * first, and a date under the frame -- and the finished mark to download for
 * invitations, signs and the like, in the site's colours.
 */
function MonogramLetters({
  design,
  onChange,
  names,
  initials,
  weddingDate,
}: {
  design: SiteDesign;
  onChange: Change;
  names: [string, string];
  initials: [string, string];
  weddingDate: string | null;
}) {
  const { theme, accent, onAccent } = resolveDesign(design);
  const mono = design.monogram;
  const set = (patch: Partial<SiteDesign["monogram"]>) => onChange({ monogram: { ...mono, ...patch } });
  const [a, b] = initials.map((n) => n.trim()[0]?.toUpperCase() ?? "");
  const face = fontById(mono.font)?.css ?? theme.display;
  const date = monogramDate(mono.date, weddingDate);
  // The frame drawn large off-screen, for the download to copy.
  const drawn = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState<"png" | "svg" | null>(null);
  const [failed, setFailed] = useState<"font" | "other" | null>(null);
  const canDownload = design.ornament !== "rule" && Boolean(a || b);

  async function save(format: "png" | "svg") {
    const svg = drawn.current?.querySelector("svg");
    if (!svg) return;
    setSaving(format);
    setFailed(null);
    try {
      const name = `monogram-${[a, b].filter(Boolean).join("").toLowerCase() || "ours"}`;
      await downloadMonogram(svg, { accent, onAccent, bg: theme.bg, face }, { format, name, date });
    } catch (e) {
      setFailed(e instanceof MonogramFontError ? "font" : "other");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <PanelLabel>Monogram letters</PanelLabel>
      <div className="grid grid-cols-4 gap-2">
        {MONOGRAM_FONTS.map((id) => {
          const font = fontById(id);
          const selected = mono.font === id;
          return (
            <button
              key={id ?? "names"}
              type="button"
              aria-pressed={selected}
              aria-label={font ? font.label : "Same as your names"}
              title={font ? font.label : "Same as your names"}
              onClick={() => set({ font: id })}
              className={`flex h-14 flex-col items-center justify-center rounded-xl ${selected ? SELECTED : UNSELECTED}`}
              style={{ background: theme.bg, color: accent }}
            >
              <span className="text-[22px] leading-none" style={{ fontFamily: font?.css ?? theme.display }}>
                {a}
                {b}
              </span>
              {!font && <span className="mt-1 text-[10px] text-ink/60">Names</span>}
            </button>
          );
        })}
      </div>

      {names[0].trim() && names[1].trim() && (
        <Pills
          label="Which initial comes first"
          options={[
            ["ab", `${names[0].trim()[0]?.toUpperCase()} & ${names[1].trim()[0]?.toUpperCase()}`],
            ["ba", `${names[1].trim()[0]?.toUpperCase()} & ${names[0].trim()[0]?.toUpperCase()}`],
          ]}
          value={mono.swap ? "ba" : "ab"}
          onPick={(v) => set({ swap: v === "ba" })}
        />
      )}

      <Pills
        label="Date under the monogram"
        options={MONOGRAM_DATES.map((d) => [d.id, d.label] as const)}
        value={mono.date}
        onPick={(v) => set({ date: v })}
      />
      {mono.date !== "none" && !weddingDate && (
        <p className="-mt-1 text-[13px] leading-normal text-ink/60">Add your wedding date in your details and it shows here.</p>
      )}

      {canDownload && (
        <>
          <div className="flex gap-2">
            {(["png", "svg"] as const).map((format) => (
              <button
                key={format}
                type="button"
                disabled={saving !== null}
                onClick={() => save(format)}
                className="flex h-11 flex-1 items-center justify-center rounded-xl border border-hairline bg-card text-sm font-medium text-ink hover:border-ink/30 disabled:opacity-60"
              >
                {saving === format ? "Preparing…" : `Download ${format.toUpperCase()}`}
              </button>
            ))}
          </div>
          <p className="-mt-1 text-[13px] leading-normal text-ink/60">
            {failed === "font"
              ? "Couldn't fetch your monogram's font, so nothing was saved. Check your connection and try again."
              : failed
                ? "That didn't save. Try again, or try the other format."
              : "Your monogram in your colours, for invitations, signs, napkins or the cake. PNG for printers; SVG stays sharp at any size."}
          </p>
          <div
            ref={drawn}
            aria-hidden="true"
            className="pointer-events-none fixed -left-[9999px] top-0"
            style={{ "--site-accent": accent, "--site-on-accent": onAccent, "--font-monogram": face } as CSSProperties}
          >
            <SiteOrnament kind={design.ornament} first={initials[0]} second={initials[1]} size="lg" />
          </div>
        </>
      )}
      {!canDownload && (
        <p className="text-[13px] leading-normal text-ink/60">
          {a || b
            ? "Pick a framed monogram above (any but Simple) to download it for invitations and signs."
            : "Add your names in your wedding details to download your monogram."}
        </p>
      )}
    </div>
  );
}

/** The envelope opening's seal colour, flap lining and tap-to-open (site-motion.tsx, Envelope). */
function EnvelopeOptions({ design, onChange }: { design: SiteDesign; onChange: Change }) {
  const { theme, accent, accent2 } = resolveDesign(design);
  const env = design.envelope;
  const set = (patch: Partial<SiteDesign["envelope"]>) => onChange({ envelope: { ...env, ...patch } });
  const vars = { "--site-accent": accent, "--site-accent-2": accent2, "--color-ink": theme.ink } as CSSProperties;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-parchment p-3">
      <span className="text-[13px] font-medium text-ink">Wax seal</span>
      <div role="group" aria-label="Wax seal colour" className="flex flex-wrap gap-2">
        {SEALS.map((x) => (
          <button
            key={x.id}
            type="button"
            title={x.label}
            aria-label={`${x.label} seal`}
            aria-pressed={env.seal === x.id}
            onClick={() => set({ seal: x.id })}
            className={`h-9 w-9 rounded-full ${env.seal === x.id ? "ring-2 ring-forest ring-offset-2" : "border border-black/10"}`}
            style={{ background: x.hex ?? accent }}
          />
        ))}
      </div>
      <span className="text-[13px] font-medium text-ink">Lining</span>
      <div role="group" aria-label="Envelope lining" className="grid grid-cols-4 gap-2">
        {ENVELOPE_LINERS.map((id) => {
          const layers = backgroundLayers({ ...NO_BACKGROUND, pattern: id });
          return (
            <button
              key={id}
              type="button"
              aria-pressed={env.liner === id}
              onClick={() => set({ liner: id })}
              className="flex flex-col items-center gap-1 text-[11px] capitalize text-ink/70"
            >
              <span
                className={`block aspect-square w-full rounded-lg ${env.liner === id ? SELECTED : UNSELECTED}`}
                style={{
                  ...vars,
                  backgroundColor: `color-mix(in srgb, ${accent} 14%, ${theme.surface})`,
                  backgroundImage: layers.image,
                  backgroundSize: layers.size,
                }}
              />
              {id === "none" ? "Plain" : id}
            </button>
          );
        })}
      </div>
      <label className="flex items-center gap-2.5 text-[14px] text-ink">
        <input
          type="checkbox"
          checked={env.tap}
          onChange={(e) => set({ tap: e.target.checked })}
          className="h-5 w-5 accent-[#2243B6]"
        />
        Wait for a tap to open
      </label>
      <p className="-mt-1.5 text-[12px] leading-normal text-ink/60">
        Guests break the seal themselves. It opens on its own after a few seconds if they don&apos;t.
      </p>
    </div>
  );
}
