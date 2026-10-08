"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useSiteDesign } from "@/components/guest-site-theme";
import {
  GRID,
  duplicateElement,
  findElement,
  holdsElements,
  moveLayer,
  phoneBoxes,
  placeOnPhone,
  removeElement,
  setHiddenOnPhone,
  snap,
  updateElement,
  updatePhoneBox,
  type CanvasElement,
  type LayerMove,
  type PhoneBox,
  type SiteCanvas,
} from "@/lib/site-canvas";
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
} from "../canvas-messages";

// Selection is Royal blue, snap guides Sky (CLAUDE.md palette).
const ROYAL = "#2243B6";
const SKY = "#00BFFE";
const NAVY = "#14203d";
// Tints of the two, for hover fills and quiet text.
const ROYAL_TINT = "rgb(34 67 182 / 0.1)";
const NAVY_SOFT = "rgb(20 32 61 / 0.65)";
const NAVY_LINE = "rgb(20 32 61 / 0.08)";
/** How close, in screen pixels, an edge has to come to a guide to snap to it. */
const SNAP_PX = 6;
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
type Handle = (typeof HANDLES)[number];

type Box = Pick<CanvasElement, "x" | "y" | "w" | "h" | "rot">;

/** Which arrangement is being edited: the frame is computer-wide or phone-wide. */
type Frame = "desktop" | "phone";

/** An element's box in the frame being edited, with a text element's font size there. */
type FrameBox = Box & { size: number | null };

type Gesture = {
  kind: "move" | "rotate" | Handle;
  frame: Frame;
  key: string;
  id: string;
  node: HTMLElement;
  wrapper: HTMLElement;
  startX: number;
  startY: number;
  start: Box;
  /** Screen pixels per frame unit. */
  scale: number;
  w: number;
  h: number;
  others: Box[];
  moved: boolean;
  /** For corner resizes of text: the size the words started at. */
  fontSize: number | null;
  /** A stacked phone section being placed by hand for the first time: every element's box as it stood. */
  freeze: Record<string, PhoneBox> | null;
};

function post(data: object) {
  window.parent?.postMessage(data, window.location.origin);
}

function layerOf(key: string) {
  return document.querySelector<HTMLElement>(`[data-canvas-layer="${CSS.escape(key)}"]`);
}

function sectionNode(key: string) {
  return document.querySelector<HTMLElement>(`[data-canvas-section="${CSS.escape(key)}"]`);
}

function elementNode(key: string, id: string) {
  return layerOf(key)?.querySelector<HTMLElement>(`[data-el="${CSS.escape(id)}"]`) ?? null;
}

const DESKTOP = "(min-width: 1024px)";

/** The frame follows the preview's width, as the page's own breakpoint does. */
function useFrame(): Frame {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(DESKTOP);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => (window.matchMedia(DESKTOP).matches ? "desktop" : "phone"),
    () => "desktop",
  );
}

/**
 * Every shown element's box in a frame, and the width those boxes are
 * measured against. A stacked phone section has no stored boxes, so they're
 * read off the page as the stack lays them out, in pixels of the section.
 */
function frameView(canvas: SiteCanvas, key: string, frame: Frame): { w: number; boxes: Map<string, FrameBox>; stacked: boolean } | null {
  const section = canvas.sections[key];
  if (!section) return null;
  if (frame === "desktop") {
    const boxes = new Map<string, FrameBox>();
    for (const el of section.elements) {
      if (!el.hidden) boxes.set(el.id, { x: el.x, y: el.y, w: el.w, h: el.h, rot: el.rot, size: el.kind === "text" ? el.size : null });
    }
    return { w: section.w, boxes, stacked: false };
  }
  if (section.phone.mode === "free") return { w: section.phone.w, boxes: phoneBoxes(section), stacked: false };
  const wrapper = sectionNode(key);
  if (!wrapper) return null;
  const origin = wrapper.getBoundingClientRect();
  const boxes = new Map<string, FrameBox>();
  for (const el of section.elements) {
    const node = elementNode(key, el.id);
    if (el.hidden || !node || node.offsetParent === null) continue;
    const rect = node.getBoundingClientRect();
    const words = node.querySelector<HTMLElement>(".site-el-words");
    boxes.set(el.id, {
      x: Math.round(rect.left - origin.left),
      y: Math.round(rect.top - origin.top),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
      rot: 0,
      size: words ? Math.round(Number.parseFloat(getComputedStyle(words).fontSize)) : null,
    });
  }
  return { w: Math.round(origin.width), boxes, stacked: true };
}

const VARS = {
  desktop: { x: "--x", y: "--y", w: "--w", h: "--h", r: "--r", fs: "--fs" },
  phone: { x: "--px", y: "--py", w: "--pw", h: "--ph", r: "--pr", fs: "--pfs" },
} as const;

