"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { DESIGN_MESSAGE, READY_MESSAGE } from "@/components/guest-site-theme";
import { PALETTES, resolveDesign, type Palette, type SiteDesign } from "@/lib/site-design";
import { TEMPLATES, TEMPLATE_TAGS, applyTemplate, type SiteTemplate, type TemplateTag } from "@/lib/site-templates";
import { createDesign } from "../actions";
import { SiteThumb } from "../site-thumb";

type Shared = { names: [string, string]; dateLine: string | null; photoUrl: string | null };

/**
 * The template gallery (the approved mockup): tag filters over a grid of
 * every template in the couple's names; one tapped opens its preview.
 */
export function TemplatesGallery({
  base,
  initialOpen,
  full,
  ...shared
}: Shared & {
  /** The design templates go over: the couple's sections and words. */
  base: SiteDesign;
  initialOpen: string | null;
  /** At the design limit: previews still open, but can't be customized. */
  full: boolean;
}) {
  const [tag, setTag] = useState<TemplateTag | null>(null);
  const [open, setOpen] = useState<string | null>(initialOpen);
  const shown = TEMPLATES.filter((t) => !tag || t.tags.includes(tag));
  const looks = useMemo(() => new Map(TEMPLATES.map((t) => [t.id, applyTemplate(base, t)])), [base]);
  const openTemplate = TEMPLATES.find((t) => t.id === open) ?? null;
  // The colours tried on each template, shared by its card and its preview.
  const [picks, setPicks] = useState<Record<string, string | null>>({});
  const pick = (id: string) => (palette: string | null) => setPicks((all) => ({ ...all, [id]: palette }));

  return (
    <div className="flex flex-col">
      <Link href="/guests/site" className="text-sm text-ink/60 hover:text-ink">
        ← Your guest site
      </Link>
      <h1 className="mt-1.5 font-display text-3xl font-semibold text-forest sm:text-4xl">Templates</h1>
      <p className="mt-1 text-ink/60">
        Shown with your names. Pick one to customize. Your live site doesn&apos;t change until you say so.
      </p>

      <div className="-mx-6 mt-5 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {[null, ...TEMPLATE_TAGS].map((t) => (
          <button
            key={t ?? "all"}
            type="button"
            aria-pressed={tag === t}
            onClick={() => setTag(t)}
            className={`h-9 shrink-0 rounded-full px-4 text-sm ${
              tag === t ? "bg-forest text-parchment" : "border border-hairline bg-card text-ink/80 hover:text-ink"
            }`}
          >
            {t ?? "All"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:gap-6 lg:grid-cols-4">
        {shown.map((t) => (
          <TemplateTile
            key={t.id}
            template={t}
            look={looks.get(t.id)!}
            palette={picks[t.id] ?? null}
            onPalette={pick(t.id)}
            onOpen={() => setOpen(t.id)}
            {...shared}
          />
        ))}
      </div>

      {openTemplate && (
        <TemplatePreview
          key={openTemplate.id}
          template={openTemplate}
          look={looks.get(openTemplate.id)!}
          looks={looks}
          picks={picks}
          onPick={pick}
          full={full}
          onOpen={setOpen}
          onClose={() => setOpen(null)}
          {...shared}
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
  ...shared
}: Shared & {
  template: SiteTemplate;
  look: SiteDesign;
  palette: string | null;
  onPalette: (palette: string | null) => void;
  onOpen: () => void;
}) {
  const options = useMemo(() => colourOptions(template, look), [template, look]);
  const design = useMemo(() => withPalette(look, palette), [look, palette]);
  return (
    <div className="group flex min-w-0 flex-col">
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-col text-left">
        <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-hairline group-hover:border-ink/30 sm:aspect-[4/3]">
          <SiteThumb design={design} {...shared} />
        </span>
        <span className="mt-2.5 truncate font-medium text-ink">{template.name}</span>
        <span className="truncate text-[13px] text-ink/55">{template.tags.join(" · ")}</span>
      </button>
      <Swatches
        look={look}
        options={options}
        palette={palette}
        onPick={onPalette}
        label={`${template.name} colours`}
        size="sm"
      />
    </div>
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
  full,
  onOpen,
  onClose,
  ...shared
}: Shared & {
  template: SiteTemplate;
  look: SiteDesign;
  looks: Map<string, SiteDesign>;
  picks: Record<string, string | null>;
  onPick: (id: string) => (palette: string | null) => void;
  full: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const palette = picks[template.id] ?? null;
  const setPalette = onPick(template.id);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const options = useMemo(() => colourOptions(template, look), [template, look]);
  const design = useMemo(() => withPalette(look, palette), [look, palette]);
  const more = TEMPLATES.filter((t) => t.id !== template.id && t.tags.some((tag) => template.tags.includes(tag))).slice(0, 4);

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
        error: "Couldn't reach the server — check your connection.",
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
          <h2 className="font-display text-3xl font-semibold text-forest sm:text-4xl">{template.name}</h2>
          <p className="mt-1 text-ink/60">{template.tags.join(" · ")}</p>

          <p className="mt-6 text-sm font-semibold text-ink">Colours</p>
          <Swatches look={look} options={options} palette={palette} onPick={setPalette} label="Colours" size="lg" />

          {/* Sticks to the bottom of a phone screen while the preview scrolls past. */}
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-hairline bg-white p-4 sm:static sm:mt-7 sm:border-0 sm:bg-transparent sm:p-0">
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
        </div>

        {more.length > 0 && (
          <div className="lg:col-span-2">
            <h3 className="font-display text-2xl font-semibold text-forest">More like this</h3>
            <div className="mt-4 grid grid-cols-2 gap-x-3.5 gap-y-5 sm:gap-6 lg:grid-cols-4">
              {more.map((t) => (
                <TemplateTile
                  key={t.id}
                  template={t}
                  look={looks.get(t.id)!}
                  palette={picks[t.id] ?? null}
                  onPalette={onPick(t.id)}
                  onOpen={() => onOpen(t.id)}
                  {...shared}
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
          src="/guests/site/preview?look=1"
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

/**
 * Three palettes to try on a template, different for each one: two as light
 * or dark as it is, from colour families other than its own, then its
 * evening (or daytime) version -- the opposite shade in its own colour.
 */
function colourOptions(template: SiteTemplate, look: SiteDesign): Palette[] {
  const { theme, heading } = resolveDesign(look);
  const dark = isDark(theme.bg);
  const own = PALETTES.find((p) => p.id === template.palette);
  const offset = [...template.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  const pool = PALETTES.filter((p) => isDark(p.bg) === dark && p.id !== template.palette && p.family !== own?.family);
  const picked: Palette[] = [];
  for (let i = 0; i < pool.length && picked.length < 2; i++) {
    const p = pool[(offset + i * 5) % pool.length];
    if (!picked.some((q) => q.family === p.family)) picked.push(p);
  }
  // A light page's colour is in its headings; a dark page's is the page itself.
  const key = keyColour(dark ? theme.bg : heading);
  const flip = PALETTES.filter((p) => isDark(p.bg) !== dark)
    .map((p, i) => ({ p, i, d: hueDistance(key, keyColour(isDark(p.bg) ? p.bg : p.heading)) }))
    .sort((a, b) => a.d - b.d || ((a.i + offset) % 7) - ((b.i + offset) % 7))[0]?.p;
  return flip ? [...picked, flip] : picked;
}

function isDark(hex: string) {
  const [r, g, b] = rgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

function rgb(hex: string) {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Hue in degrees and saturation 0-1 (HSV). */
function keyColour(hex: string) {
  const [r, g, b] = rgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const sat = max ? d / max : 0;
  const hue = !d ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { hue: (hue * 60 + 360) % 360, sat };
}

/** 0 for the same colour family, up to 2 for greys against strong colours. */
function hueDistance(a: { hue: number; sat: number }, b: { hue: number; sat: number }) {
  const greyA = a.sat < 0.2;
  const greyB = b.sat < 0.2;
  if (greyA || greyB) return greyA && greyB ? 0 : 2;
  const h = Math.abs(a.hue - b.hue);
  return Math.min(h, 360 - h) / 180;
}
