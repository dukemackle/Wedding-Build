"use client";

import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import {
  CONFETTI_MESSAGE,
  DESIGN_MESSAGE,
  READY_MESSAGE,
  REPLAY_MESSAGE,
} from "@/components/guest-site-theme";
import {
  THEMES,
  contrast,
  fontsHref,
  resolveDesign,
  sameDesign,
  type SectionKey,
  type SiteDesign,
  type SiteTheme,
} from "@/lib/site-design";
import { publishSiteDesign, saveSiteDraft } from "./actions";
import { MotionTab, PanelLabel, SectionsTab, StyleTab, type ChecklistItem, type SectionInfo } from "./editor-tabs";

type Device = "desktop" | "phone";
type Tab = "theme" | "style" | "motion" | "sections";

const TABS: { key: Tab; label: string }[] = [
  { key: "theme", label: "Theme" },
  { key: "style", label: "Style" },
  { key: "motion", label: "Motion" },
  { key: "sections", label: "Sections" },
];

// Desktop preview is laid out at a real laptop width and scaled down to fit,
// so what the couple sees is the actual arrangement guests get on a computer,
// not the page squeezed into whatever room the editor leaves.
const DESKTOP_W = 1280;
const PHONE_W = 390;
const PHONE_H = 844;

const LG = "(min-width: 1024px)";

/**
 * The guest site editor: settings on the left, the site itself on the right.
 * On a phone the site is the page and the settings are a sheet pulled up
 * over it, the same arrangement as Venues.
 *
 * Every change is saved as a draft straight away; guests see nothing until
 * Publish.
 */
