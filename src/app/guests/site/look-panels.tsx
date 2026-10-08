"use client";

import { useEffect, useState } from "react";
import {
  BG_PATTERNS,
  BG_TEXTURES,
  BODY_FONTS,
  FONTS,
  FONT_PAIRINGS,
  backgroundLayers,
  contrast,
  fontByCss,
  fontById,
  resolveDesign,
  themeById,
  type SiteDesign,
} from "@/lib/site-design";
import { PanelLabel } from "./editor-tabs";

const SELECTED = "border-2 border-forest";
const UNSELECTED = "m-px border border-hairline hover:border-ink/30";

type Change = (patch: Partial<SiteDesign>) => void;

/**
 * Whatever is picked in the preview that a panel can restyle: words from
 * phase 1 or a placed element. Fonts and Colour act on it while it's picked,
 * and on the whole site otherwise.
 */
export type PickTarget = {
  label: string;
  /** Its own font and colour; undefined where it has none to change. */
  font?: { value: string | null };
  colour?: { value: string | null };
};

/** Changes the picked thing's font or colour. */
export type TargetActions = { font: (id: string) => void; colour: (hex: string) => void };

/** "Applies to" note at the top of a panel while something is picked. */
function TargetNote({ target, what }: { target: PickTarget; what: string }) {
  return (
    <p className="rounded-xl bg-[#2243B6]/[0.06] px-3 py-2.5 text-[13px] leading-normal text-ink/80">
      Choosing a {what} changes <span className="font-semibold text-[#2243B6]">{target.label}</span>. Tap ✓ on its
      bar to go back to the whole site.
    </p>
  );
}

// ---------------------------------------------------------------------------
// Colour: the couple's own photos as a source of colours.

function hex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function rgb(h: string) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function mix(a: string, b: string, t: number) {
  const [x, y] = [rgb(a), rgb(b)];
  return hex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
}

function saturation(h: string) {
  const [r, g, b] = rgb(h);
  const max = Math.max(r, g, b);
  return max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
}

/**
 * The main colours in a photo: shrunk to 48px, each pixel rounded into a
 * bucket, the busiest buckets kept if they're not too close to one already
 * kept. Photos that won't let the canvas read them (no CORS) give nothing.
 */
function photoColours(img: HTMLImageElement): string[] {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 48;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, 48, 48);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, 48, 48).data;
  } catch {
    return [];
  }
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    // Cut-out edges and see-through pixels aren't colours anyone chose.
    if (data[i + 3] < 200) continue;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bucket.n++;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }
  const ranked = [...buckets.values()].sort((a, b) => b.n - a.n).map((x) => hex(x.r / x.n, x.g / x.n, x.b / x.n));
  const kept: string[] = [];
  for (const c of ranked) {
    const [r, g, b] = rgb(c);
    if (kept.every((k) => {
      const [kr, kg, kb] = rgb(k);
      return Math.abs(r - kr) + Math.abs(g - kg) + Math.abs(b - kb) > 90;
    })) kept.push(c);
    if (kept.length === 6) break;
  }
  return kept;
}

function usePhotoColours(photos: string[]) {
  const [found, setFound] = useState<{ key: string; colours: string[] }>({ key: "", colours: [] });
  const key = photos.slice(0, 4).join("|");
  useEffect(() => {
    if (!key) return;
    let live = true;
    Promise.all(
      key.split("|").map(
        (src) =>
          new Promise<string[]>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(photoColours(img));
            img.onerror = () => resolve([]);
            img.src = src;
          }),
      ),
    ).then((lists) => {
      if (!live) return;
      // A couple of colours from each photo first, so one photo can't fill the row.
      const merged = [...lists.flatMap((l) => l.slice(0, 3)), ...lists.flatMap((l) => l.slice(3))];
      setFound({ key, colours: [...new Set(merged)].slice(0, 10) });
    });
    return () => {
      live = false;
    };
  }, [key]);
  return found.key === key ? found.colours : [];
}

