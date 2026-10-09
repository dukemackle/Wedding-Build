"use client";

import Link from "next/link";
import { useCallback, useEffect, useEffectEvent, useRef, useState, useTransition, type ReactNode } from "react";
import {
  CONFETTI_MESSAGE,
  DESIGN_MESSAGE,
  READY_MESSAGE,
  REPLAY_MESSAGE,
  TEXT_EDIT_MESSAGE,
  TEXT_SELECT_MESSAGE,
} from "@/components/guest-site-theme";
import {
  ALL_FONTS_HREF,
  COLOR_FAMILIES,
  EMPTY_TEXT_STYLE,
  TEXT_SLOTS,
  hasTextStyle,
  PALETTES,
  THEMES,
  THEME_GROUPS,
  activePalette,
  contrast,
  isDark,
  paletteColors,
  resolveDesign,
  themeById,
  type ColorFamily,
  sameDesign,
  type SectionKey,
  type SiteDesign,
  type SiteTheme,
  type TextSlotId,
  type TextStyle,
} from "@/lib/site-design";
import { TextToolbar } from "./text-toolbar";
import { canvasSchema } from "@/lib/site-canvas-schema";
import { filterCss, PHOTO_FILTERS, findElement, updateElement, type CanvasElement, type SiteCanvas } from "@/lib/site-canvas";
import {
  CANVAS_ACTION,
  CANVAS_COMMIT,
  CANVAS_FRAMES,
  CANVAS_KEY,
  CANVAS_MODE,
  CANVAS_PANEL,
  CANVAS_SELECT,
  type CanvasFrames,
  type CanvasSelection,
} from "./canvas-messages";
import { CanvasToolbar, ElementsTab, PositionPanel } from "./canvas-panels";
import { PhoneTools, Sheet, Tool } from "./phone-tools";
import { AnimatePanel, FocusPicker, PhotoPanel } from "./photo-motion-panels";
import { TemplatesTab } from "./templates-tab";
import { DescribeSite, WrenWrite } from "./wren-panels";
import { BackgroundTab, FontsTab, PhotoColoursSection, TargetColourSection, type PickTarget } from "./look-panels";
import { publishSiteDesign, saveSiteDraft } from "./actions";
import { BirdCheer } from "@/components/bird-cheer";
import { PublicSitePanel, SiteSwitch, useGuestSite } from "../public-site-panel";
import { MotionTab, PanelLabel, SectionsTab, StyleTab, type ChecklistItem, type SectionInfo } from "./editor-tabs";

type Device = "desktop" | "phone";
// Position opens from a picked element rather than the tab strip.
// Position, Photo and Animate open from a picked element rather than the rail.
type Tab =
  | "templates"
  | "theme"
  | "style"
  | "colour"
  | "fonts"
  | "background"
  | "motion"
  | "sections"
  | "elements"
  | "position"
  | "photo"
  | "animate";

const TABS: { key: Tab; label: string }[] = [
  { key: "templates", label: "Templates" },
  { key: "theme", label: "Theme" },
  { key: "style", label: "Style" },
  { key: "colour", label: "Colour" },
  { key: "fonts", label: "Fonts" },
  { key: "background", label: "Background" },
  { key: "motion", label: "Motion" },
  { key: "sections", label: "Sections" },
  { key: "elements", label: "Elements" },
];

// Desktop preview is laid out at a real laptop width and scaled down to fit,
// so what the couple sees is the actual arrangement guests get on a computer,
// not the page squeezed into whatever room the editor leaves.
const DESKTOP_W = 1280;
const PHONE_W = 390;
const PHONE_H = 844;

const LG = "(min-width: 1024px)";

/** The phone editor's bottom tabs, drawn like its tools. */
const TAB_ICONS = {
  templates: "templates",
  theme: "theme",
  style: "styleTab",
  colour: "colour",
  fonts: "fonts",
  background: "background",
  motion: "motion",
  sections: "sections",
  elements: "elements",
} as const;

/**
 * The guest site editor: settings on the left, the site itself on the right.
 * On a phone the site is the page and the settings are a sheet pulled up
 * over it, the same arrangement as Venues.
 *
 * Every design change is saved as a draft straight away; guests see nothing
 * until Publish. Section content (words, photos, FAQs, blocks) saves to the
 * live site directly.
 */
