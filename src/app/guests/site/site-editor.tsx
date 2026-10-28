"use client";

import Link from "next/link";
import { useCallback, useEffect, useEffectEvent, useRef, useState, useTransition, type ReactNode } from "react";
import {
  CONFETTI_MESSAGE,
  DESIGN_MESSAGE,
  READY_MESSAGE,
  REPLAY_MESSAGE,
  SHOW_SECTION_MESSAGE,
  TEXT_EDIT_MESSAGE,
  TEXT_SELECT_MESSAGE,
} from "@/components/guest-site-theme";
import {
  ALL_FONTS_HREF,
  COLOR_FAMILIES,
  EMPTY_TEXT_STYLE,
  TEXT_SLOTS,
  textSlotMax,
  hasTextStyle,
  PALETTES,
  activePalette,
  contrast,
  isDark,
  paletteColors,
  resolveDesign,
  themeById,
  type ColorFamily,
  sameDesign,
  type Palette,
  type SectionKey,
  type SiteDesign,
  type TextSlotId,
  type TextStyle,
} from "@/lib/site-design";
import { TextToolbar } from "./text-toolbar";
import { canvasSchema } from "@/lib/site-canvas-schema";
import { PHOTO_FILTERS, findElement, updateElement, type CanvasElement, type SiteCanvas } from "@/lib/site-canvas";
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
import { AnimatePanel, BannerFocus, PhotoPanel } from "./photo-motion-panels";
import { TemplatesTab } from "./templates-tab";
import { templateById } from "@/lib/site-templates";
import { BackgroundTab, FontsTab, PhotoColoursSection, TargetColourSection, type PickTarget } from "./look-panels";
import { publishSiteDesign, saveSiteDraft } from "./actions";
import { STALE_DESIGN } from "@/lib/site-designs";
import { BirdCheer } from "@/components/bird-cheer";
import { PublicSitePanel, SiteSwitch, useGuestSite } from "../public-site-panel";
import { MotionTab, PageArtworkSection, PanelLabel, SceneSection, SectionsTab, StyleTab, type SectionInfo } from "./editor-tabs";

type Device = "desktop" | "phone";
// Position opens from a picked element rather than the tab strip.
// Position, Photo and Animate open from a picked element rather than the rail.
type Tab =
  | "design"
  | "style"
  | "fonts"
  | "background"
  | "motion"
  | "sections"
  | "elements"
  | "position"
  | "photo"
  | "animate";

// Seven, not ten (owner, 2026-10-21): templates, themes and colours are one
// Design tab, Wren's tab is gone, and Sections, where the site gets filled
// in, sits right under Design.
const TABS: { key: Tab; label: string }[] = [
  { key: "design", label: "Design" },
  { key: "sections", label: "Sections" },
  { key: "elements", label: "Elements" },
  { key: "fonts", label: "Fonts" },
  { key: "background", label: "Background" },
  { key: "style", label: "Style" },
  { key: "motion", label: "Motion" },
];

// Desktop preview is laid out at a real laptop width and scaled down to fit,
// so what the couple sees is the actual arrangement guests get on a computer,
// not the page squeezed into whatever room the editor leaves.
const DESKTOP_W = 1280;
const PHONE_W = 390;
/** Desktop preview zoom range, as in Canva's zoom bar. */
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 2;
const PHONE_H = 844;

const LG = "(min-width: 1024px)";