export function SiteEditor({
  draft: initialDraft,
  published: initialPublished,
  publicSlug,
  origin,
  contentKey,
  sitePanel,
  sectionInfo,
  checklist,
  hasPhoto,
}: {
  draft: SiteDesign;
  published: SiteDesign;
  publicSlug: string | null;
  origin: string;
  /** Changes whenever the site's content does, so the preview reloads to show it. */
  contentKey: string;
  /** The site's on/off switch and link. */
  sitePanel: ReactNode;
  /** Each section's status line, and its content editor where it has one. */
  sectionInfo: Partial<Record<SectionKey, SectionInfo>>;
  /** The "before you share" list. */
  checklist: ChecklistItem[];
  /** Hero layouts only show with a banner photo; the Style tab says so. */
  hasPhoto: boolean;
}) {
  const [design, setDesign] = useState(initialDraft);
  const [published, setPublished] = useState(initialPublished);
  const [tab, setTab] = useState<Tab>("theme");
  const [device, setDevice] = useState<Device>("desktop");
  const [isDesktop, setIsDesktop] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, startPublish] = useTransition();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  // Everything above and below the editor. The height itself is left to CSS
  // (100dvh less this): on a phone, innerHeight read before the viewport
  // settles is the 980px-wide layout's, and the sheet ended up off-screen.
  const [offset, setOffset] = useState<number | null>(null);

  const dirty = !sameDesign(design, published);

  // For the preview's "ready" handler, which outlives any one render.
  const designRef = useRef(design);
  useEffect(() => {
    designRef.current = design;
  }, [design]);

  // Phone screens start on the phone preview; there's no computer to show it on.
  useEffect(() => {
    const query = window.matchMedia(LG);
    function sync() {
      setIsDesktop(query.matches);
      if (!query.matches) setDevice("phone");
    }
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Fills what's left of the screen under the nav, like the Venues map:
  // the panel and the preview scroll, the page doesn't.
  useEffect(() => {
    let frame = 0;
    function measure() {
      const el = rootRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const footer = document.querySelector("footer.site-footer");
      const footerHeight = footer ? footer.getBoundingClientRect().height : 0;
      setOffset(top + footerHeight);
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }
    schedule();
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const sendDesign = useCallback((next: SiteDesign) => {
    frameRef.current?.contentWindow?.postMessage(
      { type: DESIGN_MESSAGE, design: next },
      window.location.origin,
    );
  }, []);

  // The preview asks for the design once it has loaded, including after a
  // reload for new content, so it never shows a stale draft.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === READY_MESSAGE) sendDesign(designRef.current);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendDesign]);

  const firstContentKey = useRef(contentKey);
  useEffect(() => {
    if (contentKey === firstContentKey.current) return;
    firstContentKey.current = contentKey;
    frameRef.current?.contentWindow?.location.reload();
  }, [contentKey]);

  const post = useCallback((type: string) => {
    frameRef.current?.contentWindow?.postMessage({ type }, window.location.origin);
  }, []);

  function change(patch: Partial<SiteDesign>) {
    const next = { ...design, ...patch };
    setDesign(next);
    sendDesign(next);
    // A motion change plays straight away, so the couple sees what it does.
    if (patch.motion) post(REPLAY_MESSAGE);
    setError(null);
    setSaveState("saving");
    clearTimeout(saveTimer.current);
    // The colour picker fires on every drag step; one save per pause is plenty.
    saveTimer.current = setTimeout(async () => {
      const result = await saveSiteDraft(next).catch(() => ({
        error: "Couldn't save — check your connection.",
      }));
      if (result.error) {
        setSaveState("error");
        setError(result.error);
      } else {
        setSaveState("idle");
      }
    }, 500);
  }

  function publish() {
    clearTimeout(saveTimer.current);
    startPublish(async () => {
      const result = await publishSiteDesign(design).catch(() => ({
        error: "Couldn't publish — check your connection.",
      }));
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        setSaveState("idle");
        setPublished(design);
      }
    });
  }

  const status = error
    ? error
    : saveState === "saving"
      ? "Saving draft…"
      : dirty
        ? publicSlug
          ? "Draft — guests don't see this yet"
          : "Draft — your site is off"
        : "Guests see this version";

  const liveHref = publicSlug ? `${origin}/w/${publicSlug}` : null;

  const publishButton = (
    <button
      type="button"
      onClick={publish}
      disabled={!dirty || isPublishing}
      className="h-10 shrink-0 rounded-md bg-forest px-4 text-sm font-semibold text-parchment transition-colors hover:bg-forest/90 disabled:cursor-default disabled:bg-forest/40"
    >
      {isPublishing ? "Publishing…" : dirty ? "Publish changes" : "Published"}
    </button>
  );

  const tabStrip = (
    <div role="tablist" aria-label="Editor" className="flex gap-1 rounded-lg bg-ink/[0.05] p-1">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={tab === t.key}
          onClick={() => {
            setTab(t.key);
            setSheetOpen(true);
          }}
          className={`h-9 flex-1 rounded-md text-sm transition-colors ${
            tab === t.key ? "bg-card font-semibold text-forest shadow-sm" : "text-ink/70 hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const panelBody = (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-5 lg:px-6">
      {tab === "theme" ? (
        <ThemeTab design={design} onChange={change} />
      ) : tab === "motion" ? (
        <MotionTab
          design={design}
          onChange={change}
          onReplay={() => post(REPLAY_MESSAGE)}
          onTryConfetti={() => post(CONFETTI_MESSAGE)}
        />
      ) : tab === "style" ? (
        <StyleTab design={design} onChange={change} hasPhoto={hasPhoto} />
      ) : (
        <SectionsTab
          design={design}
          onChange={change}
          sitePanel={sitePanel}
          info={sectionInfo}
          checklist={checklist}
        />
      )}
    </div>
  );

  const deviceToggle = (
    <div
      role="group"
      aria-label="Preview size"
      className="flex gap-1 rounded-lg border border-hairline bg-card p-1 shadow-sm lg:shadow-none"
    >
      {(
        [
          ["desktop", "Computer", <ComputerIcon key="c" />],
          ["phone", "Phone", <PhoneIcon key="p" />],
        ] as const
      ).map(([key, label, icon]) => (
        <button
          key={key}
          type="button"
          aria-pressed={device === key}
          onClick={() => setDevice(key)}
          className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] transition-colors ${
            device === key ? "bg-forest text-parchment" : "text-ink/70 hover:text-ink"
          }`}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <>
    {/* The theme cards and font samples are drawn in the real faces. */}
    <link rel="stylesheet" href={fontsHref(THEMES)} precedence="default" />
    <div
      ref={rootRef}
      // Breaks out of the page's side and bottom padding: the preview reaches
      // the edges, as on Venues.
      className="relative -mx-6 -mb-16 flex"
      style={{ height: `max(480px, calc(100dvh - ${offset ?? 128}px))` }}
    >
      {/* Desktop: the settings panel. */}
      {isDesktop && (
        <aside className="flex w-[400px] shrink-0 flex-col border-r border-hairline bg-card">
          <div className="flex flex-col gap-3.5 border-b border-hairline px-6 pb-4 pt-5">
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-3xl font-semibold text-forest">Your guest site</h1>
              <LiveBadge live={Boolean(publicSlug)} />
            </div>
            {tabStrip}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{panelBody}</div>
        </aside>
      )}

      {/* The preview. */}
      <section aria-label="Preview" className="relative flex min-w-0 flex-1 flex-col bg-[#eef0ec]">
        {isDesktop ? (
          <div className="flex h-[60px] shrink-0 items-center gap-3 px-6">
            {deviceToggle}
            <button
              type="button"
              onClick={() => post(REPLAY_MESSAGE)}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-hairline bg-card px-3.5 text-[13px] text-ink hover:border-ink/30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12a8 8 0 1 0 2.3-5.6" />
                <path d="M4 4v4h4" />
              </svg>
              Replay motion
            </button>
            <div className="flex-1" />
            <span className={`text-[13px] ${error ? "text-red-700" : "text-ink/60"}`} role="status">
              {status}
            </span>
            {liveHref && (
              <a
                href={liveHref}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-forest hover:underline"
              >
                Open live site
              </a>
            )}
            {publishButton}
          </div>
        ) : (
          <div className="absolute right-3 top-3 z-10">{deviceToggle}</div>
        )}

        <PreviewStage
          device={device}
          fill={!isDesktop && device === "phone"}
          frameRef={frameRef}
          address={publicSlug ? `wrenwed.com/w/${publicSlug}` : "Preview — your site is off"}
          bottomInset={isDesktop ? 0 : SHEET_PEEK_PX}
        />
      </section>

      {/* Phone: the settings are a sheet over the preview. */}
      {!isDesktop && (
        <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <div className="flex items-center gap-3 px-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="whitespace-nowrap font-display text-xl font-semibold text-forest">Guest site</h1>
                <LiveBadge live={Boolean(publicSlug)} />
              </div>
              <p
                className={`truncate text-xs ${error ? "text-red-700" : "text-ink/60"}`}
                role="status"
              >
                {status}
              </p>
            </div>
            {publishButton}
          </div>
          <div className="px-5 pt-3">{tabStrip}</div>
          <div className="mt-1 min-h-0 flex-1 overflow-y-auto">
            {panelBody}
            {liveHref && (
              <p className="px-5 pb-8 text-sm">
                <a href={liveHref} target="_blank" rel="noreferrer" className="font-medium text-forest underline">
                  Open live site
                </a>
              </p>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
    </>
  );
}

function LiveBadge({ live }: { live: boolean }) {
  return live ? (
    <span className="rounded-full bg-forest/10 px-2 py-0.5 text-xs font-semibold text-forest">Live</span>
  ) : (
    <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-xs font-semibold text-ink/60">Off</span>
  );
}

function ThemeTab({
  design,
  onChange,
}: {
  design: SiteDesign;
  onChange: (patch: Partial<SiteDesign>) => void;
}) {
  const { theme, accent } = resolveDesign(design);
  const custom = design.accent !== null && !theme.swatches.includes(design.accent as never);
  // Small labels and links are drawn in the accent, so a pale accent on a pale
  // theme (or dark on dark) makes them hard to read. Said, not prevented.
  const lowContrast = contrast(accent, theme.bg) < 3;

  return (
    <>
      <div className="flex flex-col gap-3">
        <PanelLabel>Theme</PanelLabel>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              selected={t.id === design.theme}
              onPick={() => onChange({ theme: t.id, accent: null })}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <PanelLabel>Accent colour</PanelLabel>
        <div className="flex flex-wrap items-center gap-2.5">
          {theme.swatches.map((hex, i) => (
            <button
              key={hex}
              type="button"
              aria-label={`Accent ${i + 1}`}
              aria-pressed={accent === hex && !custom}
              onClick={() => onChange({ accent: i === 0 ? null : hex })}
              className={`flex h-11 w-11 items-center justify-center rounded-full bg-card ${
                accent === hex && !custom ? "border-2 border-ink" : "m-px border border-hairline"
              }`}
            >
              <span className="h-8 w-8 rounded-full" style={{ background: hex }} />
            </button>
          ))}
          <label
            className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-card text-ink/60 ${
              custom ? "border-2 border-ink" : "m-px border border-dashed border-ink/30"
            }`}
            title="Custom colour"
          >
            <span className="sr-only">Custom colour</span>
            {custom ? (
              <span className="h-8 w-8 rounded-full" style={{ background: accent }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
            <input
              type="color"
              value={accent}
              onChange={(e) => onChange({ accent: e.target.value.toLowerCase() })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </label>
        </div>
        {lowContrast && (
          <p className="text-[13px] leading-snug text-[#8a5a00]">
            This colour is hard to read on {theme.name}&apos;s background — it&apos;s used for small
            labels and links.
          </p>
        )}
        <p className="text-[13px] leading-normal text-ink/60">
          Switching themes keeps everything you&apos;ve written — only the look changes.
        </p>
      </div>
    </>
  );
}

function ThemeCard({
  theme,
  selected,
  onPick,
}: {
  theme: SiteTheme;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      className={`overflow-hidden rounded-xl bg-card text-left ${
        selected ? "border-2 border-forest" : "m-px border border-hairline hover:border-ink/30"
      }`}
    >
      <div
        className="flex h-[92px] flex-col items-center justify-center gap-2"
        style={{ background: theme.bg, color: theme.ink }}
      >
        <span
          className="text-[28px] leading-none"
          style={{
            fontFamily: theme.display,
            fontStyle: theme.italicNames ? "italic" : "normal",
            fontWeight: theme.nameWeight,
          }}
        >
          M &amp; J
        </span>
        <span className="flex gap-1" aria-hidden="true">
          <span className="h-3.5 w-3.5 rounded-full" style={{ background: theme.swatches[0] }} />
          <span
            className="h-3.5 w-3.5 rounded-full border"
            style={{ background: theme.surface, borderColor: theme.ink }}
          />
          <span className="h-3.5 w-3.5 rounded-full" style={{ background: theme.ink }} />
        </span>
      </div>
      <span className="flex items-center justify-between border-t border-hairline px-2.5 py-2">
        <span className="text-[13px] font-medium text-ink">{theme.name}</span>
        <span className="text-[11px] text-ink/60">{theme.mood}</span>
      </span>
    </button>
  );
}

/**
 * The preview frame, laid out at a real device width and scaled to fit.
 * One iframe throughout: switching device restyles it rather than reloading.
 */
function PreviewStage({
  device,
  fill,
  frameRef,
  address,
  bottomInset,
}: {
  device: Device;
  /** On a phone showing the phone view: the preview is simply the screen. */
  fill: boolean;
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  address: string;
  bottomInset: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let outer: React.CSSProperties;
  let inner: React.CSSProperties;
  let chrome: "browser" | "phone" | "none";

  if (fill) {
    chrome = "none";
    outer = { width: "100%", height: "100%" };
    inner = { width: "100%", height: "100%" };
  } else if (device === "desktop") {
    chrome = "browser";
    const bar = 36;
    const scale = Math.min(1, size.w / DESKTOP_W) || 1;
    const frameH = Math.max(0, size.h - bottomInset - bar);
    outer = { width: size.w, height: frameH };
    inner = {
      width: DESKTOP_W,
      height: frameH / scale,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    };
  } else {
    chrome = "phone";
    const bezel = 10;
    const available = Math.max(0, size.h - bottomInset - 8);
    const scale = Math.min(1, available / (PHONE_H + bezel * 2), size.w / (PHONE_W + bezel * 2)) || 1;
    outer = { width: PHONE_W * scale, height: PHONE_H * scale };
    inner = {
      width: PHONE_W,
      height: PHONE_H,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    };
  }

  return (
    <div
      ref={stageRef}
      className={`flex min-h-0 flex-1 justify-center ${fill ? "" : "items-start px-3 pb-3 lg:px-6 lg:pb-6"} ${
        !fill && chrome === "phone" ? "pt-14 lg:pt-0" : ""
      } ${!fill && chrome === "browser" ? "pt-14 lg:pt-0" : ""}`}
    >
      <div
        className={
          chrome === "browser"
            ? "flex w-full flex-col overflow-hidden rounded-xl border border-[#d9ddd6] bg-card shadow-sm"
            : chrome === "phone"
              ? "overflow-hidden rounded-[44px] border-[10px] border-[#1b1f1c] bg-card shadow-lg"
              : "h-full w-full"
        }
      >
        {chrome === "browser" && (
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-hairline bg-[#f7f7f5] px-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            </span>
            <span className="mx-auto truncate rounded-md bg-card px-3 py-0.5 text-xs text-ink/60">
              {address}
            </span>
          </div>
        )}
        <div className="overflow-hidden" style={outer}>
          <iframe
            ref={frameRef}
            src="/guests/site/preview"
            title="Guest site preview"
            className="block border-0 bg-card"
            style={inner}
          />
        </div>
      </div>
    </div>
  );
}

const SHEET_PEEK_PX = 148;
const SHEET_FULL = 0.86;

/** The phone settings sheet: peeks with the title and tabs, drags up to edit. */
function BottomSheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const startY = useRef(0);
  const moved = useRef(false);

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-2xl border-t border-hairline bg-card shadow-[0_-6px_24px_rgb(11_74_58/0.18)]"
      style={{
        height: open ? `${SHEET_FULL * 100}%` : SHEET_PEEK_PX,
        transform: drag === null ? undefined : `translateY(${drag}px)`,
        transition: drag === null ? "height 220ms ease, transform 220ms ease" : "none",
      }}
    >
      <button
        type="button"
        aria-label={open ? "Lower the editor" : "Raise the editor"}
        aria-expanded={open}
        className="flex h-6 w-full shrink-0 touch-none items-center justify-center"
        onPointerDown={(e) => {
          startY.current = e.clientY;
          moved.current = false;
          setDrag(0);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag === null) return;
          const dy = e.clientY - startY.current;
          if (Math.abs(dy) > 4) moved.current = true;
          setDrag(open ? Math.max(0, dy) : Math.min(0, dy));
        }}
        onPointerUp={() => {
          if (drag !== null && Math.abs(drag) > 60) onOpenChange(!open);
          else if (!moved.current) onOpenChange(!open);
          setDrag(null);
        }}
        onPointerCancel={() => setDrag(null)}
      >
        <span className="h-1.5 w-10 rounded-full bg-hairline" />
      </button>
      {children}
    </div>
  );
}

function ComputerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}