/**
 * A whole palette from photo colours: the lightest, softened, as the page;
 * the darkest as text and headings; the most colourful one that still reads
 * on the page as the accent.
 */
function paletteFromPhotos(colours: string[]): Pick<SiteDesign, "colors" | "accent"> | null {
  if (colours.length < 2) return null;
  const byLight = [...colours].sort((a, b) => contrast(b, "#000000") - contrast(a, "#000000"));
  const bg = mix(byLight[0], "#ffffff", 0.75);
  const ink = mix(byLight[byLight.length - 1], "#000000", 0.45);
  const heading = mix(byLight[byLight.length - 1], "#000000", 0.25);
  const candidates = [...colours].sort((a, b) => saturation(b) - saturation(a));
  let accent = candidates[0];
  for (let i = 0; i < 6 && contrast(accent, bg) < 3; i++) accent = mix(accent, "#000000", 0.18);
  return { colors: { bg, ink, heading }, accent };
}

export function PhotoColoursSection({
  photos,
  target,
  actions,
  onChange,
}: {
  photos: string[];
  target: PickTarget | null;
  actions: TargetActions;
  onChange: Change;
}) {
  const colours = usePhotoColours(photos);
  const palette = paletteFromPhotos(colours);
  return (
    <div className="flex flex-col gap-3">
      <PanelLabel>From your photos</PanelLabel>
      {colours.length ? (
        <>
          <div className="flex flex-wrap gap-2">
            {colours.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={target?.colour ? `Colour ${target.label} ${c}` : `Use ${c} as your accent`}
                title={c}
                onClick={() => (target?.colour ? actions.colour(c) : onChange({ accent: c }))}
                className="h-9 w-9 rounded-full border border-black/10"
                style={{ background: c }}
              />
            ))}
          </div>
          <p className="text-[13px] leading-normal text-ink/60">
            {target?.colour ? `Tap one to colour ${target.label}.` : "Tap one to make it your accent colour."}
          </p>
          {palette && !target && (
            <button
              type="button"
              onClick={() => onChange(palette)}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-hairline bg-card text-sm font-medium text-ink hover:border-ink/30"
            >
              <span className="flex" aria-hidden="true">
                {[palette.colors.bg!, palette.colors.heading!, palette.accent!].map((c) => (
                  <span key={c} className="-ml-1 h-4 w-4 rounded-full border border-black/10 first:ml-0" style={{ background: c }} />
                ))}
              </span>
              Make a palette from my photos
            </button>
          )}
        </>
      ) : (
        <p className="text-[13px] leading-normal text-ink/60">
          {photos.length
            ? "Reading the colours in your photos…"
            : "Add a banner or gallery photo and its colours show up here."}
        </p>
      )}
    </div>
  );
}

