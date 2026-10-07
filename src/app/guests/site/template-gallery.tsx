"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SiteOrnament } from "@/components/site-ornament";
import {
  COLOR_FAMILIES,
  artById,
  designCssVars,
  resolveDesign,
  type ColorFamily,
  type SiteDesign,
} from "@/lib/site-design";
import {
  SITE_TEMPLATES,
  TEMPLATE_STYLES,
  matchingTemplate,
  templatePreview,
  type SiteTemplate,
  type TemplateStyle,
} from "@/lib/site-templates";
import { extractPhotoColors, photoDistance, type PhotoColor } from "@/lib/photo-palette";

type Layout = "photo" | "monogram" | "text";

const LAYOUTS: { id: Layout; label: string }[] = [
  { id: "photo", label: "With your photo" },
  { id: "monogram", label: "Monogram" },
  { id: "text", label: "Text & artwork" },
];

const layoutOf = (t: SiteTemplate): Layout =>
  t.hero === "monogram" ? "monogram" : t.hero === "text" ? "text" : "photo";

/**
 * Every template at once, filterable, each drawn with the couple's own names
 * (and photo, where the layout has one). Picking one fills in the look and
 * closes; the editor offers an undo.
 *
 * Two arrangements: on a computer a filter column beside a four-across grid,
 * as on Joy; on a phone the filters become rows of chips over a two-across
 * grid, in a full-screen sheet.
 */
