"use client";

import Link from "next/link";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { createSiteBlock, deleteSiteBlock } from "./block-actions";
import { ChevronDownIcon } from "@/components/icons";
import { SiteOrnament } from "@/components/site-ornament";
import {
  ART_HEROES,
  ART_PLACEMENTS,
  BODY_FONTS,
  FONTS,
  SITE_ART,
  FONT_PAIRINGS,
  HERO_LAYOUTS,
  ORNAMENTS,
  PAGE_STYLES,
  PHOTO_HEROES,
  SCENES,
  sceneById,
  fontById,
  MOTION_PRESETS,
  OPENINGS,
  motionPreset,
  type Motion,
  SITE_SECTIONS,
  resolveDesign,
  themeById,
  type HeroLayoutId,
  blockIdOf,
  blockKey,
  sectionColumn,
  type SectionKey,
  type SiteDesign,
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

export function StyleTab({
  design,
  onChange,
  hasPhoto,
  names,
}: {
  design: SiteDesign;
  onChange: Change;
  hasPhoto: boolean;
  /** The couple's names, so the monograms show their own initials. */
  names: [string, string];
}) {
  const base = themeById(design.theme);
  const { theme, accent, onAccent } = resolveDesign(design);
  const headingId = design.fontDisplay ?? fontByCssId(theme.display);
  const bodyId = design.fontBody ?? fontByCssId(theme.body);
  const scripts = FONTS.filter((f) => f.kind === "script");
  const others = FONTS.filter((f) => f.kind !== "script");
  const needsPhoto = PHOTO_HEROES.includes(design.hero);

  return (
    <>
      <div className="flex flex-col gap-3">
        <PanelLabel>Font pairs</PanelLabel>
        <div className="grid grid-cols-2 gap-2">
          {FONT_PAIRINGS.map((f) => {
            const display = fontById(f.display)?.css ?? base.display;
            const body = fontById(f.body)?.css ?? base.body;
            const selected = design.fonts === f.id && !design.fontDisplay && !design.fontBody;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ fonts: f.id, fontDisplay: null, fontBody: null })}
                className={`flex flex-col gap-0.5 rounded-xl bg-card px-3 py-2.5 text-left ${selected ? SELECTED : UNSELECTED}`}
              >
                <span className="truncate text-[20px] leading-tight text-ink" style={{ fontFamily: display }}>
                  {f.id === "theme" ? base.name : f.label.split(" · ")[0]}
                </span>
                <span className="truncate text-[11px] text-ink/60" style={{ fontFamily: body }}>
                  {f.id === "theme" ? "Theme default" : `with ${f.label.split(" · ")[1]}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <PanelLabel>Headings &amp; names</PanelLabel>
        <FontGrid fonts={others} selected={headingId} onPick={(id) => onChange({ fontDisplay: id })} />
        <p className="text-xs font-medium text-ink/60">Script</p>
        <FontGrid fonts={scripts} selected={headingId} onPick={(id) => onChange({ fontDisplay: id })} />
      </div>

      <label className="flex flex-col gap-2">
        <PanelLabel>Body text</PanelLabel>
        <select
          value={bodyId ?? ""}
          onChange={(e) => onChange({ fontBody: e.target.value as SiteDesign["fontBody"] })}
          className="h-11 rounded-lg border border-hairline bg-card px-3 text-[15px] text-ink"
          style={{ fontFamily: theme.body }}
        >
          {BODY_FONTS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-3">
        <PanelLabel>Monogram</PanelLabel>
        <div
          className="grid grid-cols-4 gap-2"
          style={
            {
              "--site-accent": accent,
              "--site-on-accent": onAccent,
              "--font-display": theme.display,
            } as React.CSSProperties
          }
        >
          {ORNAMENTS.map((o) => {
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
                      <SiteOrnament kind={o.id} first={names[0]} second={names[1]} />
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

      <div className="flex flex-col gap-3">
        <PanelLabel>Artwork</PanelLabel>
        <div className="grid grid-cols-3 gap-2">
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
          {SITE_ART.map((a) => {
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
        <p className="text-[13px] leading-normal text-ink/60">
          {design.art.id && !ART_HEROES.includes(design.hero) && hasPhoto
            ? "Artwork shows with the Text only, Monogram and Framed tops — your photo takes its place in this one."
            : "Sketches are drawn in your accent colour; watercolours keep their own."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <PanelLabel>Scene</PanelLabel>
        <div role="group" aria-label="Scene" className="flex flex-wrap gap-1.5">
          {[{ id: null, label: `Theme's own${base.scene && base.scene !== "none" ? ` (${sceneById(base.scene).label})` : ""}` }, ...SCENES].map(
            (x) => {
              const on = design.scene === x.id;
              return (
                <button
                  key={x.id ?? "theme"}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ scene: x.id as SiteDesign["scene"] })}
                  className={`h-8 rounded-full px-3 text-[13px] ${
                    on ? "bg-forest text-parchment" : "border border-hairline bg-card text-ink/75 hover:border-ink/30"
                  }`}
                >
                  {x.label}
                </button>
              );
            },
          )}
        </div>
        <p className="text-[13px] leading-normal text-ink/60">
          Drawn in your colours: a landscape under your names, a strip across the top, or a frame around them.
          Your accent colour sets its mood.
        </p>
      </div>

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
            : "This one needs a banner photo — add one under Sections › Photos. Until then the top of the page shows your names on their own."}
        </p>
      </div>
    </>
  );
}

function fontByCssId(css: string) {
  return FONTS.find((f) => f.css === css)?.id ?? null;
}

function FontGrid({
  fonts,
  selected,
  onPick,
}: {
  fonts: readonly (typeof FONTS)[number][];
  selected: string | null;
  onPick: (id: (typeof FONTS)[number]["id"]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {fonts.map((f) => {
        const on = selected === f.id;
        return (
          <button
            key={f.id}
            type="button"
            aria-pressed={on}
            onClick={() => onPick(f.id)}
            // Off-screen buttons aren't rendered, so their font isn't fetched until
            // the couple scrolls to it: the library is too big to load at once.
            className={`flex h-12 items-center rounded-lg bg-card px-3 text-left [contain-intrinsic-size:auto_48px] [content-visibility:auto] ${on ? SELECTED : UNSELECTED}`}
          >
            <span
              className="truncate text-ink"
              style={{ fontFamily: f.css, fontSize: f.kind === "script" ? 24 : 18 }}
            >
              {f.label}
            </span>
          </button>
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
      {layout === "monogram" && (
        <span className="absolute inset-[6px] flex flex-col items-center justify-center gap-1.5 border" style={{ borderColor: accent }}>
          <span className="block h-[22px] w-[18px] rounded-full border" style={{ borderColor: accent }} />
          <span className="flex flex-col items-center">{lines}</span>
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

  function add(kind: "photo" | "story" | "quote") {
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
            const expandable = Boolean(row.editor || row.link);
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

function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
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

const EXTRAS = [
  { key: "petals", label: "Falling petals", help: "Drift down over the page" },
  { key: "ticking", label: "Live countdown", help: "Ticks down to the second" },
  { key: "confetti", label: "Confetti on RSVP", help: "A burst when a guest says yes" },
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
          ]}
          value={motion.photo}
          onPick={(v) => set({ photo: v })}
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
