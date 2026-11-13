"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { DESIGN_MESSAGE, READY_MESSAGE } from "@/components/guest-site-theme";
import { PALETTES, resolveDesign, type Palette, type SiteDesign } from "@/lib/site-design";
import { TEMPLATES, applyTemplate, type SiteTemplate } from "@/lib/site-templates";
import { createDesign, setFavorite } from "../actions";
import { SitePageThumb } from "../site-page-thumb";
import { TemplatePicture } from "../template-picture";
import { actionFailed } from "@/lib/action-error";

/**
 * The template gallery (approved 2026-10-27): the seven templates, each card
 * the couple's real site in that look, shrunk; one tapped opens its preview.
 * A heart keeps a template on the wedding's shortlist (design_favorites) to
 * compare under Favourites, with the colourway it was hearted in.
 */
export function TemplatesGallery({
  base,
  initialOpen,
  full,
  samplePhotos,
  favorites,
}: {
  /** The design templates go over: the couple's sections and words. */
  base: SiteDesign;
  initialOpen: string | null;
  /** At the design limit: previews still open, but can't be customized. */
  full: boolean;
  /** No photos of their own yet, so the previews show Unsplash samples. */
  samplePhotos: boolean;
  /** Hearted template ids, each with the colourway it was hearted in. */
  favorites: Record<string, string | null>;
}) {
  const [open, setOpen] = useState<string | null>(initialOpen);
  const looks = useMemo(() => new Map(TEMPLATES.map((t) => [t.id, applyTemplate(base, t)])), [base]);
  const openTemplate = TEMPLATES.find((t) => t.id === open) ?? null;
  // The colours tried on each template, shared by its card and its preview.
  const [picks, setPicks] = useState<Record<string, string | null>>(favorites);
  const [hearts, setHearts] = useState<Set<string>>(() => new Set(Object.keys(favorites)));
  const [onlyHearts, setOnlyHearts] = useState(false);
  const [heartError, setHeartError] = useState<string | null>(null);

  function save(id: string, palette: string | null, on: boolean) {
    setHeartError(null);
    setFavorite({ template: id, palette, on })
      .catch(() => ({ error: actionFailed("reach the server") }))
      .then((result) => {
        if (!result.error) return;
        setHeartError(result.error);
        setHearts((all) => {
          const next = new Set(all);
          if (on) next.delete(id);
          else next.add(id);
          return next;
        });
      });
  }
  const pick = (id: string) => (palette: string | null) => {
    setPicks((all) => ({ ...all, [id]: palette }));
    // A hearted template remembers the colours it was last shown in.
    if (hearts.has(id)) save(id, palette, true);
  };
  const heart = (id: string) => () => {
    const on = !hearts.has(id);
    setHearts((all) => {
      const next = new Set(all);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
    save(id, picks[id] ?? null, on);
  };
  const shown = onlyHearts ? TEMPLATES.filter((t) => hearts.has(t.id)) : TEMPLATES;

  return (
    <div className="flex flex-col">
      <Link
        href="/guests/site"
        className="inline-flex h-10 items-center gap-2 self-start rounded-full bg-[#2243B6] px-4 text-[15px] font-semibold text-white hover:bg-[#2243B6]/90"
      >
        <span aria-hidden="true">←</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Your designs
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold text-forest sm:text-4xl">Templates</h1>
      <p className="mt-1 text-ink/60">
        Each one is your own site in that look. Pick one to customize. Your live site doesn&apos;t change until you say so.
      </p>

      <div className="mt-5 flex gap-2" role="group" aria-label="Show">
        <FilterChip on={!onlyHearts} onClick={() => setOnlyHearts(false)}>
          All templates
        </FilterChip>
        <FilterChip on={onlyHearts} onClick={() => setOnlyHearts(true)}>
          <HeartIcon filled={onlyHearts} size={15} />
          Favourites{hearts.size > 0 && ` (${hearts.size})`}
        </FilterChip>
      </div>
      {heartError && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {heartError}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="mt-6 rounded-[14px] border border-dashed border-ink/20 px-6 py-12 text-center">
          <p className="font-medium text-ink">No favourites yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[14px] text-ink/60">
            Tap the heart on any template to keep it here, so the two of you can compare your shortlist side by side.
          </p>
          <button
            type="button"
            onClick={() => setOnlyHearts(false)}
            className="mt-4 text-[14px] font-semibold text-[#2243B6] underline underline-offset-4"
          >
            See all templates
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3.5 gap-y-6 sm:gap-6 lg:grid-cols-4">
          {shown.map((t) => (
            <TemplateTile
              key={t.id}
              template={t}
              look={looks.get(t.id)!}
              palette={picks[t.id] ?? null}
              onPalette={pick(t.id)}
              onOpen={() => setOpen(t.id)}
              hearted={hearts.has(t.id)}
              onHeart={heart(t.id)}
            />
          ))}
        </div>
      )}

      {openTemplate && (
        <TemplatePreview
          key={openTemplate.id}
          template={openTemplate}
          look={looks.get(openTemplate.id)!}
          looks={looks}
          picks={picks}
          onPick={pick}
          hearts={hearts}
          onHeart={heart}
          full={full}
          samplePhotos={samplePhotos}
          onOpen={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function TemplateTile({
  template,
  look,
  palette,
  onPalette,
  onOpen,
  hearted,
  onHeart,
}: {
  template: SiteTemplate;
  look: SiteDesign;
  palette: string | null;
  onPalette: (palette: string | null) => void;
  onOpen: () => void;
  hearted: boolean;
  onHeart: () => void;
}) {
  const options = useMemo(() => colourOptions(template), [template]);
  const design = useMemo(() => withPalette(look, palette), [look, palette]);
  return (
    <div className="group relative flex min-w-0 flex-col">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-col text-left">
        <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-hairline group-hover:border-ink/30 sm:aspect-[4/3]">
          {/* The saved picture is the template's own colours; another colourway shows live. */}
          {palette === null ? <TemplatePicture id={template.id} /> : <SitePageThumb design={design} />}
          {template.badge && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-[#FFD301] px-2.5 py-0.5 text-[12px] font-semibold text-[#14203d] shadow-sm">
              {template.badge}
            </span>
          )}
        </span>
        <span className="mt-2.5 truncate font-medium text-ink">{template.name}</span>
        <span className="line-clamp-2 text-[13px] leading-snug text-ink/55">{template.blurb}</span>
      </button>
      <Swatches
        look={look}
        options={options}
        palette={palette}
        onPick={onPalette}
        label={`${template.name} colours`}
        size="sm"
      />
      {/* Over the picture's top-left corner; the badge has the top-right. */}
      <button
        type="button"
        onClick={onHeart}
        aria-pressed={hearted}
        aria-label={`Favourite ${template.name}`}
        title={hearted ? "In your favourites" : "Add to favourites"}
        className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#2243B6] shadow-[0_1px_4px_rgba(20,32,61,0.25)] transition-transform hover:scale-105 motion-reduce:transition-none"
      >
        <HeartIcon filled={hearted} size={18} />
      </button>
    </div>
  );
}

function HeartIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.1 3.6 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.6 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
    </svg>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium ${
        on ? "bg-[#14203d] text-white" : "border border-ink/15 bg-white text-ink hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * One template, large: the real guest site in that look (the preview page,
 * sent the design by postMessage), its colour options, Customize, and more
 * templates sharing a tag. Desktop is a dialog over the gallery; a phone gets
 * it as the whole screen.
 */
function TemplatePreview({
  template,
  look,
  looks,
  picks,
  onPick,
  hearts,
  onHeart,
  full,
  samplePhotos,
  onOpen,
  onClose,
}: {
  template: SiteTemplate;
  look: SiteDesign;
  looks: Map<string, SiteDesign>;
  picks: Record<string, string | null>;
  onPick: (id: string) => (palette: string | null) => void;
  hearts: Set<string>;
  onHeart: (id: string) => () => void;
  full: boolean;
  samplePhotos: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const palette = picks[template.id] ?? null;
  const setPalette = onPick(template.id);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const options = useMemo(() => colourOptions(template), [template]);
  const design = useMemo(() => withPalette(look, palette), [look, palette]);
  // The ones after it, round to the start: a different four each time.
  const at = TEMPLATES.indexOf(template);
  const more = [...TEMPLATES.slice(at + 1), ...TEMPLATES.slice(0, at)].slice(0, 4);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  function customize() {
    setError(null);
    start(async () => {
      const result = await createDesign({ template: template.id, palette }).catch(() => ({
        error: actionFailed("reach the server"),
        id: undefined,
      }));
      if (result.error || !result.id) setError(result.error ?? "That didn't work. Try again.");
      else router.push(`/guests/site/edit/${result.id}`);
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white sm:bg-[#14203d]/55 sm:px-6 sm:py-10" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={template.name}
        onClick={(e) => e.stopPropagation()}
        className="relative mx-auto grid max-w-[1400px] gap-5 bg-white p-4 pb-24 sm:rounded-[22px] sm:p-9 lg:grid-cols-[1.6fr_1fr] lg:gap-9"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-ink shadow-[0_2px_8px_rgba(0,0,0,0.2)] sm:-right-3 sm:-top-3 sm:h-11 sm:w-11"
        >
          ×
        </button>

        <LivePreview design={design} />

        <div className="flex flex-col">
          <h2 className="pr-12 font-display text-3xl font-semibold text-forest sm:pr-0 sm:text-4xl">{template.name}</h2>
          <p className="mt-1 text-ink/60">{template.blurb}</p>
          <button
            type="button"
            onClick={onHeart(template.id)}
            aria-pressed={hearts.has(template.id)}
            className="mt-4 inline-flex h-10 items-center gap-2 self-start rounded-full border border-[#2243B6]/30 px-4 text-[14px] font-medium text-[#2243B6] hover:border-[#2243B6]"
          >
            <HeartIcon filled={hearts.has(template.id)} size={17} />
            {hearts.has(template.id) ? "In your favourites" : "Add to favourites"}
          </button>

          <p className="mt-6 text-sm font-semibold text-ink">Colours</p>
          <Swatches look={look} options={options} palette={palette} onPick={setPalette} label="Colours" size="lg" />
          <p className="mt-2 text-[13px] text-ink/60">Any colour you like once you&apos;re editing.</p>

          {/* Sticks to the bottom of a phone screen while the preview scrolls past. */}
          <div data-wren-avoid className="fixed inset-x-0 bottom-0 z-10 border-t border-hairline bg-white p-4 sm:static sm:mt-7 sm:border-0 sm:bg-transparent sm:p-0">
            <button
              type="button"
              onClick={customize}
              disabled={pending || full}
              className="h-12 w-full rounded-full bg-[#2243B6] text-[15px] font-medium text-white hover:bg-[#2243B6]/90 disabled:opacity-50"
            >
              {pending ? "Making your design…" : "Customize this template"}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <p className="mt-3.5 text-[13px] leading-normal text-ink/60">
            {full
              ? "You have the most designs you can keep. Delete one on Your guest site to make room."
              : "Starts a new design with your wording, photos and schedule. Your live site stays as it is."}
          </p>
          {samplePhotos && (
            <p className="mt-2 text-[13px] leading-normal text-ink/60">
              Sample photos from Unsplash for now. Yours take their place once you add a banner and gallery.
            </p>
          )}
        </div>

        {more.length > 0 && (
          <div className="lg:col-span-2">
            <h3 className="font-display text-2xl font-semibold text-forest">More templates</h3>
            <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:gap-6 lg:grid-cols-4">
              {more.map((t) => (
                <TemplateTile
                  key={t.id}
                  template={t}
                  look={looks.get(t.id)!}
                  palette={picks[t.id] ?? null}
                  onPalette={onPick(t.id)}
                  onOpen={() => onOpen(t.id)}
                  hearted={hearts.has(t.id)}
                  onHeart={onHeart(t.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** "As designed" and the template's other colourways, as a radio row. */
function Swatches({
  look,
  options,
  palette,
  onPick,
  label,
  size,
}: {
  look: SiteDesign;
  options: Palette[];
  palette: string | null;
  onPick: (palette: string | null) => void;
  label: string;
  /** Small under a gallery card, large in the preview. */
  size: "sm" | "lg";
}) {
  const own = resolveDesign(look);
  return (
    <div className={`flex ${size === "sm" ? "mt-2 gap-3" : "mt-2 gap-2.5"}`} role="radiogroup" aria-label={label}>
      <Swatch label="As designed" bg={own.theme.bg} accent={own.accent} on={!palette} size={size} onPick={() => onPick(null)} />
      {options.map((p) => (
        <Swatch key={p.id} label={p.name} bg={p.bg} accent={p.accent} on={palette === p.id} size={size} onPick={() => onPick(p.id)} />
      ))}
    </div>
  );
}

function Swatch({
  label,
  bg,
  accent,
  on,
  size,
  onPick,
}: {
  label: string;
  bg: string;
  accent: string;
  on: boolean;
  size: "sm" | "lg";
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={onPick}
      // The small ones keep a 32px tap target around a 20px dot.
      className={size === "sm" ? "-m-1.5 flex h-8 w-8 items-center justify-center" : "flex"}
    >
      <span
        className={`block rounded-full ${size === "sm" ? "h-5 w-5" : "h-9 w-9"} ${
          on ? "ring-2 ring-[#2243B6] ring-offset-2" : "ring-1 ring-ink/15"
        }`}
        style={{ background: `linear-gradient(135deg, ${bg} 50%, ${accent} 50%)` }}
      />
    </button>
  );
}

/** The width the desktop preview is laid out at before it's scaled to fit. */
const LAYOUT_WIDTH = 1280;

/**
 * The guest site itself in the template's look, in a frame: a laptop-width
 * page scaled down on desktop, the phone layout at full size on a phone.
 */
function LivePreview({ design }: { design: SiteDesign }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const designRef = useRef(design);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    designRef.current = design;
    frameRef.current?.contentWindow?.postMessage({ type: DESIGN_MESSAGE, design }, window.location.origin);
  }, [design]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === READY_MESSAGE) {
        frameRef.current?.contentWindow?.postMessage(
          { type: DESIGN_MESSAGE, design: designRef.current },
          window.location.origin,
        );
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setBox({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Narrow boxes are phones: lay the page out at the box's own width.
  const scale = box.w >= 600 ? box.w / LAYOUT_WIDTH : 1;
  return (
    <div
      ref={boxRef}
      className="relative h-[62vh] overflow-hidden rounded-[14px] border border-hairline bg-card sm:h-auto sm:aspect-[16/10]"
    >
      {box.w > 0 && (
        <iframe
          ref={frameRef}
          src={`/guests/site/preview?look=1&template=${design.template ?? ""}`}
          title="Template preview"
          className="absolute left-0 top-0 border-0"
          style={{
            width: box.w / scale,
            height: box.h / scale,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
        />
      )}
    </div>
  );
}

function withPalette(look: SiteDesign, id: string | null): SiteDesign {
  const p = PALETTES.find((q) => q.id === id);
  return p ? { ...look, accent: p.accent, colors: { bg: p.bg, ink: p.ink, heading: p.heading } } : look;
}

/** The template's other two colourways, each chosen for it (SiteTemplate.colourways). */
function colourOptions(template: SiteTemplate): Palette[] {
  return template.colourways.flatMap((id) => PALETTES.filter((p) => p.id === id));
}