export function SiteEditor({
  draft: initialDraft,
  published: initialPublished,
  publicSlug: initialSlug,
  origin,
  contentKey,
  sectionInfo,
  checklist,
  hasPhoto,
  names,
  photos,
}: {
  draft: SiteDesign;
  published: SiteDesign;
  publicSlug: string | null;
  origin: string;
  /** Changes whenever the site's content does, so the preview reloads to show it. */
  contentKey: string;
  /** Each section's status line, and its content editor where it has one. */
  sectionInfo: Partial<Record<SectionKey, SectionInfo>>;
  /** The "before you share" list. */
  checklist: ChecklistItem[];
  /** Hero layouts only show with a banner photo; the Style tab says so. */
  hasPhoto: boolean;
  names: [string, string];
  /** The banner and gallery photos, to place on the page from Elements. */
  photos: string[];
}) {
  const site = useGuestSite(initialSlug);
  const publicSlug = site.slug;
  const [design, setDesign] = useState(initialDraft);
  const [published, setPublished] = useState(initialPublished);
  const [tab, setTab] = useState<Tab>("templates");
  const [device, setDevice] = useState<Device>("desktop");
  const [isDesktop, setIsDesktop] = useState(true);
  // Phone editor (phase 3b): the sheet open over the bottom bar, and
  // "Preview", which hides the tools to see the site as guests will.
  const [phoneSheet, setPhoneSheet] = useState<Tab | "more" | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, startPublish] = useTransition();
  // Counts publishes, to key the reveal sweep and the bird so each replays.
  const [launches, setLaunches] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  // Everything above and below the editor. The height itself is left to CSS
  // (100dvh less this): on a phone, innerHeight read before the viewport
  // settles is the 980px-wide layout's, and the sheet ended up off-screen.
  const [offset, setOffset] = useState<number | null>(null);

  const dirty = !sameDesign(design, published);

  // The latest design, for message and key handlers that outlive a render
  // and for changes that land faster than React re-renders.
  const designRef = useRef(design);
  // The words clicked in the preview, whose toolbar is showing.
  const [textSlot, setTextSlot] = useState<TextSlotId | null>(null);
  // Undo and redo: whole designs, newest last.
  const past = useRef<SiteDesign[]>([]);
  const future = useRef<SiteDesign[]>([]);
  const lastRecorded = useRef(0);
  const [historySize, setHistorySize] = useState({ past: 0, future: 0 });
  // Free elements (phase 2): what's picked in the preview, and each section's size there.
  const [canvasSel, setCanvasSel] = useState<CanvasSelection>(null);
  const [frames, setFrames] = useState<CanvasFrames>({});
  const [phoneFrames, setPhoneFrames] = useState<CanvasFrames>({});
  // Where Position's close button goes back to.
  const [lastTab, setLastTab] = useState<Exclude<Tab, "position" | "photo" | "animate">>("elements");

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

  // Placed elements are editable in both previews: the Computer one moves
  // them, the Phone one arranges the phone layout (the frame tells by width).
  // Off only while previewing on a phone.
  const editingOn = isDesktop || !previewing;
  const sendMode = useCallback((on: boolean) => {
    frameRef.current?.contentWindow?.postMessage({ type: CANVAS_MODE, on }, window.location.origin);
  }, []);
  const onFrameReady = useEffectEvent(() => sendMode(editingOn));
  useEffect(() => sendMode(editingOn), [editingOn, sendMode]);

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
      if (event.data?.type === READY_MESSAGE) {
        sendDesign(designRef.current);
        onFrameReady();
      }
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

  /** Shows a design and saves it as the draft, without touching undo. */
  function apply(next: SiteDesign) {
    designRef.current = next;
    setDesign(next);
    sendDesign(next);
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

  function change(patch: Partial<SiteDesign>) {
    const now = Date.now();
    // A colour drag or a run of clicks within a moment is one step to undo.
    if (now - lastRecorded.current > 700) {
      past.current = [...past.current.slice(-99), designRef.current];
    }
    lastRecorded.current = now;
    future.current = [];
    setHistorySize({ past: past.current.length, future: future.current.length });
    apply({ ...designRef.current, ...patch });
    // A motion change plays straight away, so the couple sees what it does.
    if (patch.motion) post(REPLAY_MESSAGE);
  }

  function undo() {
    const previous = past.current.at(-1);
    if (!previous) return;
    past.current = past.current.slice(0, -1);
    future.current = [...future.current, designRef.current];
    lastRecorded.current = 0;
    setHistorySize({ past: past.current.length, future: future.current.length });
    apply(previous);
  }

  function redo() {
    const next = future.current.at(-1);
    if (!next) return;
    future.current = future.current.slice(0, -1);
    past.current = [...past.current, designRef.current];
    lastRecorded.current = 0;
    setHistorySize({ past: past.current.length, future: future.current.length });
    apply(next);
  }

  /** One slot's style; null puts it back to the theme's. */
  function changeText(slot: TextSlotId, patch: Partial<TextStyle> | null) {
    const text = { ...designRef.current.text };
    const style = patch ? { ...EMPTY_TEXT_STYLE, ...text[slot], ...patch } : null;
    if (style && hasTextStyle(style)) text[slot] = style;
    else delete text[slot];
    change({ text });
  }

  function changeCanvas(canvas: SiteCanvas) {
    change({ canvas });
  }

  /** Picks something in the preview from a panel, or clears it. */
  function selectCanvas(next: CanvasSelection) {
    setCanvasSel(next);
    if (next) setPhoneSheet(null);
    if (next) setTextSlot(null);
    frameRef.current?.contentWindow?.postMessage({ type: CANVAS_SELECT, selection: next }, window.location.origin);
  }

  function openTab(next: Tab) {
    const floating = (t: Tab) => t === "position" || t === "photo" || t === "animate";
    if (floating(next) && !floating(tab)) setLastTab(tab);
    setTab(next);
  }

  function closeText() {
    setTextSlot(null);
    frameRef.current?.contentWindow?.postMessage({ type: TEXT_SELECT_MESSAGE, slot: null }, window.location.origin);
  }

  // Called from handlers attached once, so they always see the latest render.
  const onTypedText = useEffectEvent((slot: TextSlotId, text: string) => changeText(slot, { text: text || null }));
  const onUndo = useEffectEvent(() => undo());
  const onRedo = useEffectEvent(() => redo());
  const onCanvasCommit = useEffectEvent((canvas: unknown) => {
    const parsed = canvasSchema.safeParse(canvas);
    if (parsed.success) changeCanvas(parsed.data);
  });
  const onCanvasPanel = useEffectEvent(() => openTab("position"));

  // Words clicked or retyped in the preview.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.type === TEXT_SELECT_MESSAGE) {
        const slot = TEXT_SLOTS.find((s) => s.id === event.data.slot)?.id ?? null;
        setTextSlot(slot);
        if (slot) setPhoneSheet(null);
      }
      if (event.data?.type === CANVAS_SELECT) {
        const next = event.data.selection as CanvasSelection;
        setCanvasSel(next && typeof next.section === "string" ? next : null);
        if (next) {
          setTextSlot(null);
          setPhoneSheet(null);
        }
      }
      if (event.data?.type === CANVAS_COMMIT) onCanvasCommit(event.data.canvas);
      if (event.data?.type === CANVAS_FRAMES && event.data.frames) {
        // Computer sizes place new elements; phone sizes line things up on the phone layout.
        if (event.data.frame === "phone") setPhoneFrames(event.data.frames as CanvasFrames);
        else setFrames(event.data.frames as CanvasFrames);
      }
      if (event.data?.type === CANVAS_PANEL) onCanvasPanel();
      if (event.data?.type === CANVAS_KEY) {
        if (event.data.action === "undo") onUndo();
        else if (event.data.action === "redo") onRedo();
      }
      if (event.data?.type === TEXT_EDIT_MESSAGE && typeof event.data.text === "string") {
        const slot = TEXT_SLOTS.find((s) => s.id === event.data.slot);
        if (slot?.words) onTypedText(slot.id, event.data.text.slice(0, 120));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y), except while typing in a field.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) onUndo();
      else if ((key === "z" && event.shiftKey) || key === "y") onRedo();
      else return;
      event.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
        setLaunches((n) => n + 1);
        post(REPLAY_MESSAGE);
      }
    });
  }

  const status = error
    ? error
    : saveState === "saving"
      ? "Saving draft…"
      : dirty
        ? publicSlug
          ? "Design changes not published yet"
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

  // Whatever is picked that Fonts and Colour can restyle instead of the whole site.
  const pickedElement = canvasSel?.id ? findElement(design.canvas, canvasSel.section, canvasSel.id) : null;
  const pickTarget: PickTarget | null = textSlot
    ? {
        label: TEXT_SLOTS.find((s) => s.id === textSlot)?.label.toLowerCase() ?? "these words",
        font: { value: design.text[textSlot]?.font ?? null },
        colour: { value: design.text[textSlot]?.color ?? null },
      }
    : pickedElement
      ? {
          label: pickedElement.kind === "text" ? `“${pickedElement.text.split("\n")[0].slice(0, 24)}”` : "the picked art",
          font: pickedElement.kind === "text" ? { value: pickedElement.font } : undefined,
          colour:
            "color" in pickedElement ? { value: pickedElement.color.startsWith("#") ? pickedElement.color : null } : undefined,
        }
      : null;

  function setTargetFont(id: string) {
    if (textSlot) changeText(textSlot, { font: id as TextStyle["font"] });
    else if (canvasSel?.id) changeCanvas(updateElement(designRef.current.canvas, canvasSel.section, canvasSel.id, { font: id } as Partial<CanvasElement>));
  }

  function setTargetColour(hex: string) {
    if (textSlot) changeText(textSlot, { color: hex });
    else if (canvasSel?.id) changeCanvas(updateElement(designRef.current.canvas, canvasSel.section, canvasSel.id, { color: hex } as Partial<CanvasElement>));
  }

  const targetActions = { font: setTargetFont, colour: setTargetColour };

  const panelBody = (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-5 lg:px-6">
      {tab === "elements" ? (
        <ElementsTab
          design={design}
          frames={frames}
          selection={canvasSel}
          photos={photos}
          onCanvas={changeCanvas}
          onSelect={selectCanvas}
        />
      ) : tab === "position" && isDesktop ? (
        <PositionPanel
          design={design}
          frames={frames}
          phoneFrames={phoneFrames}
          device={device}
          selection={canvasSel}
          onCanvas={changeCanvas}
          onSelect={selectCanvas}
          onClose={() => setTab(lastTab)}
        />
      ) : tab === "photo" || tab === "animate" ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-forest">{tab === "photo" ? "Photo" : "Animate"}</h2>
            <button
              type="button"
              onClick={() => setTab(lastTab)}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/70 hover:bg-ink/[0.05] hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          {tab === "photo" ? (
            <PhotoPanel design={design} selection={canvasSel} onCanvas={changeCanvas} />
          ) : (
            <AnimatePanel design={design} selection={canvasSel} onCanvas={changeCanvas} />
          )}
        </>
      ) : tab === "templates" ? (
        <>
          <DescribeSite design={design} onChange={change} />
          <TemplatesTab design={design} names={names} onChange={change} />
        </>
      ) : tab === "theme" ? (
        <ThemeTab design={design} onChange={change} part="themes" />
      ) : tab === "colour" ? (
        <ThemeTab design={design} onChange={change} part="colours">
          {pickTarget?.colour && <TargetColourSection design={design} target={pickTarget} actions={targetActions} />}
          <PhotoColoursSection
            photos={photos}
            target={pickTarget?.colour ? pickTarget : null}
            actions={targetActions}
            onChange={change}
          />
        </ThemeTab>
      ) : tab === "fonts" ? (
        <FontsTab design={design} onChange={change} target={pickTarget?.font ? pickTarget : null} actions={targetActions} />
      ) : tab === "background" ? (
        <BackgroundTab design={design} onChange={change} />
      ) : tab === "motion" ? (
        <MotionTab
          design={design}
          onChange={change}
          onReplay={() => post(REPLAY_MESSAGE)}
          onTryConfetti={() => post(CONFETTI_MESSAGE)}
        />
      ) : tab === "style" ? (
        <>
          <StyleTab design={design} onChange={change} hasPhoto={hasPhoto} names={names} />
          {hasPhoto && photos[0] && (
            <div className="flex flex-col gap-3">
              <PanelLabel>Banner photo</PanelLabel>
              <FocusPicker
                src={photos[0]}
                fx={design.heroPhoto.fx}
                fy={design.heroPhoto.fy}
                filter={filterCss(design.heroPhoto.filter)}
                onChange={(fx, fy) => change({ heroPhoto: { ...design.heroPhoto, fx, fy } })}
              />
              <div className="flex flex-wrap gap-1.5">
                {PHOTO_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={design.heroPhoto.filter === f.id}
                    onClick={() => change({ heroPhoto: { ...design.heroPhoto, filter: f.id } })}
                    className={`h-8 rounded-full px-3 text-[13px] ${
                      design.heroPhoto.filter === f.id ? "bg-forest text-parchment" : "border border-hairline bg-card text-ink/75"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
        <WrenWrite design={design} onChange={change} />
        <SectionsTab
          design={design}
          onChange={change}
          sitePanel={<PublicSitePanel site={site} origin={origin} />}
          info={sectionInfo}
          checklist={checklist}
        />
        </>
      )}
    </div>
  );

  const historyButtons = (
    <div className="flex shrink-0 gap-1 rounded-lg border border-hairline bg-card p-1 shadow-sm lg:shadow-none">
      <button
        type="button"
        onClick={undo}
        disabled={historySize.past === 0}
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink/80 hover:bg-ink/[0.05] hover:text-ink disabled:opacity-30"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 14L4 9l5-5" />
          <path d="M4 9h10a6 6 0 010 12h-3" />
        </svg>
      </button>
      <button
        type="button"
        onClick={redo}
        disabled={historySize.future === 0}
        aria-label="Redo"
        title="Redo (Ctrl+Shift+Z)"
        className="flex h-8 w-8 items-center justify-center rounded-md text-ink/80 hover:bg-ink/[0.05] hover:text-ink disabled:opacity-30"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 14l5-5-5-5" />
          <path d="M20 9H10a6 6 0 000 12h3" />
        </svg>
      </button>
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

  // The phone editor (phase 3b, the mockup's Phone artboard): a header with
  // undo, Preview and Publish; the site filling the screen; a bar of tabs
  // along the bottom, each opening a sheet; and, while something is picked,
  // that thing's tools in the bar instead, with ✓ to finish.
  const picked = Boolean(canvasSel || textSlot);
  const iconButton =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#14203d] disabled:opacity-30";
  const sheetTitle =
    phoneSheet === "more" ? "Your guest site" : (TABS.find((t) => t.key === phoneSheet)?.label ?? "");
  const phoneEditor = (
    <>
      <link rel="stylesheet" href={ALL_FONTS_HREF} precedence="default" />
      <div
        ref={rootRef}
        className="site-editor relative -mx-6 -mb-16 flex flex-col bg-[#eef0ec]"
        style={{ height: `max(480px, calc(100dvh - ${offset ?? 128}px))` }}
      >
        <header className="flex h-14 shrink-0 items-center gap-0.5 border-b border-hairline bg-card px-2">
          <Link href="/guests" aria-label="Back to Guests" className={iconButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <button type="button" onClick={undo} disabled={historySize.past === 0} aria-label="Undo" className={iconButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 14L4 9l5-5" />
              <path d="M4 9h10a6 6 0 010 12h-3" />
            </svg>
          </button>
          <button type="button" onClick={redo} disabled={historySize.future === 0} aria-label="Redo" className={iconButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 14l5-5-5-5" />
              <path d="M20 9H10a6 6 0 000 12h3" />
            </svg>
          </button>
          <div className="flex-1" />
          <button
            type="button"
            aria-label={previewing ? "Back to editing" : "Preview as guests see it"}
            aria-pressed={previewing}
            onClick={() => {
              setPreviewing((p) => !p);
              setPhoneSheet(null);
              selectCanvas(null);
              if (textSlot) closeText();
            }}
            className={`${iconButton} ${previewing ? "bg-[#2243B6]/10 text-[#2243B6]" : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="More"
            aria-expanded={phoneSheet === "more"}
            onClick={() => setPhoneSheet(phoneSheet === "more" ? null : "more")}
            className={iconButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>
          {/* Gold on white: the one thing on this screen that matters most. */}
          <button
            type="button"
            onClick={publish}
            disabled={!dirty || isPublishing}
            className="ml-1 h-10 shrink-0 rounded-[10px] bg-[#FFD301] px-4 text-sm font-semibold text-[#14203d] disabled:bg-[#FFD301]/40 disabled:text-[#14203d]/60"
          >
            {isPublishing ? "Publishing…" : dirty ? "Publish" : "Published"}
          </button>
        </header>

        <section aria-label="Preview" className="relative flex min-h-0 flex-1 flex-col">
          {launches > 0 && (
            <div key={launches} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
              <div className="wren-reveal h-full w-full bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          )}
          {launches > 0 && <BirdCheer key={launches} message="Your site is live!" />}
          {!previewing && (
            <div className="flex shrink-0 justify-center py-2">
              <div role="group" aria-label="Layout" className="flex gap-0.5 rounded-[10px] bg-card p-[3px] text-xs font-medium">
                {(
                  [
                    ["desktop", "Computer"],
                    ["phone", "Phone layout"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={device === key}
                    onClick={() => setDevice(key)}
                    className={`h-8 rounded-lg px-3 ${device === key ? "bg-[#2243B6]/10 font-semibold text-[#2243B6]" : "text-ink/60"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && (
            <p role="status" className="mx-3 mb-2 rounded-lg bg-card px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <PreviewStage
            device={device}
            fill={device === "phone"}
            frameRef={frameRef}
            address={publicSlug ? `youdoido.com/w/${publicSlug}` : "Preview — your site is off"}
            bottomInset={0}
          />
        </section>

        {!previewing && (
          <div className="relative h-[92px] shrink-0 border-t border-hairline bg-card">
            {picked ? (
              <PhoneTools
                design={design}
                device={device}
                frames={frames}
                phoneFrames={phoneFrames}
                canvasSel={canvasSel}
                textSlot={textSlot}
                onCanvas={changeCanvas}
                onDesign={change}
                onText={changeText}
                onFrameAction={(action) =>
                  frameRef.current?.contentWindow?.postMessage({ type: CANVAS_ACTION, action }, window.location.origin)
                }
                onSelect={selectCanvas}
                onDone={() => (textSlot ? closeText() : selectCanvas(null))}
              />
            ) : (
              <>
                {phoneSheet && (
                  <Sheet title={sheetTitle} onClose={() => setPhoneSheet(null)}>
                    {phoneSheet === "more" ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <SiteSwitch site={site} />
                          <p className={`text-sm ${error ? "text-red-700" : "text-ink/70"}`} role="status">
                            {status}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneSheet(null);
                            post(REPLAY_MESSAGE);
                          }}
                          className="h-11 rounded-xl border border-hairline bg-card text-sm font-medium text-ink"
                        >
                          Replay motion
                        </button>
                        {liveHref && (
                          <a href={liveHref} target="_blank" rel="noreferrer" className="text-sm font-medium text-forest underline">
                            Open live site
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="-mx-4 -mt-5">{panelBody}</div>
                    )}
                  </Sheet>
                )}
                <div role="tablist" aria-label="Editor" className="flex gap-0.5 overflow-x-auto px-2 pt-3">
                  {TABS.map((t) => (
                    <Tool
                      key={t.key}
                      label={t.label}
                      icon={TAB_ICONS[t.key as keyof typeof TAB_ICONS]}
                      on={phoneSheet === t.key}
                      onClick={() => {
                        setTab(t.key);
                        setPhoneSheet(phoneSheet === t.key ? null : t.key);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {previewing && (
          <button
            type="button"
            onClick={() => setPreviewing(false)}
            className="absolute bottom-5 left-1/2 z-20 h-11 -translate-x-1/2 rounded-full bg-[#14203d] px-5 text-sm font-semibold text-white shadow-lg"
          >
            Back to editing
          </button>
        )}
      </div>
    </>
  );

  if (!isDesktop) return phoneEditor;

  return (
    <>
    {/* The theme cards and font samples are drawn in the real faces. */}
    <link rel="stylesheet" href={ALL_FONTS_HREF} precedence="default" />
    <div
      ref={rootRef}
      // Breaks out of the page's side and bottom padding: the preview reaches
      // the edges, as on Venues.
      className="site-editor relative -mx-6 -mb-16 flex"
      style={{ height: `max(480px, calc(100dvh - ${offset ?? 128}px))` }}
    >
      {/* Desktop: the settings panel. */}
      {(
        <aside className="flex w-[440px] shrink-0 border-r border-hairline bg-card">
          {/* The panels, down the side as in the approved mockup: eight don't fit across. */}
          <nav aria-label="Editor panels" className="flex w-[76px] shrink-0 flex-col items-center gap-0.5 overflow-y-auto border-r border-hairline py-2">
            {TABS.map((t) => (
              <Tool
                key={t.key}
                label={t.label}
                icon={TAB_ICONS[t.key as keyof typeof TAB_ICONS]}
                on={tab === t.key || (t.key === "elements" && (tab === "position" || tab === "photo" || tab === "animate"))}
                onClick={() => setTab(t.key)}
              />
            ))}
          </nav>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2.5 border-b border-hairline px-6 pb-4 pt-5">
              <h1 className="font-display text-3xl font-semibold text-forest">Your guest site</h1>
              <SiteSwitch site={site} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{panelBody}</div>
          </div>
        </aside>
      )}

      {/* The preview. */}
      <section aria-label="Preview" className="relative flex min-w-0 flex-1 flex-col bg-[#eef0ec]">
        {launches > 0 && (
          <div key={launches} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <div className="wren-reveal h-full w-full bg-gradient-to-r from-transparent via-white/70 to-transparent" />
          </div>
        )}
        {launches > 0 && <BirdCheer key={launches} message="Your site is live!" />}
        {(
          <div className="flex h-[60px] shrink-0 items-center gap-3 px-6">
            {historyButtons}
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
        )}

        {canvasSel && !textSlot && (
          <div className={`absolute inset-x-3 z-20 flex justify-center top-[64px]`}>
            <CanvasToolbar
              design={design}
              selection={canvasSel}
              frames={frames}
              phoneFrames={phoneFrames}
              device={device}
              onCanvas={changeCanvas}
              onDesign={change}
              onPosition={() => openTab("position")}
              onOpen={openTab}
              onDone={() => selectCanvas(null)}
            />
          </div>
        )}

        {textSlot && (
          <div className={`absolute inset-x-3 z-20 flex justify-center top-[64px]`}>
            <TextToolbar
              slot={textSlot}
              design={design}
              onChange={(patch) => changeText(textSlot, patch)}
              onDone={closeText}
            />
          </div>
        )}

        <PreviewStage
          device={device}
          fill={false}
          frameRef={frameRef}
          address={publicSlug ? `youdoido.com/w/${publicSlug}` : "Preview — your site is off"}
          bottomInset={0}
        />
      </section>

    </div>
    </>
  );
}

/**
 * Theme (the themes) and Colour (palettes, photo colours, fine-tuning): one
 * component in two parts, since both read the same resolved colours.
 */
function ThemeTab({
  design,
  onChange,
  part,
  children,
}: {
  design: SiteDesign;
  onChange: (patch: Partial<SiteDesign>) => void;
  part: "themes" | "colours";
  /** Colour sections that come first: the picked element's, the photos'. */
  children?: ReactNode;
}) {
  const { theme, accent, heading } = resolveDesign(design);
  const base = themeById(design.theme);
  const [family, setFamily] = useState<ColorFamily | "dark" | null>(null);
  const current = activePalette(design);
  const palettes = PALETTES.filter((p) =>
    family === null ? true : family === "dark" ? isDark(p.bg) : p.family === family,
  );
  // Small labels and links are drawn in the accent, so a pale accent on a pale
  // theme (or dark on dark) makes them hard to read. Said, not prevented.
  const lowContrast = contrast(accent, theme.bg) < 3;
  const lowText = contrast(theme.ink, theme.bg) < 4.5 || contrast(heading, theme.bg) < 3;
  const customised =
    design.accent !== null || design.colors.bg !== null || design.colors.ink !== null || design.colors.heading !== null;

  if (part === "themes") {
    return (
      <div className="flex flex-col gap-3">
        <PanelLabel>Theme</PanelLabel>
        {THEME_GROUPS.map((group) => (
          <div key={group} className="flex flex-col gap-2">
            {group !== "Classic" && <p className="text-xs font-medium text-ink/60">{group}</p>}
            <div className="grid grid-cols-2 gap-3">
              {THEMES.filter((t) => ((t as SiteTheme).group ?? "Classic") === group).map((t) => (
                <ThemeCard
                  key={t.id}
                  theme={t}
                  selected={t.id === design.theme}
                  onPick={() =>
                    onChange({
                      theme: t.id,
                      accent: null,
                      colors: NO_COLORS,
                      scene: null,
                      // A theme with marks of its own brings them; the rest keep the couple's monogram.
                      ...("ornament" in t ? { ornament: t.ornament } : {}),
                    })
                  }
                />
              ))}
            </div>
          </div>
        ))}
        <p className="text-[13px] leading-normal text-ink/60">
          A theme sets the fonts, corners and colours. Switching keeps everything you&apos;ve
          written — only the look changes.
        </p>
      </div>
    );
  }

  return (
    <>
      {children}
      <div className="flex flex-col gap-3">
        <PanelLabel>Colour palette</PanelLabel>
        <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 lg:-mx-6 lg:px-6">
          <FamilyChip on={family === null} onClick={() => setFamily(null)}>
            All
          </FamilyChip>
          {COLOR_FAMILIES.map((c) => (
            <FamilyChip key={c.id} on={family === c.id} onClick={() => setFamily(c.id)} dot={c.dot}>
              {c.label}
            </FamilyChip>
          ))}
          <FamilyChip on={family === "dark"} onClick={() => setFamily("dark")} dot="#14203d">
            Dark
          </FamilyChip>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {palettes.map((p) => {
            const on = current?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(paletteColors(p))}
                className={`overflow-hidden rounded-xl bg-card text-left ${
                  on ? "border-2 border-forest" : "m-px border border-hairline hover:border-ink/30"
                }`}
              >
                <span className="flex h-12 items-center justify-center gap-1.5" style={{ background: p.bg }}>
                  <span
                    className="text-[19px] leading-none"
                    style={{ color: p.heading, fontFamily: theme.display }}
                  >
                    Aa
                  </span>
                  <span className="h-3 w-3 rounded-full" style={{ background: p.accent }} />
                  <span className="h-3 w-3 rounded-full" style={{ background: p.ink }} />
                </span>
                <span className="block truncate border-t border-hairline px-2.5 py-1.5 text-[12px] font-medium text-ink">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <PanelLabel>Fine-tune</PanelLabel>
          {customised && (
            <button
              type="button"
              onClick={() => onChange({ accent: null, colors: NO_COLORS })}
              className="text-[13px] text-ink/60 underline underline-offset-2 hover:text-ink"
            >
              Back to {base.name}&apos;s colours
            </button>
          )}
        </div>
        <div className="divide-y divide-hairline rounded-xl border border-hairline bg-card">
          <ColorRow
            label="Background"
            value={theme.bg}
            onChange={(hex) => onChange({ colors: { ...design.colors, bg: hex } })}
          />
          <ColorRow
            label="Headings"
            value={heading}
            onChange={(hex) => onChange({ colors: { ...design.colors, heading: hex } })}
          />
          <ColorRow
            label="Text"
            value={theme.ink}
            onChange={(hex) => onChange({ colors: { ...design.colors, ink: hex } })}
          />
          <ColorRow
            label="Buttons, links & monogram"
            value={accent}
            onChange={(hex) => onChange({ accent: hex })}
            swatches={theme.swatches}
          />
        </div>
        {lowText && (
          <p className="text-[13px] leading-snug text-[#8a5a00]">
            Your text is hard to read on this background — try a darker text colour or a lighter
            background.
          </p>
        )}
        {lowContrast && (
          <p className="text-[13px] leading-snug text-[#8a5a00]">
            The accent is hard to read on this background — it&apos;s used for small labels and links.
          </p>
        )}
      </div>
    </>
  );
}

const NO_COLORS: SiteDesign["colors"] = { bg: null, ink: null, heading: null };

function FamilyChip({
  on,
  onClick,
  dot,
  children,
}: {
  on: boolean;
  onClick: () => void;
  dot?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] transition-colors ${
        on ? "bg-forest text-parchment" : "border border-hairline bg-card text-ink/75 hover:text-ink"
      }`}
    >
      {dot && <span className="h-3 w-3 rounded-full border border-black/10" style={{ background: dot }} />}
      {children}
    </button>
  );
}

function ColorRow({
  label,
  value,
  onChange,
  swatches = [],
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  swatches?: readonly string[];
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <span className="text-[14px] text-ink">{label}</span>
      <span className="flex items-center gap-1.5">
        {swatches.map((hex) => (
          <button
            key={hex}
            type="button"
            aria-label={`Use ${hex}`}
            onClick={() => onChange(hex)}
            className={`h-7 w-7 rounded-full ${value === hex ? "ring-2 ring-ink ring-offset-2 ring-offset-card" : "border border-black/10"}`}
            style={{ background: hex }}
          />
        ))}
        <label
          className="relative h-9 w-9 cursor-pointer rounded-full border-2 border-ink/80 p-[3px]"
          title={`Pick a ${label.toLowerCase()} colour`}
        >
          <span className="sr-only">Pick a {label.toLowerCase()} colour</span>
          <span className="block h-full w-full rounded-full border border-black/10" style={{ background: value }} />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </span>
    </div>
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