/** "This element": the site's colours, for whatever is picked. */
export function TargetColourSection({
  design,
  target,
  actions,
}: {
  design: SiteDesign;
  target: PickTarget;
  actions: TargetActions;
}) {
  const { theme, accent, accent2, heading } = resolveDesign(design);
  const colours = [...new Set([heading, theme.ink, accent, accent2, theme.muted, theme.bg, "#ffffff"].map((c) => c.toLowerCase()))];
  const value = target.colour?.value?.toLowerCase() ?? null;
  return (
    <div className="flex flex-col gap-3">
      <TargetNote target={target} what="colour" />
      <PanelLabel>Your palette</PanelLabel>
      <div className="flex flex-wrap items-center gap-2">
        {colours.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Colour ${c}`}
            aria-pressed={value === c}
            onClick={() => actions.colour(c)}
            className={`h-9 w-9 rounded-full border border-black/10 ${value === c ? "outline outline-2 outline-offset-2 outline-[#2243B6]" : ""}`}
            style={{ background: c }}
          />
        ))}
        <label className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border border-black/10 bg-[conic-gradient(#FFD301,#2243B6,#00BFFE,#5AE4FF,#FFF12F,#FFD301)]">
          <span className="sr-only">Your own colour</span>
          <input
            type="color"
            value={value?.startsWith("#") ? value : heading}
            onChange={(e) => actions.colour(e.target.value.toLowerCase())}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fonts.

const KINDS = [
  { id: "script", label: "Script" },
  { id: "serif", label: "Serif" },
  { id: "sans", label: "Sans" },
  { id: "display", label: "Display" },
] as const;

function fontIdOf(css: string) {
  return fontByCss(css)?.id ?? null;
}

/**
 * Fonts: the faces in this site, the tried pairs, and the whole library with
 * a search and kind filter. While words are picked, a face goes on those
 * words; otherwise it becomes the site's heading face.
 */
export function FontsTab({
  design,
  onChange,
  target,
  actions,
}: {
  design: SiteDesign;
  onChange: Change;
  target: PickTarget | null;
  actions: TargetActions;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"] | null>(null);
  const base = themeById(design.theme);
  const { theme } = resolveDesign(design);
  const headingId = design.fontDisplay ?? fontIdOf(theme.display);
  const bodyId = design.fontBody ?? fontIdOf(theme.body);
  const picked = target?.font ? target.font.value : headingId;
  const pick = (id: string) => (target?.font ? actions.font(id) : onChange({ fontDisplay: id as SiteDesign["fontDisplay"] }));
  const q = query.trim().toLowerCase();
  const library = FONTS.filter(
    (f) => (!kind || f.kind === kind) && (!q || f.label.toLowerCase().includes(q) || f.kind.includes(q)),
  );
  const inSite = [headingId, bodyId].flatMap((id) => (id ? [fontById(id)!] : [])).filter(Boolean);

  return (
    <>
      {target?.font && <TargetNote target={target} what="font" />}
      <div className="flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “script” or “Garamond”"
          aria-label="Search fonts"
          className="h-11 rounded-lg border border-hairline bg-card px-3 text-[15px] text-ink placeholder:text-ink/45"
        />
        <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 lg:-mx-6 lg:px-6">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              aria-pressed={kind === k.id}
              onClick={() => setKind(kind === k.id ? null : k.id)}
              className={`h-8 shrink-0 rounded-full px-3 text-[13px] ${
                kind === k.id ? "bg-forest text-parchment" : "border border-hairline bg-card text-ink/75 hover:text-ink"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {!q && !kind && (
        <>
          <div className="flex flex-col gap-2">
            <PanelLabel>Fonts in this site</PanelLabel>
            {inSite.map((f, i) => (
              <FontRow key={`${f.id}${i}`} font={f} note={i === 0 ? "Headings & names" : "Body text"} on={picked === f.id} onPick={() => pick(f.id)} />
            ))}
          </div>

          {!target && (
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
                      className={`flex flex-col gap-0.5 rounded-xl bg-card px-3 py-2.5 text-left [contain-intrinsic-size:auto_60px] [content-visibility:auto] ${selected ? SELECTED : UNSELECTED}`}
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
          )}
        </>
      )}

      <div className="flex flex-col gap-2">
        <PanelLabel>{target?.font ? `Fonts for ${target.label}` : "Headings & names"}</PanelLabel>
        {library.length ? (
          library.map((f) => <FontRow key={f.id} font={f} on={picked === f.id} onPick={() => pick(f.id)} />)
        ) : (
          <p className="text-sm text-ink/60">No fonts match that. Try another word.</p>
        )}
        <p className="text-[13px] text-ink/60">All free Google fonts. Every one works on the published site.</p>
      </div>

      {!target && (
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
      )}
    </>
  );
}

function FontRow({
  font,
  note,
  on,
  onPick,
}: {
  font: (typeof FONTS)[number];
  note?: string;
  on: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onPick}
      // Off-screen rows aren't rendered, so their face isn't fetched until
      // the couple scrolls to it: the library is too big to load at once.
      className={`flex h-12 items-center justify-between gap-3 rounded-lg px-3 text-left [contain-intrinsic-size:auto_48px] [content-visibility:auto] ${
        on ? "bg-[#2243B6]/10" : "border border-hairline bg-card hover:border-ink/30"
      }`}
    >
      <span className="truncate text-ink" style={{ fontFamily: font.css, fontSize: font.kind === "script" ? 24 : 18 }}>
        {font.label}
      </span>
      <span className="shrink-0 text-[11px] text-ink/50">{note ?? KINDS.find((k) => k.id === font.kind)?.label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Background.

/**
 * Background: the page colour, a pattern and a texture, drawn in the site's
 * own colours so they change with the palette. "Use on every section" puts
 * them behind the whole page; off, only behind the top of it.
 */
export function BackgroundTab({ design, onChange }: { design: SiteDesign; onChange: Change }) {
  const { theme, accent, accent2 } = resolveDesign(design);
  const base = themeById(design.theme);
  const bg = design.background;
  const vars = { "--site-accent": accent, "--site-accent-2": accent2, "--color-ink": theme.ink } as Record<string, string>;
  const colours = [...new Set([base.bg, base.surface, mix(base.bg, accent, 0.12), theme.bg].map((c) => c.toLowerCase()))];
  const set = (patch: Partial<SiteDesign["background"]>) => onChange({ background: { ...bg, ...patch } });
  // Each tile shows the choice over the page colour, as it will look.
  const tile = (choice: Partial<SiteDesign["background"]>) => {
    const { image, size } = backgroundLayers({ ...bg, pattern: "none", texture: "none", ...choice });
    return { backgroundColor: theme.bg, backgroundImage: image, backgroundSize: size };
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <PanelLabel>Colour</PanelLabel>
        <div className="flex flex-wrap items-center gap-2">
          {colours.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Background ${c}`}
              aria-pressed={theme.bg.toLowerCase() === c}
              onClick={() => onChange({ colors: { ...design.colors, bg: c === base.bg.toLowerCase() ? null : c } })}
              className={`h-10 w-10 rounded-full border border-black/10 ${
                theme.bg.toLowerCase() === c ? "outline outline-2 outline-offset-2 outline-[#2243B6]" : ""
              }`}
              style={{ background: c }}
            />
          ))}
          <label className="relative h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-black/10 bg-[conic-gradient(#FFD301,#2243B6,#00BFFE,#5AE4FF,#FFF12F,#FFD301)]">
            <span className="sr-only">Your own background colour</span>
            <input
              type="color"
              value={theme.bg}
              onChange={(e) => onChange({ colors: { ...design.colors, bg: e.target.value.toLowerCase() } })}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <PanelLabel>Patterns</PanelLabel>
        <div className="grid grid-cols-4 gap-2">
          {BG_PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={bg.pattern === p.id}
              onClick={() => set({ pattern: p.id })}
              className="flex flex-col items-center gap-1 text-[11px] text-ink/70"
            >
              <span
                className={`block aspect-square w-full rounded-xl ${bg.pattern === p.id ? SELECTED : UNSELECTED}`}
                style={{ ...tile({ pattern: p.id }), ...vars }}
              />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <PanelLabel>Textures</PanelLabel>
        <div className="grid grid-cols-4 gap-2">
          {BG_TEXTURES.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={bg.texture === t.id}
              onClick={() => set({ texture: t.id })}
              className="flex flex-col items-center gap-1 text-center text-[11px] leading-tight text-ink/70"
            >
              <span
                className={`block aspect-square w-full rounded-xl ${bg.texture === t.id ? SELECTED : UNSELECTED}`}
                style={{ ...tile({ texture: t.id }), ...vars }}
              />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-[14px] text-ink">
        <input
          type="checkbox"
          checked={bg.scope === "page"}
          onChange={(e) => set({ scope: e.target.checked ? "page" : "top" })}
          className="h-5 w-5 accent-[#2243B6]"
        />
        Use on every section
      </label>
      <p className="-mt-3 text-[13px] leading-normal text-ink/60">
        Off, the pattern and texture sit behind the top of the page only.
      </p>
    </>
  );
}
