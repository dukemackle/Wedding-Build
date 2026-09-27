"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/icons";
import {
  FONT_PAIRINGS,
  HERO_LAYOUTS,
  SITE_SECTIONS,
  resolveDesign,
  themeById,
  type HeroLayoutId,
  type SectionId,
  type SiteDesign,
} from "@/lib/site-design";

export type SectionInfo = {
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

const NAMES = Object.fromEntries(SITE_SECTIONS.map((x) => [x.id, x.name])) as Record<SectionId, string>;
const COLUMN = Object.fromEntries(SITE_SECTIONS.map((x) => [x.id, x.column])) as Record<SectionId, string>;

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
}: {
  design: SiteDesign;
  onChange: Change;
  hasPhoto: boolean;
}) {
  const base = themeById(design.theme);
  const { accent } = resolveDesign(design);

  return (
    <>
      <div className="flex flex-col gap-3">
        <PanelLabel>Fonts</PanelLabel>
        {FONT_PAIRINGS.map((f) => {
          const display = f.display ?? base.display;
          const body = f.body ?? base.body;
          const selected = design.fonts === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange({ fonts: f.id })}
              className={`flex items-center gap-4 rounded-xl bg-card px-4 py-3 text-left ${selected ? SELECTED : UNSELECTED}`}
            >
              <span className="w-24 shrink-0 text-[26px] leading-none text-ink" style={{ fontFamily: display }}>
                Aa
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-ink" style={{ fontFamily: display }}>
                  {f.label}
                </span>
                <span className="block text-xs text-ink/60" style={{ fontFamily: body }}>
                  {f.id === "theme" ? `What ${base.name} uses` : "Headings · body text"}
                </span>
              </span>
            </button>
          );
        })}
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
                <HeroThumb layout={h.id} bg={base.bg} surface={base.surface} photo={base.photo} ink={base.ink} accent={accent} />
                <span className="border-t border-hairline px-2 py-1.5 text-[12px] font-medium text-ink">{h.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[13px] leading-normal text-ink/60">
          {hasPhoto
            ? HERO_LAYOUTS.find((h) => h.id === design.hero)?.help
            : "These need a banner photo — add one under Sections › Photos. Until then the top of the page shows your names on their own."}
        </p>
      </div>
    </>
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
  info: Record<SectionId, SectionInfo>;
  checklist: ChecklistItem[];
}) {
  const [open, setOpen] = useState<SectionId | null>(null);
  const sections = design.sections;

  function move(from: number, to: number) {
    if (to < 0 || to >= sections.length || from === to) return;
    const next = [...sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ sections: next });
  }

  function toggle(id: SectionId) {
    onChange({ sections: sections.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x)) });
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
          onMove={move}
          renderRow={(id, handle) => {
            const section = sections.find((x) => x.id === id)!;
            const row = info[id];
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
                      <span className={`block text-[15px] font-medium ${shown ? "text-ink" : "text-ink/45"}`}>
                        {NAMES[id]}
                        <span className="ml-2 text-[11px] font-normal text-ink/40">
                          {COLUMN[id] === "main" ? "Main" : "Side"}
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
                  <Switch on={shown} label={`Show ${NAMES[id]}`} onToggle={() => toggle(id)} />
                </div>
                {open === id && expandable && (
                  <div className="border-t border-hairline px-4 pb-5 pt-4">
                    {row.link && (
                      <Link href={row.link.href} className="text-sm font-medium text-forest underline">
                        {row.link.label}
                      </Link>
                    )}
                    {row.editor}
                  </div>
                )}
              </div>
            );
          }}
        />
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
}: {
  ids: SectionId[];
  onMove: (from: number, to: number) => void;
  renderRow: (id: SectionId, handle: ReactNode) => ReactNode;
}) {
  const rowRefs = useRef(new Map<SectionId, HTMLLIElement>());
  const [dragging, setDragging] = useState<{ id: SectionId; offset: number } | null>(null);
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
            aria-label={`Move ${NAMES[id]} (use arrow keys)`}
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