/** Puts a box on an element's node straight away, ahead of the round trip through the editor. */
function paint(node: HTMLElement, box: Box, frame: Frame) {
  const v = VARS[frame];
  node.style.setProperty(v.x, String(box.x));
  node.style.setProperty(v.y, String(box.y));
  node.style.setProperty(v.w, String(box.w));
  node.style.setProperty(v.h, String(box.h));
  node.style.setProperty(v.r, `${box.rot}deg`);
}

/**
 * Turns a stacked phone section into a hand-placed one on the page, with
 * every element exactly where the stack had it, so nothing jumps when the
 * first drag starts. The design catches up when the drag is sent up.
 */
function freezeStack(key: string, view: { w: number; boxes: Map<string, FrameBox> }) {
  const wrapper = sectionNode(key);
  const layer = layerOf(key);
  if (!wrapper || !layer) return null;
  const place: Record<string, PhoneBox> = {};
  let bottom = 0;
  for (const [id, b] of view.boxes) {
    place[id] = { x: b.x, y: b.y, w: b.w, h: b.h, rot: 0, size: b.size };
    bottom = Math.max(bottom, b.y + b.h);
    const node = elementNode(key, id);
    if (!node) continue;
    paint(node, b, "phone");
    if (b.size !== null) node.style.setProperty("--pfs", String(b.size));
  }
  layer.style.setProperty("--PW", String(view.w));
  layer.style.setProperty("--PB", String(bottom));
  wrapper.classList.add("site-canvas-phone-free");
  return place;
}

/**
 * Free-element editing inside the editor's preview frame (Editor v2, phases
 * 2 and 3): pick, drag, resize from the corners and sides, rotate, snap to
 * the 8px grid and to the section's and other elements' centres and edges, a
 * floating bar and a right-click menu. Only the preview page mounts it, so
 * none of this reaches guests.
 *
 * The same tools edit both arrangements. At computer width they move the
 * elements themselves; at phone width they move the phone layout, and the
 * first move in a stacked section turns it into a hand-placed one.
 *
 * The frame never keeps a design of its own: each finished gesture is sent
 * up as a whole new canvas, the editor records it for undo and saves it, and
 * the design comes back down like any other change. During a drag the
 * element's own CSS variables are moved directly, so it follows the pointer
 * without a re-render per frame.
 */