/** The phone editor's bottom tabs, drawn like its tools. */
const TAB_ICONS = {
  design: "templates",
  style: "styleTab",
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
  designId,
  designName,
  isLive: initialLive,
  draft: initialDraft,
  version,
  published: initialPublished,
  publicSlug: initialSlug,
  siteLocked,
  origin,
  contentKey,
  sectionInfo,
  hasPhoto,
  names,
  weddingDate,
  photos,
}: {
  /** Which of the couple's designs this is (site_designs). */
  designId: string;
  designName: string;
  /** Whether guests see this design (weddings.live_design_id). */
  isLive: boolean;
  draft: SiteDesign;
  /** The design row's updated_at when the page loaded, for spotting edits from another device. */
  version: string;
  published: SiteDesign;
  publicSlug: string | null;
  siteLocked: boolean;
  origin: string;
  /** Changes whenever the site's content does, so the preview reloads to show it. */
  contentKey: string;
  /** Each section's status line, and its content editor where it has one. */
  sectionInfo: Partial<Record<SectionKey, SectionInfo>>;
  /** Hero layouts only show with a banner photo; the Style tab says so. */
  hasPhoto: boolean;
  names: [string, string];
  /** For the monogram's date line ("2027-06-12"). */
  weddingDate: string | null;
  /** The banner and gallery photos, to place on the page from Elements. */
  photos: string[];
}) {
  const site = useGuestSite(initialSlug);
  const publicSlug = site.slug;
  const [design, setDesign] = useState(initialDraft);
  const [published, setPublished] = useState(initialPublished);
  const [isLive, setIsLive] = useState(initialLive);
  const [tab, setTab] = useState<Tab>("design");
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

  // A design guests don't see always has something to publish: itself.
  const dirty = !isLive || !sameDesign(design, published);

  // The latest design, for message and key handlers that outlive a render
  // and for changes that land faster than React re-renders.
  const designRef = useRef(design);
  // The row's updated_at as this device last saw it: a save from a stale copy is refused.
  const versionRef = useRef<string | null>(version);
  const [stale, setStale] = useState(false);
  // Saves run one after another, so each carries the version the last one returned.
  const saveChain = useRef<Promise<void>>(Promise.resolve());
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
  // The Sections row that's open, kept here so the preview can open one.
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  // Brings an opened row into view in the panel, and its tab into the preview.
  useEffect(() => {
    if (!openSection) return;
    frameRef.current?.contentWindow?.postMessage({ type: SHOW_SECTION_MESSAGE, section: openSection }, window.location.origin);
    const frame = requestAnimationFrame(() =>
      document.getElementById(`section-row-${openSection}`)?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [openSection, tab, phoneSheet]);

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

  // Full screen shows the site as guests get it: editing off until Esc.
  const onFullscreenChange = useEffectEvent(() => {
    sendMode(document.fullscreenElement === frameRef.current ? false : editingOn);
  });
  useEffect(() => {
    const listener = () => onFullscreenChange();
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
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
    if (stale) {
      setSaveState("error");
      setError(STALE_DESIGN);
      return;
    }
    saveTimer.current = setTimeout(() => {
      saveChain.current = saveChain.current.then(async () => {
        const result: { error?: string; stale?: boolean; version?: string } = await saveSiteDraft(
          designId,
          next,
          versionRef.current,
        ).catch(() => ({ error: "Couldn't save — check your connection." }));
        if (result.version) versionRef.current = result.version;
        if (result.stale) setStale(true);
        if (result.error) {
          setSaveState("error");
          setError(result.error);
        } else {
          setSaveState("idle");
        }
      });
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
    if (next) frameRef.current?.contentWindow?.postMessage({ type: SHOW_SECTION_MESSAGE, section: next.section }, window.location.origin);
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

  // A whole section clicked in the computer preview opens its row in
  // Sections, so what's on the page is where it's edited.
  const onSectionPicked = useEffectEvent((next: CanvasSelection) => {
    if (!isDesktop || !next || next.id !== null) return;
    const key = next.section as SectionKey;
    const row = sectionInfo[key];
    if (!row || !(row.editor || row.link || row.layout)) return;
    setTab("sections");
    setOpenSection(key);
  });

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
      if (event.data?.type === CANVAS_SELECT) onSectionPicked(event.data.selection as CanvasSelection);
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
        if (slot?.words) onTypedText(slot.id, event.data.text.slice(0, textSlotMax(slot.id)));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Delete or Backspace removes the picked element even when focus is out here rather than in the preview
  // (say, just after adding it from a panel).
  const onDeleteKey = useEffectEvent(() => {
    if (!canvasSel?.id) return false;
    frameRef.current?.contentWindow?.postMessage({ type: CANVAS_ACTION, action: "delete" }, window.location.origin);
    return true;
  });

  // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y), plus Delete/Backspace, except while typing in a field.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        if (!event.metaKey && !event.ctrlKey && !event.altKey && onDeleteKey()) event.preventDefault();
        return;
      }
      if (!(event.metaKey || event.ctrlKey)) return;
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
      await saveChain.current;
      const result: { error?: string; stale?: boolean; version?: string } = await publishSiteDesign(
        designId,
        design,
        versionRef.current,
      ).catch(() => ({ error: "Couldn't publish — check your connection." }));
      if (result.version) versionRef.current = result.version;
      if (result.stale) setStale(true);
      if (result.error) {
        setError(result.error);
      } else {
        setError(null);
        setSaveState("idle");
        setPublished(design);
        setIsLive(true);
        // Publishing means guests can see it: a site that's off comes on too.
        if (!site.slug) site.enable();
        setLaunches((n) => n + 1);
        post(REPLAY_MESSAGE);
      }
    });
  }

  const status = error
    ? error
    : saveState === "saving"
      ? "Saving draft…"
      : !isLive
        ? "Guests see another design"
        : dirty
          ? publicSlug
            ? "Design changes not published yet"
            : "Draft — your site is off"
          : publicSlug
            ? "Guests see this version"
            : "Your site is off";

  // Guests' page when they'd see exactly this; otherwise the saved draft in
  // its own tab, which works with the site off too.
  const showsLive = Boolean(publicSlug) && !dirty;
  const openHref = showsLive ? `${origin}/w/${publicSlug}` : `/guests/site/preview?design=${designId}&view=1`;
  const openLabel = showsLive ? "Open live site" : "Open preview";

  // What the publish button does now. Published and on: it unpublishes
  // (turns the site off, after a confirm). Published but off: it turns it on.
  const publishAction: "publish" | "turnOn" | "unpublish" = dirty ? "publish" : publicSlug ? "unpublish" : "turnOn";
  const publishBusy = isPublishing || site.isPending;
  const onPublishClick = publishAction === "publish" ? publish : publishAction === "turnOn" ? site.enable : site.disable;
  // Gently pulses while there's something to click for, so it reads as ready.
  const publishReady = publishAction !== "unpublish" && !publishBusy;

  const publishButton = (
    <button
      type="button"
      onClick={onPublishClick}
      disabled={publishBusy}
      title={publishAction === "unpublish" ? "Your site is live. Click to unpublish (turn it off)." : undefined}
      className={`group h-10 shrink-0 rounded-md px-4 text-sm font-semibold transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.97] disabled:cursor-default ${
        publishAction === "unpublish"
          ? "border border-forest/30 bg-card text-forest hover:border-red-700/40 hover:text-red-700"
          : "bg-forest text-parchment shadow-sm hover:-translate-y-px hover:bg-forest/90 hover:shadow-md disabled:bg-forest/40"
      } ${publishReady ? "publish-ready" : ""}`}
    >
      {publishBusy ? (
        site.isPending ? (publicSlug ? "Unpublishing…" : "Turning on…") : "Publishing…"
      ) : publishAction === "publish" ? (
        !isLive ? "Make this live" : "Publish changes"
      ) : publishAction === "turnOn" ? (
        "Turn site on"
      ) : (
        <>
          <span className="group-hover:hidden">Published</span>
          <span className="hidden group-hover:inline">Unpublish</span>
        </>
      )}
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
        <>
        <PageArtworkSection design={design} onChange={change} hasPhoto={hasPhoto} />
        <ElementsTab
          design={design}
          frames={frames}
          selection={canvasSel}
          photos={photos}
          onCanvas={changeCanvas}
          onSelect={selectCanvas}
        />
        </>
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
      ) : tab === "design" ? (
        <>
          {pickTarget?.colour && <TargetColourSection design={design} target={pickTarget} actions={targetActions} />}
          <TemplatesTab design={design} onChange={change} />
          <ColoursSection design={design} onChange={change}>
            <PhotoColoursSection
              photos={photos}
              target={pickTarget?.colour ? pickTarget : null}
              actions={targetActions}
              onChange={change}
            />
          </ColoursSection>
        </>
      ) : tab === "fonts" ? (
        <FontsTab design={design} onChange={change} target={pickTarget?.font ? pickTarget : null} actions={targetActions} />
      ) : tab === "background" ? (
        <>
          <SceneSection design={design} onChange={change} />
          <BackgroundTab design={design} onChange={change} />
        </>
      ) : tab === "motion" ? (
        <MotionTab
          design={design}
          onChange={change}
          onReplay={() => post(REPLAY_MESSAGE)}
          onTryConfetti={() => post(CONFETTI_MESSAGE)}
        />
      ) : tab === "style" ? (
        <StyleTab design={design} onChange={change} hasPhoto={hasPhoto} names={names} weddingDate={weddingDate}>
          {hasPhoto && photos[0] && (
            <div className="flex flex-col gap-3">
              <PanelLabel>Banner photo</PanelLabel>
              <BannerFocus src={photos[0]} design={design} onChange={change} />
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
        </StyleTab>
      ) : (
        <SectionsTab
          design={design}
          onChange={change}
          sitePanel={<PublicSitePanel site={site} origin={origin} locked={siteLocked} />}
          info={sectionInfo}
          open={openSection}
          onOpen={setOpenSection}
        />
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
    phoneSheet === "more" ? designName : (TABS.find((t) => t.key === phoneSheet)?.label ?? "");
  const phoneEditor = (
    <>
      <link rel="stylesheet" href={ALL_FONTS_HREF} precedence="default" />
      <div
        ref={rootRef}
        className="site-editor relative -mx-6 -mb-16 flex flex-col bg-[#eef0ec]"
        style={{ height: `max(480px, calc(100dvh - ${offset ?? 128}px))` }}
      >
        <header className="flex h-14 shrink-0 items-center gap-0.5 border-b border-hairline bg-card px-2">
          <Link href="/guests/site" aria-label="Back to your designs" className={iconButton}>
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
            onClick={onPublishClick}
            disabled={publishBusy}
            className={`ml-1 h-10 shrink-0 rounded-[10px] px-4 text-sm font-semibold text-[#14203d] transition-transform active:scale-[0.97] disabled:opacity-60 ${
              publishAction === "unpublish" ? "border border-[#14203d]/20 bg-card" : "bg-[#FFD301]"
            } ${publishReady ? "publish-ready" : ""}`}
          >
            {publishBusy
              ? site.isPending
                ? publicSlug
                  ? "Unpublishing…"
                  : "Turning on…"
                : "Publishing…"
              : publishAction === "publish"
                ? !isLive
                  ? "Make live"
                  : "Publish"
                : publishAction === "turnOn"
                  ? "Turn on"
                  : "Published"}
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
            designId={designId}
            address={`${publicSlug ? `youdoido.com/w/${publicSlug}` : "Preview — your site is off"}${hasPhoto ? "" : " · sample photos until you add yours"}`}
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
                        <a href={openHref} target="_blank" rel="noreferrer" className="text-sm font-medium text-forest underline">
                          {openLabel}
                        </a>
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
    {stale && (
      <div role="alert" className="fixed inset-x-3 top-3 z-[60] mx-auto flex max-w-xl items-center gap-3 rounded-xl bg-[#14203d] px-4 py-3 text-sm text-white shadow-lg">
        <span className="flex-1">{STALE_DESIGN}</span>
        <button type="button" onClick={() => window.location.reload()} className="h-9 shrink-0 rounded-lg bg-[#FFD301] px-3 font-semibold text-[#14203d]">
          Reload
        </button>
      </div>
    )}
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
              <div className="min-w-0">
                <Link
                  href="/guests/site"
                  className="mb-2 inline-flex h-10 items-center gap-2 rounded-full bg-[#2243B6] px-4 text-[15px] font-semibold text-white hover:bg-[#2243B6]/90"
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
                <h1 className="truncate font-display text-3xl font-semibold text-forest">{designName}</h1>
              </div>
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
          <div className="flex h-[52px] shrink-0 items-center gap-3 px-6">
            {historyButtons}
            {deviceToggle}
            {/* Something picked: its bar takes the middle of this row, so the
                preview never gives up height to a strip that's empty most of the time. */}
            {canvasSel || textSlot ? (
              <div className="relative z-20 flex min-w-0 flex-1 justify-center">
                {textSlot ? (
                  <TextToolbar
                    slot={textSlot}
                    design={design}
                    onChange={(patch) => changeText(textSlot, patch)}
                    onDone={closeText}
                  />
                ) : canvasSel ? (
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
                ) : null}
              </div>
            ) : (
              <>
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
                {/* The site full screen as guests get it, editing off until Esc. */}
                <button
                  type="button"
                  onClick={() => frameRef.current?.requestFullscreen().catch(() => {})}
                  title="Preview (Esc to exit)"
                  className="flex h-10 items-center gap-1.5 rounded-lg border border-hairline bg-card px-3.5 text-[13px] text-ink hover:border-ink/30"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview
                </button>
                <div className="flex-1" />
                <span className={`text-[13px] ${error ? "text-red-700" : "text-ink/60"}`} role="status">
                  {status}
                </span>
                <a
                  href={openHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-forest hover:underline"
                >
                  {openLabel}
                </a>
              </>
            )}
            {publishButton}
          </div>
        )}

        <PreviewStage
          device={device}
          fill={false}
          frameRef={frameRef}
            designId={designId}
          address={`${publicSlug ? `youdoido.com/w/${publicSlug}` : "Preview — your site is off"}${hasPhoto ? "" : " · sample photos until you add yours"}`}
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
/**
 * The colour half of the Design tab: palettes to put over the template, then
 * fine-tuning folded away, since most couples never need it.
 */
function ColoursSection({
  design,
  onChange,
  children,
}: {
  design: SiteDesign;
  onChange: (patch: Partial<SiteDesign>) => void;
  /** The colours read from the couple's photos, after the palettes. */
  children?: ReactNode;
}) {
  const { theme, accent, heading } = resolveDesign(design);
  const base = themeById(design.theme);
  const [family, setFamily] = useState<ColorFamily | "dark" | null>(null);
  const current = activePalette(design);
  const [showAll, setShowAll] = useState(false);
  const palettes = PALETTES.filter((p) =>
    family === null ? true : family === "dark" ? isDark(p.bg) : p.family === family,
  );
  // Small labels and links are drawn in the accent, so a pale accent on a pale
  // theme (or dark on dark) makes them hard to read. Said, not prevented.
  const lowContrast = contrast(accent, theme.bg) < 3;
  const lowText = contrast(theme.ink, theme.bg) < 4.5 || contrast(heading, theme.bg) < 3;
  // The colours the template started with, which "Back to" restores.
  const template = templateById(design.template);
  const startPalette = PALETTES.find((p) => p.id === template?.palette);
  const starting = startPalette ? paletteColors(startPalette) : { accent: null, colors: NO_COLORS };
  const startName = template?.name ?? base.name;
  // Six that suit the look (owner, 2026-10-21: fewer choices up front): the
  // template's own and the one in use, then light or dark like the page,
  // its own colour family first. The rest wait behind "More colours".
  const anchor = startPalette ?? current;
  const dark = isDark(theme.bg);
  const suited = [
    ...[startPalette, current].filter((p): p is Palette => Boolean(p)),
    ...PALETTES.filter((p) => isDark(p.bg) === dark && p.family === anchor?.family),
    ...PALETTES.filter((p) => isDark(p.bg) === dark),
    ...PALETTES,
  ]
    .filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i)
    .slice(0, 6);
  const customised = JSON.stringify({ a: design.accent, c: design.colors }) !== JSON.stringify({ a: starting.accent, c: starting.colors });

  return (
    <>
      <div className="flex flex-col gap-3 border-t border-hairline pt-6">
        <PanelLabel>Colours</PanelLabel>
        {showAll && (
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
        )}
        <div className="grid grid-cols-2 gap-2.5">
          {(showAll ? palettes : suited).map((p) => {
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
        <button
          type="button"
          onClick={() => {
            setShowAll((v) => !v);
            setFamily(null);
          }}
          aria-expanded={showAll}
          className="h-10 rounded-lg border border-hairline bg-card text-[13px] font-semibold text-[#2243B6] transition-colors hover:border-[#2243B6]/50 hover:bg-[#2243B6]/[0.04]"
        >
          {showAll ? "Fewer colours" : `More colours (${PALETTES.length})`}
        </button>
      </div>

      {children}

      <details className="group flex flex-col gap-3 rounded-xl border border-hairline">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-[14px] font-medium text-ink hover:bg-ink/[0.03] [&::-webkit-details-marker]:hidden">
          Fine-tune colours
          <ChevronIcon />
        </summary>
        <div className="flex flex-col gap-3 px-4 pb-4">
        {customised && (
          <button
            type="button"
            onClick={() => onChange(starting)}
            className="self-start text-[13px] text-ink/60 underline underline-offset-2 hover:text-ink"
          >
            Back to {startName}&apos;s colours
          </button>
        )}
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
      </details>
    </>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="text-ink/50 transition-transform group-open:rotate-180">
      <path d="M6 9l6 6 6-6" />
    </svg>
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

function PreviewStage({
  device,
  fill,
  frameRef,
  designId,
  address,
  bottomInset,
}: {
  device: Device;
  /** On a phone showing the phone view: the preview is simply the screen. */
  fill: boolean;
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  designId: string;
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

  // Desktop zoom: null follows the window ("Fit"), a number is a zoom the
  // couple picked with the slider or ctrl/cmd + wheel.
  const [zoom, setZoom] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fitScale = Math.min(1, size.w / DESKTOP_W) || 1;
  const phoneBezel = 10;
  const phoneScale =
    Math.min(1, Math.max(0, size.h - bottomInset - 8) / (PHONE_H + phoneBezel * 2), size.w / (PHONE_W + phoneBezel * 2)) || 1;
  // How far the iframe is scaled down (or up) to fit the stage.
  const scale = fill ? 1 : device === "desktop" ? (zoom ?? fitScale) : phoneScale;
  // One percent of the desktop window at "Fit", for the site's --site-vh.
  const siteVh =
    !fill && device === "desktop" ? Math.max(0, size.h - bottomInset - 36 - 40) / fitScale / 100 : null;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const apply = () => {
      const root = frame.contentDocument?.documentElement;
      if (!root) return;
      if (siteVh) root.style.setProperty("--site-vh", `${siteVh}px`);
      else root.style.removeProperty("--site-vh");
    };
    apply();
    frame.addEventListener("load", apply);
    return () => frame.removeEventListener("load", apply);
  }, [frameRef, siteVh]);

  // Wheel over the iframe scrolls the site natively, but the events never
  // reach this page. Wheel anywhere else on the stage (the margins, the
  // browser bar) is passed into the site so it scrolls the same way.
  const onWheel = useEffectEvent((event: WheelEvent) => {
    const win = frameRef.current?.contentWindow;
    if (!win) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size.h : 1;
    if ((event.ctrlKey || event.metaKey) && device === "desktop" && !fill) {
      const next = (zoom ?? fitScale) * Math.exp(-event.deltaY * unit * 0.002);
      setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next)));
      return;
    }
    win.scrollBy(0, (event.deltaY * unit) / scale);
    if (event.deltaX && scrollerRef.current) scrollerRef.current.scrollLeft += event.deltaX * unit;
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const listener = (event: WheelEvent) => onWheel(event);
    el.addEventListener("wheel", listener, { passive: false });
    return () => el.removeEventListener("wheel", listener);
  }, []);

  let outer: React.CSSProperties;
  let inner: React.CSSProperties;
  let site: React.CSSProperties | null = null;
  let chrome: "browser" | "phone" | "none";

  if (fill) {
    chrome = "none";
    outer = { width: "100%", height: "100%" };
    inner = { width: "100%", height: "100%" };
  } else if (device === "desktop") {
    chrome = "browser";
    const bar = 36 + 40; // browser bar above, zoom bar below (as in siteVh)
    const frameH = Math.max(0, size.h - bottomInset - bar);
    outer = { width: size.w, height: frameH };
    // Zoomed out, the site's window grows to fill the frame, so more of the
    // page shows instead of white below it; zoomed in it stays the "Fit"
    // size and the frame scrolls. The hero's screen-relative heights read
    // --site-vh, pinned to the "Fit" window (siteVh), so a taller window
    // shows more of the site rather than a stretched hero.
    const viewH = Math.max(frameH / fitScale, frameH / scale);
    site = { width: DESKTOP_W * scale, height: viewH * scale, margin: "0 auto", overflow: "hidden" };
    inner = {
      width: DESKTOP_W,
      height: viewH,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    };
  } else {
    chrome = "phone";
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
        <div
          ref={scrollerRef}
          className={site ? "relative overflow-auto" : "overflow-hidden"}
          style={outer}
        >
          <div style={site ?? undefined}>
            <iframe
              ref={frameRef}
              src={`/guests/site/preview?design=${designId}&samples=1`}
              title="Guest site preview"
              className="block border-0 bg-card"
              style={inner}
            />
          </div>
        </div>
        {chrome === "browser" && (
          <div className="flex h-10 shrink-0 items-center justify-end gap-3 border-t border-hairline bg-[#f7f7f5] px-4">
            <button
              type="button"
              onClick={() => setZoom(null)}
              aria-pressed={zoom === null}
              className={`rounded-md px-2 py-0.5 text-xs ${
                zoom === null ? "bg-[#2243B6]/10 font-semibold text-[#2243B6]" : "text-ink/60 hover:text-ink"
              }`}
            >
              Fit
            </button>
            <input
              type="range"
              min={ZOOM_MIN * 100}
              max={ZOOM_MAX * 100}
              step={1}
              value={Math.round((zoom ?? fitScale) * 100)}
              onChange={(e) => setZoom(Number(e.target.value) / 100)}
              aria-label="Zoom"
              className="w-40 accent-[#2243B6]"
            />
            <span className="w-10 text-right text-xs tabular-nums text-ink/70">
              {Math.round((zoom ?? fitScale) * 100)}%
            </span>
            <button
              type="button"
              onClick={() => frameRef.current?.requestFullscreen().catch(() => {})}
              aria-label="Full screen"
              title="Full screen (Esc to exit)"
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink/60 hover:bg-ink/5 hover:text-ink"
            >
              <FullscreenIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
    </svg>
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