export function TemplateGallery({
  design,
  names,
  photoUrl,
  onPick,
  onClose,
}: {
  design: SiteDesign;
  names: [string, string];
  photoUrl: string | null;
  onPick: (t: SiteTemplate) => void;
  onClose: () => void;
}) {
  const [styles, setStyles] = useState<Set<TemplateStyle>>(new Set());
  const [families, setFamilies] = useState<Set<ColorFamily | "dark">>(new Set());
  const [layouts, setLayouts] = useState<Set<Layout>>(new Set());
  const [artOnly, setArtOnly] = useState(false);
  const [photoColors, setPhotoColors] = useState<PhotoColor[] | null>(null);
  const current = matchingTemplate(design);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const shown = useMemo(() => {
    const list = SITE_TEMPLATES.filter(
      (t) =>
        (styles.size === 0 || t.styles.some((s) => styles.has(s))) &&
        (families.size === 0 || families.has(t.palette.family) || (families.has("dark") && t.dark)) &&
        (layouts.size === 0 || layouts.has(layoutOf(t))) &&
        (!artOnly || t.art),
    );
    return photoColors ? [...list].sort((a, b) => photoDistance(photoColors, a) - photoDistance(photoColors, b)) : list;
  }, [styles, families, layouts, artOnly, photoColors]);

  const anyFilter = styles.size + families.size + layouts.size > 0 || artOnly;
  const clear = () => {
    setStyles(new Set());
    setFamilies(new Set());
    setLayouts(new Set());
    setArtOnly(false);
  };

  const count = (pred: (t: SiteTemplate) => boolean) => SITE_TEMPLATES.filter(pred).length;
  const match = <MatchPhoto photoUrl={photoUrl} colors={photoColors} onColors={setPhotoColors} />;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Templates"
      className="fixed inset-0 z-[60] flex flex-col bg-card"
    >
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-3 lg:px-6">
        <h2 className="font-display text-2xl font-semibold text-forest">Templates</h2>
        <span className="text-[13px] text-ink/60">
          {shown.length === SITE_TEMPLATES.length ? `${SITE_TEMPLATES.length} designs` : `${shown.length} of ${SITE_TEMPLATES.length}`}
          {photoColors ? " · best matches first" : ""}
        </span>
        <div className="flex-1" />
        {anyFilter && (
          <button type="button" onClick={clear} className="text-[13px] text-ink/60 underline underline-offset-2 hover:text-ink">
            Clear filters
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close templates"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink/70 hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Computer: the filter column. */}
        <aside className="hidden w-[280px] shrink-0 flex-col gap-7 overflow-y-auto border-r border-hairline px-6 py-5 lg:flex">
          {match}
          <FilterGroup title="Style">
            {TEMPLATE_STYLES.map((s) => (
              <Check key={s} on={styles.has(s)} onClick={() => setStyles(toggle(styles, s))}>
                {s} <span className="text-ink/45">({count((t) => t.styles.includes(s))})</span>
              </Check>
            ))}
          </FilterGroup>
          <FilterGroup title="Colour">
            {COLOR_FAMILIES.map((c) => (
              <Check key={c.id} on={families.has(c.id)} onClick={() => setFamilies(toggle(families, c.id))} dot={c.dot}>
                {c.label} <span className="text-ink/45">({count((t) => t.palette.family === c.id)})</span>
              </Check>
            ))}
            <Check on={families.has("dark")} onClick={() => setFamilies(toggle(families, "dark"))} dot="#14203d">
              Dark background <span className="text-ink/45">({count((t) => t.dark)})</span>
            </Check>
          </FilterGroup>
          <FilterGroup title="Top of the page">
            {LAYOUTS.map((l) => (
              <Check key={l.id} on={layouts.has(l.id)} onClick={() => setLayouts(toggle(layouts, l.id))}>
                {l.label} <span className="text-ink/45">({count((t) => layoutOf(t) === l.id)})</span>
              </Check>
            ))}
            <Check on={artOnly} onClick={() => setArtOnly(!artOnly)}>
              With artwork <span className="text-ink/45">({count((t) => Boolean(t.art))})</span>
            </Check>
          </FilterGroup>
        </aside>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Phone: the filters as rows of chips. */}
          <div className="flex flex-col gap-2.5 border-b border-hairline px-4 py-3 lg:hidden">
            {match}
            <ChipRow>
              {TEMPLATE_STYLES.map((s) => (
                <Chip key={s} on={styles.has(s)} onClick={() => setStyles(toggle(styles, s))}>
                  {s}
                </Chip>
              ))}
            </ChipRow>
            <ChipRow>
              {COLOR_FAMILIES.map((c) => (
                <Chip key={c.id} on={families.has(c.id)} onClick={() => setFamilies(toggle(families, c.id))} dot={c.dot}>
                  {c.label}
                </Chip>
              ))}
              <Chip on={families.has("dark")} onClick={() => setFamilies(toggle(families, "dark"))} dot="#14203d">
                Dark
              </Chip>
            </ChipRow>
            <ChipRow>
              {LAYOUTS.map((l) => (
                <Chip key={l.id} on={layouts.has(l.id)} onClick={() => setLayouts(toggle(layouts, l.id))}>
                  {l.label}
                </Chip>
              ))}
              <Chip on={artOnly} onClick={() => setArtOnly(!artOnly)}>
                With artwork
              </Chip>
            </ChipRow>
          </div>

          {shown.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
              <p className="text-[15px] text-ink/70">No templates match all of those.</p>
              <button type="button" onClick={clear} className="text-[14px] font-medium text-forest underline underline-offset-2">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:gap-5 lg:p-6 xl:grid-cols-4">
              {shown.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onPick(t)}
                  className="group flex flex-col gap-2 text-left"
                >
                  <span
                    className={`relative block overflow-hidden rounded-lg transition-shadow group-hover:shadow-md ${
                      current?.id === t.id ? "ring-2 ring-forest ring-offset-2 ring-offset-card" : "ring-1 ring-hairline"
                    }`}
                  >
                    <TemplateCard t={t} names={names} photoUrl={photoUrl} />
                    {photoColors && i < 6 && (
                      <span className="absolute left-2 top-2 rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-semibold text-forest shadow-sm">
                        Great match
                      </span>
                    )}
                  </span>
                  <span className="flex items-center justify-between gap-2 px-0.5">
                    <span className="truncate text-[14px] font-medium text-ink">{t.name}</span>
                    {current?.id === t.id ? (
                      <span className="shrink-0 text-[11px] font-semibold text-forest">Current</span>
                    ) : (
                      <span className="flex shrink-0 gap-1" aria-hidden="true">
                        {[t.palette.bg, t.palette.accent, t.palette.heading].map((c, j) => (
                          <span key={j} className="h-3 w-3 rounded-full border border-black/10" style={{ background: c }} />
                        ))}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function toggle<T>(set: Set<T>, v: T) {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink/60">{title}</p>
      {children}
    </div>
  );
}

function Check({ on, onClick, dot, children }: { on: boolean; onClick: () => void; dot?: string; children: ReactNode }) {
  return (
    <button type="button" role="checkbox" aria-checked={on} onClick={onClick} className="flex items-center gap-2.5 py-1 text-left text-[14px] text-ink">
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${
          on ? "border-forest bg-forest text-parchment" : "border-ink/25 bg-card"
        }`}
        aria-hidden="true"
      >
        {on && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L19 7" />
          </svg>
        )}
      </span>
      {dot && <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10" style={{ background: dot }} />}
      <span>{children}</span>
    </button>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4">{children}</div>;
}

function Chip({ on, onClick, dot, children }: { on: boolean; onClick: () => void; dot?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] ${
        on ? "bg-forest text-parchment" : "border border-hairline bg-card text-ink/75"
      }`}
    >
      {dot && <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: dot }} />}
      {children}
    </button>
  );
}

/**
 * The photo-palette panel: their banner photo or one picked from the device
 * (read in the browser, never uploaded), its main colours, and a way out.
 */
function MatchPhoto({
  photoUrl,
  colors,
  onColors,
}: {
  photoUrl: string | null;
  colors: PhotoColor[] | null;
  onColors: (c: PhotoColor[] | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);

  function read(src: string, revoke = false) {
    setBusy(true);
    setError(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const found = extractPhotoColors(img);
        if (found.length === 0) throw new Error("empty");
        onColors(found);
        setThumb(src);
      } catch {
        setError("We couldn't read the colours in that photo. Try choosing one from your device.");
      } finally {
        setBusy(false);
        if (revoke) setTimeout(() => URL.revokeObjectURL(src), 60_000);
      }
    };
    img.onerror = () => {
      setBusy(false);
      setError("That photo didn't load. Try choosing one from your device.");
    };
    img.src = src;
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-dashed border-ink/20 bg-parchment/60 p-3.5">
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M21 16l-5-5-8 8" />
        </svg>
        <p className="text-[14px] font-semibold text-forest">Match my photo</p>
      </div>
      {colors ? (
        <>
          <div className="flex items-center gap-2.5">
            {thumb && (
              // eslint-disable-next-line @next/next/no-img-element -- a local preview, not a page image
              <img src={thumb} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" />
            )}
            <span className="flex flex-1 overflow-hidden rounded-md">
              {colors.map((c) => (
                <span key={c.hex} className="h-7" style={{ background: c.hex, flexGrow: c.weight }} title={c.hex} />
              ))}
            </span>
          </div>
          <p className="text-[12px] leading-snug text-ink/60">Templates are sorted by how well they suit these colours.</p>
          <button
            type="button"
            onClick={() => {
              onColors(null);
              setThumb(null);
            }}
            className="self-start text-[13px] text-ink/60 underline underline-offset-2 hover:text-ink"
          >
            Stop matching
          </button>
        </>
      ) : (
        <>
          <p className="text-[12px] leading-snug text-ink/60">
            We&apos;ll find the templates whose colours suit your engagement photo. It stays on your device.
          </p>
          <div className="flex flex-wrap gap-2">
            {photoUrl && (
              <button
                type="button"
                disabled={busy}
                onClick={() => read(photoUrl)}
                className="h-9 rounded-full bg-forest px-3.5 text-[13px] font-medium text-parchment disabled:opacity-60"
              >
                Use our banner photo
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className={`h-9 rounded-full px-3.5 text-[13px] font-medium disabled:opacity-60 ${
                photoUrl ? "border border-hairline bg-card text-ink" : "bg-forest text-parchment"
              }`}
            >
              {busy ? "Reading…" : "Choose a photo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) read(URL.createObjectURL(file), true);
                e.target.value = "";
              }}
            />
          </div>
        </>
      )}
      {error && <p className="text-[12px] leading-snug text-[#8a5a00]">{error}</p>}
    </div>
  );
}

/**
 * A template drawn small: its top of the page in its own colours, fonts,
 * monogram and artwork, with the couple's names. Sized in container units so
 * the same drawing works two-across on a phone and four-across on a computer.
 */
export function TemplateCard({
  t,
  names,
  photoUrl,
}: {
  t: SiteTemplate;
  names: [string, string];
  photoUrl: string | null;
}) {
  const design = templatePreview(t);
  const { theme } = resolveDesign(design);
  const [a, b] = [names[0] || "Alex", names[1] || "Sam"];
  const art = artById(t.design.art.id);
  const sideArt = Boolean(art) && t.design.art.placement === "sides";

  const photo = (className: string, style?: CSSProperties) => (
    <span className={`absolute overflow-hidden ${className}`} style={{ background: "var(--site-photo)", ...style }}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- a thumbnail of their own photo, many on screen
        <img src={photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span
          className="block h-full w-full"
          style={{
            background:
              "radial-gradient(60% 70% at 50% 60%, color-mix(in srgb, var(--site-scrim) 22%, transparent), transparent), var(--site-photo)",
          }}
        />
      )}
    </span>
  );

  const words = (big = false) => (
    <span className="relative z-10 flex flex-col items-center text-center">
      {t.ornament !== "none" && (
        <span
          className={`block [&_svg]:!h-full [&_svg]:!w-full ${big ? "h-[30cqw] w-[30cqw]" : "h-[13cqw] w-[13cqw]"} ${
            t.ornament === "rule" ? "flex items-center justify-center [&>div]:scale-[0.45]" : ""
          }`}
        >
          <SiteOrnament kind={t.ornament} first={a} second={b} />
        </span>
      )}
      <span
        className="mt-[1.5cqw] leading-[1.05]"
        style={{
          fontFamily: "var(--font-names)",
          fontStyle: "var(--site-name-style)",
          fontWeight: "var(--site-name-weight)" as CSSProperties["fontWeight"],
          color: "var(--color-forest)",
          // Narrower when artwork stands either side, so the names clear it.
          fontSize: big ? "7cqw" : sideArt ? "6.6cqw" : "8.5cqw",
        }}
      >
        {a} &amp; {b}
      </span>
      <span className="mt-[1.5cqw] text-[2.6cqw] tracking-wide" style={{ color: "var(--site-muted)", fontFamily: "var(--font-body)" }}>
        September 4, 2027
      </span>
      <span
        className="mt-[2.5cqw] px-[3cqw] py-[0.8cqw] text-[2.4cqw]"
        style={{
          background: "var(--site-accent)",
          color: "var(--site-on-accent)",
          borderRadius: "min(var(--site-radius), 999px)",
          fontFamily: "var(--font-body)",
        }}
      >
        RSVP
      </span>
    </span>
  );

  const artPiece = (side: "l" | "r") =>
    art && (
      <span
        aria-hidden="true"
        className="absolute"
        style={{
          ...(t.design.art.placement === "corners"
            ? side === "l"
              ? { left: "-3%", top: "-4%", height: "48%", width: "30%", rotate: "-28deg" }
              : { right: "-3%", bottom: "-4%", height: "48%", width: "30%", rotate: "152deg" }
            : side === "l"
              ? { left: "2%", top: "14%", height: "72%", width: "19%" }
              : { right: "2%", top: "14%", height: "72%", width: "19%" }),
          transform: side === "r" ? "scaleX(-1)" : undefined,
          ...(art.kind === "line"
            ? {
                background: "var(--site-accent)",
                WebkitMaskImage: `url(${art.src})`,
                maskImage: `url(${art.src})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "top",
                maskPosition: "top",
              }
            : {
                backgroundImage: `url(${art.src})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top",
              }),
        }}
      />
    );

  return (
    <span
      className="relative block aspect-[4/3] w-full overflow-hidden [container-type:inline-size]"
      style={{ ...(designCssVars(design) as CSSProperties), background: theme.bg }}
      aria-hidden="true"
    >
      {t.hero === "full" && (
        <>
          {photo("inset-x-0 top-0 h-[56%]")}
          <span
            className="absolute left-1/2 top-[38%] flex w-[64%] -translate-x-1/2 flex-col items-center py-[4cqw]"
            style={{ background: "var(--color-card)", borderRadius: "min(var(--site-radius), 0.6rem)" }}
          >
            {words()}
          </span>
        </>
      )}
      {t.hero === "split" && (
        <>
          {photo("inset-y-0 left-0 w-1/2")}
          <span className="absolute inset-y-0 right-0 flex w-1/2 items-center justify-center">{words()}</span>
        </>
      )}
      {t.hero === "framed" && (
        <>
          {artPiece("l")}
          {artPiece("r")}
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-[2cqw]">
            <span
              className="relative z-10 rounded-[100px_100px_4px_4px] border p-[0.8cqw]"
              style={{ borderColor: "var(--site-accent)" }}
            >
              <span className="relative block h-[22cqw] w-[16cqw] overflow-hidden rounded-[100px_100px_3px_3px]">
                {photo("inset-0")}
              </span>
            </span>
            {words()}
          </span>
        </>
      )}
      {t.hero === "monogram" && (
        <span
          className="absolute inset-[4%] flex items-center justify-center overflow-hidden border"
          style={{ borderColor: "color-mix(in srgb, var(--site-accent) 45%, transparent)" }}
        >
          {artPiece("l")}
          {artPiece("r")}
          {words(true)}
        </span>
      )}
      {t.hero === "text" && (
        <span className="absolute inset-0 flex items-center justify-center">
          {artPiece("l")}
          {artPiece("r")}
          {words()}
        </span>
      )}
    </span>
  );
}