export function CanvasEditing() {
  const { canvas } = useSiteDesign();
  const frame = useFrame();
  const frameRef = useRef(frame);
  const canvasRef = useRef(canvas);
  const [on, setOn] = useState(false);
  const [sel, setSel] = useState<CanvasSelection>(null);
  const selRef = useRef(sel);
  // The box mid-gesture, until the design it was made against is replaced.
  const [live, setLiveState] = useState<{ box: Box; base: SiteCanvas } | null>(null);
  const setLive = (box: Box | null) => setLiveState(box ? { box, base: canvasRef.current } : null);
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [menu, setMenu] = useState<{ left: number; top: number } | null>(null);
  const [typing, setTyping] = useState(false);
  // The picked element's laid-out height in frame units: text grows with its words.
  const [textHeight, setTextHeight] = useState<{ id: string; frame: Frame; h: number } | null>(null);
  const gesture = useRef<Gesture | null>(null);

  useEffect(() => {
    canvasRef.current = canvas;
    frameRef.current = frame;
  }, [canvas, frame]);
  useEffect(() => {
    selRef.current = sel;
  }, [sel]);

  const selected = sel?.id ? findElement(canvas, sel.section, sel.id) : null;
  const view = sel && on ? frameView(canvas, sel.section, frame) : null;
  const liveBox = live && live.base === canvas ? live.box : null;
  const box: Box | null = liveBox ?? (sel?.id ? (view?.boxes.get(sel.id) ?? null) : null);

  function pick(next: CanvasSelection, tell = true) {
    setSel(next);
    selRef.current = next;
    setMenu(null);
    if (tell) post({ type: CANVAS_SELECT, selection: next });
  }

  function commit(next: SiteCanvas) {
    canvasRef.current = next;
    post({ type: CANVAS_COMMIT, canvas: next });
  }

  /** A change to one element's box in the frame being edited. */
  function commitBox(key: string, id: string, patch: Partial<FrameBox>, freeze: Record<string, PhoneBox> | null = null) {
    const c = canvasRef.current;
    if (frameRef.current === "desktop") {
      const { size, ...rest } = patch;
      const el = findElement(c, key, id);
      commit(updateElement(c, key, id, { ...rest, ...(el?.kind === "text" && size ? { size } : {}) } as Partial<CanvasElement>));
      return;
    }
    let place = freeze;
    if (!place && c.sections[key]?.phone.mode !== "free") {
      const v = frameView(c, key, "phone");
      place = v ? freezeStack(key, v) : null;
      if (!place || !v) return;
      commit(placeOnPhone(c, key, v.w, { ...place, [id]: { ...place[id], ...patch } }));
      return;
    }
    if (place) {
      const w = Number.parseFloat(layerOf(key)?.style.getPropertyValue("--PW") ?? "") || 390;
      commit(placeOnPhone(c, key, w, { ...place, [id]: { ...place[id], ...patch } }));
    } else {
      commit(updatePhoneBox(c, key, id, patch));
    }
  }

  // Messages from the editor.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === CANVAS_MODE) {
        setOn(Boolean(event.data.on));
        if (!event.data.on) pick(null, false);
      }
      if (event.data?.type === CANVAS_SELECT) {
        const next = event.data.selection as CanvasSelection;
        pick(next, false);
        // Something just added isn't on the page until its design arrives, so look for it for a few frames.
        let tries = 0;
        const reveal = () => {
          const node = next?.id ? elementNode(next.section, next.id) : next ? sectionNode(next.section) : null;
          if (node) node.scrollIntoView({ block: "nearest", behavior: "smooth" });
          else if (next && tries++ < 20) requestAnimationFrame(reveal);
        };
        reveal();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The editor places new elements and lines things up against each
  // section's size, so it's told whenever that changes, and in which frame.
  useEffect(() => {
    let raf = 0;
    function report() {
      const frames: CanvasFrames = {};
      document.querySelectorAll<HTMLElement>("[data-canvas-section]").forEach((node) => {
        const key = node.dataset.canvasSection!;
        if (!holdsElements(key)) return;
        const rect = node.getBoundingClientRect();
        const heading = node.querySelector("h2, blockquote, figcaption")?.textContent?.trim();
        frames[key] = {
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          label: key === "hero" ? "Top of the page" : heading ? heading.slice(0, 40) : "Your block",
        };
      });
      post({ type: CANVAS_FRAMES, frames, frame: frameRef.current });
    }
    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(report);
    }
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [canvas, frame]);

  // Text grows with its words, so its box is measured rather than stored.
  useLayoutEffect(() => {
    if (!sel?.id || selected?.kind !== "text" || !view) return;
    const node = elementNode(sel.section, sel.id);
    const wrapper = sectionNode(sel.section);
    if (!node || !wrapper) return;
    const { id } = sel;
    const w = view.w;
    const f = frame;
    const observer = new ResizeObserver(() => {
      const scale = wrapper.getBoundingClientRect().width / w;
      setTextHeight({ id, frame: f, h: node.offsetHeight / scale });
    });
    observer.observe(node);
    return () => observer.disconnect();
    // `view` is rebuilt every render; its width only changes with these.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, selected, canvas, frame]);

  function startGesture(kind: Gesture["kind"], key: string, id: string, event: PointerEvent, capture: Element) {
    const f = frameRef.current;
    const v = frameView(canvasRef.current, key, f);
    const b = v?.boxes.get(id);
    const node = elementNode(key, id);
    const wrapper = sectionNode(key);
    if (!v || !b || !node || !wrapper) return;
    const scale = wrapper.getBoundingClientRect().width / v.w;
    const el = findElement(canvasRef.current, key, id);
    gesture.current = {
      kind,
      frame: f,
      key,
      id,
      node,
      wrapper,
      startX: event.clientX,
      startY: event.clientY,
      start: { x: b.x, y: b.y, w: b.w, h: el?.kind === "text" ? node.offsetHeight / scale : b.h, rot: b.rot },
      scale,
      w: v.w,
      h: wrapper.getBoundingClientRect().height / scale,
      others: [...v.boxes].filter(([other]) => other !== id).map(([, o]) => o),
      moved: false,
      fontSize: el?.kind === "text" ? b.size : null,
      freeze: null,
    };
    (capture as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function startTyping(key: string, id: string) {
    const words = elementNode(key, id)?.querySelector<HTMLElement>(".site-el-words");
    if (!words) return;
    setTyping(true);
    setMenu(null);
    const before = words.innerText;
    words.contentEditable = "plaintext-only";
    words.focus();
    document.getSelection()?.selectAllChildren(words);
    function finish() {
      words!.removeEventListener("blur", finish);
      words!.removeEventListener("keydown", onKey);
      words!.removeAttribute("contenteditable");
      setTyping(false);
      const text = words!.innerText.replace(/\n{3,}/g, "\n\n").trim().slice(0, 500);
      if (text === before.trim()) return;
      const section = canvasRef.current.sections[key];
      const wrapper = sectionNode(key);
      const node = elementNode(key, id);
      if (!text) {
        commit(removeElement(canvasRef.current, key, id));
        pick(null);
        return;
      }
      // The stored height is the computer one; a phone layout measures its own.
      const scale = wrapper && section ? wrapper.getBoundingClientRect().width / section.w : 1;
      const h = node && frameRef.current === "desktop" ? Math.max(GRID, Math.round(node.offsetHeight / scale)) : undefined;
      commit(updateElement(canvasRef.current, key, id, { text, ...(h ? { h } : {}) } as Partial<CanvasElement>));
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" || (event.key === "Enter" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        words!.blur();
      }
    }
    words.addEventListener("blur", finish);
    words.addEventListener("keydown", onKey);
  }

  // Picking and dragging. Attached to the document so a press anywhere on
  // the page is seen first, before the page's own handlers.
  useEffect(() => {
    if (!on) return;

    function onDown(event: PointerEvent) {
      if (event.button !== 0) return;
      const target = event.target as Element;
      if (target.closest("[data-canvas-ui]")) return;
      const current = selRef.current;
      const handle = target.closest<HTMLElement>("[data-canvas-handle]");
      if (handle && current?.id) {
        event.preventDefault();
        startGesture(handle.dataset.canvasHandle as Gesture["kind"], current.section, current.id, event, handle);
        return;
      }
      const elNode = target.closest<HTMLElement>("[data-el]");
      const layer = elNode?.closest<HTMLElement>("[data-canvas-layer]");
      if (elNode && layer) {
        const key = layer.dataset.canvasLayer!;
        const id = elNode.dataset.el!;
        if (current?.id === id && elNode.querySelector("[contenteditable='plaintext-only']")) return;
        event.preventDefault();
        if (current?.id !== id || current.section !== key) pick({ section: key, id });
        const el = findElement(canvasRef.current, key, id);
        if (el && !el.locked) startGesture("move", key, id, event, elNode);
        return;
      }
      // Headings and names keep phase 1's click-to-restyle.
      if (target.closest("[data-site-text]")) {
        if (current) pick(null);
        return;
      }
      const section = target.closest<HTMLElement>("[data-canvas-section]");
      const key = section?.dataset.canvasSection ?? null;
      if (key) {
        if (current?.section !== key || current.id) pick({ section: key, id: null });
      } else if (current) {
        pick(null);
      }
    }

    function onMove(event: PointerEvent) {
      const g = gesture.current;
      if (!g) return;
      const dx = (event.clientX - g.startX) / g.scale;
      const dy = (event.clientY - g.startY) / g.scale;
      if (!g.moved && Math.hypot(event.clientX - g.startX, event.clientY - g.startY) < 3) return;
      if (!g.moved && g.frame === "phone" && canvasRef.current.sections[g.key]?.phone.mode !== "free") {
        const v = frameView(canvasRef.current, g.key, "phone");
        g.freeze = v ? freezeStack(g.key, v) : null;
        if (!g.freeze) return;
      }
      g.moved = true;
      const free = event.altKey;
      let next: Box;
      let lines = { x: [] as number[], y: [] as number[] };
      if (g.kind === "move") {
        [next, lines] = snapMove({ ...g.start, x: g.start.x + dx, y: g.start.y + dy }, g, free);
      } else if (g.kind === "rotate") {
        const rect = g.wrapper.getBoundingClientRect();
        const cx = rect.left + (g.start.x + g.start.w / 2) * g.scale;
        const cy = rect.top + (g.start.y + g.start.h / 2) * g.scale;
        let angle = (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI + 90;
        if (angle > 180) angle -= 360;
        if (!free) angle = Math.round(angle / 15) * 15;
        next = { ...g.start, rot: Math.round(angle) };
      } else {
        next = resize(g, dx, dy, free);
      }
      if (g.fontSize !== null && g.kind.length === 2) {
        // A text box's corners scale the words with it.
        const v = VARS[g.frame].fs;
        const target = g.frame === "desktop" ? g.node.querySelector<HTMLElement>(".site-el-words") : g.node;
        target?.style.setProperty(v, String(scaledFont(g, next)));
      }
      paint(g.node, next, g.frame);
      setLive(next);
      setGuides(lines);
    }

    function onUp() {
      const g = gesture.current;
      gesture.current = null;
      setGuides({ x: [], y: [] });
      if (!g?.moved) {
        setLive(null);
        return;
      }
      const box = readBox(g.node, g.frame);
      const unchanged = ["x", "y", "w", "h", "rot"].every((k) => box[k as keyof Box] === Math.round(g.start[k as keyof Box]));
      if (unchanged && !g.freeze) {
        setLive(null);
        return;
      }
      const el = findElement(canvasRef.current, g.key, g.id);
      const patch: Partial<FrameBox> = { ...box };
      if (el?.kind === "text") {
        if (g.fontSize !== null && g.kind.length === 2) patch.size = scaledFont(g, box);
        patch.h = Math.max(GRID, Math.round(g.node.offsetHeight / g.scale));
      }
      // The live box stays up until the design comes back with the change.
      commitBox(g.key, g.id, patch, g.freeze);
    }

    function onContextMenu(event: MouseEvent) {
      const target = event.target as Element;
      const elNode = target.closest<HTMLElement>("[data-el]");
      const layer = elNode?.closest<HTMLElement>("[data-canvas-layer]");
      if (!elNode || !layer) return;
      event.preventDefault();
      pick({ section: layer.dataset.canvasLayer!, id: elNode.dataset.el! });
      setMenu({ left: event.clientX, top: event.clientY });
    }

    function onDoubleClick(event: MouseEvent) {
      const elNode = (event.target as Element).closest<HTMLElement>("[data-el]");
      const current = selRef.current;
      if (!elNode || !current?.id || elNode.dataset.el !== current.id) return;
      const el = findElement(canvasRef.current, current.section, current.id);
      if (el?.kind === "text" && !el.locked) startTyping(current.section, el.id);
    }

    // On a touch screen, a tap on a form inside a section picks the section;
    // it doesn't open a menu or the keyboard. Preview lets the form work.
    const touch = window.matchMedia("(pointer: coarse)").matches;
    function holdForm(event: Event) {
      if (!touch) return;
      const target = event.target as Element;
      if (target.closest?.("[data-canvas-section] :is(input, select, textarea, label)")) event.preventDefault();
    }

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("mousedown", holdForm, true);
    document.addEventListener("click", holdForm, true);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("dblclick", onDoubleClick, true);
    document.documentElement.dataset.canvasOn = "";
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("mousedown", holdForm, true);
      document.removeEventListener("click", holdForm, true);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("dblclick", onDoubleClick, true);
      delete document.documentElement.dataset.canvasOn;
    };
    // The handlers read everything through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  function act(action: MenuAction) {
    const current = selRef.current;
    setMenu(null);
    if (!current?.id) return;
    const { section: key, id } = current;
    const c = canvasRef.current;
    const el = findElement(c, key, id);
    if (!el) return;
    const phone = frameRef.current === "phone";
    if (action === "duplicate") {
      const [next, copy] = duplicateElement(c, key, id);
      commit(next);
      if (copy) pick({ section: key, id: copy });
    } else if (action === "delete") {
      commit(removeElement(c, key, id));
      pick(null);
    } else if (action === "lock") {
      commit(updateElement(c, key, id, { locked: !el.locked }));
    } else if (action === "hide") {
      // On the phone layout, Hide leaves it off phones only.
      commit(phone ? setHiddenOnPhone(c, key, id, true) : updateElement(c, key, id, { hidden: true }));
      pick(null);
    } else if (action === "centre") {
      const v = frameView(c, key, frameRef.current);
      const b = v?.boxes.get(id);
      if (v && b) commitBox(key, id, { x: Math.round((v.w - b.w) / 2) });
    } else if (action === "position") {
      post({ type: CANVAS_PANEL, panel: "position" });
    } else if (action === "edit") {
      startTyping(key, id);
    } else {
      commit(moveLayer(c, key, id, action));
    }
  }

  // The phone editor's tool row runs the floating bar's actions from outside the frame.
  useEffect(() => {
    if (!on) return;
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.data?.type !== CANVAS_ACTION) return;
      const action = event.data.action as MenuAction;
      if (["edit", "duplicate", "delete", "lock", "hide", "centre"].includes(action)) act(action);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // `act` reads everything through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  // Keys while the frame has focus. Undo and redo belong to the editor.
  useEffect(() => {
    if (!on) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (mod && (key === "z" || key === "y")) {
        event.preventDefault();
        post({ type: CANVAS_KEY, action: key === "z" && !event.shiftKey ? "undo" : "redo" });
        return;
      }
      const current = selRef.current;
      if (!current?.id) return;
      const el = findElement(canvasRef.current, current.section, current.id);
      if (!el) return;
      if (event.key === "Escape") {
        pick(null);
      } else if (event.key === "Delete" || event.key === "Backspace") {
        act("delete");
      } else if (mod && key === "d") {
        act("duplicate");
      } else if (event.key === "Enter" && el.kind === "text") {
        act("edit");
      } else if (event.key.startsWith("Arrow") && !el.locked) {
        const b = frameView(canvasRef.current, current.section, frameRef.current)?.boxes.get(current.id);
        if (!b) return;
        const step = event.altKey ? 1 : event.shiftKey ? GRID * 4 : GRID;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        commitBox(current.section, current.id, { x: b.x + dx, y: b.y + dy });
      } else {
        return;
      }
      event.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  // The menu closes on any scroll or click elsewhere.
  useEffect(() => {
    if (!menu) return;
    const close = (event: Event) => {
      if (!(event.target as Element)?.closest?.("[data-canvas-ui]")) setMenu(null);
    };
    window.addEventListener("scroll", close, true);
    document.addEventListener("pointerdown", close, true);
    return () => {
      window.removeEventListener("scroll", close, true);
      document.removeEventListener("pointerdown", close, true);
    };
  }, [menu]);

  if (!on) return null;

  const wrapper = sel ? sectionNode(sel.section) : null;
  const shown = box && selected && view;
  const measured = textHeight && selected && textHeight.id === selected.id && textHeight.frame === frame ? textHeight.h : null;
  const height = selected?.kind === "text" && !liveBox ? (measured ?? box?.h ?? 0) : (box?.h ?? 0);

  return (
    <>
      <style>{editorCss(sel)}</style>
      {wrapper &&
        shown &&
        createPortal(
          // Boxes are in the frame's units; --EW turns them into the section's width.
          <div style={{ "--EW": view.w, position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20 } as CSSProperties}>
            <Selection box={{ ...box, h: height }} locked={selected.locked} text={selected.kind === "text"} />
            {!liveBox && !typing && (
              <FloatingBar
                box={{ ...box, h: height }}
                locked={selected.locked}
                text={selected.kind === "text"}
                onAct={act}
                onMore={(rect) => setMenu({ left: rect.left, top: rect.bottom + 6 })}
              />
            )}
            {guides.x.map((x) => (
              <span key={`x${x}`} aria-hidden="true" style={guideStyle("x", x)} />
            ))}
            {guides.y.map((y) => (
              <span key={`y${y}`} aria-hidden="true" style={guideStyle("y", y)} />
            ))}
          </div>,
          wrapper,
        )}
      {menu && selected && (
        <ContextMenu at={menu} locked={selected.locked} text={selected.kind === "text"} phone={frame === "phone"} onAct={act} />
      )}
    </>
  );
}

/** The box as last painted on the node, in frame units, snapped to whole numbers. */
function readBox(node: HTMLElement, frame: Frame): Box {
  const v = VARS[frame];
  const read = (name: string) => Number.parseFloat(node.style.getPropertyValue(name));
  return {
    x: Math.round(read(v.x)),
    y: Math.round(read(v.y)),
    w: Math.max(GRID, Math.round(read(v.w))),
    h: Math.max(1, Math.round(read(v.h))),
    rot: Math.round(read(v.r) || 0),
  };
}

function scaledFont(g: Gesture, box: Box) {
  return Math.max(6, Math.min(400, Math.round((g.fontSize ?? 16) * (box.w / g.start.w))));
}

/**
 * A move, snapped: to the section's edges and centre, then to other
 * elements' edges and centres, then to the grid. Alt places freely.
 */
function snapMove(box: Box, g: Gesture, free: boolean): [Box, { x: number[]; y: number[] }] {
  if (free) return [{ ...box, x: Math.round(box.x), y: Math.round(box.y) }, { x: [], y: [] }];
  const threshold = SNAP_PX / g.scale;
  const xs = [0, g.w / 2, g.w, ...g.others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w])];
  const ys = [0, g.h / 2, g.h, ...g.others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h])];
  const fit = (start: number, size: number, lines: number[]) => {
    let best: { shift: number; line: number } | null = null;
    for (const edge of [start, start + size / 2, start + size]) {
      for (const line of lines) {
        const shift = line - edge;
        if (Math.abs(shift) <= threshold && (!best || Math.abs(shift) < Math.abs(best.shift))) best = { shift, line };
      }
    }
    return best;
  };
  const sx = fit(box.x, box.w, xs);
  const sy = fit(box.y, box.h, ys);
  const x = sx ? box.x + sx.shift : snap(box.x);
  const y = sy ? box.y + sy.shift : snap(box.y);
  // Every guide the snapped box now touches, not just the one that pulled it.
  const touching = (start: number, size: number, lines: number[]) =>
    [...new Set(lines.filter((l) => [start, start + size / 2, start + size].some((e) => Math.abs(e - l) < 0.5)))];
  return [
    { ...box, x: Math.round(x), y: Math.round(y) },
    { x: sx ? touching(x, box.w, xs) : [], y: sy ? touching(y, box.h, ys) : [] },
  ];
}

/**
 * A resize from one handle, worked out in the element's own rotated frame so
 * the opposite corner or side stays put. Corners keep the proportions.
 */
function resize(g: Gesture, dx: number, dy: number, free: boolean): Box {
  const { start } = g;
  const kind = g.kind as Handle;
  const theta = (start.rot * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const lx = dx * cos + dy * sin;
  const ly = -dx * sin + dy * cos;
  const sx = kind.includes("e") ? 1 : kind.includes("w") ? -1 : 0;
  const sy = kind.includes("s") ? 1 : kind.includes("n") ? -1 : 0;
  const round = (n: number) => Math.max(GRID, free ? Math.round(n) : snap(n));
  let w = sx ? round(start.w + sx * lx) : start.w;
  let h = sy ? round(start.h + sy * ly) : start.h;
  if (sx && sy) {
    const ratio = start.w / start.h;
    if (Math.abs(w / start.w) >= Math.abs(h / start.h)) h = Math.max(1, Math.round(w / ratio));
    else w = Math.max(GRID, Math.round(h * ratio));
  }
  const dw = w - start.w;
  const dh = h - start.h;
  // The centre moves by half the growth, turned back into page axes.
  const cx = (sx * dw) / 2;
  const cy = (sy * dh) / 2;
  const centreX = start.x + start.w / 2 + cx * cos - cy * sin;
  const centreY = start.y + start.h / 2 + cx * sin + cy * cos;
  return { ...start, w, h, x: Math.round(centreX - w / 2), y: Math.round(centreY - h / 2) };
}

/** A box placed in its layer the same way the element itself is (globals.css, .site-el). */
function placed(box: Box): CSSProperties {
  return {
    position: "absolute",
    left: `calc(${box.x} / var(--EW) * 100cqw)`,
    top: `calc(${box.y} / var(--EW) * 100cqw)`,
    width: `calc(${box.w} / var(--EW) * 100cqw)`,
    height: `calc(${box.h} / var(--EW) * 100cqw)`,
    transform: `rotate(${box.rot}deg)`,
  };
}

function Selection({ box, locked, text }: { box: Box; locked: boolean; text: boolean }) {
  return (
    <div aria-hidden="true" style={{ ...placed(box), outline: `2px solid ${ROYAL}`, outlineOffset: 1, zIndex: 20 }}>
      {!locked &&
        HANDLES.filter((h) => !(text && (h === "n" || h === "s"))).map((h) => (
          <span key={h} data-canvas-handle={h} style={handleStyle(h)} />
        ))}
      {!locked && (
        <span data-canvas-handle="rotate" title="Rotate" style={rotateStyle}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={ROYAL} strokeWidth="2.6" strokeLinecap="round" style={{ pointerEvents: "none" }}>
            <path d="M20 12a8 8 0 1 1-2.3-5.6" />
            <path d="M20 4v4h-4" />
          </svg>
        </span>
      )}
    </div>
  );
}

const CURSORS: Record<Handle, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};

function handleStyle(h: Handle): CSSProperties {
  const side = h.length === 1;
  const vertical = h === "n" || h === "s";
  const w = side ? (vertical ? 20 : 6) : 12;
  const ht = side ? (vertical ? 6 : 20) : 12;
  const x = h.includes("w") ? "0%" : h.includes("e") ? "100%" : "50%";
  const y = h.includes("n") ? "0%" : h.includes("s") ? "100%" : "50%";
  return {
    position: "absolute",
    left: x,
    top: y,
    width: w,
    height: ht,
    transform: "translate(-50%, -50%)",
    background: "#fff",
    border: `1.5px solid ${ROYAL}`,
    borderRadius: side ? 3 : 999,
    boxShadow: "0 1px 3px rgba(20,32,61,.25)",
    cursor: CURSORS[h],
    pointerEvents: "auto",
    touchAction: "none",
  };
}

const rotateStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "100%",
  width: 24,
  height: 24,
  marginTop: 14,
  transform: "translateX(-50%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
  border: `1.5px solid ${ROYAL}`,
  borderRadius: 999,
  boxShadow: "0 1px 3px rgba(20,32,61,.25)",
  cursor: "grab",
  pointerEvents: "auto",
  touchAction: "none",
};

function guideStyle(axis: "x" | "y", at: number): CSSProperties {
  return axis === "x"
    ? { position: "absolute", top: "-100vh", bottom: "-100vh", left: `calc(${at} / var(--EW) * 100cqw)`, width: 1, background: SKY, zIndex: 30, pointerEvents: "none" }
    : { position: "absolute", left: 0, right: 0, top: `calc(${at} / var(--EW) * 100cqw)`, height: 1, background: SKY, zIndex: 30, pointerEvents: "none" };
}

function FloatingBar({
  box,
  locked,
  text,
  onAct,
  onMore,
}: {
  box: Box;
  locked: boolean;
  text: boolean;
  onAct: (action: "duplicate" | "delete" | "lock" | "edit") => void;
  onMore: (rect: DOMRect) => void;
}) {
  // Above the element, or below it when it's at the very top of the section.
  const above = box.y > 72;
  return (
    <div
      data-canvas-ui
      role="toolbar"
      aria-label="Element"
      style={{
        position: "absolute",
        left: `calc(${box.x + box.w / 2} / var(--EW) * 100cqw)`,
        top: above ? `calc(${box.y} / var(--EW) * 100cqw - 56px)` : `calc(${box.y + box.h} / var(--EW) * 100cqw + 52px)`,
        transform: "translateX(-50%)",
        display: "flex",
        gap: 2,
        padding: 4,
        borderRadius: 10,
        background: "#fff",
        boxShadow: "0 2px 10px rgba(20,32,61,.18)",
        zIndex: 40,
        pointerEvents: "auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {text && !locked && (
        <BarButton label="Edit words" onClick={() => onAct("edit")}>
          <path d="M4 20h4L19 9l-4-4L4 16v4z" />
        </BarButton>
      )}
      <BarButton label={locked ? "Unlock" : "Lock"} pressed={locked} onClick={() => onAct("lock")}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d={locked ? "M8 11V8a4 4 0 0 1 8 0v3" : "M8 11V8a4 4 0 0 1 7.5-2"} />
      </BarButton>
      <BarButton label="Duplicate" onClick={() => onAct("duplicate")}>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </BarButton>
      <BarButton label="Delete" onClick={() => onAct("delete")}>
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
      </BarButton>
      <BarButton label="More" onClick={(e) => onMore(e.currentTarget.getBoundingClientRect())}>
        <circle cx="5" cy="12" r="1.2" />
        <circle cx="12" cy="12" r="1.2" />
        <circle cx="19" cy="12" r="1.2" />
      </BarButton>
    </div>
  );
}

function BarButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: 0,
        borderRadius: 8,
        cursor: "pointer",
        background: pressed ? ROYAL_TINT : "transparent",
        color: pressed ? ROYAL : NAVY,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

type MenuAction = "duplicate" | "delete" | "lock" | "hide" | LayerMove | "centre" | "position" | "edit";

function ContextMenu({
  at,
  locked,
  text,
  phone,
  onAct,
}: {
  at: { left: number; top: number };
  locked: boolean;
  text: boolean;
  /** Editing the phone layout: Hide and Centre act there. */
  phone: boolean;
  onAct: (action: MenuAction) => void;
}) {
  const groups: [MenuAction, string, string?][][] = [
    [
      ...(text && !locked ? [["edit", "Edit words", "Enter"] as [MenuAction, string, string]] : []),
      ["duplicate", "Duplicate", "Ctrl+D"],
      ["delete", "Delete", "Del"],
      ["lock", locked ? "Unlock" : "Lock"],
      ["hide", phone ? "Hide on phones" : "Hide"],
    ],
    [
      ["forward", "Bring forward"],
      ["backward", "Send backward"],
      ["front", "Bring to front"],
      ["back", "Send to back"],
    ],
    [
      ["centre", "Centre in section"],
      ["position", "Position…"],
    ],
  ];
  // Kept on screen near the right and bottom edges.
  const left = Math.min(at.left, window.innerWidth - 228);
  const top = Math.min(at.top, window.innerHeight - 340);
  return (
    <div
      data-canvas-ui
      role="menu"
      style={{
        position: "fixed",
        left,
        top,
        width: 220,
        padding: 6,
        borderRadius: 10,
        background: "#fff",
        boxShadow: "0 6px 24px rgba(20,32,61,.22)",
        zIndex: 1000,
        fontFamily: "system-ui, sans-serif",
        fontSize: 13,
        color: NAVY,
      }}
    >
      {groups.map((group, i) => (
        <div key={i} style={i ? { borderTop: `1px solid ${NAVY_LINE}`, marginTop: 4, paddingTop: 4 } : undefined}>
          {group.map(([action, label, keys]) => (
            <button
              key={action}
              type="button"
              role="menuitem"
              onClick={() => onAct(action)}
              className="canvas-menu-item"
              style={{
                width: "100%",
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 10px",
                border: 0,
                borderRadius: 6,
                background: "transparent",
                cursor: "pointer",
                font: "inherit",
                color: "inherit",
                textAlign: "left",
              }}
            >
              {label}
              {keys && <span style={{ color: NAVY_SOFT, fontSize: 12 }}>{keys}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Hover outlines, the picked section's outline and the menu's hover, for the frame only. */
function editorCss(sel: CanvasSelection) {
  const picked = sel && !sel.id ? `[data-canvas-section="${CSS.escape(sel.section)}"]` : null;
  return `
[data-canvas-on] .site-el { cursor: move; touch-action: none; }
[data-canvas-on] .site-el:hover { outline: 1px solid ${ROYAL}; outline-offset: 1px; }
[data-canvas-on] .site-el-words[contenteditable] { cursor: text; outline: none; user-select: text; }
[data-canvas-on] [data-canvas-section]:hover:not(:has(.site-el:hover, [data-site-text]:hover)) { outline: 1px dashed rgb(34 67 182 / 0.6); outline-offset: -1px; }
${picked ? `${picked}, ${picked}:hover { outline: 2px solid ${ROYAL} !important; outline-offset: -2px; }` : ""}
@media (pointer: coarse) { [data-canvas-handle] { min-width: 24px !important; min-height: 24px !important; } [data-canvas-handle="n"], [data-canvas-handle="s"], [data-canvas-handle="e"], [data-canvas-handle="w"] { display: none; } }
.canvas-menu-item:hover { background: ${ROYAL_TINT} !important; color: ${ROYAL}; }
[data-canvas-on] .site-canvas { overflow: visible; }
`;
}
